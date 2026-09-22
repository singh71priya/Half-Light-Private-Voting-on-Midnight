import '../polyfills';
import { midnightWallet } from './midnightWallet';
import type { VoteChoice } from './types';
import deployedContractInfo from '../../../deployed_contract.json';

export const CONTRACT_ADDRESS = deployedContractInfo.contractAddress;

export type OnChainResult =
  | { ok: true; txId: string; explorerUrl: string }
  | { ok: false; error: string };

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export async function callContractCircuit(
  circuitName: 'openElection' | 'closeElection' | 'castVote',
  args: { adminSkHex?: string; voterSecretHex?: string; choice?: VoteChoice }
): Promise<OnChainResult> {
  try {
    // Dynamically import the Midnight SDK
    const [
      { indexerPublicDataProvider },
      { httpClientProofProvider },
      { FetchZkConfigProvider },
      { findDeployedContract },
      { CompiledBBoardContractContract },
      { setNetworkId },
    ] = await Promise.all([
      import('@midnight-ntwrk/midnight-js-indexer-public-data-provider'),
      import('@midnight-ntwrk/midnight-js-http-client-proof-provider'),
      import('@midnight-ntwrk/midnight-js-fetch-zk-config-provider'),
      import('@midnight-ntwrk/midnight-js-contracts'),
      import('@midnight-ntwrk/bboard-contract'),
      import('@midnight-ntwrk/midnight-js-network-id'),
    ]);

    setNetworkId('preprod');

    const indexerHttp = deployedContractInfo.indexer;
    const indexerWs = indexerHttp.replace('https', 'wss').replace('http', 'ws');
    const zkConfigPath = `${window.location.origin}/managed/bboard`;

    // The ONEAM proof server is required for compatibility with 1AM wallet.
    const ONEAM_PROOF_SERVER = 'https://api-preprod.1am.xyz';

    // The wallet MUST be connected to proceed
    const walletState = midnightWallet.getState();
    if (!walletState.isConnected) {
      throw new Error('Wallet not connected');
    }

    // Reach into the wallet manager to get the raw API provider object
    interface InjectedMidnight {
      midnight?: Record<string, any>;
    }
    const win = window as unknown as InjectedMidnight;
    
    // Fallback to searching the window for the active provider.
    const walletId = walletState.walletId || '1am';
    let activeProvider = win.midnight?.[walletId] || win.midnight?.['1am'] || win.midnight?.oneam;
    if (!activeProvider) {
      // Find the first one that matches 1am
      for (const key of Object.keys(win.midnight || {})) {
        if (key.toLowerCase().includes('1am')) {
          activeProvider = win.midnight![key];
          break;
        }
      }
    }
    
    if (!activeProvider) {
      throw new Error('Could not locate active wallet provider in window.');
    }

    const connectedAPI = midnightWallet.getConnectedAPI();
    if (!connectedAPI) {
      throw new Error('Wallet API not initialized. Please connect your wallet first.');
    }

    const { coinPublicKey } = walletState;
    if (!coinPublicKey) {
      throw new Error('Wallet coin public key not found');
    }

    const ap = connectedAPI as Record<string, any>;
    
    // Set up the providers for the SDK
    const zkConfigProvider = new FetchZkConfigProvider(zkConfigPath, fetch.bind(window));
    const proofProvider = httpClientProofProvider(ONEAM_PROOF_SERVER, zkConfigProvider);

    // Provide the expected WalletProvider interface
    const walletProvider = {
      getCoinPublicKey: () => coinPublicKey,
      getEncryptionPublicKey: () => coinPublicKey,
      balanceTx: async (tx: any) => {
        const { toHex, fromHex } = await import('@midnight-ntwrk/midnight-js-utils');
        const { Transaction } = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
        const serializedTx = toHex(tx.serialize());
        if (typeof ap?.balanceUnsealedTransaction === 'function') {
          const received = await ap.balanceUnsealedTransaction(serializedTx);
          return Transaction.deserialize('signature', 'proof', 'binding', fromHex(received.tx));
        }
        throw new Error('Could not balance transaction: balanceUnsealedTransaction missing');
      }
    };

    // Provide the expected MidnightProvider interface
    const midnightProvider = {
      submitTx: async (tx: any) => {
        const { toHex } = await import('@midnight-ntwrk/midnight-js-utils');
        const txHex = toHex(tx.serialize());
        if (typeof ap?.submitTransaction === 'function') {
          const res = await ap.submitTransaction(txHex);
          let returnedId = '';
          if (typeof res === 'string' && res.length > 0) returnedId = res;
          else if (typeof res === 'object' && res !== null) returnedId = res.txHash || res.id;
          return returnedId.replace(/^0x/, '');
        }
        throw new Error('Connected wallet does not support submitting transactions.');
      }
    };

    // Private state provider
    let privateStateProvider: any = null;
    const privateStateId = 'bboard-voter';
    if (circuitName === 'castVote' && args.voterSecretHex) {
      const { levelPrivateStateProvider } = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');
      privateStateProvider = levelPrivateStateProvider({
        privateStateStoreName: `bboard-private-state-${coinPublicKey.slice(0, 8)}`,
        signingKeyStoreName: `bboard-signing-${coinPublicKey.slice(0, 8)}`,
        privateStoragePasswordProvider: () => "TempPassword123!Secure",
        accountId: coinPublicKey,
      });
      // The mock we had earlier didn't have all methods and could cause Symbol crashes
      // But we also need to supply the initial private state to findDeployedContract!
    } else {
      // Mock for openElection / closeElection which don't need private state
      privateStateProvider = {
        get: async () => null,
        set: async () => {},
        setContractAddress: () => {},
        remove: async () => {},
        clear: async () => {},
        exportPrivateStates: async () => ({}),
        importPrivateStates: async () => ({}),
        getSigningKey: async () => null,
        setSigningKey: async () => {},
        removeSigningKey: async () => {},
        clearSigningKeys: async () => {},
        exportSigningKeys: async () => ({}),
        importSigningKeys: async () => ({}),
      };
    }

    const providers = {
      privateStateProvider,
      publicDataProvider: indexerPublicDataProvider(indexerHttp, indexerWs),
      zkConfigProvider,
      proofProvider,
      walletProvider,
      midnightProvider,
    };

    const findArgs: any = {
      contractAddress: CONTRACT_ADDRESS,
      compiledContract: CompiledBBoardContractContract,
    };
    
    if (circuitName === 'castVote' && args.voterSecretHex) {
      const secretBytes = hexToBytes(args.voterSecretHex.padStart(64, '0').slice(0, 64));
      findArgs.privateStateId = privateStateId;
      findArgs.initialPrivateState = { voterSecretKey: secretBytes };
    }

    // Find the deployed contract on the ledger
    const deployedContract = (await findDeployedContract(providers as any, findArgs)) as any;

    let txId = '';
    
    if (circuitName === 'openElection') {
      const adminSk = hexToBytes(args.adminSkHex!.padStart(64, '0').slice(0, 64));
      const tx = await deployedContract.callTx.openElection(adminSk);
      txId = tx.public.txHash || tx.txHash;
    } else if (circuitName === 'closeElection') {
      const adminSk = hexToBytes(args.adminSkHex!.padStart(64, '0').slice(0, 64));
      const tx = await deployedContract.callTx.closeElection(adminSk);
      txId = tx.public.txHash || tx.txHash;
    } else if (circuitName === 'castVote') {
      const isYes = args.choice === 'YES';
      const tx = await deployedContract.callTx.castVote(isYes);
      txId = tx.public.txHash || tx.txHash;
    }

    const cleanId = txId.replace(/^0x/, '');
    const explorerUrl = `https://explorer.1am.xyz/tx/${cleanId}?network=preprod`;

    return { ok: true, txId, explorerUrl };
  } catch (error: any) {
    console.error('Onchain error:', error);
    return { ok: false, error: error.message || String(error) };
  }
}

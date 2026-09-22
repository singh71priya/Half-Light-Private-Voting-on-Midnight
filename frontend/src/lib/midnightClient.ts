/**
 * midnightClient.ts
 * -------------------------------------------------------------------------
 * Integration point between the UI and the REAL deployed Midnight contract
 * on Midnight Preprod network.
 * -------------------------------------------------------------------------
 */
import type { CastVoteResult, ElectionPublicState, VoteChoice } from './types';
import { VotingSimulator } from './votingSimulator';
import { midnightWallet } from './midnightWallet';

export const DEMO_MODE = false;

export interface ElectionClient {
  getState(): Promise<ElectionPublicState>;
  openElection(): Promise<{ txId: string; explorerUrl: string }>;
  closeElection(): Promise<{ txId: string; explorerUrl: string }>;
  castVote(secretHex: string, choice: VoteChoice): Promise<CastVoteResult>;
}

export function createDemoClient(electionId: string): ElectionClient {
  const sim = new VotingSimulator(electionId);
  return {
    async getState() {
      return sim.state;
    },
    async openElection() {
      sim.openElection();
      return { txId: 'simulated_open', explorerUrl: '' };
    },
    async closeElection() {
      sim.closeElection();
      return { txId: 'simulated_close', explorerUrl: '' };
    },
    async castVote(secretHex, choice) {
      return sim.castVote(secretHex, choice);
    },
  };
}

/**
 * Real client backed by the Midnight Preprod Network and browser wallet.
 * Prompts wallet extension for approval/signature and generates on-chain links.
 */
import { callContractCircuit } from './onchain';

export function createLiveClient(electionId: string): ElectionClient {
  const sim = new VotingSimulator(electionId);
  const adminSkHex = '7011d61b369c766e409b62fb915e7f093229b15dd6466f8da7905f32997b79d2';

  return {
    async getState(): Promise<ElectionPublicState> {
      return sim.state;
    },

    async openElection(): Promise<{ txId: string; explorerUrl: string }> {
      // Constructs ZK transaction via Midnight SDK and prompts wallet
      const tx = await callContractCircuit('openElection', { adminSkHex });
      if (!tx.ok) throw new Error(tx.error);
      sim.openElection();
      return tx;
    },

    async closeElection(): Promise<{ txId: string; explorerUrl: string }> {
      const tx = await callContractCircuit('closeElection', { adminSkHex });
      if (!tx.ok) throw new Error(tx.error);
      sim.closeElection();
      return tx;
    },

    async castVote(secretHex: string, choice: VoteChoice): Promise<CastVoteResult> {
      // Constructs ZK castVote transaction & uses levelPrivateStateProvider for voterSecretKey
      const tx = await callContractCircuit('castVote', { voterSecretHex: secretHex, choice });
      if (!tx.ok) throw new Error(tx.error);

      const baseResult = sim.castVote(secretHex, choice);
      return {
        ...baseResult,
        txId: tx.txId,
        explorerUrl: tx.explorerUrl,
        message: `Ballot successfully proved & submitted on Midnight Preprod!`,
      };
    },
  };
}

export function createElectionClient(electionId: string): ElectionClient {
  if (DEMO_MODE) return createDemoClient(electionId);
  return createLiveClient(electionId);
}

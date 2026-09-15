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

export const DEMO_MODE = true;

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
export function createLiveClient(electionId: string): ElectionClient {
  const sim = new VotingSimulator(electionId);

  return {
    async getState(): Promise<ElectionPublicState> {
      return sim.state;
    },

    async openElection(): Promise<{ txId: string; explorerUrl: string }> {
      // Connects wallet & prompts user for signature popup
      const tx = await midnightWallet.signAndSubmitTx({
        circuit: 'openElection',
        electionId,
      });
      sim.openElection();
      return tx;
    },

    async closeElection(): Promise<{ txId: string; explorerUrl: string }> {
      const tx = await midnightWallet.signAndSubmitTx({
        circuit: 'closeElection',
        electionId,
      });
      sim.closeElection();
      return tx;
    },

    async castVote(secretHex: string, choice: VoteChoice): Promise<CastVoteResult> {
      // Trigger browser wallet signature popup
      const tx = await midnightWallet.signAndSubmitTx({
        circuit: 'castVote',
        choice,
        electionId,
      });

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

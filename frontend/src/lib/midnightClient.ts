/**
 * midnightClient.ts
 * -------------------------------------------------------------------------
 * Integration point between the UI and a REAL deployed Midnight contract.
 *
 * This project ships with `DEMO_MODE = true` by default so judges/reviewers
 * can run the full UX with zero infra (no wallet extension, no node, no
 * testnet tokens) via `votingSimulator.ts`. Flip `DEMO_MODE` to `false` and
 * fill in the TODOs below to point at a real deployment — the calling code
 * in `useElection.ts` and every component is already written against the
 * `ElectionClient` interface, so nothing above this file needs to change.
 *
 * Wiring checklist for production mode (see docs.midnight.network):
 *   1. `compact compile contract/src/private-voting.compact contract/managed/private-voting`
 *   2. Deploy with `@midnight-ntwrk/midnight-js-contracts` `deployContract(...)`
 *      using the compiled artifacts in `contract/managed/private-voting`.
 *   3. Connect the Lace (or Midnight Lace-compatible) wallet via
 *      `@midnight-ntwrk/dapp-connector-api` to get a wallet + proof provider.
 *   4. Replace the bodies below with real `contract.callTx.<circuitName>(...)`
 *      calls and a `contract.circuitContext.ledger` read for state.
 * -------------------------------------------------------------------------
 */
import type { CastVoteResult, ElectionPublicState, VoteChoice } from './types';
import { VotingSimulator } from './votingSimulator';

export const DEMO_MODE = true;

export interface ElectionClient {
  getState(): Promise<ElectionPublicState>;
  openElection(): Promise<void>;
  closeElection(): Promise<void>;
  castVote(secretHex: string, choice: VoteChoice): Promise<CastVoteResult>;
}

/** Demo-mode client backed by the in-memory simulator. */
export function createDemoClient(electionId: string): ElectionClient {
  const sim = new VotingSimulator(electionId);
  return {
    async getState() {
      return sim.state;
    },
    async openElection() {
      sim.openElection();
    },
    async closeElection() {
      sim.closeElection();
    },
    async castVote(secretHex, choice) {
      return sim.castVote(secretHex, choice);
    },
  };
}

/**
 * TODO(production): real client backed by a deployed Compact contract.
 *
 * Sketch (pseudocode — depends on your @midnight-ntwrk/midnight-js-contracts
 * version; see the Counter/Bulletin-board tutorials on docs.midnight.network
 * for the exact provider wiring for your toolchain version):
 *
 *   import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
 *   import { Contract, ledger } from '../../contract/managed/private-voting/contract/index.cjs';
 *
 *   export async function createLiveClient(contractAddress: string, providers): Promise<ElectionClient> {
 *     const deployed = await findDeployedContract(providers, {
 *       contractAddress,
 *       contract: new Contract({ voterSecretKey: () => readLocalSecret() }),
 *     });
 *
 *     return {
 *       async getState() {
 *         const state = ledger(deployed.state);
 *         return {
 *           status: mapStatus(state.status),
 *           yesVotes: Number(state.yesVotes),
 *           noVotes: Number(state.noVotes),
 *           nullifiers: [...state.nullifierUsed.keys()],
 *           round: Number(state.round),
 *         };
 *       },
 *       async openElection() {
 *         await deployed.callTx.openElection(readAdminSecret());
 *       },
 *       async closeElection() {
 *         await deployed.callTx.closeElection(readAdminSecret());
 *       },
 *       async castVote(_secretHex, choice) {
 *         const tx = await deployed.callTx.castVote(choice === 'YES');
 *         return { ok: true, message: 'Ballot recorded on-chain.', nullifier: tx.txId };
 *       },
 *     };
 *   }
 */
export function createElectionClient(electionId: string): ElectionClient {
  if (DEMO_MODE) return createDemoClient(electionId);
  throw new Error(
    'Production mode is not wired up yet. Flip DEMO_MODE and implement createLiveClient() — see the TODO block in midnightClient.ts.',
  );
}

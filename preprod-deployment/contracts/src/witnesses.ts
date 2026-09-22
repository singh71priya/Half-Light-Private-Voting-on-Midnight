import { Ledger } from "./managed/bboard/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";

export type VotingPrivateState = {
  readonly voterSecretKey: Uint8Array;
};

export const createVotingPrivateState = (voterSecretKey: Uint8Array) => ({
  voterSecretKey,
});

export const witnesses = {
  voterSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, VotingPrivateState>): [
    VotingPrivateState,
    Uint8Array,
  ] => [privateState, privateState?.voterSecretKey ?? new Uint8Array(32)],
};

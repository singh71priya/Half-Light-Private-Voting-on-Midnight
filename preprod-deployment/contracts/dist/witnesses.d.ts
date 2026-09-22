import { Ledger } from "./managed/bboard/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
export type VotingPrivateState = {
    readonly voterSecretKey: Uint8Array;
};
export declare const createVotingPrivateState: (voterSecretKey: Uint8Array) => {
    voterSecretKey: Uint8Array<ArrayBufferLike>;
};
export declare const witnesses: {
    voterSecretKey: ({ privateState, }: WitnessContext<Ledger, VotingPrivateState>) => [VotingPrivateState, Uint8Array];
};

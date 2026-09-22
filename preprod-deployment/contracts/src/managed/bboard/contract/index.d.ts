import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum ElectionStatus { CREATED = 0, OPEN = 1, CLOSED = 2 }

export type Witnesses<PS> = {
  voterSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  openElection(context: __compactRuntime.CircuitContext<PS>,
               adminSk_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  closeElection(context: __compactRuntime.CircuitContext<PS>,
                adminSk_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  castVote(context: __compactRuntime.CircuitContext<PS>, choice_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  hasVoted(context: __compactRuntime.CircuitContext<PS>, nullifier_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type ProvableCircuits<PS> = {
  openElection(context: __compactRuntime.CircuitContext<PS>,
               adminSk_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  closeElection(context: __compactRuntime.CircuitContext<PS>,
                adminSk_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  castVote(context: __compactRuntime.CircuitContext<PS>, choice_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  hasVoted(context: __compactRuntime.CircuitContext<PS>, nullifier_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  openElection(context: __compactRuntime.CircuitContext<PS>,
               adminSk_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  closeElection(context: __compactRuntime.CircuitContext<PS>,
                adminSk_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, []>>;
  castVote(context: __compactRuntime.CircuitContext<PS>, choice_0: boolean): Promise<__compactRuntime.CircuitResults<PS, []>>;
  hasVoted(context: __compactRuntime.CircuitContext<PS>, nullifier_0: Uint8Array): Promise<__compactRuntime.CircuitResults<PS, boolean>>;
}

export type Ledger = {
  readonly admin: Uint8Array;
  readonly electionMetaHash: Uint8Array;
  readonly status: ElectionStatus;
  readonly yesVotes: bigint;
  readonly noVotes: bigint;
  nullifierUsed: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  readonly round: bigint;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               adminPk_0: Uint8Array,
               metaHash_0: Uint8Array): Promise<__compactRuntime.ConstructorResult<PS>>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
export declare const expectedVk: Record<string, string>;

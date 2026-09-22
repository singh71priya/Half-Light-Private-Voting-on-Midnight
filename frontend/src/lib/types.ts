export type ElectionStatus = 'CREATED' | 'OPEN' | 'CLOSED';

export interface ElectionMeta {
  id: string;
  title: string;
  description: string;
  yesLabel: string;
  noLabel: string;
}

export interface ElectionPublicState {
  status: ElectionStatus;
  yesVotes: number;
  noVotes: number;
  /** Hex-encoded nullifiers already consumed. Public, but unlinkable to identity. */
  nullifiers: string[];
  round: number;
}

export type VoteChoice = 'YES' | 'NO';

export interface CastVoteResult {
  ok: boolean;
  message: string;
  nullifier?: string;
  txId?: string;
  explorerUrl?: string;
}

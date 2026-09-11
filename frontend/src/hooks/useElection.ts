import { useCallback, useEffect, useState } from 'react';
import { createElectionClient, type ElectionClient } from '../lib/midnightClient';
import { generateVoterSecret } from '../lib/hash';
import type { ElectionPublicState, VoteChoice } from '../lib/types';

const SECRET_STORAGE_KEY = 'midnight-private-vote:voter-secret';

function getOrCreateVoterSecret(): string {
  if (typeof window === 'undefined') return generateVoterSecret();
  const existing = window.localStorage.getItem(SECRET_STORAGE_KEY);
  if (existing) return existing;
  const fresh = generateVoterSecret();
  window.localStorage.setItem(SECRET_STORAGE_KEY, fresh);
  return fresh;
}

export interface UseElectionResult {
  state: ElectionPublicState | null;
  loading: boolean;
  error: string | null;
  lastMessage: string | null;
  myNullifier: string | null;
  hasVoted: boolean;
  castVote: (choice: VoteChoice) => Promise<void>;
  openElection: () => Promise<void>;
  closeElection: () => Promise<void>;
}

export function useElection(electionId: string): UseElectionResult {
  const [client] = useState<ElectionClient>(() => createElectionClient(electionId));
  const [state, setState] = useState<ElectionPublicState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [myNullifier, setMyNullifier] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const next = await client.getState();
      setState(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load election state');
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const castVote = useCallback(
    async (choice: VoteChoice) => {
      setError(null);
      const secret = getOrCreateVoterSecret();
      const result = await client.castVote(secret, choice);
      setLastMessage(result.message);
      if (!result.ok) {
        setError(result.message);
      } else if (result.nullifier) {
        setMyNullifier(result.nullifier);
      }
      await refresh();
    },
    [client, refresh],
  );

  const openElection = useCallback(async () => {
    setError(null);
    try {
      await client.openElection();
      setLastMessage('Election opened. Ballots are now being accepted.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open election');
    }
    await refresh();
  }, [client, refresh]);

  const closeElection = useCallback(async () => {
    setError(null);
    try {
      await client.closeElection();
      setLastMessage('Election closed. Final tallies are now locked.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not close election');
    }
    await refresh();
  }, [client, refresh]);

  const hasVoted = !!(myNullifier && state?.nullifiers.includes(myNullifier));

  return { state, loading, error, lastMessage, myNullifier, hasVoted, castVote, openElection, closeElection };
}

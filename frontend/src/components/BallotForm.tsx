import { useState } from 'react';
import type { ElectionMeta, ElectionStatus, VoteChoice } from '../lib/types';

interface Props {
  meta: ElectionMeta;
  status: ElectionStatus;
  hasVoted: boolean;
  onVote: (choice: VoteChoice) => Promise<void>;
}

export function BallotForm({ meta, status, hasVoted, onVote }: Props) {
  const [submitting, setSubmitting] = useState<VoteChoice | null>(null);

  const disabled = status !== 'OPEN' || hasVoted || submitting !== null;

  async function handleVote(choice: VoteChoice) {
    setSubmitting(choice);
    try {
      await onVote(choice);
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-moonlight-300">
        Cast your ballot
      </h3>
      <p className="mt-2 text-sm text-white/60">{meta.description}</p>

      {hasVoted ? (
        <div className="mt-5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Your ballot was recorded. A nullifier now sits in the public registry so nobody — including this
          app — can tell it was cast by you, and you can't vote again with this device key.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleVote('YES')}
            className="group flex flex-col items-center gap-1 rounded-xl border border-accent-yes/30 bg-accent-yes/10 px-4 py-4 font-display font-semibold text-accent-yes transition hover:bg-accent-yes/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="text-lg">{meta.yesLabel}</span>
            <span className="text-[11px] font-normal text-accent-yes/70">
              {submitting === 'YES' ? 'Signing in wallet…' : 'Vote'}
            </span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleVote('NO')}
            className="group flex flex-col items-center gap-1 rounded-xl border border-accent-no/30 bg-accent-no/10 px-4 py-4 font-display font-semibold text-accent-no transition hover:bg-accent-no/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="text-lg">{meta.noLabel}</span>
            <span className="text-[11px] font-normal text-accent-no/70">
              {submitting === 'NO' ? 'Signing in wallet…' : 'Vote'}
            </span>
          </button>
        </div>
      )}

      {status !== 'OPEN' && !hasVoted && (
        <p className="mt-4 text-xs text-white/40">
          {status === 'CREATED' ? 'Voting has not opened yet.' : 'Voting has closed for this election.'}
        </p>
      )}
    </div>
  );
}

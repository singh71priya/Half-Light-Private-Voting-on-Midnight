import type { ElectionMeta, ElectionPublicState } from '../lib/types';

interface Props {
  meta: ElectionMeta;
  state: ElectionPublicState;
}

export function TallyChart({ meta, state }: Props) {
  const total = state.yesVotes + state.noVotes;
  const yesPct = total === 0 ? 50 : Math.round((state.yesVotes / total) * 100);
  const noPct = total === 0 ? 50 : 100 - yesPct;

  return (
    <div data-testid="tally-chart" className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-moonlight-300">
          Live public tally
        </h3>
        <span className="text-xs text-white/40">{total} ballot{total === 1 ? '' : 's'} cast</span>
      </div>

      <div className="space-y-4">
        <Bar label={meta.yesLabel} value={state.yesVotes} pct={yesPct} colorClass="bg-accent-yes" />
        <Bar label={meta.noLabel} value={state.noVotes} pct={noPct} colorClass="bg-accent-no" />
      </div>

      <p className="mt-5 text-xs leading-relaxed text-white/40">
        These totals are the only per-vote signal ever written to the public ledger — individual ballots
        are never revealed, only the running counters.
      </p>
    </div>
  );
}

function Bar({ label, value, pct, colorClass }: { label: string; value: number; pct: number; colorClass: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-white/80">{label}</span>
        <span className="tabular-nums text-white/50">
          {value} · {pct}%
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${colorClass} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

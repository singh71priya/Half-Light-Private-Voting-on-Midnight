import type { ElectionStatus } from '../lib/types';

const STYLES: Record<ElectionStatus, string> = {
  CREATED: 'bg-slate-500/20 text-slate-300 ring-slate-400/30',
  OPEN: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/40',
  CLOSED: 'bg-amber-500/15 text-amber-300 ring-amber-400/40',
};

const LABELS: Record<ElectionStatus, string> = {
  CREATED: 'Not yet open',
  OPEN: 'Voting open',
  CLOSED: 'Voting closed',
};

export function StatusBadge({ status }: { status: ElectionStatus }) {
  return (
    <span
      data-testid="status-badge"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'OPEN' ? 'animate-pulse bg-emerald-400' : status === 'CLOSED' ? 'bg-amber-400' : 'bg-slate-400'}`} />
      {LABELS[status]}
    </span>
  );
}

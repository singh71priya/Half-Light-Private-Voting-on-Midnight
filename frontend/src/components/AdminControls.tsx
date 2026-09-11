import type { ElectionStatus } from '../lib/types';

interface Props {
  status: ElectionStatus;
  onOpen: () => Promise<void>;
  onClose: () => Promise<void>;
}

export function AdminControls({ status, onOpen, onClose }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-white/50">
          Admin — election organizer
        </h3>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/40">
          Gated by admin key
        </span>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onOpen}
          disabled={status !== 'CREATED'}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Open voting
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={status !== 'OPEN'}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Close voting
        </button>
      </div>
    </div>
  );
}

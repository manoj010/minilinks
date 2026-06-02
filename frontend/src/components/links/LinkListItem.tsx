import { ArrowDown, ArrowUp, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { Link } from '../../types/link';

type LinkListItemProps = {
  link: Link;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onMove: (direction: 'up' | 'down') => void;
};

export function LinkListItem({
  link,
  canMoveUp,
  canMoveDown,
  onEdit,
  onDelete,
  onToggle,
  onMove,
}: LinkListItemProps) {
  return (
    <article className="panel p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold text-slate-950">{link.title}</h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                link.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {link.is_active ? 'Active' : 'Hidden'}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-slate-500">{link.url}</p>
          {link.description ? <p className="mt-1 text-sm text-slate-600">{link.description}</p> : null}
          <p className="mt-2 text-sm font-semibold text-slate-700">{link.click_count} clicks</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary px-3" disabled={!canMoveUp} onClick={() => onMove('up')} title="Move up">
            <ArrowUp size={16} />
          </button>
          <button
            className="btn-secondary px-3"
            disabled={!canMoveDown}
            onClick={() => onMove('down')}
            title="Move down"
          >
            <ArrowDown size={16} />
          </button>
          <button className="btn-secondary px-3" onClick={onToggle} title={link.is_active ? 'Hide link' : 'Show link'}>
            {link.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button className="btn-secondary px-3" onClick={onEdit} title="Edit link">
            <Edit size={16} />
          </button>
          <button className="btn-danger px-3" onClick={onDelete} title="Delete link">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}

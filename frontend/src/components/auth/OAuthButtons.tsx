import { Chrome, Github } from 'lucide-react';
import { getOAuthStartUrl } from '../../api/authApi';

export function OAuthButtons() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>Or continue with</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a className="btn-secondary" href={getOAuthStartUrl('google')}>
          <Chrome size={18} /> Google
        </a>
        <a className="btn-secondary" href={getOAuthStartUrl('github')}>
          <Github size={18} /> GitHub
        </a>
      </div>
    </div>
  );
}

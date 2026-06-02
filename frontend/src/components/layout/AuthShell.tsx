import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

type AuthShellProps = {
  title: string;
  subtitle: string;
  switchText: string;
  switchHref: string;
  switchLabel: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  switchText,
  switchHref,
  switchLabel,
  children,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d3f4ef,transparent_34%),linear-gradient(135deg,#f9fafb,#eef2ff)] px-4 py-8">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <div className="w-full rounded-lg border border-white/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <div className="mb-6">
            <p className="text-sm font-bold uppercase tracking-wide text-teal-700">MiniLinks</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
            <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
          </div>
          {children}
          <p className="mt-6 text-center text-sm text-slate-600">
            {switchText}{' '}
            <Link className="font-semibold text-teal-700 hover:text-teal-800" to={switchHref}>
              {switchLabel}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

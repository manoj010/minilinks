import { ExternalLink, Link as LinkIcon, MousePointerClick, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getLinks } from '../../api/linkApi';
import { getProfile } from '../../api/profileApi';
import type { Link } from '../../types/link';
import type { UserProfile } from '../../types/profile';

export function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);

  useEffect(() => {
    void Promise.all([getProfile(), getLinks()]).then(([nextProfile, nextLinks]) => {
      setProfile(nextProfile);
      setLinks(nextLinks);
    });
  }, []);

  const totalClicks = useMemo(() => links.reduce((sum, link) => sum + link.click_count, 0), [links]);
  const activeLinks = links.filter((link) => link.is_active).length;
  const publicUrl = profile ? `${window.location.origin}/u/${profile.username}` : '';

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Dashboard</h1>
          <p className="mt-1 text-slate-600">Track link activity and keep your profile fresh.</p>
        </div>
        {profile ? (
          <a className="btn-secondary" href={publicUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={17} /> View public page
          </a>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={<MousePointerClick size={22} />} label="Total clicks" value={totalClicks} />
        <StatCard icon={<LinkIcon size={22} />} label="Active links" value={activeLinks} />
        <StatCard icon={<UserRound size={22} />} label="Username" value={profile ? `@${profile.username}` : '...'} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="panel p-5">
          <h2 className="text-lg font-bold">Top links</h2>
          <div className="mt-4 space-y-3">
            {[...links]
              .sort((a, b) => b.click_count - a.click_count)
              .slice(0, 5)
              .map((link) => (
                <div key={link.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{link.title}</p>
                    <p className="truncate text-sm text-slate-500">{link.url}</p>
                  </div>
                  <span className="ml-4 text-sm font-bold text-teal-700">{link.click_count}</span>
                </div>
              ))}
            {links.length === 0 ? <p className="text-sm text-slate-500">No links yet.</p> : null}
          </div>
        </div>
        <div className="panel p-5">
          <h2 className="text-lg font-bold">Profile preview</h2>
          <div className="mt-4 rounded-lg bg-gradient-to-br from-teal-500 via-sky-500 to-rose-400 p-5 text-white">
            <img
              className="h-20 w-20 rounded-full border-4 border-white object-cover"
              src={profile?.avatar_url || 'https://api.dicebear.com/9.x/thumbs/svg?seed=minilinks'}
              alt=""
            />
            <p className="mt-4 text-xl font-bold">{profile?.name ?? 'Your name'}</p>
            <p className="text-sm text-white/80">@{profile?.username ?? 'username'}</p>
            <p className="mt-3 text-sm text-white/90">{profile?.bio || 'Add a short bio on your profile page.'}</p>
          </div>
          <RouterLink className="btn-primary mt-4 w-full" to="/dashboard/profile">
            Edit profile
          </RouterLink>
        </div>
      </div>
    </section>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="panel p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal-50 text-teal-700">{icon}</div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

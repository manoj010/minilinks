import { ExternalLink, Link as LinkIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { recordLinkClick } from '../../api/linkApi';
import { getPublicProfile } from '../../api/profileApi';
import type { Link } from '../../types/link';
import type { UserProfile } from '../../types/profile';

const themeClasses: Record<string, string> = {
  sunset: 'from-teal-500 via-sky-500 to-rose-400',
  forest: 'from-emerald-700 via-teal-600 to-lime-400',
  midnight: 'from-slate-950 via-indigo-900 to-cyan-700',
  minimal: 'from-slate-100 via-white to-slate-200 text-slate-950',
};

export function PublicProfile() {
  const { username = '' } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setLoading(true);
    void getPublicProfile(username)
      .then((data) => {
        setProfile(data.user);
        setLinks(data.links);
        setMissing(false);
      })
      .catch(() => setMissing(true))
      .finally(() => setLoading(false));
  }, [username]);

  const theme = useMemo(() => themeClasses[profile?.theme || 'sunset'] ?? themeClasses.sunset, [profile?.theme]);

  async function openLink(link: Link) {
    await recordLinkClick(link.id);
    window.location.href = link.url;
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center bg-slate-100 text-slate-600">Loading profile...</main>;
  }

  if (missing || !profile) {
    return <main className="grid min-h-screen place-items-center bg-slate-100 text-slate-600">Profile not found.</main>;
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br ${theme} px-4 py-8`}>
      <section className="mx-auto max-w-md">
        <div className="rounded-lg bg-white/92 p-5 text-center shadow-soft backdrop-blur">
          <img
            className="mx-auto h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
            src={profile.avatar_url || 'https://api.dicebear.com/9.x/thumbs/svg?seed=minilinks'}
            alt=""
          />
          <h1 className="mt-4 text-2xl font-bold text-slate-950">{profile.name}</h1>
          <p className="text-sm font-semibold text-teal-700">@{profile.username}</p>
          {profile.bio ? <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-600">{profile.bio}</p> : null}
        </div>

        <div className="mt-5 space-y-3">
          {links.map((link) => (
            <button
              key={link.id}
              className="group flex w-full items-center justify-between rounded-lg bg-white px-4 py-4 text-left font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              onClick={() => void openLink(link)}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                  <LinkIcon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate">{link.title}</span>
                  {link.description ? (
                    <span className="block truncate text-sm font-normal text-slate-500">{link.description}</span>
                  ) : null}
                </span>
              </span>
              <ExternalLink className="shrink-0 text-slate-400 transition group-hover:text-teal-700" size={18} />
            </button>
          ))}
          {links.length === 0 ? (
            <div className="rounded-lg bg-white/90 px-4 py-5 text-center text-sm text-slate-500 shadow-sm">
              No active links yet.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

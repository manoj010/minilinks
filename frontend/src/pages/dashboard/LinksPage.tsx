import { useEffect, useState } from 'react';
import { createLink, deleteLink, getLinks, reorderLinks, toggleLink, updateLink } from '../../api/linkApi';
import { LinkForm } from '../../components/links/LinkForm';
import { LinkListItem } from '../../components/links/LinkListItem';
import type { Link, LinkInput } from '../../types/link';

export function LinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [editing, setEditing] = useState<Link | null>(null);
  const [error, setError] = useState('');

  async function loadLinks() {
    setLinks(await getLinks());
  }

  useEffect(() => {
    void loadLinks();
  }, []);

  async function submit(input: LinkInput) {
    setError('');
    try {
      if (editing) {
        await updateLink(editing.id, input);
        setEditing(null);
      } else {
        await createLink({ ...input, position: links.length });
      }
      await loadLinks();
    } catch {
      setError('Could not save this link. Check the URL and try again.');
    }
  }

  async function moveLink(index: number, direction: 'up' | 'down') {
    const next = [...links];
    const target = direction === 'up' ? index - 1 : index + 1;
    [next[index], next[target]] = [next[target], next[index]];
    const ordered = next.map((link, position) => ({ ...link, position }));
    setLinks(ordered);
    setLinks(await reorderLinks(ordered.map(({ id, position }) => ({ id, position }))));
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Links</h1>
        <p className="mt-1 text-slate-600">Add, reorder, hide, and monitor every public link.</p>
      </div>
      <LinkForm editing={editing} onCancel={() => setEditing(null)} onSubmit={submit} />
      {error ? <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p> : null}
      <div className="mt-6 space-y-3">
        {links.map((link, index) => (
          <LinkListItem
            key={link.id}
            link={link}
            canMoveUp={index > 0}
            canMoveDown={index < links.length - 1}
            onEdit={() => setEditing(link)}
            onDelete={async () => {
              await deleteLink(link.id);
              await loadLinks();
            }}
            onToggle={async () => {
              await toggleLink(link.id);
              await loadLinks();
            }}
            onMove={(direction) => void moveLink(index, direction)}
          />
        ))}
        {links.length === 0 ? (
          <div className="panel p-8 text-center text-slate-500">Your first link will appear here.</div>
        ) : null}
      </div>
    </section>
  );
}

import { api } from './axios';
import type { Link, LinkInput } from '../types/link';

export async function getLinks() {
  const { data } = await api.get<Link[]>('/links');
  return data;
}

export async function createLink(input: LinkInput) {
  const { data } = await api.post<Link>('/links', input);
  return data;
}

export async function updateLink(id: number, input: Partial<LinkInput>) {
  const { data } = await api.put<Link>(`/links/${id}`, input);
  return data;
}

export async function deleteLink(id: number) {
  await api.delete(`/links/${id}`);
}

export async function reorderLinks(links: Pick<Link, 'id' | 'position'>[]) {
  const { data } = await api.patch<Link[]>('/links/reorder', { links });
  return data;
}

export async function toggleLink(id: number) {
  const { data } = await api.patch<Link>(`/links/${id}/toggle`);
  return data;
}

export async function recordLinkClick(id: number) {
  await api.post(`/links/${id}/click`);
}

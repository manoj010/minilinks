import { api } from './axios';
import type { Link } from '../types/link';
import type { ProfileUpdate, UserProfile } from '../types/profile';

export async function getProfile() {
  const { data } = await api.get<UserProfile>('/profile/me');
  return data;
}

export async function updateProfile(input: ProfileUpdate) {
  const { data } = await api.put<UserProfile>('/profile/me', input);
  return data;
}

export async function getPublicProfile(username: string) {
  const { data } = await api.get<{ user: UserProfile; links: Link[] }>(`/public/${username}`);
  return data;
}

import { api } from './axios';
import type { AuthResponse, LoginInput, RegisterInput } from '../types/auth';
import type { UserProfile } from '../types/profile';

export async function login(input: LoginInput) {
  const { data } = await api.post<AuthResponse>('/auth/login', input);
  return data;
}

export async function register(input: Omit<RegisterInput, 'confirmPassword'>) {
  const { data } = await api.post<AuthResponse>('/auth/register', input);
  return data;
}

export async function getMe() {
  const { data } = await api.get<UserProfile>('/auth/me');
  return data;
}

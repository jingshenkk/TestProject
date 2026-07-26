import { apiRequest } from '@/api/client';

export interface WalletRead {
  balance_cents: number;
  frozen_cents: number;
  bonus_cents: number;
  available_cents: number;
  currency: string;
}

export interface CurrentUser {
  id: number;
  username: string;
  display_name: string;
  role: string;
  membership_level: string;
  wallet?: WalletRead | null;
}

interface LoginResponse {
  token: string;
  user: CurrentUser;
}

export async function fetchCurrentUser(): Promise<CurrentUser> {
  return apiRequest<CurrentUser>('/api/auth/me');
}

export async function login(username: string, password: string): Promise<CurrentUser> {
  const response = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  return response.user;
}

export async function logout(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' });
}

import { api } from './api';
import type { User } from '../types';

export async function register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data;
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function getMe(): Promise<{ user: User }> {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function updateProfile(payload: { name?: string; avatar?: string }): Promise<{ user: User }> {
  const { data } = await api.patch('/auth/me', payload);
  return data;
}

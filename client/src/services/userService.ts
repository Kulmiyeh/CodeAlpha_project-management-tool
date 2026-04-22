import { api } from './api';
import type { PopulatedUser } from '../types';

export async function searchUsers(q: string): Promise<{ users: PopulatedUser[] }> {
  const { data } = await api.get('/users/search', { params: { q } });
  return data;
}

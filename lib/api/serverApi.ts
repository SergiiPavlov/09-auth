import axios from 'axios';
import { cookies } from 'next/headers';

/**
 * Server-side API instance.
 * Uses absolute base URL from NEXT_PUBLIC_API_URL + '/api' to be robust on Vercel.
 * Falls back to '/api' for local dev.
 */
const PUBLIC_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
const BASE_URL = (PUBLIC_BASE ? `${PUBLIC_BASE}/api` : '/api');

export function serverApi() {
  const cookieHeader = cookies().toString();
  return axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
  });
}

export async function getServerMe() {
  try {
    const api = serverApi();
    const res = await api.get('/users/me');
    return res.data;
  } catch {
    return null;
  }
}

export { getServerMe as getMe };

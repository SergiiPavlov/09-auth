import axios from 'axios';
import { cookies } from 'next/headers';

export function serverApi() {
  const cookieHeader = cookies().toString();
  return axios.create({
    baseURL: '/api',
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

import axios from 'axios';
import { cookies } from 'next/headers';

// Server-side Axios instance with forwarded cookies
export function serverApi() {
  const cookieHeader = cookies().toString();
  return axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || ''}/api`,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
  });
}

export async function getMe() {
  try {
    const api = serverApi();
    const res = await api.get('/users/me');
    return res.data;
  } catch (e) {
    return null;
  }
}

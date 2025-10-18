import axios, { AxiosInstance } from 'axios';

const BASE_URL = (process.env.NEXT_PUBLIC_API_BASE ?? '').trim() || '/api/notehub';
const DIRECT_API = /^https?:\/\//i.test(BASE_URL);

export const notehubClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (DIRECT_API) {
  const token = (process.env.NEXT_PUBLIC_NOTEHUB_TOKEN ?? '').trim();
  if (token) {
    notehubClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
}

export { BASE_URL };

import axios from 'axios';

/**
 * Base URL must be built from NEXT_PUBLIC_API_URL + '/api' (per HW-09 spec).
 * We keep a safe fallback to relative '/api' for local dev if the env is not provided.
 */
const PUBLIC_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
const BASE_URL = (PUBLIC_BASE ? `${PUBLIC_BASE}/api` : '/api');

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

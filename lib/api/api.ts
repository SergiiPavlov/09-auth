import axios, { AxiosInstance } from 'axios';
const baseURL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/api';
export const api: AxiosInstance = axios.create({ baseURL, withCredentials: true, headers: { 'Content-Type': 'application/json' }});
export default api;

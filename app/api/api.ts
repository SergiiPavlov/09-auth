import axios from 'axios';

/** Axios for Next route handlers to talk to NoteHub upstream */
export const api = axios.create({
  baseURL: process.env.NOTEHUB_API_BASE || 'https://notehub-api.goit.study',
  withCredentials: true,
});

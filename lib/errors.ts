import axios from 'axios';

export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg =
      (err.response?.data as any)?.message ||
      (err.response?.data as any)?.error ||
      err.message;

    if (status === 401) return 'Unauthorized: проверьте переменную NEXT_PUBLIC_NOTEHUB_TOKEN.';
    if (status === 429) return 'Слишком много запросов. Попробуйте через пару секунд.';
    if (status === 404) return 'Ресурс не найден.';
    if (status && msg) return `${status}: ${msg}`;
    if (msg) return msg;
  }
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}

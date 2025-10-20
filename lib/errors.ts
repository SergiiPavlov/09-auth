export function getErrorMessage(err: unknown, fallback: string = 'Unexpected error'): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const anyErr = err as any;
    // Axios-like error shape
    if (anyErr.response?.data?.message && typeof anyErr.response.data.message === 'string') {
      return anyErr.response.data.message;
    }
    if (anyErr.message && typeof anyErr.message === 'string') {
      return anyErr.message;
    }
  }
  return fallback;
}

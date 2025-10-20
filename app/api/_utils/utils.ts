export function logErrorResponse(errorObj: unknown): void {
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const reset = '\x1b[0m';

  // Стрелка зелёная, текст жёлтый
  console.log(`${green}> ${yellow}Error Response Data:${reset}`);
  console.dir(errorObj, { depth: null, colors: true });
}

export type ParsedCookieRecord = Record<string, string | undefined>;

export function parseSetCookieHeader(cookieStr: string): ParsedCookieRecord {
  return cookieStr.split(';').reduce<ParsedCookieRecord>((acc, segment) => {
    const [rawKey, ...rawValue] = segment.trim().split('=');
    if (!rawKey) {
      return acc;
    }

    const key = rawKey.trim();
    const value = rawValue.length > 0 ? rawValue.join('=').trim() : undefined;

    acc[key] = value;

    return acc;
  }, {});
}

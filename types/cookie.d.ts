declare module 'cookie' {
  export interface CookieParseOptions {
    decode?(value: string): string;
  }

  export interface CookieSerializeOptions {
    encode?(value: string): string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: true | false | 'lax' | 'strict' | 'none';
    priority?: 'low' | 'medium' | 'high';
    partitioned?: boolean;
  }

  export function parse(str: string, options?: CookieParseOptions): Record<string, string>;
  export function serialize(name: string, value: string, options?: CookieSerializeOptions): string;
}

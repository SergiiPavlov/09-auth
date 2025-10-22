'use client';
import { QueryClient, QueryClientProvider, Hydrate } from '@tanstack/react-query';
import React from 'react';

export default function TanStackProvider({ children, state }: { children: React.ReactNode; state?: unknown }) {
  const [client] = React.useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <Hydrate state={state}>{children}</Hydrate>
    </QueryClientProvider>
  );
}

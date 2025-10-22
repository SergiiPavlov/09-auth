'use client';

import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
} from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

interface TanStackProviderProps {
  children: ReactNode;
  state?: DehydratedState;
}

export default function TanStackProvider({ children, state }: TanStackProviderProps) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}

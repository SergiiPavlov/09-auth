'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
export default function AuthRoutesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  React.useEffect(() => { router.refresh(); }, [router]);
  return <>{children}</>;
}

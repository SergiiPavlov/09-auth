import AuthProvider from '@/components/AuthProvider/AuthProvider';

export default function PrivateRoutesLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider enforceAuth>{children}</AuthProvider>;
}

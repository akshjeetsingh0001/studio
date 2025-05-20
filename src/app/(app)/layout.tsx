import type React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

export default function AuthenticatedAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout>
      <div className="animate-fadeIn">
        {children}
      </div>
    </AppLayout>
  );
}

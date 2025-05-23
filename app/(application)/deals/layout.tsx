"use client";

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { PERMISSION_TYPES } from '@/types';

export default function DealsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="p-8 space-y-6">
    <ProtectedRoute requiredPermission={PERMISSION_TYPES.DEALS_MANAGEMENT}>
      {children}
    </ProtectedRoute></div>
  );
}
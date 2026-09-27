import React from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Role } from '@/types';

interface RoleGateProps {
  roles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ roles, children, fallback = null }) => {
  const { hasRole } = usePermission();

  if (!hasRole(...roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

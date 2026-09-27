import { useAuth } from '@/stores/authStore';
import { Role } from '@/types';

export function usePermission() {
  const { user } = useAuth();

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    user,
    role: user?.role,
    isAdmin: user?.role === 'ADMIN',
    isManager: user?.role === 'MANAGER',
    isTechnician: user?.role === 'TECHNICIAN',
    isCashier: user?.role === 'CASHIER',
    hasRole,
  };
}

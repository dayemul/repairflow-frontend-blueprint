import { useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { storageService, subscribeStorage } from '@/lib/storage';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

let authState: AuthState = {
  user: storageService.getActiveUser(),
  accessToken: 'fixflow_jwt_token_sample',
  refreshToken: 'fixflow_refresh_token_sample',
  isAuthenticated: true,
};

const authListeners = new Set<() => void>();

function notifyAuth() {
  authListeners.forEach((fn) => fn());
}

export const authActions = {
  login: (email: string, role: Role = 'ADMIN', name?: string) => {
    const user: User = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    };
    storageService.setActiveUser(user);
    authState = {
      user,
      accessToken: `token_${Date.now()}`,
      refreshToken: `refresh_${Date.now()}`,
      isAuthenticated: true,
    };
    notifyAuth();
  },

  logout: () => {
    authState = {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    };
    notifyAuth();
  },

  switchRole: (role: Role) => {
    const allUsers = storageService.getUsers();
    const matching = allUsers.find((u) => u.role === role);
    const newUser: User = matching || {
      id: `usr-${role.toLowerCase()}`,
      name: `${role} User`,
      email: `${role.toLowerCase()}@fixflow.com`,
      role,
    };
    storageService.setActiveUser(newUser);
    authState = {
      ...authState,
      user: newUser,
      isAuthenticated: true,
    };
    notifyAuth();
  },

  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => {
    authState = {
      ...authState,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || authState.refreshToken,
    };
    notifyAuth();
  },
};

export function useAuth() {
  const [state, setState] = useState<AuthState>(authState);

  useEffect(() => {
    const listener = () => setState({ ...authState });
    authListeners.add(listener);
    const unsubStorage = subscribeStorage(() => {
      const active = storageService.getActiveUser();
      if (active && active.id !== authState.user?.id) {
        authState = { ...authState, user: active };
        setState({ ...authState });
      }
    });

    return () => {
      authListeners.delete(listener);
      unsubStorage();
    };
  }, []);

  return {
    ...state,
    ...authActions,
  };
}

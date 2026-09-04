import { create } from 'zustand';
import { api } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: localStorage.getItem('drawflow_user')
    ? JSON.parse(localStorage.getItem('drawflow_user'))
    : null,
  token: localStorage.getItem('drawflow_token') || '',
  isAuthenticated: !!localStorage.getItem('drawflow_token'),
  isLoading: false,
  isSettingsOpen: false,
  authError: null,

  setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
  setAuthError: (error) => set({ authError: error }),

  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { user, token } = res.data;
        localStorage.setItem('drawflow_token', token);
        localStorage.setItem('drawflow_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false, authError: null });
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid email or password';
      set({ authError: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, authError: null });
    try {
      const res = await api.post('/auth/register', { name, email, password });
      if (res.data?.success) {
        const { user, token } = res.data;
        localStorage.setItem('drawflow_token', token);
        localStorage.setItem('drawflow_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false, authError: null });
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Registration failed';
      set({ authError: errorMsg, isLoading: false });
      return { success: false, error: errorMsg };
    }
  },

  quickDemoLogin: () => {
    const demoUser = {
      id: 'user-demo-1',
      name: 'Rahul Singh',
      email: 'creator@drawflow.io',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      tier: 'plan_b',
      accountStatus: 'Pro Creator',
    };
    const demoToken = 'demo-jwt-token-drawflow-2026';
    localStorage.setItem('drawflow_token', demoToken);
    localStorage.setItem('drawflow_user', JSON.stringify(demoUser));
    set({ user: demoUser, token: demoToken, isAuthenticated: true, authError: null });
  },

  logout: () => {
    localStorage.removeItem('drawflow_token');
    localStorage.removeItem('drawflow_user');
    set({ user: null, token: '', isAuthenticated: false, isSettingsOpen: false });
  },

  fetchUser: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        set({ user: res.data.user });
        localStorage.setItem('drawflow_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Could not refresh user session');
    }
  },

  upgradePlan: async (tierId) => {
    try {
      const res = await api.post('/billing/upgrade', { tierId });
      if (res.data?.success) {
        set((state) => ({
          user: {
            ...state.user,
            tier: res.data.user.tier,
            accountStatus: res.data.user.accountStatus,
          },
        }));
        localStorage.setItem('drawflow_user', JSON.stringify(res.data.user));
        return { success: true, message: res.data.message };
      }
    } catch (err) {
      const tierTitles = {
        plan_a: 'Plan A (Free)',
        plan_b: 'Plan B (Pro Creator)',
        plan_c: 'Plan C (Enterprise Studio)',
      };
      set((state) => {
        const updated = {
          ...state.user,
          tier: tierId,
          accountStatus: `${tierTitles[tierId] || tierId} Active`,
        };
        localStorage.setItem('drawflow_user', JSON.stringify(updated));
        return { user: updated };
      });
      return { success: true, message: `Upgraded to ${tierTitles[tierId] || tierId}` };
    }
  },
}));

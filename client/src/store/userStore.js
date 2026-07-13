import { create } from 'zustand';
import api from '../lib/api';

function extractData(response) {
  const res = response.data;
  return res.data || res.watchlist || res.history || res.notifications || res.achievements || res.profile || res;
}

const useUserStore = create((set) => ({
  profile: null,
  watchlist: [],
  history: [],
  notifications: [],
  achievements: [],

  loadingProfile: false,
  loadingWatchlist: false,
  loadingHistory: false,
  loadingNotifications: false,
  loadingAchievements: false,

  error: null,

  fetchProfile: async () => {
    set({ loadingProfile: true, error: null });
    try {
      const response = await api.get('/user/profile');
      set({ profile: extractData(response), loadingProfile: false });
    } catch (error) {
      set({ loadingProfile: false, error: error.response?.data?.message || 'Failed to fetch profile' });
    }
  },

  fetchWatchlist: async () => {
    set({ loadingWatchlist: true, error: null });
    try {
      const response = await api.get('/user/watchlist');
      set({ watchlist: extractData(response), loadingWatchlist: false });
    } catch (error) {
      set({ loadingWatchlist: false, error: error.response?.data?.message || 'Failed to fetch watchlist' });
    }
  },

  addToWatchlist: async (animeId, status = 'watching') => {
    try {
      const response = await api.post('/user/watchlist', { animeId, status });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed' };
    }
  },

  removeFromWatchlist: async (animeId) => {
    try {
      await api.delete(`/user/watchlist/${animeId}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed' };
    }
  },

  fetchHistory: async () => {
    set({ loadingHistory: true, error: null });
    try {
      const response = await api.get('/user/history');
      set({ history: extractData(response), loadingHistory: false });
    } catch (error) {
      set({ loadingHistory: false, error: error.response?.data?.message || 'Failed to fetch history' });
    }
  },

  addToHistory: async (animeId, episodeId, progress = 0) => {
    try {
      await api.post('/user/history', { animeId, episodeId, progress });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  clearHistory: async () => {
    try {
      await api.delete('/user/history');
      set({ history: [] });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed' };
    }
  },

  fetchNotifications: async () => {
    set({ loadingNotifications: true, error: null });
    try {
      const response = await api.get('/user/notifications');
      set({ notifications: extractData(response), loadingNotifications: false });
    } catch (error) {
      set({ loadingNotifications: false, error: error.response?.data?.message || 'Failed' });
    }
  },

  markNotificationsRead: async () => {
    try {
      await api.put('/user/notifications/read');
      set((state) => ({
        notifications: Array.isArray(state.notifications)
          ? state.notifications.map((n) => ({ ...n, is_read: 1 }))
          : [],
      }));
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  fetchAchievements: async () => {
    set({ loadingAchievements: true, error: null });
    try {
      const response = await api.get('/user/achievements');
      set({ achievements: extractData(response), loadingAchievements: false });
    } catch (error) {
      set({ loadingAchievements: false, error: error.response?.data?.message || 'Failed to fetch achievements' });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useUserStore;

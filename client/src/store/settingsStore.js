import { create } from 'zustand';
import api from '../lib/api';

const useSettingsStore = create((set) => ({
  premiumEnabled: true,
  adsEnabled: false,
  freeEpisodesCount: 3,
  loading: false,
  fetched: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/admin/settings');
      const d = res.data.data;
      set({
        premiumEnabled: d.premium_enabled?.value !== '0' && d.premium_enabled?.value !== false,
        adsEnabled: d.ads_enabled?.value === '1' || d.ads_enabled?.value === true,
        freeEpisodesCount: parseInt(d.free_episodes_count?.value) || 3,
        fetched: true,
        loading: false,
      });
    } catch {
      set({ loading: false, fetched: true });
    }
  },
}));

export default useSettingsStore;

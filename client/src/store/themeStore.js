import { create } from 'zustand';
import api from '../lib/api';

const useThemeStore = create((set, get) => ({
  theme: 'dark',
  initialized: false,

  applyTheme: (theme) => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } catch {}
  },

  setTheme: (theme) => {
    set({ theme });
    get().applyTheme(theme);
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  // Initialize from saved preference -> admin default -> dark
  initTheme: async () => {
    if (get().initialized) return;
    let theme = 'dark';
    try {
      theme = localStorage.getItem('theme') || 'dark';
    } catch {}

    try {
      const res = await api.get('/admin/settings');
      const d = res.data.data || {};
      const adminDark = d.dark_mode?.value;
      if (adminDark === '0' || adminDark === false || adminDark === 0) {
        theme = 'light';
      } else if (adminDark === '1' || adminDark === true || adminDark === 1) {
        theme = 'dark';
      }
      // localStorage choice wins if user explicitly set it
      try {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') theme = saved;
      } catch {}
    } catch {}

    set({ theme, initialized: true });
    get().applyTheme(theme);
  },
}));

export default useThemeStore;

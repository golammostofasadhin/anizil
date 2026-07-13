import { useEffect, useRef, useCallback } from 'react';
import useUserStore from '../store/userStore';

export default function useWatchHistory(animeId, episodeId) {
  const addToHistory = useUserStore((s) => s.addToHistory);
  const lastSavedRef = useRef(0);
  const intervalRef = useRef(null);

  const saveProgress = useCallback(
    async (progress) => {
      if (!animeId || !episodeId) return;

      const now = Date.now();
      if (now - lastSavedRef.current < 30000) return;

      lastSavedRef.current = now;
      await addToHistory(animeId, episodeId, Math.min(Math.round(progress), 100));
    },
    [animeId, episodeId, addToHistory]
  );

  const handleTimeUpdate = useCallback(
    (currentTime, duration) => {
      if (!duration) return;
      const progress = (currentTime / duration) * 100;

      if (progress >= 90) {
        saveProgress(100);
      } else if (progress - (lastSavedRef.current || 0) >= 5) {
        saveProgress(progress);
      }
    },
    [saveProgress]
  );

  const startTracking = useCallback(
    (videoElement) => {
      if (!videoElement) return;

      const onTimeUpdate = () => {
        handleTimeUpdate(videoElement.currentTime, videoElement.duration);
      };

      const onEnded = () => {
        saveProgress(100);
      };

      videoElement.addEventListener('timeupdate', onTimeUpdate);
      videoElement.addEventListener('ended', onEnded);

      return () => {
        videoElement.removeEventListener('timeupdate', onTimeUpdate);
        videoElement.removeEventListener('ended', onEnded);
      };
    },
    [handleTimeUpdate, saveProgress]
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { saveProgress, startTracking };
}
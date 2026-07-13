import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Maximize, AlertCircle } from 'lucide-react';

export default function VideoPlayer({ src, title, onProgress }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [src]);

  const handleLoad = () => setLoading(false);

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const toggleFullscreen = useCallback(() => {
    const el = iframeRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'pauseVideo' }),
            '*'
          );
          break;
        case 'ArrowLeft':
          e.preventDefault();
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'seekTo', args: [-5, true] }),
            '*'
          );
          break;
        case 'ArrowRight':
          e.preventDefault();
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'seekTo', args: [5, true] }),
            '*'
          );
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          iframe.contentWindow?.postMessage(
            JSON.stringify({ event: 'command', func: 'unMute' }),
            '*'
          );
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [toggleFullscreen]);

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden">
      {/* 16:9 wrapper */}
      <div className="relative pb-[56.25%]">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-panel">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-panel gap-2">
            <AlertCircle className="w-10 h-10 text-danger" />
            <p className="text-sm text-muted">Failed to load video</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={src}
          title={title || 'Video Player'}
          className={`absolute inset-0 w-full h-full border-0 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>

      {/* Fullscreen button */}
      {!error && (
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-3 right-3 p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
          aria-label="Toggle fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

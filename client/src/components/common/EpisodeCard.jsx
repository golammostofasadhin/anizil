import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function EpisodeCard({ episode, isActive, onClick }) {
  const { number, title, thumbnail } = episode;

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
        isActive
          ? 'border-primary bg-primary/10'
          : 'border-border bg-surface hover:border-primary/30'
      }`}
    >
      {thumbnail ? (
        <div className="relative w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-panel">
          <img
            src={thumbnail}
            alt={`Episode ${number}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Play className="w-4 h-4 text-white" fill="currentColor" />
          </div>
        </div>
      ) : (
        <div
          className={`w-24 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold ${
            isActive ? 'bg-primary/20 text-primary' : 'bg-panel text-muted'
          }`}
        >
          {number}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-primary' : 'text-text'}`}>
          Episode {number}
        </p>
        {title && (
          <p className="text-xs text-muted truncate mt-0.5">{title}</p>
        )}
      </div>
      {isActive && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse flex-shrink-0" />
      )}
    </motion.button>
  );
}

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DISMISS_KEY = 'anizil_announcement_dismissed';

export default function AnnouncementBar({ text, link }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (!dismissed && text) setVisible(true);
  }, [text]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  };

  if (!visible) return null;

  const content = link ? (
    <a href={link} className="underline underline-offset-2 hover:no-underline">
      {text}
    </a>
  ) : (
    text
  );

  return (
    <div className="bg-primary text-white text-sm text-center py-2 px-10 relative">
      <span>{content}</span>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

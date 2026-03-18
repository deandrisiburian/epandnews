import { useEffect } from 'react';
import { X, Link2, Twitter, Facebook, MessageCircle, Send, Copy } from 'lucide-react';
import { Article } from '../db/database';
import toast from 'react-hot-toast';

interface ShareModalProps {
  article: Article | null;
  onClose: () => void;
}

export default function ShareModal({ article, onClose }: ShareModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!article) return null;

  const shareUrl = article.url || window.location.href;
  const shareTitle = article.title;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link disalin!', {
        style: { borderRadius: '12px', background: '#1c1c1e', color: '#fff', fontSize: '14px' },
      });
    } catch {
      toast.error('Gagal menyalin link');
    }
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      color: 'bg-green-500',
      icon: <MessageCircle size={20} className="text-white" />,
      url: `https://wa.me/?text=${encodeURIComponent(shareTitle + '\n' + shareUrl)}`,
    },
    {
      name: 'Twitter/X',
      color: 'bg-black',
      icon: <Twitter size={20} className="text-white" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Facebook',
      color: 'bg-blue-600',
      icon: <Facebook size={20} className="text-white" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Telegram',
      color: 'bg-sky-500',
      icon: <Send size={20} className="text-white" />,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch { /* user cancelled */ }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bagikan Artikel</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Article Preview */}
        <div className="mx-6 mb-5 flex gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
          <img
            src={article.image}
            alt={article.title}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=60'; }}
          />
          <div className="min-w-0">
            <p className="text-xs text-apple-blue font-semibold mb-1">{article.source}</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
              {article.title}
            </p>
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-4 gap-3 px-6 mb-5">
          {shareLinks.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="share-btn flex flex-col items-center gap-2"
            >
              <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center shadow-md`}>
                {s.icon}
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{s.name}</span>
            </a>
          ))}
        </div>

        {/* Copy link */}
        <div className="mx-6 mb-4">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl p-3">
            <Link2 size={16} className="text-slate-400 flex-shrink-0" />
            <p className="flex-1 text-xs text-slate-500 dark:text-slate-400 truncate">{shareUrl}</p>
            <button
              onClick={handleCopy}
              className="bg-apple-blue text-white px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-blue-600 transition-colors flex-shrink-0"
            >
              <Copy size={12} className="inline mr-1" />
              Salin
            </button>
          </div>
        </div>

        {/* Native share (mobile) */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <div className="px-6 pb-6">
            <button
              onClick={handleNativeShare}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-3 rounded-2xl text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Lebih Banyak Opsi...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

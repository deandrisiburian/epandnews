import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Share2, Clock, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Article, dbHelpers } from '../db/database';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'hero' | 'compact' | 'horizontal';
  onShare?: (article: Article) => void;
}

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: idLocale });
  } catch {
    return 'Baru saja';
  }
}

export default function ArticleCard({ article, variant = 'default', onShare }: ArticleCardProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const { refreshBookmarkCount } = useApp();

  useEffect(() => {
    dbHelpers.isBookmarked(article.articleId).then(setBookmarked);
  }, [article.articleId]);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await dbHelpers.toggleBookmark(article);
    setBookmarked(result);
    await refreshBookmarkCount();
    toast.success(result ? '🔖 Artikel disimpan!' : '🗑️ Artikel dihapus dari simpanan', {
      duration: 2000,
      style: { borderRadius: '12px', background: '#1c1c1e', color: '#fff', fontSize: '14px' },
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) onShare(article);
  };

  // ── HERO variant ──────────────────────────────────────────────────────────
  if (variant === 'hero') {
    return (
      <Link to={`/article/${article.articleId}`} state={{ article }} className="block group relative rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative h-[480px] md:h-[560px]">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'; }}
          />
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute top-4 left-4">
            <span className="bg-apple-blue text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
              {article.category}
            </span>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <button onClick={handleBookmark} className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
              {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
            <button onClick={handleShare} className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white hover:bg-black/50 transition-colors">
              <Share2 size={16} />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="text-sm text-white/70 mb-2 flex items-center gap-2">
              <Clock size={12} /> {timeAgo(article.publishedAt)}
              <span className="w-1 h-1 bg-white/50 rounded-full" />
              {article.source}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold leading-tight line-clamp-3 group-hover:text-blue-200 transition-colors">
              {article.title}
            </h2>
            <p className="mt-2 text-white/80 text-sm line-clamp-2">{article.description}</p>
          </div>
        </div>
      </Link>
    );
  }

  // ── HORIZONTAL variant ────────────────────────────────────────────────────
  if (variant === 'horizontal') {
    return (
      <Link
        to={`/article/${article.articleId}`}
        state={{ article }}
        className="flex gap-3 group p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="relative flex-shrink-0 w-24 h-20 rounded-xl overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-semibold text-apple-blue uppercase tracking-wide">{article.category}</span>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug mt-0.5 group-hover:text-apple-blue transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <Clock size={10} /> {timeAgo(article.publishedAt)} · {article.source}
          </p>
        </div>
      </Link>
    );
  }

  // ── COMPACT variant ───────────────────────────────────────────────────────
  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${article.articleId}`}
        state={{ article }}
        className="block group"
      >
        <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="relative h-36 overflow-hidden">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'; }}
            />
            <div className="absolute top-2 left-2">
              <span className="bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                {article.category}
              </span>
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-apple-blue transition-colors">
              {article.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
              <Clock size={10} /> {timeAgo(article.publishedAt)}
            </p>
          </div>
        </div>
      </Link>
    );
  }

  // ── DEFAULT variant ───────────────────────────────────────────────────────
  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 card-hover">
      <Link to={`/article/${article.articleId}`} state={{ article }}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'; }}
          />
          <div className="absolute top-3 left-3">
            <span className="bg-apple-blue text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide">
              {article.category}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock size={11} /> {timeAgo(article.publishedAt)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Eye size={11} /> {article.views?.toLocaleString() || '0'}
          </span>
        </div>
        <Link to={`/article/${article.articleId}`} state={{ article }}>
          <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-apple-blue transition-colors mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        </Link>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
              {article.source.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate font-medium">{article.source}</span>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={handleBookmark}
              className={cn(
                'p-1.5 rounded-xl transition-all',
                bookmarked
                  ? 'text-apple-blue bg-blue-50 dark:bg-blue-950'
                  : 'text-slate-400 hover:text-apple-blue hover:bg-blue-50 dark:hover:bg-blue-950'
              )}
              title="Simpan artikel"
            >
              {bookmarked ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl text-slate-400 hover:text-apple-blue hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
              title="Bagikan artikel"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

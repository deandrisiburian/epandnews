import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Bookmark, BookmarkCheck, Share2, Clock, Eye,
  ExternalLink, Tag, ChevronRight, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Article, dbHelpers } from '../db/database';
import { fetchNewsByCategory } from '../api/newsApi';
import { useApp } from '../context/AppContext';
import Comments from '../components/Comments';
import ShareModal from '../components/ShareModal';
import ArticleCard from '../components/ArticleCard';
import SkeletonCard from '../components/SkeletonCard';
import toast from 'react-hot-toast';

export default function ArticleDetail() {
  const { articleId } = useParams<{ articleId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshBookmarkCount } = useApp();

  const [article, setArticle] = useState<Article | null>(
    (location.state as { article?: Article })?.article || null
  );
  const [bookmarked, setBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [related, setRelated] = useState<Article[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Try to load from DB if not in state
  useEffect(() => {
    if (!article && articleId) {
      dbHelpers.getArticle(articleId).then((a) => {
        if (a) setArticle(a);
      });
    }
  }, [articleId, article]);

  // Load bookmark state & save read history
  useEffect(() => {
    if (!articleId || !article) return;
    dbHelpers.isBookmarked(articleId).then(setBookmarked);
    dbHelpers.addReadHistory(articleId, article.title).catch(() => {});
    dbHelpers.incrementViews(articleId).catch(() => {});
  }, [articleId, article]);

  // Reading progress bar
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop || document.body.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setReadProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Load related articles
  useEffect(() => {
    if (!article) return;
    setLoadingRelated(true);
    fetchNewsByCategory(article.category, 1).then((result) => {
      setRelated(result.articles.filter((a) => a.articleId !== article.articleId).slice(0, 4));
      setLoadingRelated(false);
    });
  }, [article]);

  const handleBookmark = useCallback(async () => {
    if (!article) return;
    const result = await dbHelpers.toggleBookmark(article);
    setBookmarked(result);
    await refreshBookmarkCount();
    toast.success(result ? '🔖 Artikel disimpan!' : '🗑️ Dihapus dari simpanan', {
      style: { borderRadius: '12px', background: '#1c1c1e', color: '#fff', fontSize: '14px' },
    });
  }, [article, refreshBookmarkCount]);

  function formatDate(dateStr: string) {
    try {
      return format(new Date(dateStr), "dd MMMM yyyy, HH:mm", { locale: idLocale });
    } catch { return dateStr; }
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center">
        <div className="text-center p-8">
          <RefreshCw size={32} className="animate-spin text-apple-blue mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  const contentParagraphs = article.content
    ? article.content.split('\n').filter(p => p.trim().length > 0)
    : [article.description];

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Reading progress bar */}
      <div className="progress-bar" style={{ width: `${readProgress}%` }} />

      {/* Sticky toolbar */}
      <div className="sticky top-16 z-40 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-apple-blue transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Kembali</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl transition-all ${bookmarked ? 'text-apple-blue bg-blue-50 dark:bg-blue-950' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
            <button
              onClick={() => setShareOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Share2 size={18} />
            </button>
            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6 flex-wrap">
          <Link to="/" className="hover:text-apple-blue transition-colors">Beranda</Link>
          <ChevronRight size={12} />
          <Link to="/" className="hover:text-apple-blue transition-colors capitalize">{article.category}</Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{article.title}</span>
        </div>

        {/* Category badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1 bg-blue-50 dark:bg-blue-950 text-apple-blue px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide">
            <Tag size={10} />
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {article.author.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300">{article.author}</span>
          </div>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {formatDate(article.publishedAt)}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={13} /> {(article.views || 0).toLocaleString()} tayangan
          </span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full font-medium">
            {article.source}
          </span>
        </div>

        {/* Lead image */}
        <div className="rounded-2xl overflow-hidden mb-8 shadow-lg">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-64 sm:h-80 md:h-96 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80'; }}
          />
          <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400">📷 Foto: {article.source}</p>
          </div>
        </div>

        {/* Article body */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {/* Lead paragraph */}
          <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-6 border-l-4 border-apple-blue pl-4 italic">
            {article.description}
          </p>

          {/* Content paragraphs */}
          {contentParagraphs.map((para, idx) => (
            <p key={idx} className="text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              {para}
            </p>
          ))}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            {article.tags.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs hover:bg-blue-50 hover:text-apple-blue dark:hover:bg-blue-950 transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Source attribution */}
        {article.url && (
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sumber:{' '}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-apple-blue hover:underline font-medium"
              >
                {article.source} ↗
              </a>
            </p>
          </div>
        )}

        {/* Share CTA */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-2xl text-center">
          <p className="text-slate-700 dark:text-slate-300 font-medium mb-3">Bagikan artikel ini</p>
          <button
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-2 bg-apple-blue text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-md"
          >
            <Share2 size={16} />
            Bagikan Sekarang
          </button>
        </div>

        {/* Comments */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
          <Comments articleId={article.articleId} />
        </div>

        {/* Related Articles */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Berita Terkait</h2>
          {loadingRelated ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((a) => (
                <ArticleCard key={a.articleId} article={a} variant="default" />
              ))}
            </div>
          )}
        </div>
      </article>

      {shareOpen && <ShareModal article={article} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

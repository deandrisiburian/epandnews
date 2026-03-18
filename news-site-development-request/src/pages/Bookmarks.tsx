import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, Clock, Search, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Bookmark as BookmarkType, dbHelpers } from '../db/database';
import { useApp } from '../context/AppContext';
import ArticleCard from '../components/ArticleCard';
import ShareModal from '../components/ShareModal';
import { Article } from '../db/database';
import toast from 'react-hot-toast';

export default function Bookmarks() {
  const { refreshBookmarkCount } = useApp();
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  const [shareArticle, setShareArticle] = useState<Article | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    setLoading(true);
    const data = await dbHelpers.getAllBookmarks();
    setBookmarks(data);
    setLoading(false);
  }

  async function handleRemove(articleId: string) {
    const bm = bookmarks.find(b => b.articleId === articleId);
    if (!bm) return;
    await dbHelpers.toggleBookmark(bm.article);
    await loadBookmarks();
    await refreshBookmarkCount();
    toast.success('🗑️ Artikel dihapus dari simpanan', {
      style: { borderRadius: '12px', background: '#1c1c1e', color: '#fff', fontSize: '14px' },
    });
  }

  async function handleClearAll() {
    if (!window.confirm('Hapus semua artikel yang disimpan?')) return;
    for (const bm of bookmarks) {
      await dbHelpers.toggleBookmark(bm.article);
    }
    await loadBookmarks();
    await refreshBookmarkCount();
    toast.success('Semua bookmark dihapus', {
      style: { borderRadius: '12px', background: '#1c1c1e', color: '#fff', fontSize: '14px' },
    });
  }

  function timeAgo(ts: number) {
    try {
      return formatDistanceToNow(new Date(ts), { addSuffix: true, locale: idLocale });
    } catch { return 'Baru saja'; }
  }

  const filtered = searchQ
    ? bookmarks.filter(b =>
        b.article.title.toLowerCase().includes(searchQ.toLowerCase()) ||
        b.article.source.toLowerCase().includes(searchQ.toLowerCase()) ||
        b.article.category.toLowerCase().includes(searchQ.toLowerCase())
      )
    : bookmarks;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pt-6 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bookmark size={24} className="text-apple-blue" />
              Artikel Tersimpan
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {bookmarks.length} artikel disimpan
            </p>
          </div>
          {bookmarks.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-apple-blue transition-all shadow-sm text-xs font-medium px-3"
              >
                {view === 'grid' ? '☰ List' : '⊞ Grid'}
              </button>
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all shadow-sm"
              >
                <Trash2 size={14} />
                Hapus Semua
              </button>
            </div>
          )}
        </div>

        {/* Search within bookmarks */}
        {bookmarks.length > 3 && (
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              placeholder="Cari dalam simpanan..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-apple-blue transition-all"
            />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-3 skeleton rounded w-1/3" />
                  <div className="h-4 skeleton rounded" />
                  <div className="h-4 skeleton rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-24 animate-fadeInUp">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mx-auto mb-5">
              <BookOpen size={36} className="text-apple-blue" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Belum ada artikel tersimpan</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-sm mx-auto">
              Simpan artikel menarik agar bisa dibaca kapan saja, bahkan saat offline.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-apple-blue text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-md"
            >
              Jelajahi Berita
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 dark:text-slate-400">Tidak ada hasil untuk "<strong>{searchQ}</strong>"</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((bm) => (
              <div key={bm.articleId} className="relative group">
                <ArticleCard article={bm.article} variant="default" onShare={setShareArticle} />
                {/* Saved date overlay */}
                <div className="mt-1 px-1">
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={10} />
                    Disimpan {timeAgo(bm.savedAt)}
                  </p>
                </div>
                {/* Quick remove */}
                <button
                  onClick={() => handleRemove(bm.articleId)}
                  className="absolute top-2 right-2 p-1.5 bg-white dark:bg-slate-900 rounded-full shadow-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Hapus dari simpanan"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="space-y-3">
            {filtered.map((bm) => (
              <div key={bm.articleId} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-md transition-shadow group">
                <Link to={`/article/${bm.articleId}`} state={{ article: bm.article }} className="flex gap-4 p-4">
                  <img
                    src={bm.article.image}
                    alt={bm.article.title}
                    className="w-24 h-20 sm:w-32 sm:h-24 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=60'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold text-apple-blue uppercase tracking-wide">{bm.article.category}</span>
                    <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug mt-0.5 text-sm group-hover:text-apple-blue transition-colors">
                      {bm.article.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{bm.article.source}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={10} /> Disimpan {timeAgo(bm.savedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); handleRemove(bm.articleId); }}
                    className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all self-start opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={15} />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {shareArticle && <ShareModal article={shareArticle} onClose={() => setShareArticle(null)} />}
    </div>
  );
}

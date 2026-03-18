import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X, TrendingUp, Clock, Filter } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { Article } from '../db/database';
import { searchNews, CATEGORIES } from '../api/newsApi';
import ArticleCard from '../components/ArticleCard';
import SkeletonCard from '../components/SkeletonCard';
import ShareModal from '../components/ShareModal';

const POPULAR_TOPICS = [
  'Politik', 'Ekonomi', 'Teknologi', 'Olahraga',
  'Kesehatan', 'Hiburan', 'Dunia', 'Pendidikan',
  'Lingkungan', 'Hukum', 'Bisnis', 'Sains',
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [inputVal, setInputVal] = useState(initialQuery);
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [shareArticle, setShareArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  const [isLive, setIsLive] = useState(false);

  // Handle search when query changes
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    setPage(1);
    setHasMore(true);
    setResults([]);
    searchNews(query, 1).then((result) => {
      setResults(result.articles);
      setIsLive(result.isLive);
      setLoading(false);
    });
  }, [query]);

  // Sync query with URL
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
      setInputVal(initialQuery);
    }
  }, [initialQuery]);

  // Infinite scroll for search
  useEffect(() => {
    if (!inView || loading || loadingMore || !hasMore || !query) return;
    const nextPage = page + 1;
    if (nextPage > 4) { setHasMore(false); return; }
    setLoadingMore(true);
    searchNews(query, nextPage).then((result) => {
      if (result.articles.length === 0) setHasMore(false);
      else { setResults(prev => [...prev, ...result.articles]); setPage(nextPage); }
      setLoadingMore(false);
    });
  }, [inView, loading, loadingMore, hasMore, page, query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setQuery(inputVal.trim());
      setSearchParams({ q: inputVal.trim() });
    }
  };

  const handleClear = () => {
    setInputVal('');
    setQuery('');
    setSearchParams({});
    setResults([]);
  };

  const filteredResults = selectedCategory === 'all'
    ? results
    : results.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black pt-6 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pencarian</h1>
            {isLive && query && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                LIVE
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Cari berita dari seluruh Indonesia &amp; dunia</p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="relative mb-6">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-apple-blue focus-within:border-transparent transition-all">
            <SearchIcon size={20} className="text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Cari berita, topik, kata kunci..."
              className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
              autoFocus
            />
            {inputVal && (
              <button type="button" onClick={handleClear} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            )}
            <button
              type="submit"
              className="bg-apple-blue text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex-shrink-0"
            >
              Cari
            </button>
          </div>
        </form>

        {/* No query - show suggestions */}
        {!query && (
          <div className="space-y-8 animate-fadeInUp">
            {/* Trending searches */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-orange-500" />
                <h2 className="font-bold text-slate-900 dark:text-white">Topik Populer</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setInputVal(t); setQuery(t); setSearchParams({ q: t }); }}
                    className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-blue-50 hover:text-apple-blue hover:border-apple-blue dark:hover:bg-blue-950 transition-all shadow-sm"
                  >
                    🔍 {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Category cards */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-apple-blue" />
                <h2 className="font-bold text-slate-900 dark:text-white">Kategori Berita</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setInputVal(cat.label); setQuery(cat.label); setSearchParams({ q: cat.label }); }}
                    className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-apple-blue hover:shadow-md transition-all text-left group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{cat.label}</p>
                      <p className="text-xs text-slate-400">Telusuri →</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <>
            {/* Filter bar */}
            {results.length > 0 && (
              <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                <Filter size={14} className="text-slate-400 flex-shrink-0" />
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-colors ${selectedCategory === 'all' ? 'bg-apple-blue text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                >
                  Semua ({results.length})
                </button>
                {CATEGORIES.filter(c => results.some(r => r.category === c.id)).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-colors ${selectedCategory === cat.id ? 'bg-apple-blue text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-16 animate-fadeInUp">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <SearchIcon size={28} className="text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Tidak ada hasil</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Tidak ditemukan artikel untuk "<strong>{query}</strong>"
                </p>
                <p className="text-slate-400 text-sm mt-1">Coba kata kunci lain atau topik yang berbeda</p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Menampilkan <strong className="text-slate-700 dark:text-slate-300">{filteredResults.length}</strong> hasil untuk{' '}
                    <strong className="text-apple-blue">"{query}"</strong>
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredResults.map((a) => (
                    <ArticleCard key={a.articleId} article={a} variant="default" onShare={setShareArticle} />
                  ))}
                </div>

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className="py-6">
                  {loadingMore && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1,2].map(i => <SkeletonCard key={i} />)}
                    </div>
                  )}
                  {!hasMore && filteredResults.length > 0 && (
                    <p className="text-center text-sm text-slate-400 py-4">✓ Semua hasil telah dimuat</p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {shareArticle && <ShareModal article={shareArticle} onClose={() => setShareArticle(null)} />}
    </div>
  );
}

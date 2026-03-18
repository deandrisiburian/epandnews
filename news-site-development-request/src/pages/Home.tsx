import { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { RefreshCw, TrendingUp, Clock, Flame, Wifi, WifiOff, Radio } from 'lucide-react';
import { Article, dbHelpers } from '../db/database';
import { fetchNewsByCategory, fetchBreakingNews, clearCache, getMockArticles } from '../api/newsApi';
import { useApp } from '../context/AppContext';
import ArticleCard from '../components/ArticleCard';
import SkeletonCard from '../components/SkeletonCard';
import CategoryBar from '../components/CategoryBar';
import BreakingTicker from '../components/BreakingTicker';
import ShareModal from '../components/ShareModal';

const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

export default function Home() {
  const { currentCategory } = useApp();
  const [articles, setArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [breakingArticles, setBreakingArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [shareArticle, setShareArticle] = useState<Article | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [apiError, setApiError] = useState(false);
  const autoRefreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  // Load initial articles
  const loadArticles = useCallback(async (cat: string, forceRefresh = false) => {
    if (forceRefresh) {
      clearCache();
    }
    setLoading(true);
    setPage(1);
    setHasMore(true);
    setApiError(false);
    try {
      const result = await fetchNewsByCategory(cat, 1, 10);
      setIsLive(result.isLive);
      setApiError(!result.isLive);
      const withDefaults = result.articles.map((a) => ({
        ...a,
        views: a.views || 0,
        tags: a.tags || [],
      }));
      setArticles(withDefaults);
      setLastUpdated(new Date());
      withDefaults.forEach((a) => dbHelpers.saveArticle(a).catch(() => {}));
    } catch {
      setApiError(true);
      const fallback = getMockArticles(cat, 1);
      setArticles(fallback);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load breaking news
  const loadBreaking = useCallback(async () => {
    try {
      const result = await fetchBreakingNews(8);
      if (result.articles.length > 0) {
        setBreakingArticles(result.articles);
      }
    } catch {
      // silently ignore
    }
  }, []);

  // Load trending sidebar (from live or mock)
  const loadTrending = useCallback(async () => {
    try {
      const result = await fetchNewsByCategory('general', 1, 5);
      setTrendingArticles(result.articles.slice(0, 5));
    } catch {
      setTrendingArticles(getMockArticles('general', 1).slice(0, 5));
    }
  }, []);

  useEffect(() => {
    setArticles([]);
    setPage(1);
    loadArticles(currentCategory);
  }, [currentCategory, loadArticles]);

  // Load breaking + trending on mount
  useEffect(() => {
    loadBreaking();
    loadTrending();
  }, [loadBreaking, loadTrending]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    autoRefreshTimer.current = setInterval(() => {
      console.log('[Home] ⏱️ Auto-refreshing news...');
      clearCache();
      loadArticles(currentCategory);
      loadBreaking();
    }, AUTO_REFRESH_MS);
    return () => {
      if (autoRefreshTimer.current) clearInterval(autoRefreshTimer.current);
    };
  }, [currentCategory, loadArticles, loadBreaking]);

  // Infinite scroll
  useEffect(() => {
    if (!inView || loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    if (nextPage > 5) {
      setHasMore(false);
      return;
    }
    setLoadingMore(true);
    fetchNewsByCategory(currentCategory, nextPage, 10).then((result) => {
      if (result.articles.length === 0) {
        setHasMore(false);
      } else {
        setArticles((prev) => {
          const existingIds = new Set(prev.map((a) => a.articleId));
          const newData = result.articles.filter((a) => !existingIds.has(a.articleId));
          return [...prev, ...newData];
        });
        setPage(nextPage);
        result.articles.forEach((a) =>
          dbHelpers.saveArticle({ ...a, views: 0, tags: a.tags || [] }).catch(() => {})
        );
      }
      setLoadingMore(false);
    });
  }, [inView, loading, loadingMore, hasMore, page, currentCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    setArticles([]);
    loadArticles(currentCategory, true);
    loadBreaking();
  };

  const heroArticle = articles[0];
  const featuredArticles = articles.slice(1, 4);
  const gridArticles = articles.slice(4);

  // Breaking ticker source: prefer live breaking, else current articles
  const tickerArticles = breakingArticles.length > 0 ? breakingArticles : articles.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      {/* Breaking news ticker */}
      {tickerArticles.length > 0 && <BreakingTicker articles={tickerArticles} isLive={isLive} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Berita Terkini
              </h1>

              {/* Live status badge */}
              <span
                className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full transition-all ${
                  isLive
                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'
                }`}
              >
                {isLive ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    LIVE
                  </>
                ) : (
                  <>
                    <WifiOff size={9} />
                    DEMO
                  </>
                )}
              </span>

              {/* GNews badge */}
              {isLive && (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                  <Radio size={9} />
                  GNews API
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Indonesia &amp; Dunia</p>
              {lastUpdated && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  · Diperbarui {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:border-apple-blue hover:text-apple-blue transition-all shadow-sm disabled:opacity-60"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryBar />
        </div>

        {/* API Status Banner */}
        {!loading && (
          <div
            className={`mb-4 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm ${
              isLive
                ? 'bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-900'
                : 'bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900'
            }`}
          >
            {isLive ? (
              <>
                <Wifi size={15} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-green-800 dark:text-green-300">
                  <strong>Berita Real-Time</strong> · Terhubung ke GNews API — menampilkan berita langsung dari Indonesia &amp; dunia
                </span>
              </>
            ) : (
              <>
                <WifiOff size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-amber-800 dark:text-amber-300">
                  <strong>Mode Demo</strong> · GNews API sedang tidak tersedia atau rate-limited. Menampilkan data contoh.
                </span>
                {apiError && (
                  <button
                    onClick={handleRefresh}
                    className="ml-auto text-xs font-semibold text-amber-700 dark:text-amber-400 underline hover:no-underline flex-shrink-0"
                  >
                    Coba lagi
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            <SkeletonCard variant="hero" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Hero Article */}
            {heroArticle && (
              <div className="mb-6 animate-fadeInUp">
                <ArticleCard article={heroArticle} variant="hero" onShare={setShareArticle} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Featured 3-column */}
                {featuredArticles.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Flame size={16} className="text-orange-500" />
                      <h2 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                        Pilihan Editor
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {featuredArticles.map((a, idx) => (
                        <div
                          key={a.articleId}
                          className="animate-fadeInUp"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          <ArticleCard article={a} variant="default" onShare={setShareArticle} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* More articles grid */}
                {gridArticles.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock size={16} className="text-apple-blue" />
                      <h2 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                        Berita Lainnya
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {gridArticles.map((a, idx) => (
                        <div
                          key={a.articleId}
                          className="animate-fadeInUp"
                          style={{ animationDelay: `${(idx % 4) * 0.05}s` }}
                        >
                          <ArticleCard article={a} variant="default" onShare={setShareArticle} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Load more trigger (infinite scroll) */}
                <div ref={loadMoreRef} className="py-4">
                  {loadingMore && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  )}
                  {!hasMore && articles.length > 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                        <TrendingUp size={20} className="text-slate-400" />
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        ✓ Semua berita telah dimuat
                      </p>
                      <button
                        onClick={handleRefresh}
                        className="mt-3 text-xs text-apple-blue font-medium hover:underline"
                      >
                        Muat ulang berita terbaru
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Trending */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-orange-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                      Trending
                    </h3>
                    {isLive && (
                      <span className="ml-auto text-[9px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-950 px-1.5 py-0.5 rounded-full">
                        LIVE
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {(trendingArticles.length > 0 ? trendingArticles : articles.slice(0, 5)).map(
                      (a, idx) => (
                        <div key={a.articleId} className="flex gap-3 py-2">
                          <span className="text-2xl font-black text-slate-200 dark:text-slate-700 leading-none flex-shrink-0 w-7 text-right select-none">
                            {idx + 1}
                          </span>
                          <ArticleCard article={a} variant="horizontal" />
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Sorotan */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame size={16} className="text-red-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">
                      Sorotan
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {articles.slice(0, 4).map((a) => (
                      <ArticleCard key={a.articleId} article={a} variant="compact" />
                    ))}
                  </div>
                </div>

                {/* Live Data Info Box */}
                <div
                  className={`rounded-2xl p-4 border ${
                    isLive
                      ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-900'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isLive ? (
                      <Wifi size={14} className="text-green-500" />
                    ) : (
                      <WifiOff size={14} className="text-slate-400" />
                    )}
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Status Sumber
                    </span>
                  </div>
                  {isLive ? (
                    <div className="space-y-2">
                      <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed font-medium">
                        ✅ Berita real-time dari GNews API
                      </p>
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                        <div className="flex justify-between">
                          <span>Sumber</span>
                          <span className="font-medium">GNews.io</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Bahasa</span>
                          <span className="font-medium">Indonesia</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Auto-refresh</span>
                          <span className="font-medium">5 menit</span>
                        </div>
                        {lastUpdated && (
                          <div className="flex justify-between">
                            <span>Terakhir</span>
                            <span className="font-medium">
                              {lastUpdated.toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      📦 Data demo aktif. GNews API dengan key yang diberikan akan digunakan saat
                      tersedia.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Share Modal */}
      {shareArticle && (
        <ShareModal article={shareArticle} onClose={() => setShareArticle(null)} />
      )}
    </div>
  );
}

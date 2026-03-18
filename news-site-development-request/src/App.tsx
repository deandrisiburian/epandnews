import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Search from './pages/Search';
import ArticleDetail from './pages/ArticleDetail';
import Bookmarks from './pages/Bookmarks';
import Redaksi from './pages/Redaksi';
import About from './pages/About';
import { Newspaper, Heart } from 'lucide-react';

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="sm:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-apple-blue flex items-center justify-center">
                <Newspaper size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                EpanD<span className="text-apple-blue">News</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Portal berita terpercaya Indonesia. Informasi akurat, cepat, dan mendalam dari seluruh nusantara.
            </p>
          </div>
          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Navigasi</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Beranda' },
                { to: '/search', label: 'Pencarian' },
                { to: '/bookmarks', label: 'Tersimpan' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-slate-500 dark:text-slate-400 hover:text-apple-blue transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Perusahaan</h4>
            <ul className="space-y-2">
              {[
                { to: '/about', label: 'Tentang Kami' },
                { to: '/redaksi', label: 'Redaksi' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-slate-500 dark:text-slate-400 hover:text-apple-blue transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-3">Kategori</h4>
            <ul className="space-y-2">
              {['Nasional', 'Teknologi', 'Olahraga', 'Bisnis', 'Kesehatan'].map(c => (
                <li key={c}>
                  <Link to={`/search?q=${encodeURIComponent(c)}`} className="text-xs text-slate-500 dark:text-slate-400 hover:text-apple-blue transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            © {year} EpanDNews. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            Dibuat dengan <Heart size={11} className="text-red-400" fill="currentColor" /> di Indonesia
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-slate-400 hover:text-apple-blue transition-colors">Kebijakan Privasi</a>
            <a href="#" className="text-xs text-slate-400 hover:text-apple-blue transition-colors">Syarat & Ketentuan</a>
            <a href="mailto:redaksi@epandnews.id" className="text-xs text-slate-400 hover:text-apple-blue transition-colors">Kontak</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors duration-300 flex flex-col">
          <Navbar />
          <main className="pt-16 flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/article/:articleId" element={<ArticleDetail />} />
              <Route path="/bookmarks" element={<Bookmarks />} />
              <Route path="/redaksi" element={<Redaksi />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                borderRadius: '12px',
                background: '#1c1c1e',
                color: '#fff',
                fontSize: '14px',
              },
            }}
          />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

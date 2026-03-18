import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Newspaper, Search, Bookmark, Moon, Sun, Menu, X, Bell, Home, Info, Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

export default function Navbar() {
  const { darkMode, toggleDarkMode, bookmarkCount } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal('');
    }
  };

  const navLinks = [
    { href: '/', label: 'Beranda', icon: <Home size={16} /> },
    { href: '/search', label: 'Pencarian', icon: <Search size={16} /> },
    { href: '/bookmarks', label: 'Tersimpan', icon: <Bookmark size={16} /> },
    { href: '/redaksi', label: 'Redaksi', icon: <Users size={16} /> },
    { href: '/about', label: 'Tentang', icon: <Info size={16} /> },
  ];

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled || mobileOpen ? 'nav-glass shadow-sm' : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-apple-blue flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Newspaper size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                EpanD<span className="text-apple-blue">News</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    location.pathname === link.href
                      ? 'bg-blue-50 text-apple-blue dark:bg-blue-950 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  {link.icon}
                  {link.label}
                  {link.href === '/bookmarks' && bookmarkCount > 0 && (
                    <span className="ml-0.5 bg-apple-blue text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {bookmarkCount > 9 ? '9+' : bookmarkCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Cari berita"
              >
                <Search size={18} />
              </button>

              {/* Notification bell */}
              <button className="hidden sm:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-700 py-2 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all mb-1',
                  location.pathname === link.href
                    ? 'bg-blue-50 text-apple-blue dark:bg-blue-950 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                {link.icon}
                {link.label}
                {link.href === '/bookmarks' && bookmarkCount > 0 && (
                  <span className="ml-auto bg-apple-blue text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {bookmarkCount > 9 ? '9+' : bookmarkCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-fadeInUp"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3 p-4">
              <Search size={20} className="text-slate-400 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Cari berita, topik, atau kata kunci..."
                className="flex-1 text-lg bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button type="submit" className="bg-apple-blue text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">
                Cari
              </button>
              <button type="button" onClick={() => setSearchOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X size={18} className="text-slate-500" />
              </button>
            </form>
            <div className="px-4 pb-4">
              <p className="text-xs text-slate-400 mb-2 font-medium">TOPIK POPULER</p>
              <div className="flex flex-wrap gap-2">
                {['Politik', 'Ekonomi', 'Teknologi', 'Olahraga', 'Hiburan', 'Kesehatan', 'Dunia'].map((t) => (
                  <button
                    key={t}
                    onClick={() => { navigate(`/search?q=${encodeURIComponent(t)}`); setSearchOpen(false); }}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-blue-50 hover:text-apple-blue dark:hover:bg-blue-950 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

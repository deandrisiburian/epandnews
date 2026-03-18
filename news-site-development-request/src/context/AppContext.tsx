import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, dbHelpers } from '../db/database';

interface AppContextType {
  user: UserProfile | null;
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentCategory: string;
  setCurrentCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  bookmarkCount: number;
  setBookmarkCount: (n: number) => void;
  refreshBookmarkCount: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkCount, setBookmarkCount] = useState(0);

  useEffect(() => {
    const savedDark = localStorage.getItem('epandnews_darkmode');
    if (savedDark === 'true') setDarkMode(true);
    dbHelpers.getOrCreateUser().then((u) => {
      setUser(u);
    });
    dbHelpers.getAllBookmarks().then((bms) => setBookmarkCount(bms.length));
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('epandnews_darkmode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    await dbHelpers.updateUserProfile(updates);
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const refreshBookmarkCount = useCallback(async () => {
    const bms = await dbHelpers.getAllBookmarks();
    setBookmarkCount(bms.length);
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        darkMode,
        toggleDarkMode,
        currentCategory,
        setCurrentCategory,
        searchQuery,
        setSearchQuery,
        updateUser,
        bookmarkCount,
        setBookmarkCount,
        refreshBookmarkCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

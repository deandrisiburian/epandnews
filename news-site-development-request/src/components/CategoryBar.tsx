import { useRef } from 'react';
import { CATEGORIES } from '../api/newsApi';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

export default function CategoryBar() {
  const { currentCategory, setCurrentCategory } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setCurrentCategory(cat.id)}
          className={cn(
            'cat-pill flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium flex-shrink-0 border',
            currentCategory === cat.id
              ? 'active border-transparent shadow-sm'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          )}
        >
          <span className="text-base leading-none">{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}

import { Article } from '../db/database';
import { Zap, Radio } from 'lucide-react';

interface BreakingTickerProps {
  articles: Article[];
  isLive?: boolean;
}

export default function BreakingTicker({ articles, isLive = false }: BreakingTickerProps) {
  if (!articles.length) return null;

  // Duplicate for seamless CSS loop
  const items = [...articles, ...articles];

  return (
    <div className="bg-apple-blue text-white py-2 overflow-hidden">
      <div className="flex items-center">
        {/* Label */}
        <div className="flex items-center gap-1.5 px-4 flex-shrink-0 z-10 bg-apple-blue">
          {isLive ? (
            <>
              <span className="relative flex h-2 w-2 mr-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              <Radio size={12} />
              <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Live</span>
            </>
          ) : (
            <>
              <Zap size={13} fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">Breaking</span>
            </>
          )}
          <span className="w-px h-4 bg-white/30 mx-1" />
        </div>

        {/* Ticker scroll */}
        <div className="overflow-hidden flex-1">
          <div className="ticker-inner">
            {items.map((a, i) => (
              <span
                key={`${a.articleId}-${i}`}
                className="flex items-center gap-2 pr-12 text-xs font-medium whitespace-nowrap opacity-95"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                {a.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Send, MessageCircle, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Comment, dbHelpers } from '../db/database';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import toast from 'react-hot-toast';

interface CommentsProps {
  articleId: string;
}

export default function Comments({ articleId }: CommentsProps) {
  const { user } = useApp();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [articleId]);

  async function loadComments() {
    setLoading(true);
    const data = await dbHelpers.getComments(articleId);
    setComments(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setSubmitting(true);
    try {
      await dbHelpers.addComment({
        articleId,
        author: user.displayName || user.username,
        avatar: user.avatar,
        content: text.trim(),
        createdAt: Date.now(),
        likes: 0,
        likedBy: [],
      });
      setText('');
      await loadComments();
      toast.success('Komentar berhasil dikirim!', {
        style: { borderRadius: '12px', background: '#1c1c1e', color: '#fff', fontSize: '14px' },
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike(commentId: number) {
    if (!user) return;
    await dbHelpers.likeComment(commentId, user.userId);
    await loadComments();
  }

  async function handleDelete(commentId: number, author: string) {
    if (!user) return;
    const isOwner = author === (user.displayName || user.username);
    if (!isOwner) return;
    await dbHelpers.deleteComment(commentId);
    await loadComments();
    toast.success('Komentar dihapus', {
      style: { borderRadius: '12px', background: '#1c1c1e', color: '#fff', fontSize: '14px' },
    });
  }

  function timeAgo(ts: number) {
    try {
      return formatDistanceToNow(new Date(ts), { addSuffix: true, locale: idLocale });
    } catch {
      return 'Baru saja';
    }
  }

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} className="text-apple-blue" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Komentar ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          {user ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-slate-400" />
            </div>
          )}
          <div className="flex-1">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tulis komentar Anda..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-all"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-slate-400">{text.length}/500</span>
              <button
                type="submit"
                disabled={!text.trim() || submitting}
                className="flex items-center gap-2 bg-apple-blue text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={14} />
                {submitting ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-24 rounded" />
                <div className="skeleton h-12 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Belum ada komentar. Jadilah yang pertama!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = user && comment.author === (user.displayName || user.username);
            const liked = user ? comment.likedBy?.includes(user.userId) : false;
            return (
              <div
                key={comment.id}
                className="flex gap-3 group animate-fadeInUp"
              >
                <img
                  src={comment.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author)}&background=4F46E5&color=fff&size=64`}
                  alt={comment.author}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {comment.author}
                      </span>
                      <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 px-2">
                    <button
                      onClick={() => comment.id && handleLike(comment.id)}
                      className={cn(
                        'flex items-center gap-1 text-xs transition-colors',
                        liked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                      )}
                    >
                      <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
                      <span>{comment.likes || 0}</span>
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => comment.id && handleDelete(comment.id, comment.author)}
                        className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

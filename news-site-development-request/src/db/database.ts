import Dexie, { type Table } from 'dexie';

export interface Article {
  id?: number;
  articleId: string;
  title: string;
  description: string;
  content: string;
  image: string;
  url: string;
  source: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  views: number;
  savedAt?: number;
}

export interface Bookmark {
  id?: number;
  articleId: string;
  savedAt: number;
  article: Article;
}

export interface Comment {
  id?: number;
  articleId: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: number;
  likes: number;
  likedBy: string[];
}

export interface UserProfile {
  id?: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  createdAt: number;
  darkMode: boolean;
}

export interface ReadHistory {
  id?: number;
  articleId: string;
  title: string;
  readAt: number;
}

class EpanDDatabase extends Dexie {
  articles!: Table<Article>;
  bookmarks!: Table<Bookmark>;
  comments!: Table<Comment>;
  userProfile!: Table<UserProfile>;
  readHistory!: Table<ReadHistory>;

  constructor() {
    super('EpanDNewsDB');
    this.version(1).stores({
      articles: '++id, articleId, category, publishedAt, source',
      bookmarks: '++id, articleId, savedAt',
      comments: '++id, articleId, createdAt',
      userProfile: '++id, userId',
      readHistory: '++id, articleId, readAt',
    });
  }
}

export const db = new EpanDDatabase();

function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function generateAvatar(name: string): string {
  const colors = ['4F46E5', '0284C7', '059669', 'D97706', 'DC2626', '7C3AED', 'DB2777'];
  const color = colors[name.length % colors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=128`;
}

export const dbHelpers = {
  async getOrCreateUser(): Promise<UserProfile> {
    const existing = await db.userProfile.toCollection().first();
    if (existing) return existing;
    const newUser: UserProfile = {
      userId: generateUserId(),
      username: 'pembaca',
      displayName: 'Pembaca Setia',
      avatar: generateAvatar('Pembaca Setia'),
      bio: 'Selamat datang di EpanDNews!',
      createdAt: Date.now(),
      darkMode: false,
    };
    await db.userProfile.add(newUser);
    return newUser;
  },

  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    const existing = await db.userProfile.toCollection().first();
    if (existing && existing.id) {
      await db.userProfile.update(existing.id, updates);
    }
  },

  async saveArticle(article: Article): Promise<void> {
    const existing = await db.articles.where('articleId').equals(article.articleId).first();
    if (!existing) {
      await db.articles.add({ ...article, tags: article.tags || [], views: article.views || 0 });
    }
  },

  async getArticle(articleId: string): Promise<Article | undefined> {
    return db.articles.where('articleId').equals(articleId).first();
  },

  async toggleBookmark(article: Article): Promise<boolean> {
    const existing = await db.bookmarks.where('articleId').equals(article.articleId).first();
    if (existing) {
      await db.bookmarks.delete(existing.id!);
      return false;
    } else {
      await db.bookmarks.add({ articleId: article.articleId, savedAt: Date.now(), article });
      return true;
    }
  },

  async isBookmarked(articleId: string): Promise<boolean> {
    const existing = await db.bookmarks.where('articleId').equals(articleId).first();
    return !!existing;
  },

  async getAllBookmarks(): Promise<Bookmark[]> {
    return db.bookmarks.orderBy('savedAt').reverse().toArray();
  },

  async addComment(comment: Omit<Comment, 'id'>): Promise<number> {
    return db.comments.add(comment);
  },

  async getComments(articleId: string): Promise<Comment[]> {
    return db.comments.where('articleId').equals(articleId).sortBy('createdAt');
  },

  async likeComment(commentId: number, userId: string): Promise<void> {
    const comment = await db.comments.get(commentId);
    if (!comment) return;
    const likedBy = comment.likedBy || [];
    if (likedBy.includes(userId)) {
      await db.comments.update(commentId, {
        likes: Math.max(0, comment.likes - 1),
        likedBy: likedBy.filter((id) => id !== userId),
      });
    } else {
      await db.comments.update(commentId, {
        likes: comment.likes + 1,
        likedBy: [...likedBy, userId],
      });
    }
  },

  async deleteComment(commentId: number): Promise<void> {
    await db.comments.delete(commentId);
  },

  async addReadHistory(articleId: string, title: string): Promise<void> {
    const existing = await db.readHistory.where('articleId').equals(articleId).first();
    if (existing) {
      await db.readHistory.update(existing.id!, { readAt: Date.now() });
    } else {
      await db.readHistory.add({ articleId, title, readAt: Date.now() });
    }
    const all = await db.readHistory.orderBy('readAt').toArray();
    if (all.length > 50) {
      const toDelete = all.slice(0, all.length - 50);
      await db.readHistory.bulkDelete(toDelete.map((r) => r.id!));
    }
  },

  async getReadHistory(): Promise<ReadHistory[]> {
    return db.readHistory.orderBy('readAt').reverse().toArray();
  },

  async incrementViews(articleId: string): Promise<void> {
    const article = await db.articles.where('articleId').equals(articleId).first();
    if (article && article.id) {
      await db.articles.update(article.id, { views: (article.views || 0) + 1 });
    }
  },
};

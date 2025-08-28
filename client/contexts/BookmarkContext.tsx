import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Room, Flatmate, PG } from '@shared/types';

interface BookmarkedItem {
  id: string;
  type: 'room' | 'flatmate' | 'pg';
  data: Room | Flatmate | PG;
  bookmarkedAt: string;
}

interface BookmarkContextType {
  bookmarks: BookmarkedItem[];
  isBookmarked: (id: string, type: 'room' | 'flatmate' | 'pg') => boolean;
  addBookmark: (item: Room | Flatmate | PG, type: 'room' | 'flatmate' | 'pg') => void;
  removeBookmark: (id: string, type: 'room' | 'flatmate' | 'pg') => void;
  toggleBookmark: (item: Room | Flatmate | PG, type: 'room' | 'flatmate' | 'pg') => void;
  getBookmarksByType: (type: 'room' | 'flatmate' | 'pg') => BookmarkedItem[];
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider: React.FC<BookmarkProviderProps> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>([]);

  useEffect(() => {
    // Load bookmarks from localStorage on mount
    const savedBookmarks = localStorage.getItem('bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (error) {
        console.error('Error parsing saved bookmarks:', error);
        localStorage.removeItem('bookmarks');
      }
    }
  }, []);

  useEffect(() => {
    // Save bookmarks to localStorage whenever they change
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const isBookmarked = (id: string, type: 'room' | 'flatmate' | 'pg'): boolean => {
    return bookmarks.some(bookmark => bookmark.id === id && bookmark.type === type);
  };

  const addBookmark = (item: Room | Flatmate | PG, type: 'room' | 'flatmate' | 'pg') => {
    if (!isBookmarked(item.id, type)) {
      const newBookmark: BookmarkedItem = {
        id: item.id,
        type,
        data: item,
        bookmarkedAt: new Date().toISOString(),
      };
      setBookmarks(prev => [newBookmark, ...prev]);
    }
  };

  const removeBookmark = (id: string, type: 'room' | 'flatmate' | 'pg') => {
    setBookmarks(prev => prev.filter(bookmark => !(bookmark.id === id && bookmark.type === type)));
  };

  const toggleBookmark = (item: Room | Flatmate | PG, type: 'room' | 'flatmate' | 'pg') => {
    if (isBookmarked(item.id, type)) {
      removeBookmark(item.id, type);
    } else {
      addBookmark(item, type);
    }
  };

  const getBookmarksByType = (type: 'room' | 'flatmate' | 'pg'): BookmarkedItem[] => {
    return bookmarks.filter(bookmark => bookmark.type === type);
  };

  const value = {
    bookmarks,
    isBookmarked,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    getBookmarksByType,
  };

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
};

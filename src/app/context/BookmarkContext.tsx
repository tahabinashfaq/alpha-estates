"use client";
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { db } from '../../firebase';
import { useAuth } from './AuthContext';

interface Bookmark {
  id: string;
  userId: string;
  propertyId: string;
  savedAt: Date;
}

interface BookmarkContextType {
  bookmarks: Bookmark[];
  loading: boolean;
  error: string | null;
  addBookmark: (propertyId: string) => Promise<void>;
  removeBookmark: (propertyId: string) => Promise<void>;
  isBookmarked: (propertyId: string) => boolean;
  clearError: () => void;
}

const BookmarkContext = createContext<BookmarkContextType>({
  bookmarks: [],
  loading: false,
  error: null,
  addBookmark: async () => {},
  removeBookmark: async () => {},
  isBookmarked: () => false,
  clearError: () => {},
});

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};

interface BookmarkProviderProps {
  children: ReactNode;
}

export const BookmarkProvider = ({ children }: BookmarkProviderProps) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Load user's bookmarks
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    setLoading(true);
    const bookmarksQuery = query(
      collection(db, 'bookmarks'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      bookmarksQuery,
      (snapshot) => {
        const userBookmarks: Bookmark[] = [];
        snapshot.forEach((doc) => {
          userBookmarks.push({
            id: doc.id,
            ...doc.data(),
            savedAt: doc.data().savedAt?.toDate() || new Date(),
          } as Bookmark);
        });
        setBookmarks(userBookmarks);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading bookmarks:', err);
        setError('Failed to load bookmarks');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addBookmark = async (propertyId: string) => {
    if (!user) {
      setError('You must be logged in to bookmark properties');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if already bookmarked
      if (isBookmarked(propertyId)) {
        setError('Property is already bookmarked');
        return;
      }

      await addDoc(collection(db, 'bookmarks'), {
        userId: user.uid,
        propertyId,
        savedAt: new Date(),
      });

    } catch (err) {
      console.error('Error adding bookmark:', err);
      setError('Failed to bookmark property');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (propertyId: string) => {
    if (!user) {
      setError('You must be logged in to remove bookmarks');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Find the bookmark document
      const bookmarksQuery = query(
        collection(db, 'bookmarks'),
        where('userId', '==', user.uid),
        where('propertyId', '==', propertyId)
      );

      const querySnapshot = await getDocs(bookmarksQuery);

      if (querySnapshot.empty) {
        setError('Bookmark not found');
        return;
      }

      // Delete the bookmark
      await deleteDoc(querySnapshot.docs[0].ref);

    } catch (err) {
      console.error('Error removing bookmark:', err);
      setError('Failed to remove bookmark');
    } finally {
      setLoading(false);
    }
  };

  const isBookmarked = (propertyId: string): boolean => {
    return bookmarks.some(bookmark => bookmark.propertyId === propertyId);
  };

  const clearError = () => {
    setError(null);
  };

  const value: BookmarkContextType = {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    isBookmarked,
    clearError,
  };

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
};

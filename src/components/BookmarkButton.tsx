"use client";
import { useState } from 'react';
import { useAuth } from '../app/context/AuthContext';
import { useBookmarks } from '../app/context/BookmarkContext';

interface BookmarkButtonProps {
  propertyId: string;
  className?: string;
  showText?: boolean;
}

export const BookmarkButton = ({
  propertyId,
  className = '',
  showText = false
}: BookmarkButtonProps) => {
  const { addBookmark, removeBookmark, isBookmarked, loading, error, clearError } = useBookmarks();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      alert('Please log in to bookmark properties');
      return;
    }

    setIsProcessing(true);
    clearError();

    try {
      if (isBookmarked(propertyId)) {
        await removeBookmark(propertyId);
      } else {
        await addBookmark(propertyId);
      }
    } catch (err) {
      console.error('Bookmark operation failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const isActive = isBookmarked(propertyId);
  const isLoading = loading || isProcessing;

  return (
    <div className="relative">
      <button
        onClick={handleBookmarkToggle}
        disabled={isLoading || !user}
        className={`
          flex items-center gap-2 p-2 rounded-lg transition-all duration-200
          ${isActive
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          ${!user ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        title={
          !user
            ? 'Log in to bookmark properties'
            : isActive
              ? 'Remove from bookmarks'
              : 'Add to bookmarks'
        }
      >
        {isLoading ? (
          <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="32"
              strokeDashoffset="32"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 32;16 16;0 32;0 32"
                repeatCount="indefinite"
              />
              <animate
                attributeName="stroke-dashoffset"
                dur="2s"
                values="0;-16;-32;-32"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        ) : (
          <svg
            className={`w-5 h-5 transition-colors ${isActive ? 'fill-current' : 'fill-none stroke-current stroke-2'
              }`}
            viewBox="0 0 24 24"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5Z" />
          </svg>
        )}

        {showText && (
          <span className="text-sm font-medium">
            {isActive ? 'Saved' : 'Save'}
          </span>
        )}
      </button>

      {error && (
        <div className="absolute top-full left-0 mt-1 bg-red-100 border border-red-300 text-red-700 px-2 py-1 rounded text-xs whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
};

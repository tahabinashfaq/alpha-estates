"use client";
import { useState } from "react";

interface VirtualTour {
  id: string;
  name: string;
  type: '360' | 'video' | 'slideshow';
  url: string;
  thumbnail?: string;
  duration?: number; // for videos
  roomCount?: number; // for 360 tours
}

interface VirtualTourViewerProps {
  tours: VirtualTour[];
  propertyTitle: string;
}

export function VirtualTourViewer({ tours, propertyTitle }: VirtualTourViewerProps) {
  const [currentTourIndex, setCurrentTourIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!tours || tours.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          Virtual Tours
        </h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">Virtual tours coming soon</p>
          <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-700 text-sm">
              Experience this property with immersive 360° tours and video walkthroughs
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentTour = tours[currentTourIndex];

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            Virtual Tours
          </h3>

          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span className="text-sm font-medium">Fullscreen</span>
          </button>
        </div>

        {/* Tour Navigation */}
        {tours.length > 1 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tours.map((tour, index) => (
                <button
                  key={tour.id}
                  onClick={() => setCurrentTourIndex(index)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${currentTourIndex === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tour.type === '360' ? 'bg-purple-100 text-purple-600' :
                      tour.type === 'video' ? 'bg-red-100 text-red-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                      {tour.type === '360' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                      )}
                      {tour.type === 'video' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
                        </svg>
                      )}
                      {tour.type === 'slideshow' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{tour.name}</h4>
                      <div className="flex items-center space-x-3 text-xs text-gray-600 mt-1">
                        <span className="capitalize">{tour.type}</span>
                        {tour.duration && <span>{tour.duration}min</span>}
                        {tour.roomCount && <span>{tour.roomCount} rooms</span>}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Current Tour Display */}
        <div className="space-y-4">
          {/* Tour Info */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div>
              <h4 className="font-semibold text-gray-900">{currentTour.name}</h4>
              <p className="text-sm text-gray-600 capitalize">{currentTour.type} tour</p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {currentTour.duration && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{currentTour.duration} min</span>
                </div>
              )}
              {currentTour.roomCount && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{currentTour.roomCount} rooms</span>
                </div>
              )}
            </div>
          </div>

          {/* Tour Viewer */}
          <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
            {currentTour.type === 'video' ? (
              <video
                src={currentTour.url}
                controls
                className="w-full h-full"
                poster={currentTour.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            ) : currentTour.type === '360' ? (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-2">360° Virtual Tour</p>
                  <p className="text-sm opacity-75">Click and drag to explore</p>
                </div>
                {/* In a real implementation, you would embed a 360° viewer here */}
                <iframe
                  src={currentTour.url}
                  className="absolute inset-0 w-full h-full"
                  allowFullScreen
                  title={`360° tour of ${propertyTitle}`}
                />
              </div>
            ) : (
              <iframe
                src={currentTour.url}
                className="w-full h-full"
                allowFullScreen
                title={`${currentTour.name} of ${propertyTitle}`}
              />
            )}

            {/* Tour Type Badge */}
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${currentTour.type === '360' ? 'bg-purple-600' :
                currentTour.type === 'video' ? 'bg-red-600' :
                  'bg-green-600'
                }`}>
                {currentTour.type === '360' ? '360° Tour' :
                  currentTour.type === 'video' ? 'Video Tour' :
                    'Photo Tour'}
              </span>
            </div>
          </div>

          {/* Tour Controls */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 bg-white hover:bg-gray-100 rounded-lg shadow-sm flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
                </svg>
              </button>
              <button className="w-10 h-10 bg-white hover:bg-gray-100 rounded-lg shadow-sm flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full h-full">
            {currentTour.type === 'video' ? (
              <video
                src={currentTour.url}
                controls
                className="w-full h-full object-contain"
                poster={currentTour.thumbnail}
                autoPlay
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <iframe
                src={currentTour.url}
                className="w-full h-full"
                allowFullScreen
                title={`${currentTour.name} of ${propertyTitle}`}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

import React from 'react';
import type { Video } from './CourseSidebar';

export interface VideoPlayerProps {
  video: Video | null;
  onOpenGenerator: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
}

/**
 * VideoPlayer Component
 * Renders the primary video streaming canvas with playback controls,
 * embed URL resolver for YouTube/hosted lectures, and quick lesson navigation.
 */
export function VideoPlayer({ 
  video, 
  onOpenGenerator,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  isCompleted = false,
  onToggleComplete
}: VideoPlayerProps) {
  if (!video) {
    return (
      <div className="w-full aspect-video bg-ctp-mantle border-b border-ctp-surface0 flex flex-col items-center justify-center text-center p-6 sm:p-12 relative rounded-none">
        <div className="max-w-md space-y-3.5">
          <div className="w-10 h-10 rounded-none bg-white shadow-2xs border border-ctp-surface0 text-ctp-mauve flex items-center justify-center mx-auto">
            <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-ctp-text tracking-tight uppercase">
              Interactive Learning Canvas
            </h3>
            <p className="text-xs text-ctp-subtext0 mt-1 leading-relaxed max-w-sm mx-auto">
              Select a lecture from the curriculum sidebar to stream or generate a new customized course track.
            </p>
          </div>
          <div className="pt-1">
            <button
              onClick={onOpenGenerator}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-none font-bold uppercase tracking-wider text-white bg-ctp-mauve hover:bg-[#13382c] active:bg-[#0c241c] transition-colors shadow-2xs text-xs cursor-pointer border border-ctp-mauve"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Generate Curriculum</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Parse embed URL if source is YouTube
  const isYouTube = video.videoUrl?.includes('youtube.com') || video.videoUrl?.includes('youtu.be');
  let embedUrl = video.videoUrl;

  if (isYouTube && video.videoUrl) {
    try {
      const urlObj = new URL(video.videoUrl);
      const vid = urlObj.searchParams.get('v');
      if (vid) {
        embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1&modestbranding=1&rel=0`;
      }
    } catch {
      // Keep original URL
    }
  }

  return (
    <div className="w-full bg-[#1e1e2e] border-b border-ctp-surface0 relative rounded-none">
      {/* 16:9 Screen Frame */}
      <div className="aspect-video w-full relative">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={video.title}
            className="w-full h-full absolute inset-0 border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-ctp-crust text-ctp-text relative group overflow-hidden">
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ctp-text/80 via-ctp-text/30 to-transparent" />
            <div className="z-10 bg-white text-ctp-mauve p-3 rounded-none shadow-md cursor-pointer hover:bg-ctp-base transition-colors border border-white">
              <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
              <p className="text-[10px] font-mono uppercase font-bold text-white/80">{video.author}</p>
              <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-1 uppercase">{video.title}</h3>
            </div>
          </div>
        )}
      </div>

      {/* Player Navigation & Quick Actions Toolbar */}
      <div className="bg-white px-4 sm:px-6 py-2.5 border-t border-ctp-surface0 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center space-x-3 min-w-0">
          <span className="font-bold text-ctp-text truncate max-w-xs sm:max-w-md uppercase text-xs">
            {video.title}
          </span>
          <span className="text-ctp-subtext0 hidden sm:inline">•</span>
          <span className="text-ctp-subtext0 font-mono text-[11px] hidden sm:inline">{video.duration}</span>
        </div>

        {/* Quick Lesson Steppers */}
        <div className="flex items-center space-x-2 shrink-0">
          {onToggleComplete && (
            <button
              onClick={onToggleComplete}
              className={`px-2.5 py-1 rounded-none text-[10px] font-mono font-bold uppercase border transition-colors cursor-pointer flex items-center space-x-1 ${
                isCompleted 
                  ? 'bg-ctp-green/10 text-ctp-green border-ctp-green/30' 
                  : 'bg-ctp-base/60 text-ctp-subtext0 border-ctp-surface0 hover:text-ctp-text'
              }`}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>{isCompleted ? 'Completed' : 'Mark Done'}</span>
            </button>
          )}

          {onPrevious && (
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="p-1.5 rounded-none border border-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-mantle disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous lesson"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
          )}

          {onNext && (
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-1.5 rounded-none border border-ctp-surface0 text-ctp-subtext0 hover:text-ctp-text hover:bg-ctp-mantle disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next lesson"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

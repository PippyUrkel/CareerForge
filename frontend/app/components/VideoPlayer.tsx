import React from 'react';
import type { Video } from './CourseSidebar';

interface VideoPlayerProps {
  video: Video | null;
  onOpenGenerator: () => void;
}

export function VideoPlayer({ video, onOpenGenerator }: VideoPlayerProps) {
  if (!video) {
    return (
      <div className="w-full aspect-video bg-ctp-mantle border-b border-ctp-surface0 flex flex-col items-center justify-center text-center p-6 sm:p-12 relative">
        <div className="max-w-md space-y-3.5">
          <div className="w-12 h-12 rounded-xl bg-white shadow-2xs border border-ctp-surface0 text-ctp-mauve flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-ctp-text tracking-tight">
              Interactive Learning Canvas
            </h3>
            <p className="text-xs sm:text-sm text-ctp-subtext0 mt-1 leading-relaxed max-w-sm mx-auto">
              Select a lecture from the curriculum sidebar to stream or generate a new customized course track.
            </p>
          </div>
          <div className="pt-1">
            <button
              onClick={onOpenGenerator}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-white bg-ctp-mauve hover:bg-[#7a2be2] active:bg-[#6b22c7] transition-colors shadow-xs text-xs cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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

  const isYouTube = video.videoUrl?.includes('youtube.com') || video.videoUrl?.includes('youtu.be');
  let embedUrl = video.videoUrl;

  if (isYouTube && video.videoUrl) {
    try {
      const urlObj = new URL(video.videoUrl);
      const vid = urlObj.searchParams.get('v');
      if (vid) {
        embedUrl = `https://www.youtube.com/embed/${vid}?autoplay=1&modestbranding=1&rel=0`;
      }
    } catch (e) {
      // Keep original url
    }
  }

  return (
    <div className="w-full bg-[#1e1e2e] border-b border-ctp-surface0 relative">
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
            <div className="z-10 bg-white text-ctp-mauve p-3.5 rounded-full shadow-md cursor-pointer hover:scale-105 transition-transform border border-white">
              <svg className="w-6 h-6 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
              <p className="text-[11px] font-medium text-white/80">{video.author}</p>
              <h3 className="text-sm sm:text-base font-semibold text-white line-clamp-1">{video.title}</h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

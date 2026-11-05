import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Heart, Play, MoreHorizontal } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function RightPanel() {
  const navigate = useNavigate();
  const {
    currentTrack,
    likedSongIds,
    toggleLike,
    queue,
    queueIndex,
    playTrack,
    setShowNowPlayingPanel,
    showToast
  } = usePlayer();

  if (!currentTrack) return null;

  const isLiked = likedSongIds.has(String(currentTrack.id));
  const nextTrackItem = queue.length > queueIndex + 1 ? queue[queueIndex + 1] : null;

  return (
    <aside className="w-[340px] bg-[#121212] rounded-lg h-full flex flex-col overflow-hidden select-none flex-shrink-0 animate-in slide-in-from-right-4 duration-200">
      {/* Top Header */}
      <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#232323]">
        <span className="font-bold text-white text-[15px] truncate">
          {currentTrack.album || currentTrack.title}
        </span>
        <button
          onClick={() => setShowNowPlayingPanel(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] transition-all"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Large Artwork */}
        <div className="relative group rounded-lg overflow-hidden shadow-2xl aspect-square">
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title, Artist, and Like */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span 
              onClick={() => currentTrack.albumId && navigate(`/album/${currentTrack.albumId}`)}
              className="text-xl font-bold text-white truncate hover:underline cursor-pointer"
            >
              {currentTrack.title}
            </span>
            <span
              onClick={() => currentTrack.artistId && navigate(`/artist/${currentTrack.artistId}`)}
              className="text-sm text-[#b3b3b3] hover:underline hover:text-white cursor-pointer mt-0.5 truncate"
            >
              {currentTrack.artist}
            </span>
          </div>

          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-1.5 transition-transform active:scale-125 focus:outline-none ${
              isLiked ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={isLiked ? "Remove from Your Library" : "Save to Your Library"}
          >
            <Heart size={22} className={isLiked ? 'fill-[#1ed760]' : ''} />
          </button>
        </div>

        {/* About the Artist Card */}
        <div className="bg-[#181818] rounded-xl overflow-hidden shadow-lg border border-[#282828] group/artist">
          <div className="relative h-44 overflow-hidden">
            <img
              src={currentTrack.cover}
              alt={currentTrack.artist}
              className="w-full h-full object-cover group-hover/artist:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-black/30 p-4 flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white drop-shadow">
                About the artist
              </span>
              <span className="text-lg font-bold text-white drop-shadow">
                {currentTrack.artist}
              </span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#b3b3b3]">
                84,912,400 monthly listeners
              </span>
              <button
                onClick={() => showToast(`Following ${currentTrack.artist}`)}
                className="px-3.5 py-1 rounded-full border border-[#878787] hover:border-white text-white text-xs font-bold hover:scale-105 transition-all"
              >
                Follow
              </button>
            </div>
            <p className="text-xs text-[#a7a7a7] line-clamp-3">
              Grammy-award winning artist with billions of global streams, dominating international charts and redefining modern music.
            </p>
          </div>
        </div>

        {/* Next in Queue Card */}
        {nextTrackItem && (
          <div className="bg-[#181818] rounded-xl p-4 shadow-lg border border-[#282828]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                Next in queue
              </span>
              <button
                onClick={() => navigate('/queue')}
                className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline"
              >
                Open queue
              </button>
            </div>

            <div 
              onClick={() => playTrack(nextTrackItem, queue, queueIndex + 1)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer group"
            >
              <div className="relative w-12 h-12 flex-shrink-0 rounded overflow-hidden">
                <img
                  src={nextTrackItem.cover}
                  alt={nextTrackItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play size={16} className="text-white fill-white ml-0.5" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate group-hover:underline">
                  {nextTrackItem.title}
                </p>
                <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                  {nextTrackItem.artist}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}


import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function MediaCard({ item, onPlayOverride = null }) {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  if (!item) return null;

  // Determine if this item is currently playing
  const isCurrentTrackPlaying = 
    item.type === 'track' && 
    currentTrack && 
    String(currentTrack.id) === String(item.id) && 
    isPlaying;

  const handleCardClick = () => {
    if (item.route) {
      navigate(item.route);
    }
  };

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (onPlayOverride) {
      onPlayOverride(item);
      return;
    }

    if (item.type === 'track') {
      if (currentTrack && String(currentTrack.id) === String(item.id)) {
        togglePlay();
      } else {
        playTrack(item, [item], 0);
      }
    } else if (item.route) {
      // Navigate to playlist/album or start playback
      navigate(item.route);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="p-4 bg-[#181818] hover:bg-[#282828] transition-all duration-300 rounded-lg cursor-pointer group flex flex-col relative select-none"
    >
      {/* Artwork Container */}
      <div className="relative w-full aspect-square mb-4 shadow-lg overflow-hidden">
        <img
          src={item.cover}
          alt={item.title}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            item.isRound ? 'rounded-full' : 'rounded-md'
          }`}
          loading="lazy"
        />

        {/* Floating Play Button */}
        <button
          onClick={handlePlayClick}
          className={`absolute bottom-2 right-2 w-12 h-12 rounded-full bg-[#1ed760] hover:bg-[#3be477] flex items-center justify-center text-black shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${
            isCurrentTrackPlaying
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
          title={isCurrentTrackPlaying ? "Pause" : `Play ${item.title}`}
        >
          {isCurrentTrackPlaying ? (
            <Pause size={22} className="fill-black" />
          ) : (
            <Play size={22} className="fill-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-[15px] truncate mb-1" title={item.title}>
        {item.title}
      </h3>

      {/* Description / Subtitle */}
      {item.description && (
        <p className="text-[#b3b3b3] text-[13px] line-clamp-2 leading-snug">
          {item.description}
        </p>
      )}
    </div>
  );
}


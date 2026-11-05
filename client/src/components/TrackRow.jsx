import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, MoreHorizontal, Plus, ListPlus, Copy, Check } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatDuration(sec) {
  if (isNaN(sec) || sec < 0) return '0:30';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function TrackRow({ 
  track, 
  index, 
  playlist = [], 
  showAlbum = true, 
  showCover = true,
  dateAdded = null 
}) {
  const navigate = useNavigate();
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    togglePlay, 
    likedSongIds, 
    toggleLike, 
    addToQueue, 
    userPlaylists, 
    addTrackToPlaylist,
    showToast 
  } = usePlayer();

  const [menuOpen, setMenuOpen] = useState(false);
  const [playlistSubmenuOpen, setPlaylistSubmenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isCurrent = currentTrack && String(currentTrack.id) === String(track.id);
  const isCurrentPlaying = isCurrent && isPlaying;
  const isLiked = likedSongIds.has(String(track.id));

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setPlaylistSubmenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      const q = playlist.length > 0 ? playlist : [track];
      playTrack(track, q, index);
    }
  };

  const handlePlayButtonClick = (e) => {
    e.stopPropagation();
    handleRowClick();
  };

  const copyTrackLink = (e) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(window.location.origin + `/album/${track.albumId}`);
    showToast('Link copied to clipboard');
    setMenuOpen(false);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group flex items-center h-14 px-4 rounded-md cursor-pointer transition-colors select-none text-[14px] ${
        isCurrent ? 'bg-white/10' : 'hover:bg-white/10'
      }`}
    >
      {/* 1. Track Index / Play Button */}
      <div className="w-8 flex-shrink-0 flex items-center justify-start text-[#b3b3b3]">
        {/* Normal Index / Equalizer */}
        <div className="group-hover:hidden flex items-center justify-center w-6">
          {isCurrentPlaying ? (
            <div className="flex items-end gap-[2px] h-3.5">
              <span className="w-[3px] bg-[#1ed760] rounded-full animate-bar-1" />
              <span className="w-[3px] bg-[#1ed760] rounded-full animate-bar-2" />
              <span className="w-[3px] bg-[#1ed760] rounded-full animate-bar-3" />
              <span className="w-[3px] bg-[#1ed760] rounded-full animate-bar-4" />
            </div>
          ) : (
            <span className={isCurrent ? 'text-[#1ed760] font-semibold' : ''}>
              {index + 1}
            </span>
          )}
        </div>

        {/* Hover Play / Pause Button */}
        <button
          onClick={handlePlayButtonClick}
          className="hidden group-hover:flex items-center justify-center w-6 text-white hover:scale-110 transition-transform"
        >
          {isCurrentPlaying ? (
            <Pause size={16} className="fill-white" />
          ) : (
            <Play size={16} className="fill-white ml-0.5" />
          )}
        </button>
      </div>

      {/* 2. Title & Artist Info (with Artwork) */}
      <div className="flex-1 min-w-0 flex items-center gap-3 pr-4">
        {showCover && (
          <img
            src={track.cover}
            alt={track.title}
            className="w-10 h-10 object-cover rounded flex-shrink-0 shadow"
            loading="lazy"
          />
        )}
        <div className="flex flex-col min-w-0">
          <span className={`font-medium truncate ${
            isCurrent ? 'text-[#1ed760]' : 'text-white group-hover:text-white'
          }`}>
            {track.title}
          </span>
          <div className="flex items-center gap-1.5 text-[13px] text-[#b3b3b3] mt-0.5">
            {track.explicit && (
              <span className="bg-[#b3b3b3] text-black text-[9px] font-bold px-1 rounded-sm uppercase tracking-tighter">
                E
              </span>
            )}
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (track.artistId) navigate(`/artist/${track.artistId}`);
              }}
              className="hover:underline hover:text-white cursor-pointer truncate"
            >
              {track.artist}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Album */}
      {showAlbum && (
        <div className="hidden md:flex flex-1 min-w-0 items-center pr-4">
          <span
            onClick={(e) => {
              e.stopPropagation();
              if (track.albumId) navigate(`/album/${track.albumId}`);
            }}
            className="text-[13px] text-[#b3b3b3] hover:underline hover:text-white cursor-pointer truncate"
          >
            {track.album || 'Single'}
          </span>
        </div>
      )}

      {/* 4. Date Added */}
      {dateAdded && (
        <div className="hidden lg:flex w-32 flex-shrink-0 items-center text-[13px] text-[#b3b3b3]">
          <span>{dateAdded}</span>
        </div>
      )}

      {/* 5. Like Button, Duration & More Menu */}
      <div className="flex items-center justify-end gap-4 w-28 flex-shrink-0 text-[#b3b3b3]">
        {/* Heart Like */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          className={`transition-opacity ${
            isLiked ? 'opacity-100 text-[#1ed760]' : 'opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
          title={isLiked ? "Remove from Your Library" : "Save to Your Library"}
        >
          <Heart size={16} className={isLiked ? 'fill-[#1ed760]' : ''} />
        </button>

        {/* Duration */}
        <span className="text-[13px] font-mono text-[#b3b3b3]">
          {formatDuration(track.duration)}
        </span>

        {/* More Options Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="opacity-0 group-hover:opacity-100 hover:text-white transition-opacity p-1"
            title="More options"
          >
            <MoreHorizontal size={18} />
          </button>

          {menuOpen && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 w-52 bg-[#282828] border border-[#3e3e3e] rounded-md shadow-2xl py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToQueue(track);
                  setMenuOpen(false);
                }}
                className="w-full px-3 py-2.5 text-left text-white hover:bg-[#3e3e3e] flex items-center gap-2"
              >
                <ListPlus size={15} />
                <span>Add to queue</span>
              </button>

              {/* Add to Playlist Submenu */}
              <div className="relative">
                <button
                  onClick={() => setPlaylistSubmenuOpen(!playlistSubmenuOpen)}
                  className="w-full px-3 py-2.5 text-left text-white hover:bg-[#3e3e3e] flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Plus size={15} />
                    <span>Add to playlist</span>
                  </span>
                  <span>▸</span>
                </button>

                {playlistSubmenuOpen && (
                  <div className="absolute right-full top-0 w-48 bg-[#282828] border border-[#3e3e3e] rounded-md shadow-2xl py-1 z-50">
                    {userPlaylists.length > 0 ? (
                      userPlaylists.map(pl => (
                        <button
                          key={pl.id}
                          onClick={() => {
                            addTrackToPlaylist(pl.id, track);
                            setMenuOpen(false);
                            setPlaylistSubmenuOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-white hover:bg-[#3e3e3e] truncate"
                        >
                          {pl.title}
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-[#a7a7a7]">No playlists created yet</p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-[#3e3e3e] my-1"></div>

              <button
                onClick={copyTrackLink}
                className="w-full px-3 py-2.5 text-left text-white hover:bg-[#3e3e3e] flex items-center gap-2"
              >
                <Copy size={15} />
                <span>Copy song link</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


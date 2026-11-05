import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Heart, 
  Minimize2,
  Mic2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatDuration(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function CreatePlaylistModal() {
  const { createPlaylistModalOpen, setCreatePlaylistModalOpen, createPlaylist } = usePlayer();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!createPlaylistModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    createPlaylist(title || 'My Playlist', description);
    setTitle('');
    setDescription('');
    setCreatePlaylistModalOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={() => setCreatePlaylistModalOpen(false)}
          className="absolute top-4 right-4 text-[#b3b3b3] hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4">Create Playlist</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-[#b3b3b3] mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Playlist"
              autoFocus
              className="w-full h-10 px-3 bg-[#3e3e3e] focus:bg-[#333] border border-transparent focus:border-[#1ed760] rounded-md text-white text-sm focus:outline-none transition-all placeholder-[#727272]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-[#b3b3b3] mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your playlist a catchy description"
              rows={3}
              className="w-full p-3 bg-[#3e3e3e] focus:bg-[#333] border border-transparent focus:border-[#1ed760] rounded-md text-white text-sm focus:outline-none resize-none transition-all placeholder-[#727272]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setCreatePlaylistModalOpen(false)}
              className="px-5 py-2 rounded-full text-white font-semibold text-sm hover:scale-105 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#1ed760] hover:bg-[#3be477] text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EditPlaylistModal() {
  const { editPlaylistModalData, setEditPlaylistModalData, refreshUserData, showToast } = usePlayer();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editPlaylistModalData) {
      setTitle(editPlaylistModalData.title || '');
      setDescription(editPlaylistModalData.description || '');
    }
  }, [editPlaylistModalData]);

  if (!editPlaylistModalData) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`/api/user/playlists/${editPlaylistModalData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      showToast('Playlist details saved');
      refreshUserData();
      setEditPlaylistModalData(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#282828] border border-[#3e3e3e] rounded-xl w-full max-w-lg p-6 shadow-2xl relative">
        <button
          onClick={() => setEditPlaylistModalData(null)}
          className="absolute top-4 right-4 text-[#b3b3b3] hover:text-white"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6">Edit details</h2>

        <form onSubmit={handleSubmit} className="flex gap-4">
          {/* Cover Art Preview */}
          <div className="w-40 h-40 bg-[#181818] rounded-md overflow-hidden flex-shrink-0 shadow-lg relative group">
            <img
              src={editPlaylistModalData.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#b3b3b3] mb-1">
                Name
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 bg-[#3e3e3e] focus:bg-[#333] border border-transparent focus:border-[#1ed760] rounded-md text-white text-sm focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-[#b3b3b3] mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-[#3e3e3e] focus:bg-[#333] border border-transparent focus:border-[#1ed760] rounded-md text-white text-xs focus:outline-none resize-none transition-all"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-white hover:scale-105 text-black font-bold text-sm transition-all"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function FullScreenPlayer() {
  const { 
    isFullScreen, 
    setIsFullScreen, 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    currentTime, 
    duration, 
    seek, 
    likedSongIds, 
    toggleLike,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat
  } = usePlayer();

  const navigate = useNavigate();

  if (!isFullScreen || !currentTrack) return null;

  const isLiked = likedSongIds.has(String(currentTrack.id));
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col justify-between p-8 select-none animate-in fade-in duration-300">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 opacity-40 blur-3xl pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 40%, #1e3264 0%, #121212 70%)`
        }}
      />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.628-5.373-12-12-12zm5.503 17.307c-.217.355-.68.468-1.034.252-2.833-1.731-6.4-2.123-10.601-1.163-.404.092-.806-.16-.898-.564-.092-.404.16-.806.564-.898 4.603-1.051 8.547-.604 11.716 1.339.355.216.469.68.253 1.034zm1.468-3.264c-.274.444-.86.587-1.303.314-3.242-1.993-8.184-2.569-12.02-1.404-.5.152-1.03-.133-1.182-.633-.151-.5.133-1.03.633-1.182 4.39-1.332 9.845-.693 13.558 1.599.444.273.587.86.314 1.305zm.126-3.41c-3.887-2.308-10.301-2.521-14.02-1.392-.596.18-1.229-.158-1.41-.755-.181-.596.159-1.229.756-1.41 4.272-1.297 11.353-1.045 15.82 1.607.536.319.711 1.011.393 1.547-.319.537-1.012.712-1.548.393z"/>
          </svg>
          <span className="text-xs uppercase font-bold tracking-widest text-[#b3b3b3]">
            Playing from album • {currentTrack.album || currentTrack.title}
          </span>
        </div>

        <button
          onClick={() => setIsFullScreen(false)}
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-white transition-all hover:scale-105"
          title="Exit full screen"
        >
          <Minimize2 size={20} />
        </button>
      </div>

      {/* Center Artwork & Info */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-12 max-w-5xl mx-auto w-full my-auto">
        <div className="w-72 h-72 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
          <img
            src={currentTrack.cover}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col text-center md:text-left max-w-md">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
            {currentTrack.title}
          </h1>
          <p className="text-xl md:text-2xl text-[#b3b3b3] font-medium mb-6">
            {currentTrack.artist}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <button
              onClick={() => toggleLike(currentTrack)}
              className={`p-2 rounded-full border border-white/20 transition-all ${
                isLiked ? 'text-[#1ed760] border-[#1ed760]' : 'text-white hover:scale-110'
              }`}
            >
              <Heart size={24} className={isLiked ? 'fill-[#1ed760]' : ''} />
            </button>
            <button
              onClick={() => {
                setIsFullScreen(false);
                navigate('/lyrics');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all"
            >
              <Mic2 size={18} />
              <span>Lyrics</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 max-w-3xl w-full mx-auto flex flex-col items-center">
        {/* Timeline */}
        <div className="w-full flex items-center gap-3 text-xs text-[#b3b3b3] font-mono mb-4">
          <span>{formatDuration(currentTime)}</span>
          <div className="relative flex-1 group/slider h-4 flex items-center cursor-pointer">
            <div className="w-full h-1.5 bg-[#4d4d4d] rounded-full overflow-hidden">
              <div 
                className="h-full bg-white group-hover/slider:bg-[#1ed760] transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 30}
              step={0.1}
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span>{formatDuration(duration)}</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={toggleShuffle}
            className={`p-2 transition-colors ${isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <Shuffle size={20} />
          </button>
          <button
            onClick={prevTrack}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <SkipBack size={28} className="fill-current" />
          </button>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white hover:scale-105 active:scale-95 flex items-center justify-center text-black transition-transform shadow-xl"
          >
            {isPlaying ? (
              <Pause size={28} className="fill-black" />
            ) : (
              <Play size={28} className="fill-black ml-1" />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <SkipForward size={28} className="fill-current" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`p-2 transition-colors ${repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <Repeat size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastNotification() {
  const { toastMessage } = usePlayer();
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#2e77d0] text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-2xl flex items-center gap-2 select-none animate-in fade-in slide-in-from-bottom-2 duration-150">
      <span>{toastMessage}</span>
    </div>
  );
}


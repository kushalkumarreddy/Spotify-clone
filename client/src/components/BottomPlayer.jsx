import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Heart, 
  Mic2, 
  ListMusic, 
  Laptop2, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Maximize2,
  Tv2
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function BottomPlayer() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    likedSongIds,
    showNowPlayingPanel,
    setShowNowPlayingPanel,
    isFullScreen,
    setIsFullScreen,
    togglePlay,
    nextTrack,
    prevTrack,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    showToast
  } = usePlayer();

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);

  const isLiked = currentTrack && likedSongIds.has(String(currentTrack.id));

  // Progress percentage
  const effectiveTime = isSeeking ? seekTime : currentTime;
  const progressPercent = duration > 0 ? (effectiveTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  const handleSeekChange = (e) => {
    setIsSeeking(true);
    setSeekTime(parseFloat(e.target.value));
  };

  const handleSeekEnd = (e) => {
    const val = parseFloat(e.target.value);
    seek(val);
    setIsSeeking(false);
  };

  const handleVolumeChange = (e) => {
    setVolumeLevel(parseFloat(e.target.value));
  };

  return (
    <footer className="h-[80px] bg-black border-t border-[#181818] px-4 flex items-center justify-between select-none fixed bottom-0 left-0 right-0 z-50">
      {/* LEFT: Current Track Info */}
      <div className="flex items-center gap-3.5 w-[30%] min-w-[180px]">
        {currentTrack ? (
          <>
            <div className="relative group/cover flex-shrink-0">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="w-14 h-14 object-cover rounded shadow-md"
              />
              <button 
                onClick={() => setShowNowPlayingPanel(!showNowPlayingPanel)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white opacity-0 group-hover/cover:opacity-100 flex items-center justify-center transition-opacity hover:scale-110"
                title="Expand cover"
              >
                <Maximize2 size={10} />
              </button>
            </div>

            <div className="flex flex-col min-w-0 pr-2">
              <span 
                onClick={() => currentTrack.albumId && navigate(`/album/${currentTrack.albumId}`)}
                className="text-[14px] font-semibold text-white truncate hover:underline cursor-pointer leading-snug"
                title={currentTrack.title}
              >
                {currentTrack.title}
              </span>
              <span
                onClick={() => currentTrack.artistId && navigate(`/artist/${currentTrack.artistId}`)}
                className="text-[11px] text-[#b3b3b3] truncate hover:underline hover:text-white cursor-pointer mt-0.5 leading-none"
                title={currentTrack.artist}
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
              <Heart size={18} className={isLiked ? 'fill-[#1ed760]' : ''} />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3 text-[#727272] text-xs">
            <div className="w-14 h-14 bg-[#181818] rounded flex items-center justify-center">
              <Tv2 size={20} className="text-[#333]" />
            </div>
            <span>No song playing. Choose a track to start.</span>
          </div>
        )}
      </div>

      {/* CENTER: Playback Controls & Progress Bar */}
      <div className="flex flex-col items-center max-w-[720px] w-[40%]">
        {/* Buttons Row */}
        <div className="flex items-center gap-5 mb-1.5">
          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            className={`relative p-1 transition-colors ${
              isShuffle ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={isShuffle ? "Disable shuffle" : "Enable shuffle"}
          >
            <Shuffle size={16} />
            {isShuffle && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1ed760] rounded-full"></span>
            )}
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="text-[#b3b3b3] hover:text-white transition-colors"
            title="Previous"
          >
            <SkipBack size={20} className="fill-current" />
          </button>

          {/* Circular Play / Pause Button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 flex items-center justify-center text-black transition-transform shadow-md"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={18} className="fill-black" />
            ) : (
              <Play size={18} className="fill-black ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="text-[#b3b3b3] hover:text-white transition-colors"
            title="Next"
          >
            <SkipForward size={20} className="fill-current" />
          </button>

          {/* Repeat Button */}
          <button
            onClick={toggleRepeat}
            className={`relative p-1 transition-colors ${
              repeatMode !== 'off' ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
            }`}
            title={repeatMode === 'one' ? "Disable repeat" : repeatMode === 'all' ? "Repeat one" : "Enable repeat"}
          >
            {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            {repeatMode !== 'off' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1ed760] rounded-full"></span>
            )}
          </button>
        </div>

        {/* Timeline Row */}
        <div className="w-full flex items-center gap-2 text-[11px] font-medium text-[#b3b3b3]">
          <span className="w-9 text-right font-mono">{formatTime(effectiveTime)}</span>

          {/* Custom Interactive Scrub Bar with Drag Handle */}
          <div className="relative flex-1 group/slider flex items-center h-3 cursor-pointer">
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full relative">
              {/* Filled Portion */}
              <div
                className="h-full bg-white group-hover/slider:bg-[#1ed760] rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Visible Hover Thumb Handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/slider:opacity-100 shadow-md transition-opacity pointer-events-none"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
            {/* Input Overlay */}
            <input
              type="range"
              min={0}
              max={duration || 30}
              step={0.1}
              value={effectiveTime}
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="w-9 font-mono">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT: Extra Actions & Volume Controls */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px]">
        {/* Now Playing View Toggle */}
        <button
          onClick={() => setShowNowPlayingPanel(!showNowPlayingPanel)}
          className={`p-1.5 transition-colors ${
            showNowPlayingPanel ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Now playing view"
        >
          <Tv2 size={17} />
        </button>

        {/* Lyrics Toggle */}
        <button
          onClick={() => {
            if (location.pathname === '/lyrics') {
              navigate(-1);
            } else {
              navigate('/lyrics');
            }
          }}
          className={`p-1.5 transition-colors ${
            location.pathname === '/lyrics' ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 size={17} />
        </button>

        {/* Queue Toggle */}
        <button
          onClick={() => {
            if (location.pathname === '/queue') {
              navigate(-1);
            } else {
              navigate('/queue');
            }
          }}
          className={`p-1.5 transition-colors ${
            location.pathname === '/queue' ? 'text-[#1ed760]' : 'text-[#b3b3b3] hover:text-white'
          }`}
          title="Queue"
        >
          <ListMusic size={17} />
        </button>

        {/* Connect to a Device */}
        <div className="relative">
          <button
            onClick={() => setDeviceModalOpen(!deviceModalOpen)}
            className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
            title="Connect to a device"
          >
            <Laptop2 size={17} />
          </button>

          {deviceModalOpen && (
            <div className="absolute bottom-10 right-0 w-64 bg-[#282828] border border-[#3e3e3e] rounded-lg shadow-2xl p-4 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center gap-2 text-white font-bold mb-2">
                <Laptop2 size={16} className="text-[#1ed760]" />
                <span>Current device</span>
              </div>
              <p className="text-[#1ed760] font-semibold">Web Browser (This Computer)</p>
              <div className="border-t border-[#3e3e3e] my-2"></div>
              <p className="text-[#a7a7a7] text-[11px]">Spotify Connect listening enabled with high fidelity streaming.</p>
            </div>
          )}
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-1.5 group/volume">
          <button
            onClick={toggleMute}
            className="p-1 text-[#b3b3b3] hover:text-white transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={17} />
            ) : volume < 0.5 ? (
              <Volume1 size={17} />
            ) : (
              <Volume2 size={17} />
            )}
          </button>

          {/* Volume Scrubber with Visible Thumb on Hover */}
          <div className="relative w-24 h-3 flex items-center group/slider cursor-pointer">
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full relative">
              <div
                className="h-full bg-white group-hover/slider:bg-[#1ed760] rounded-full"
                style={{ width: `${volumePercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/slider:opacity-100 shadow-md transition-opacity pointer-events-none"
                style={{ left: `${volumePercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Fullscreen Player Toggle */}
        <button
          onClick={() => setIsFullScreen(!isFullScreen)}
          className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
          title="Full screen"
        >
          <Maximize2 size={17} />
        </button>
      </div>
    </footer>
  );
}

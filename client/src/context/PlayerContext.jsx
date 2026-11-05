import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [likedSongIds, setLikedSongIds] = useState(new Set());
  const [userPlaylists, setUserPlaylists] = useState([]);
  
  // UI Panels state
  const [showNowPlayingPanel, setShowNowPlayingPanel] = useState(false);
  const [showLyricsView, setShowLyricsView] = useState(false);
  const [showQueueView, setShowQueueView] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [createPlaylistModalOpen, setCreatePlaylistModalOpen] = useState(false);
  const [editPlaylistModalData, setEditPlaylistModalData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const audioRef = useRef(new Audio());

  // Show Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 2800);
  };

  // Initial fetch of user data & liked songs
  const refreshUserData = async () => {
    try {
      const [likedRes, plRes] = await Promise.all([
        fetch('/api/user/liked').then(r => r.json()),
        fetch('/api/user/playlists').then(r => r.json())
      ]);
      if (likedRes && likedRes.tracks) {
        setLikedSongIds(new Set(likedRes.tracks.map(t => String(t.id))));
      }
      if (Array.isArray(plRes)) {
        setUserPlaylists(plRes);
      }
    } catch (e) {
      console.error('Error loading initial user data:', e);
    }
  };

  useEffect(() => {
    refreshUserData();
  }, []);

  // Sync Audio Element Events
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 30);
    };

    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    };

    const onError = (e) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [repeatMode, isMuted, volume, queue, queueIndex]);

  // Volume change effect
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play a track and optionally set queue
  const playTrack = (track, newQueue = null, index = 0) => {
    if (!track) return;

    if (newQueue && Array.isArray(newQueue)) {
      setQueue(newQueue);
      setQueueIndex(index);
    } else if (!queue.some(t => String(t.id) === String(track.id))) {
      setQueue(prev => [track, ...prev]);
      setQueueIndex(0);
    }

    setCurrentTrack(track);
    const audio = audioRef.current;

    // Use preview audioUrl or reliable fallback audio
    const audioSrc = track.audioUrl || 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/44/af/81/44af8168-9609-1b85-5048-ada08dceacf3/mzaf_1341699644335558812.plus.aac.p.m4a';
    audio.src = audioSrc;
    audio.currentTime = 0;
    
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.warn('Auto-play blocked or failed:', err);
      setIsPlaying(false);
    });

    // Record in user recently played
    fetch('/api/user/recents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId: track.id, trackData: track })
    }).catch(() => {});
  };

  const togglePlay = () => {
    if (!currentTrack) {
      if (queue.length > 0) {
        playTrack(queue[0], queue, 0);
      }
      return;
    }

    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
  };

  const nextTrack = () => {
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (isShuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeatMode === 'all') {
        nextIdx = 0;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIdx);
    const track = queue[nextIdx];
    if (track) {
      playTrack(track, queue, nextIdx);
    }
  };

  const prevTrack = () => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (queue.length === 0) return;
    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    setQueueIndex(prevIdx);
    const track = queue[prevIdx];
    if (track) {
      playTrack(track, queue, prevIdx);
    }
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolumeLevel = (vol) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const next = !prev;
      showToast(next ? 'Shuffle enabled' : 'Shuffle disabled');
      return next;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      let next = 'off';
      if (prev === 'off') next = 'all';
      else if (prev === 'all') next = 'one';
      else next = 'off';

      const label = next === 'all' ? 'Repeat all enabled' : next === 'one' ? 'Repeat one enabled' : 'Repeat disabled';
      showToast(label);
      return next;
    });
  };

  const toggleLike = async (track) => {
    if (!track) return;
    const trackIdStr = String(track.id);
    const isLiked = likedSongIds.has(trackIdStr);

    // Optimistic UI update
    setLikedSongIds(prev => {
      const copy = new Set(prev);
      if (isLiked) {
        copy.delete(trackIdStr);
      } else {
        copy.add(trackIdStr);
      }
      return copy;
    });

    showToast(isLiked ? 'Removed from Liked Songs' : 'Added to Liked Songs');

    try {
      if (isLiked) {
        await fetch(`/api/user/liked/${trackIdStr}`, { method: 'DELETE' });
      } else {
        await fetch('/api/user/liked', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trackId: trackIdStr, trackData: track })
        });
      }
    } catch (e) {
      console.error('Error toggling like:', e);
    }
  };

  const addToQueue = (track) => {
    if (!track) return;
    setQueue(prev => [...prev, track]);
    showToast(`Added "${track.title}" to queue`);
  };

  const removeFromQueue = (idx) => {
    setQueue(prev => prev.filter((_, i) => i !== idx));
  };

  const clearQueue = () => {
    if (currentTrack) {
      setQueue([currentTrack]);
      setQueueIndex(0);
    } else {
      setQueue([]);
      setQueueIndex(0);
    }
    showToast('Queue cleared');
  };

  const createPlaylist = async (title, description) => {
    try {
      const res = await fetch('/api/user/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      const newPl = await res.json();
      setUserPlaylists(prev => [newPl, ...prev]);
      showToast(`Created playlist "${newPl.title}"`);
      return newPl;
    } catch (e) {
      console.error('Error creating playlist:', e);
      return null;
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      await fetch(`/api/user/playlists/${playlistId}`, { method: 'DELETE' });
      setUserPlaylists(prev => prev.filter(p => p.id !== playlistId));
      showToast('Playlist deleted');
    } catch (e) {
      console.error('Error deleting playlist:', e);
    }
  };

  const addTrackToPlaylist = async (playlistId, track) => {
    try {
      await fetch(`/api/user/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackId: track.id, trackData: track })
      });
      showToast('Added to playlist');
      refreshUserData();
    } catch (e) {
      console.error('Error adding track to playlist:', e);
    }
  };

  const removeTrackFromPlaylist = async (playlistId, trackId) => {
    try {
      await fetch(`/api/user/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE'
      });
      showToast('Removed from playlist');
      refreshUserData();
    } catch (e) {
      console.error('Error removing track from playlist:', e);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffle,
        repeatMode,
        queue,
        queueIndex,
        likedSongIds,
        userPlaylists,
        showNowPlayingPanel,
        setShowNowPlayingPanel,
        showLyricsView,
        setShowLyricsView,
        showQueueView,
        setShowQueueView,
        isFullScreen,
        setIsFullScreen,
        createPlaylistModalOpen,
        setCreatePlaylistModalOpen,
        editPlaylistModalData,
        setEditPlaylistModalData,
        toastMessage,
        showToast,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seek,
        setVolumeLevel,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        toggleLike,
        addToQueue,
        removeFromQueue,
        clearQueue,
        createPlaylist,
        deletePlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        refreshUserData
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}


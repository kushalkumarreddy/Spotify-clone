import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Heart, 
  MoreHorizontal, 
  Clock, 
  Edit2, 
  Trash2, 
  Plus
} from 'lucide-react';
import TrackRow from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';

function formatDurationHuman(seconds) {
  if (!seconds || seconds <= 0) return '0 min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

export default function PlaylistView() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    togglePlay, 
    setEditPlaylistModalData, 
    deletePlaylist,
    addTrackToPlaylist,
    showToast 
  } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [recommendedTracks, setRecommendedTracks] = useState([]);
  const [recSearch, setRecSearch] = useState('');

  const isLikedSongs = location.pathname === '/collection/tracks';

  // Fetch playlist data
  useEffect(() => {
    setLoading(true);
    const endpoint = isLikedSongs ? '/api/user/liked' : `/api/playlist/${id}`;

    fetch(endpoint)
      .then(r => {
        if (!r.ok) throw new Error('Failed to load playlist');
        return r.json();
      })
      .then(data => {
        setPlaylist(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id, isLikedSongs]);

  // Fetch recommended tracks for custom playlists
  useEffect(() => {
    if (playlist && (playlist.isCustom || (playlist.tracks && playlist.tracks.length < 5))) {
      fetch('/api/search?q=' + encodeURIComponent(recSearch || 'hit'))
        .then(r => r.json())
        .then(res => {
          if (res.tracks) {
            setRecommendedTracks(res.tracks.slice(0, 5));
          }
        })
        .catch(console.error);
    }
  }, [playlist?.id, recSearch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[#b3b3b3]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="p-8 text-center text-[#b3b3b3]">
        <h2 className="text-xl font-bold text-white mb-2">Playlist not found</h2>
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-all mt-4"
        >
          Go Home
        </button>
      </div>
    );
  }

  const tracks = playlist.tracks || [];
  const totalSeconds = tracks.reduce((acc, t) => acc + (t.duration || 30), 0);
  const isPlayingThisPlaylist = 
    isPlaying && 
    currentTrack && 
    tracks.some(t => String(t.id) === String(currentTrack.id));

  const handlePlayPlaylist = () => {
    if (tracks.length === 0) return;
    if (isPlayingThisPlaylist) {
      togglePlay();
    } else {
      playTrack(tracks[0], tracks, 0);
    }
  };

  const bgGradient = playlist.color || '#1e3264';

  return (
    <div className="min-h-full pb-28 select-none">
      {/* Hero Header Section */}
      <div 
        className="p-6 pb-6 flex flex-col md:flex-row items-end gap-6 relative shadow-lg"
        style={{
          background: `linear-gradient(180deg, ${bgGradient} 0%, rgba(18, 18, 18, 0.85) 100%)`
        }}
      >
        {/* Cover Art */}
        <div className="w-48 h-48 md:w-56 md:h-56 flex-shrink-0 rounded shadow-[0_8px_30px_rgb(0,0,0,0.6)] overflow-hidden">
          {isLikedSongs ? (
            <div className="w-full h-full bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center">
              <Heart size={64} className="fill-white text-white drop-shadow-md" />
            </div>
          ) : (
            <img
              src={playlist.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80'}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-end text-white">
          <span className="text-xs uppercase font-bold tracking-wider mb-2">
            {playlist.isCustom ? 'Public Playlist' : 'Playlist'}
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 tracking-tight leading-none drop-shadow line-clamp-2">
            {playlist.title}
          </h1>

          {playlist.description && (
            <p className="text-sm text-[#b3b3b3] mb-3 line-clamp-2">
              {playlist.description}
            </p>
          )}

          {/* Meta Details */}
          <div className="flex items-center gap-1.5 text-xs text-[#b3b3b3] font-medium flex-wrap">
            {playlist.ownerAvatar && (
              <img
                src={playlist.ownerAvatar}
                alt="Owner"
                className="w-6 h-6 rounded-full object-cover mr-1"
              />
            )}
            <span className="font-bold text-white hover:underline cursor-pointer">
              {playlist.owner || 'Spotify'}
            </span>
            {playlist.likes && (
              <>
                <span>•</span>
                <span>{playlist.likes} saves</span>
              </>
            )}
            <span>•</span>
            <span className="text-white font-semibold">{tracks.length} songs,</span>
            <span className="text-[#a7a7a7]">about {formatDurationHuman(totalSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Main Content (Action Row & Table) */}
      <div className="bg-[#121212]/50 p-6 pt-4 space-y-4">
        {/* Action Row */}
        <div className="flex items-center gap-6 mb-4">
          {/* Circular Green Play Button */}
          <button
            onClick={handlePlayPlaylist}
            disabled={tracks.length === 0}
            className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#3be477] flex items-center justify-center text-black shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            title={isPlayingThisPlaylist ? "Pause" : "Play"}
          >
            {isPlayingThisPlaylist ? (
              <Pause size={26} className="fill-black" />
            ) : (
              <Play size={26} className="fill-black ml-1" />
            )}
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[#b3b3b3] hover:text-white transition-colors p-1"
              title="More options"
            >
              <MoreHorizontal size={28} />
            </button>

            {menuOpen && (
              <div 
                className="absolute left-0 top-8 w-48 bg-[#282828] border border-[#3e3e3e] rounded-md shadow-2xl py-1 z-50 text-xs"
                onClick={() => setMenuOpen(false)}
              >
                {playlist.isCustom && (
                  <>
                    <button
                      onClick={() => setEditPlaylistModalData(playlist)}
                      className="w-full px-3 py-2 text-left text-white hover:bg-[#3e3e3e] flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      <span>Edit details</span>
                    </button>
                    <button
                      onClick={() => {
                        deletePlaylist(playlist.id);
                        navigate('/');
                      }}
                      className="w-full px-3 py-2 text-left text-[#f15e6c] hover:bg-[#3e3e3e] flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      <span>Delete playlist</span>
                    </button>
                    <div className="border-t border-[#3e3e3e] my-1"></div>
                  </>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    showToast('Link copied to clipboard');
                  }}
                  className="w-full px-3 py-2 text-left text-white hover:bg-[#3e3e3e]"
                >
                  Copy link to playlist
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tracklist Table */}
        {tracks.length > 0 ? (
          <div>
            {/* Table Header Aligned with TrackRow Columns */}
            <div className="flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#b3b3b3] border-b border-[#282828] mb-2 select-none">
              <div className="w-8 flex-shrink-0 text-center">#</div>
              <div className="flex-1 min-w-0 pr-4">Title</div>
              <div className="hidden md:flex flex-1 min-w-0 pr-4">Album</div>
              <div className="hidden lg:flex w-32 flex-shrink-0">Date added</div>
              <div className="w-28 flex-shrink-0 flex justify-end pr-2">
                <Clock size={16} />
              </div>
            </div>

            {/* Track Rows */}
            <div className="space-y-0.5">
              {tracks.map((track, idx) => (
                <TrackRow
                  key={track.id + '-' + idx}
                  track={track}
                  index={idx}
                  playlist={tracks}
                  showAlbum={true}
                  showCover={true}
                  dateAdded="3 days ago"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-[#b3b3b3]">
            <p className="text-lg font-bold text-white mb-2">This playlist is empty</p>
            <p className="text-sm">Find more that you like and add them to this playlist.</p>
          </div>
        )}

        {/* Recommended Tracks Section */}
        {playlist.isCustom && (
          <div className="pt-10 border-t border-[#282828] space-y-4">
            <h3 className="text-xl font-bold text-white">Recommended</h3>
            <p className="text-xs text-[#b3b3b3]">Based on what's in this playlist</p>

            <div className="space-y-1">
              {recommendedTracks.map(rec => (
                <div 
                  key={rec.id}
                  className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={rec.cover} 
                      alt={rec.title} 
                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-sm text-white truncate">{rec.title}</span>
                      <span className="text-xs text-[#b3b3b3] truncate">{rec.artist}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => addTrackToPlaylist(playlist.id, rec)}
                    className="px-4 py-1.5 rounded-full border border-[#878787] hover:border-white text-white text-xs font-bold hover:scale-105 transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

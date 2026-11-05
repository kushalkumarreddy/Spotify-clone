import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, MoreHorizontal, Clock } from 'lucide-react';
import TrackRow from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';

function formatDurationHuman(seconds) {
  if (!seconds || seconds <= 0) return '0 min';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours} hr ${minutes} min`;
  return `${minutes} min`;
}

export default function AlbumView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay, showToast } = usePlayer();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/album/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Album not found');
        return r.json();
      })
      .then(data => {
        setAlbum(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[#b3b3b3]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="p-8 text-center text-[#b3b3b3]">
        <h2 className="text-xl font-bold text-white mb-2">Album not found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-all mt-4"
        >
          Go Home
        </button>
      </div>
    );
  }

  const tracks = album.tracks || [];
  const totalSeconds = tracks.reduce((acc, t) => acc + (t.duration || 30), 0);
  const isPlayingThisAlbum =
    isPlaying &&
    currentTrack &&
    tracks.some(t => String(t.id) === String(currentTrack.id));

  const handlePlayAlbum = () => {
    if (tracks.length === 0) return;
    if (isPlayingThisAlbum) {
      togglePlay();
    } else {
      playTrack(tracks[0], tracks, 0);
    }
  };

  return (
    <div className="min-h-full pb-28 select-none">
      {/* Header */}
      <div 
        className="p-6 pb-6 flex flex-col md:flex-row items-end gap-6 relative shadow-lg"
        style={{
          background: `linear-gradient(180deg, #3d2b56 0%, rgba(18, 18, 18, 0.85) 100%)`
        }}
      >
        <div className="w-48 h-48 md:w-56 md:h-56 flex-shrink-0 rounded shadow-[0_8px_30px_rgb(0,0,0,0.6)] overflow-hidden">
          <img
            src={album.cover}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-end text-white">
          <span className="text-xs uppercase font-bold tracking-wider mb-2">Album</span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 tracking-tight leading-none drop-shadow line-clamp-2">
            {album.title}
          </h1>

          <div className="flex items-center gap-1.5 text-xs text-[#b3b3b3] font-medium flex-wrap">
            <span 
              onClick={() => album.artistId && navigate(`/artist/${album.artistId}`)}
              className="font-bold text-white hover:underline cursor-pointer"
            >
              {album.artist}
            </span>
            <span>•</span>
            <span>{album.releaseDate?.slice(0, 4) || '2023'}</span>
            <span>•</span>
            <span className="text-white font-semibold">{tracks.length} songs,</span>
            <span className="text-[#a7a7a7]">{formatDurationHuman(totalSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Action Row & Tracklist */}
      <div className="bg-[#121212]/50 p-6 pt-4 space-y-4">
        <div className="flex items-center gap-6 mb-4">
          <button
            onClick={handlePlayAlbum}
            disabled={tracks.length === 0}
            className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#3be477] flex items-center justify-center text-black shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            title={isPlayingThisAlbum ? "Pause" : "Play"}
          >
            {isPlayingThisAlbum ? (
              <Pause size={26} className="fill-black" />
            ) : (
              <Play size={26} className="fill-black ml-1" />
            )}
          </button>

          <button
            onClick={() => showToast('Saved to Your Library')}
            className="text-[#b3b3b3] hover:text-white transition-colors p-1"
          >
            <Heart size={28} />
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast('Link copied to clipboard');
            }}
            className="text-[#b3b3b3] hover:text-white transition-colors p-1"
          >
            <MoreHorizontal size={28} />
          </button>
        </div>

        {/* Table Header Aligned */}
        <div className="flex items-center px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#b3b3b3] border-b border-[#282828] mb-2 select-none">
          <div className="w-8 flex-shrink-0 text-center">#</div>
          <div className="flex-1 min-w-0 pr-4">Title</div>
          <div className="w-28 flex-shrink-0 flex justify-end pr-2">
            <Clock size={16} />
          </div>
        </div>

        {/* Tracks */}
        <div className="space-y-0.5">
          {tracks.map((track, idx) => (
            <TrackRow
              key={track.id + '-' + idx}
              track={track}
              index={idx}
              playlist={tracks}
              showAlbum={false}
              showCover={false}
            />
          ))}
        </div>

        {/* Album Copyright Footer */}
        <div className="pt-8 text-xs text-[#a7a7a7] space-y-1">
          <p>{album.releaseDate || '2023'}</p>
          <p>© 2026 Republic Records, a division of UMG Recordings, Inc.</p>
        </div>
      </div>
    </div>
  );
}

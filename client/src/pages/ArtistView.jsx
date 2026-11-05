import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, CheckCircle2, MoreHorizontal } from 'lucide-react';
import TrackRow from '../components/TrackRow';
import MediaCard from '../components/MediaCard';
import { usePlayer } from '../context/PlayerContext';

export default function ArtistView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay, showToast } = usePlayer();

  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAllTracks, setShowAllTracks] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/artist/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Artist not found');
        return r.json();
      })
      .then(data => {
        setArtist(data);
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

  if (!artist) {
    return (
      <div className="p-8 text-center text-[#b3b3b3]">
        <h2 className="text-xl font-bold text-white mb-2">Artist not found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-all mt-4"
        >
          Go Home
        </button>
      </div>
    );
  }

  const topTracks = artist.topTracks || [];
  const isPlayingThisArtist =
    isPlaying &&
    currentTrack &&
    topTracks.some(t => String(t.id) === String(currentTrack.id));

  const handlePlayArtist = () => {
    if (topTracks.length === 0) return;
    if (isPlayingThisArtist) {
      togglePlay();
    } else {
      playTrack(topTracks[0], topTracks, 0);
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    showToast(isFollowing ? `Unfollowed ${artist.name}` : `Followed ${artist.name}`);
  };

  return (
    <div className="min-h-full pb-28 select-none">
      {/* Hero Banner */}
      <div className="relative h-72 md:h-96 flex flex-col justify-end p-8 overflow-hidden shadow-2xl">
        <img
          src={artist.banner || artist.avatar}
          alt={artist.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/40 to-transparent" />

        <div className="relative z-10 text-white">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={24} className="fill-[#3d91f4] text-white" />
            <span className="text-sm font-semibold tracking-wide">Verified Artist</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-4 tracking-tight drop-shadow-lg">
            {artist.name}
          </h1>

          <p className="text-sm sm:text-base font-medium text-[#e0e0e0] drop-shadow">
            {artist.monthlyListeners || '75,000,000'} monthly listeners
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-10">
        {/* Action Row */}
        <div className="flex items-center gap-6">
          <button
            onClick={handlePlayArtist}
            disabled={topTracks.length === 0}
            className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#3be477] flex items-center justify-center text-black shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            title={isPlayingThisArtist ? "Pause" : "Play"}
          >
            {isPlayingThisArtist ? (
              <Pause size={26} className="fill-black" />
            ) : (
              <Play size={26} className="fill-black ml-1" />
            )}
          </button>

          <button
            onClick={handleFollow}
            className={`px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider hover:scale-105 transition-all ${
              isFollowing 
                ? 'border-[#1ed760] text-[#1ed760]' 
                : 'border-[#878787] text-white hover:border-white'
            }`}
          >
            {isFollowing ? 'Following' : 'Follow'}
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

        {/* Popular Tracks */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Popular</h2>
          <div className="space-y-0.5">
            {(showAllTracks ? topTracks : topTracks.slice(0, 5)).map((track, idx) => (
              <TrackRow
                key={track.id + '-' + idx}
                track={track}
                index={idx}
                playlist={topTracks}
                showAlbum={true}
                showCover={true}
              />
            ))}
          </div>
          {topTracks.length > 5 && (
            <button
              onClick={() => setShowAllTracks(!showAllTracks)}
              className="mt-4 text-xs font-bold text-[#b3b3b3] hover:text-white uppercase tracking-wider hover:underline"
            >
              {showAllTracks ? 'Show less' : 'See more'}
            </button>
          )}
        </section>

        {/* Discography */}
        {artist.albums && artist.albums.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Discography</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {artist.albums.map(alb => (
                <MediaCard
                  key={alb.id}
                  item={{
                    id: alb.id,
                    title: alb.title,
                    description: `Album • ${alb.releaseDate?.slice(0, 4) || '2023'}`,
                    cover: alb.cover,
                    route: `/album/${alb.id}`
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Fans Also Like */}
        {artist.relatedArtists && artist.relatedArtists.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Fans Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {artist.relatedArtists.map(rel => (
                <MediaCard
                  key={rel.id}
                  item={{
                    id: rel.id,
                    title: rel.name,
                    description: 'Artist',
                    cover: rel.avatar,
                    isRound: true,
                    route: `/artist/${rel.id}`
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* About Section */}
        {artist.bio && (
          <section className="bg-[#181818] rounded-xl p-8 max-w-4xl border border-[#282828] relative group overflow-hidden">
            <h2 className="text-2xl font-bold text-white mb-3">About</h2>
            <p className="text-sm text-[#b3b3b3] leading-relaxed max-w-2xl">
              {artist.bio}
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-[#a7a7a7]">
              <CheckCircle2 size={16} className="text-[#3d91f4]" />
              <span>Verified Artist • {artist.followers || '10,000,000'} followers</span>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}


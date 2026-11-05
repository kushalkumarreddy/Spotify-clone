import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MediaCard from '../components/MediaCard';
import TrackRow from '../components/TrackRow';

export default function GenreView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/genres/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Genre not found');
        return r.json();
      })
      .then(data => {
        setGenre(data);
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

  if (!genre) {
    return (
      <div className="p-8 text-center text-[#b3b3b3]">
        <h2 className="text-xl font-bold text-white mb-2">Category not found</h2>
        <button
          onClick={() => navigate('/search')}
          className="px-6 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-all mt-4"
        >
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-full pb-28 select-none">
      {/* Header Banner */}
      <div 
        className="p-8 pb-10 flex flex-col justify-end shadow-lg"
        style={{
          background: `linear-gradient(180deg, ${genre.color || '#1e3264'} 0%, #121212 100%)`
        }}
      >
        <span className="text-xs uppercase font-bold tracking-wider text-white mb-2">Category</span>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow">
          {genre.title}
        </h1>
      </div>

      {/* Content */}
      <div className="p-8 space-y-10">
        {/* Playlists */}
        {genre.playlists && genre.playlists.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Popular Playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {genre.playlists.map(pl => (
                <MediaCard
                  key={pl.id}
                  item={{
                    id: pl.id,
                    title: pl.title,
                    description: pl.description,
                    cover: pl.cover,
                    route: `/playlist/${pl.id}`
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tracks */}
        {genre.tracks && genre.tracks.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Featured Tracks</h2>
            <div className="space-y-0.5">
              {genre.tracks.map((trk, idx) => (
                <TrackRow
                  key={trk.id + '-' + idx}
                  track={trk}
                  index={idx}
                  playlist={genre.tracks}
                  showAlbum={true}
                  showCover={true}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}


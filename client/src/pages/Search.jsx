import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import MediaCard from '../components/MediaCard';
import TrackRow from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();

  const [genres, setGenres] = useState([]);
  const [searchResults, setSearchResults] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';

  // Fetch genres or search results
  useEffect(() => {
    if (!query) {
      setSearchResults(null);
      fetch('/api/genres')
        .then(r => r.json())
        .then(data => setGenres(data))
        .catch(console.error);
    } else {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => {
          setSearchResults(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [query]);

  const handleTopResultPlay = (item) => {
    if (!item) return;
    if (item.type === 'track') {
      if (currentTrack && String(currentTrack.id) === String(item.id)) {
        togglePlay();
      } else {
        playTrack(item.item, [item.item], 0);
      }
    } else if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <div className="min-h-full px-6 py-6 pb-28 select-none">
      {/* CASE 1: Query Empty -> Browse All Genre Cards */}
      {!query && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {genres.map(genre => (
              <div
                key={genre.id}
                onClick={() => navigate(`/genre/${genre.id}`)}
                className="relative h-48 rounded-lg overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] transition-transform duration-200 p-4 flex flex-col justify-between"
                style={{ backgroundColor: genre.color || '#1e3264' }}
              >
                <h3 className="text-white font-extrabold text-xl md:text-2xl max-w-[120px] break-words leading-tight tracking-tight">
                  {genre.title}
                </h3>

                {/* Angled Cover Art */}
                <img
                  src={genre.cover}
                  alt={genre.title}
                  className="absolute bottom-0 right-0 w-24 h-24 object-cover rounded-md shadow-2xl rotate-[25deg] translate-x-[18%] translate-y-[5%]"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CASE 2: Query Present -> Live Search Results */}
      {query && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {['All', 'Songs', 'Artists', 'Albums', 'Playlists'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-white text-black'
                    : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24 text-[#b3b3b3]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : searchResults ? (
            <div className="space-y-8">
              {/* TOP RESULT & SONGS SECTION (Shown when 'All' tab is active) */}
              {(activeTab === 'All' || activeTab === 'Songs') && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Top Result Card */}
                  {activeTab === 'All' && searchResults.topResult && (
                    <div className="lg:col-span-5 flex flex-col">
                      <h2 className="text-2xl font-bold text-white mb-3">Top result</h2>
                      <div
                        onClick={() => handleTopResultPlay(searchResults.topResult)}
                        className="bg-[#181818] hover:bg-[#282828] p-5 rounded-lg flex-1 flex flex-col justify-between group cursor-pointer transition-colors relative shadow-xl"
                      >
                        <div>
                          <img
                            src={searchResults.topResult.cover}
                            alt={searchResults.topResult.title}
                            className={`w-24 h-24 object-cover shadow-2xl mb-4 ${
                              searchResults.topResult.isRound ? 'rounded-full' : 'rounded-md'
                            }`}
                          />
                          <h3 className="text-3xl font-extrabold text-white mb-1 leading-tight line-clamp-1">
                            {searchResults.topResult.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-[#b3b3b3]">
                            <span>{searchResults.topResult.subtitle}</span>
                            <span className="bg-[#121212] px-2.5 py-0.5 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                              {searchResults.topResult.type}
                            </span>
                          </div>
                        </div>

                        {/* Play Button */}
                        <div className="flex justify-end pt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTopResultPlay(searchResults.topResult);
                            }}
                            className="w-12 h-12 rounded-full bg-[#1ed760] hover:bg-[#3be477] flex items-center justify-center text-black shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 hover:scale-105"
                          >
                            <Play size={22} className="fill-black ml-0.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Songs Top 4/5 */}
                  <div className={activeTab === 'All' ? 'lg:col-span-7' : 'lg:col-span-12'}>
                    <h2 className="text-2xl font-bold text-white mb-3">Songs</h2>
                    <div className="space-y-1">
                      {searchResults.tracks && searchResults.tracks.length > 0 ? (
                        searchResults.tracks.slice(0, activeTab === 'All' ? 4 : 15).map((track, idx) => (
                          <TrackRow
                            key={track.id}
                            track={track}
                            index={idx}
                            playlist={searchResults.tracks}
                            showAlbum={activeTab !== 'All'}
                          />
                        ))
                      ) : (
                        <p className="text-[#b3b3b3] text-sm">No songs found.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ARTISTS SHELF */}
              {(activeTab === 'All' || activeTab === 'Artists') && searchResults.artists && searchResults.artists.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">Artists</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {searchResults.artists.map(art => (
                      <MediaCard
                        key={art.id}
                        item={{
                          id: art.id,
                          title: art.name,
                          description: 'Artist',
                          cover: art.avatar,
                          isRound: true,
                          route: `/artist/${art.id}`
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* ALBUMS SHELF */}
              {(activeTab === 'All' || activeTab === 'Albums') && searchResults.albums && searchResults.albums.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {searchResults.albums.map(alb => (
                      <MediaCard
                        key={alb.id}
                        item={{
                          id: alb.id,
                          title: alb.title,
                          description: alb.artist,
                          cover: alb.cover,
                          route: `/album/${alb.id}`
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* PLAYLISTS SHELF */}
              {(activeTab === 'All' || activeTab === 'Playlists') && searchResults.playlists && searchResults.playlists.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4">Playlists</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {searchResults.playlists.map(pl => (
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
            </div>
          ) : (
            <div className="text-center py-20 text-[#b3b3b3]">
              <p className="text-lg font-bold text-white mb-1">No results found for "{query}"</p>
              <p className="text-sm">Please make sure your words are spelled correctly or use less or different keywords.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


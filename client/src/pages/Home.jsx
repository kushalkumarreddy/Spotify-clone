import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart } from 'lucide-react';
import MediaCard from '../components/MediaCard';
import { usePlayer } from '../context/PlayerContext';

export default function Home() {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [data, setData] = useState({
    greeting: 'Good afternoon',
    quickAccess: [],
    shelves: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching home data:', err);
        setLoading(false);
      });
  }, []);

  const handleQuickPlay = (e, item) => {
    e.stopPropagation();
    if (item.type === 'track') {
      if (currentTrack && String(currentTrack.id) === String(item.id)) {
        togglePlay();
      } else {
        playTrack(item, [item], 0);
      }
    } else {
      navigate(item.route);
    }
  };

  return (
    <div className="min-h-full pb-28">
      {/* Dynamic Top Ambient Header */}
      <div className="bg-gradient-to-b from-[#1e3264]/60 via-[#121212]/90 to-[#121212] px-6 pt-6 pb-6">
        {/* Greeting Heading */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6 tracking-tight">
          {data.greeting}
        </h1>

        {/* Top 6-8 Quick Access Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
          {data.quickAccess.map((item) => {
            const isPlayingThis = 
              currentTrack && 
              item.type === 'track' && 
              String(currentTrack.id) === String(item.id) && 
              isPlaying;

            return (
              <div
                key={item.id}
                onClick={() => navigate(item.route)}
                className="group relative flex items-center bg-white/5 hover:bg-white/20 transition-all rounded overflow-hidden cursor-pointer shadow-md select-none h-16"
              >
                {/* Artwork */}
                <div className="w-16 h-16 flex-shrink-0 shadow-md">
                  {item.type === 'liked' ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center">
                      <Heart size={24} className="fill-white text-white" />
                    </div>
                  ) : (
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Title */}
                <span className="font-bold text-[14px] text-white px-4 truncate flex-1">
                  {item.title}
                </span>

                {/* Floating Play Button */}
                <button
                  onClick={(e) => handleQuickPlay(e, item)}
                  className={`mr-4 w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#3be477] flex items-center justify-center text-black shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 ${
                    isPlayingThis
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
                  }`}
                  title={isPlayingThis ? "Pause" : `Play ${item.title}`}
                >
                  {isPlayingThis ? (
                    <Pause size={20} className="fill-black" />
                  ) : (
                    <Play size={20} className="fill-black ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shelves Container */}
      <div className="px-6 space-y-9">
        {data.shelves.map((shelf) => (
          <section key={shelf.id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
                {shelf.title}
              </h2>
              <span className="text-xs font-bold text-[#b3b3b3] hover:underline cursor-pointer">
                Show all
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {shelf.items.map((item) => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}

        {/* Footer info (Spotify style) */}
        <footer className="pt-16 pb-8 border-t border-[#282828] text-xs text-[#a7a7a7]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <p className="font-bold text-white mb-3">Company</p>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer hover:underline">About</li>
                <li className="hover:text-white cursor-pointer hover:underline">Jobs</li>
                <li className="hover:text-white cursor-pointer hover:underline">For the Record</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-3">Communities</p>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer hover:underline">For Artists</li>
                <li className="hover:text-white cursor-pointer hover:underline">Developers</li>
                <li className="hover:text-white cursor-pointer hover:underline">Advertising</li>
                <li className="hover:text-white cursor-pointer hover:underline">Investors</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-3">Useful links</p>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer hover:underline">Support</li>
                <li className="hover:text-white cursor-pointer hover:underline">Free Mobile App</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-white mb-3">Spotify Plans</p>
              <ul className="space-y-2">
                <li className="hover:text-white cursor-pointer hover:underline">Premium Individual</li>
                <li className="hover:text-white cursor-pointer hover:underline">Premium Duo</li>
                <li className="hover:text-white cursor-pointer hover:underline">Premium Family</li>
                <li className="hover:text-white cursor-pointer hover:underline">Spotify Free</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[#232323] text-[#727272]">
            <div className="flex gap-4 mb-4 sm:mb-0">
              <span className="hover:text-white cursor-pointer">Legal</span>
              <span className="hover:text-white cursor-pointer">Privacy Center</span>
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Cookies</span>
            </div>
            <span>© 2026 Spotify AB</span>
          </div>
        </footer>
      </div>
    </div>
  );
}


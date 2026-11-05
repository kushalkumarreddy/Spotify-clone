import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic2, ArrowLeft } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function LyricsView() {
  const navigate = useNavigate();
  const { currentTrack, currentTime, seek } = usePlayer();
  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const activeLineRef = useRef(null);

  useEffect(() => {
    if (!currentTrack) return;
    setLoading(true);
    fetch(`/api/lyrics/${currentTrack.id}`)
      .then(r => r.json())
      .then(data => {
        setLyrics(data.lyrics || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [currentTrack?.id]);

  // Find active line index
  let activeIndex = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
      break;
    }
  }

  // Auto-scroll to active line smoothly
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!currentTrack) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#b3b3b3] p-8 text-center">
        <Mic2 size={48} className="mb-4 text-[#727272]" />
        <h2 className="text-xl font-bold text-white mb-2">No song currently playing</h2>
        <p className="text-sm">Play a song from your library or search to view its lyrics.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-all"
        >
          Browse Music
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-full pb-32 select-none overflow-hidden">
      {/* Dynamic Colorful Blurred Gradient Background */}
      <div 
        className="absolute inset-0 opacity-60 blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 30%, #5038a0 0%, #121212 85%)`
        }}
      />

      {/* Top Header */}
      <div className="relative z-10 px-8 py-6 flex items-center justify-between border-b border-white/10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-[#1ed760] transition-colors text-sm font-semibold"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <div className="text-center">
          <p className="font-bold text-white text-sm">{currentTrack.title}</p>
          <p className="text-xs text-[#b3b3b3]">{currentTrack.artist}</p>
        </div>

        <div className="w-16"></div>
      </div>

      {/* Lyrics Scrollable Container */}
      <div className="relative z-10 max-w-3xl mx-auto px-8 py-12 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[#b3b3b3]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : lyrics.length > 0 ? (
          lyrics.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <p
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`text-2xl sm:text-3xl md:text-4xl font-black cursor-pointer transition-all duration-300 leading-relaxed ${
                  isActive
                    ? 'text-white scale-[1.02] drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]'
                    : isPast
                    ? 'text-white/60 hover:text-white'
                    : 'text-white/30 hover:text-white/70'
                }`}
              >
                {line.text}
              </p>
            );
          })
        ) : (
          <div className="text-center py-20 text-[#b3b3b3]">
            <p className="text-xl font-bold text-white mb-2">Looks like we don't have the lyrics for this song yet.</p>
            <p className="text-sm">Enjoy the audio preview!</p>
          </div>
        )}
      </div>
    </div>
  );
}


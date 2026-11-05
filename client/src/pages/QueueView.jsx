import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListMusic, Trash2, X } from 'lucide-react';
import TrackRow from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';

export default function QueueView() {
  const navigate = useNavigate();
  const { currentTrack, queue, queueIndex, playTrack, removeFromQueue, clearQueue } = usePlayer();

  const nextTracks = queue.slice(queueIndex + 1);

  return (
    <div className="min-h-full p-8 pb-32 select-none space-y-8">
      <div className="flex items-center justify-between border-b border-[#282828] pb-4">
        <h1 className="text-3xl font-extrabold text-white">Queue</h1>
        {nextTracks.length > 0 && (
          <button
            onClick={clearQueue}
            className="px-4 py-1.5 rounded-full border border-[#878787] hover:border-white text-white text-xs font-bold hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            <span>Clear queue</span>
          </button>
        )}
      </div>

      {/* Now Playing Section */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#b3b3b3] mb-3">
          Now playing
        </h2>
        {currentTrack ? (
          <TrackRow
            track={currentTrack}
            index={queueIndex}
            playlist={queue}
            showAlbum={true}
            showCover={true}
          />
        ) : (
          <p className="text-sm text-[#727272]">No track currently playing.</p>
        )}
      </section>

      {/* Next Up in Queue */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#b3b3b3] mb-3">
          Next up
        </h2>

        {nextTracks.length > 0 ? (
          <div className="space-y-1">
            {nextTracks.map((trk, offset) => {
              const actualIdx = queueIndex + 1 + offset;
              return (
                <div key={trk.id + '-' + actualIdx} className="relative group/queueItem flex items-center">
                  <div className="flex-1">
                    <TrackRow
                      track={trk}
                      index={actualIdx}
                      playlist={queue}
                      showAlbum={true}
                      showCover={true}
                    />
                  </div>
                  <button
                    onClick={() => removeFromQueue(actualIdx)}
                    className="opacity-0 group-hover/queueItem:opacity-100 p-2 text-[#b3b3b3] hover:text-white transition-opacity ml-2"
                    title="Remove from queue"
                  >
                    <X size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-[#b3b3b3] border border-dashed border-[#282828] rounded-xl">
            <ListMusic size={32} className="mx-auto mb-2 text-[#727272]" />
            <p className="text-sm font-semibold text-white">Your queue is empty</p>
            <p className="text-xs text-[#a7a7a7] mt-1">Right-click any song or tap the menu to add it to your queue.</p>
          </div>
        )}
      </section>
    </div>
  );
}


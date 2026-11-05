import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bookmark, 
  Plus, 
  ArrowRight, 
  Search, 
  ListFilter, 
  Grid, 
  List as ListIcon, 
  Heart, 
  Pin, 
  Music, 
  MoreHorizontal,
  Trash2,
  Edit2
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    likedSongIds, 
    userPlaylists, 
    setCreatePlaylistModalOpen, 
    setEditPlaylistModalData, 
    deletePlaylist,
    showToast 
  } = usePlayer();

  const [activeFilter, setActiveFilter] = useState(null); // null, 'playlists', 'artists', 'albums'
  const [librarySearchOpen, setLibrarySearchOpen] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [sortBy, setSortBy] = useState('Recents');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [contextMenu, setContextMenu] = useState(null); // { x, y, playlistId }

  // Static Library Artists and Albums
  const artists = [
    { id: 'artist-the-weeknd', name: 'The Weeknd', avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', route: '/artist/artist-the-weeknd' },
    { id: 'artist-taylor-swift', name: 'Taylor Swift', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80', route: '/artist/artist-taylor-swift' },
    { id: 'artist-billie-eilish', name: 'Billie Eilish', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80', route: '/artist/artist-billie-eilish' },
    { id: 'artist-kendrick-lamar', name: 'Kendrick Lamar', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80', route: '/artist/artist-kendrick-lamar' }
  ];

  const albums = [
    { id: 'album-starboy', title: 'Starboy', artist: 'The Weeknd', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80', route: '/album/album-starboy' },
    { id: 'album-midnights', title: 'Midnights', artist: 'Taylor Swift', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80', route: '/album/album-midnights' }
  ];

  // Close context menu on outside click
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Filter items
  let items = [];

  // Liked songs
  if (!activeFilter || activeFilter === 'playlists') {
    items.push({
      id: 'collection-tracks',
      type: 'liked',
      title: 'Liked Songs',
      subtitle: `Playlist • ${likedSongIds.size} songs`,
      route: '/collection/tracks',
      isPinned: true
    });
  }

  // Playlists
  if (!activeFilter || activeFilter === 'playlists') {
    userPlaylists.forEach(pl => {
      items.push({
        id: pl.id,
        type: 'playlist',
        title: pl.title,
        subtitle: `Playlist • Alex Mercer`,
        cover: pl.cover,
        route: `/playlist/${pl.id}`,
        isPinned: false,
        raw: pl
      });
    });
  }

  // Artists
  if (!activeFilter || activeFilter === 'artists') {
    artists.forEach(a => {
      items.push({
        id: a.id,
        type: 'artist',
        title: a.name,
        subtitle: 'Artist',
        cover: a.avatar,
        isRound: true,
        route: a.route,
        isPinned: false
      });
    });
  }

  // Albums
  if (!activeFilter || activeFilter === 'albums') {
    albums.forEach(alb => {
      items.push({
        id: alb.id,
        type: 'album',
        title: alb.title,
        subtitle: `Album • ${alb.artist}`,
        cover: alb.cover,
        route: alb.route,
        isPinned: false
      });
    });
  }

  // Search filter
  if (libraryQuery.trim()) {
    items = items.filter(it => 
      it.title.toLowerCase().includes(libraryQuery.toLowerCase()) || 
      (it.subtitle && it.subtitle.toLowerCase().includes(libraryQuery.toLowerCase()))
    );
  }

  // Sorting
  if (sortBy === 'Alphabetical') {
    items.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'Creator') {
    items.sort((a, b) => (a.subtitle || '').localeCompare(b.subtitle || ''));
  }

  const handleContextMenu = (e, playlist) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      playlist
    });
  };

  return (
    <aside className={`flex flex-col bg-[#121212] rounded-lg transition-all duration-200 select-none ${sidebarCollapsed ? 'w-[72px]' : 'w-[320px]'} flex-shrink-0 h-full overflow-hidden relative`}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center gap-3 text-[#b3b3b3] hover:text-white transition-colors group focus:outline-none"
          title={sidebarCollapsed ? "Expand Your Library" : "Collapse Your Library"}
        >
          <div className="flex items-center justify-center w-7 h-7">
            <svg className="w-6 h-6 fill-current text-[#b3b3b3] group-hover:text-white transition-colors" viewBox="0 0 24 24">
              <path d="M3 22a1 1 0 0 1-1-1V3a1 1 0 0 1 2 0v18a1 1 0 0 1-1 1zM15.5 2.134A1 1 0 0 0 14 3v18a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1.5-.866zM7 4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-[16px] text-[#b3b3b3] group-hover:text-white">Your Library</span>
          )}
        </button>

        {!sidebarCollapsed && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCreatePlaylistModalOpen(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] transition-all"
              title="Create playlist"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] transition-all"
              title="Collapse"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Filter Chips Row (Only when expanded) */}
      {!sidebarCollapsed && (
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="w-7 h-7 rounded-full bg-[#242424] hover:bg-[#2a2a2a] text-[#b3b3b3] hover:text-white flex items-center justify-center flex-shrink-0"
              title="Clear filter"
            >
              ✕
            </button>
          )}
          {['Playlists', 'Artists', 'Albums'].map(filterName => {
            const key = filterName.toLowerCase();
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(isActive ? null : key)}
                className={`px-3 py-1 rounded-full text-[13px] font-semibold transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-white text-black'
                    : 'bg-[#232323] text-white hover:bg-[#2a2a2a]'
                }`}
              >
                {filterName}
              </button>
            );
          })}
        </div>
      )}

      {/* Search & Sort Controls (Only when expanded) */}
      {!sidebarCollapsed && (
        <div className="px-3 py-1 flex items-center justify-between text-[#b3b3b3] text-sm">
          {/* Search Icon / Input */}
          <div className="flex items-center">
            {librarySearchOpen ? (
              <div className="flex items-center bg-[#242424] rounded-md px-2 py-1 text-xs">
                <Search size={14} className="text-[#a7a7a7] mr-1.5" />
                <input
                  type="text"
                  value={libraryQuery}
                  onChange={(e) => setLibraryQuery(e.target.value)}
                  placeholder="Search in Your Library"
                  autoFocus
                  className="bg-transparent border-none text-white focus:outline-none w-32 placeholder-[#757575]"
                />
                <button 
                  onClick={() => { setLibrarySearchOpen(false); setLibraryQuery(''); }}
                  className="text-[#a7a7a7] hover:text-white ml-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setLibrarySearchOpen(true)}
                className="w-8 h-8 rounded-full hover:bg-[#1f1f1f] flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors"
                title="Search in Your Library"
              >
                <Search size={16} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold hover:text-white transition-colors px-2 py-1"
            >
              <span>{sortBy}</span>
              <ListFilter size={15} />
            </button>

            {sortDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[#282828] rounded-md shadow-2xl py-1 z-50 border border-[#3e3e3e] text-xs">
                <p className="px-3 py-1.5 text-[#a7a7a7] font-bold">Sort by</p>
                {['Recents', 'Recently Added', 'Alphabetical', 'Creator'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      setSortBy(opt);
                      setSortDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-[#3e3e3e] flex items-center justify-between ${
                      sortBy === opt ? 'text-[#1ed760] font-bold' : 'text-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {sortBy === opt && <span className="text-[#1ed760]">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Library Items List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
        {items.map(item => {
          const isActive = location.pathname === item.route;
          return (
            <div
              key={item.id}
              onClick={() => navigate(item.route)}
              onContextMenu={(e) => item.type === 'playlist' && item.raw && handleContextMenu(e, item.raw)}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors group ${
                isActive 
                  ? 'bg-[#232323]' 
                  : 'hover:bg-[#1a1a1a]'
              }`}
              title={item.title}
            >
              {/* Thumbnail / Avatar */}
              <div className="relative flex-shrink-0 w-12 h-12">
                {item.type === 'liked' ? (
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center shadow-md">
                    <Heart size={20} className="fill-white text-white" />
                  </div>
                ) : (
                  <img
                    src={item.cover}
                    alt={item.title}
                    className={`w-12 h-12 object-cover shadow-sm ${item.isRound ? 'rounded-full' : 'rounded'}`}
                  />
                )}
              </div>

              {/* Text Info */}
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-medium truncate ${
                    isActive ? 'text-[#1ed760]' : 'text-white group-hover:text-white'
                  }`}>
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#b3b3b3] truncate mt-0.5">
                    {item.isPinned && (
                      <Pin size={12} className="text-[#1ed760] fill-[#1ed760] rotate-45 flex-shrink-0" />
                    )}
                    <span className="truncate">{item.subtitle}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Context Menu for Playlists */}
      {contextMenu && (
        <div 
          className="fixed bg-[#282828] border border-[#3e3e3e] rounded-md shadow-2xl py-1 z-50 text-xs w-48 animate-in fade-in zoom-in-95 duration-100"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setEditPlaylistModalData(contextMenu.playlist);
              setContextMenu(null);
            }}
            className="w-full px-3 py-2 text-left text-white hover:bg-[#3e3e3e] flex items-center gap-2"
          >
            <Edit2 size={14} />
            <span>Edit details</span>
          </button>
          <button
            onClick={() => {
              deletePlaylist(contextMenu.playlist.id);
              setContextMenu(null);
            }}
            className="w-full px-3 py-2 text-left text-[#f15e6c] hover:bg-[#3e3e3e] flex items-center gap-2"
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </aside>
  );
}


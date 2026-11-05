import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home as HomeIcon, 
  Search as SearchIcon, 
  X, 
  Download, 
  Bell, 
  ExternalLink,
  Layers
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isSearchPage = location.pathname.startsWith('/search');
  const isHomePage = location.pathname === '/';

  // Sync search input with URL query
  useEffect(() => {
    if (isSearchPage) {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get('q') || '');
    } else {
      setSearchQuery('');
    }
  }, [location.search, location.pathname, isSearchPage]);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim()) {
      navigate(`/search?q=${encodeURIComponent(val)}`);
    } else {
      navigate('/search');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    navigate('/search');
  };

  return (
    <header className="h-[64px] px-4 flex items-center justify-between bg-black sticky top-0 z-40 select-none">
      {/* LEFT: Spotify Icon & History Navigation */}
      <div className="flex items-center gap-3">
        {/* Official Spotify Icon */}
        <button 
          onClick={() => navigate('/')} 
          className="p-1 hover:scale-105 transition-transform focus:outline-none"
          title="Spotify"
        >
          <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-6.628-5.373-12-12-12zm5.503 17.307c-.217.355-.68.468-1.034.252-2.833-1.731-6.4-2.123-10.601-1.163-.404.092-.806-.16-.898-.564-.092-.404.16-.806.564-.898 4.603-1.051 8.547-.604 11.716 1.339.355.216.469.68.253 1.034zm1.468-3.264c-.274.444-.86.587-1.303.314-3.242-1.993-8.184-2.569-12.02-1.404-.5.152-1.03-.133-1.182-.633-.151-.5.133-1.03.633-1.182 4.39-1.332 9.845-.693 13.558 1.599.444.273.587.86.314 1.305zm.126-3.41c-3.887-2.308-10.301-2.521-14.02-1.392-.596.18-1.229-.158-1.41-.755-.181-.596.159-1.229.756-1.41 4.272-1.297 11.353-1.045 15.82 1.607.536.319.711 1.011.393 1.547-.319.537-1.012.712-1.548.393z"/>
          </svg>
        </button>

        {/* Browser History Nav Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-[#1a1a1a] flex items-center justify-center text-[#b3b3b3] hover:text-white transition-all disabled:opacity-40"
            title="Go back"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-[#1a1a1a] flex items-center justify-center text-[#b3b3b3] hover:text-white transition-all disabled:opacity-40"
            title="Go forward"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* CENTER: Home Button & Search Pill */}
      <div className="flex items-center gap-2 max-w-[500px] w-full mx-4">
        {/* Home Button */}
        <button
          onClick={() => navigate('/')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isHomePage 
              ? 'bg-[#1f1f1f] text-white hover:scale-105' 
              : 'bg-[#1f1f1f] text-[#b3b3b3] hover:text-white hover:scale-105'
          }`}
          title="Home"
        >
          <HomeIcon size={24} className={isHomePage ? 'stroke-[2.5]' : ''} />
        </button>

        {/* Search Input Bar (Spotify Pill) */}
        <div className="relative flex-1 group">
          <div className="flex items-center h-12 px-3 bg-[#1f1f1f] hover:bg-[#2a2a2a] group-focus-within:bg-[#1f1f1f] rounded-full border border-transparent group-focus-within:border-white transition-all">
            <SearchIcon size={22} className="text-[#b3b3b3] group-focus-within:text-white flex-shrink-0 transition-colors mr-2" />
            
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (!isSearchPage) {
                  navigate(searchQuery ? `/search?q=${encodeURIComponent(searchQuery)}` : '/search');
                }
              }}
              placeholder="What do you want to play?"
              className="w-full bg-transparent text-white text-[14px] font-medium placeholder-[#757575] focus:outline-none"
            />

            {searchQuery && (
              <button
                onClick={clearSearch}
                className="text-[#b3b3b3] hover:text-white transition-colors p-1 flex-shrink-0"
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}

            {/* Vertical Divider */}
            <div className="h-6 w-[1px] bg-[#3e3e3e] mx-2 flex-shrink-0"></div>

            {/* Browse Icon */}
            <button
              onClick={() => navigate('/search')}
              className="text-[#b3b3b3] hover:text-white transition-colors p-1 flex-shrink-0"
              title="Browse"
            >
              <Layers size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Premium, Install, Notifications & User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Explore Premium */}
        <button
          onClick={() => showToast('Spotify Premium is active')}
          className="hidden md:inline-flex items-center px-4 py-1.5 rounded-full text-black bg-white hover:scale-105 text-sm font-bold transition-transform"
        >
          Explore Premium
        </button>

        {/* Install App */}
        <button
          onClick={() => showToast('Opening Spotify Desktop installer...')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white bg-black hover:scale-105 hover:text-white text-sm font-bold transition-transform"
        >
          <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center">
            <Download size={11} className="stroke-[2.5]" />
          </div>
          <span>Install App</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => showToast('No new notifications')}
          className="w-9 h-9 rounded-full bg-[#121212] hover:bg-[#1f1f1f] flex items-center justify-center text-[#b3b3b3] hover:text-white hover:scale-105 transition-all"
          title="What's New"
        >
          <Bell size={18} />
        </button>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="w-9 h-9 rounded-full bg-[#1f1f1f] hover:scale-105 p-0.5 border border-[#333] transition-transform overflow-hidden flex items-center justify-center focus:outline-none"
            title="Alex Mercer"
          >
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
              alt="Alex Mercer"
              className="w-full h-full object-cover rounded-full"
            />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#282828] rounded-md shadow-2xl py-1 z-50 border border-[#3e3e3e] text-sm animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-[#3e3e3e]">
                <p className="font-semibold text-white">Alex Mercer</p>
                <p className="text-xs text-[#a7a7a7]">Individual Premium</p>
              </div>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  showToast('Redirecting to Account settings...');
                }}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left text-white hover:bg-[#3e3e3e] transition-colors"
              >
                <span>Account</span>
                <ExternalLink size={14} className="text-[#a7a7a7]" />
              </button>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/collection/tracks');
                }}
                className="w-full px-4 py-2.5 flex items-center text-left text-white hover:bg-[#3e3e3e] transition-colors"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  showToast('You are currently on Spotify Premium');
                }}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left text-white hover:bg-[#3e3e3e] transition-colors"
              >
                <span>Upgrade to Premium</span>
                <ExternalLink size={14} className="text-[#a7a7a7]" />
              </button>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  showToast('Settings opened');
                }}
                className="w-full px-4 py-2.5 flex items-center text-left text-white hover:bg-[#3e3e3e] transition-colors"
              >
                Settings
              </button>
              <div className="border-t border-[#3e3e3e] my-1"></div>
              <button
                onClick={() => {
                  setProfileDropdownOpen(false);
                  showToast('Logged out of session');
                }}
                className="w-full px-4 py-2.5 flex items-center text-left text-[#f15e6c] hover:bg-[#3e3e3e] transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

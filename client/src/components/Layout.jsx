import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import BottomPlayer from './BottomPlayer';
import RightPanel from './RightPanel';
import { CreatePlaylistModal, EditPlaylistModal, FullScreenPlayer, ToastNotification } from './Modals';
import { usePlayer } from '../context/PlayerContext';

export default function Layout() {
  const { showNowPlayingPanel } = usePlayer();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white select-none">
      {/* Top Navigation */}
      <TopNav />

      {/* Main Workspace (Sidebar + Center Content + Right Panel) */}
      <div className="flex-1 flex gap-2 px-2 pb-2 overflow-hidden min-h-0">
        {/* Left Sidebar ("Your Library") */}
        <Sidebar />

        {/* Center Main View */}
        <main className="flex-1 bg-[#121212] rounded-lg overflow-y-auto relative scrollbar-thin">
          <Outlet />
        </main>

        {/* Right Collapsible Panel ("Now Playing View") */}
        {showNowPlayingPanel && <RightPanel />}
      </div>

      {/* Bottom Music Player Bar */}
      <BottomPlayer />

      {/* Global Modals & Notifications */}
      <CreatePlaylistModal />
      <EditPlaylistModal />
      <FullScreenPlayer />
      <ToastNotification />
    </div>
  );
}


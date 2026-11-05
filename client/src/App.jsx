import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import PlaylistView from './pages/PlaylistView';
import AlbumView from './pages/AlbumView';
import ArtistView from './pages/ArtistView';
import LyricsView from './pages/LyricsView';
import QueueView from './pages/QueueView';
import GenreView from './pages/GenreView';

export default function App() {
  return (
    <PlayerProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="playlist/:id" element={<PlaylistView />} />
            <Route path="collection/tracks" element={<PlaylistView />} />
            <Route path="album/:id" element={<AlbumView />} />
            <Route path="artist/:id" element={<ArtistView />} />
            <Route path="lyrics" element={<LyricsView />} />
            <Route path="queue" element={<QueueView />} />
            <Route path="genre/:id" element={<GenreView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PlayerProvider>
  );
}

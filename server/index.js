import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { tracks: [], artists: [], albums: [], playlists: [], user: { likedSongIds: [], customPlaylists: [], recentlyPlayed: [] }, genres: [], lyrics: {} };
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { tracks: [], artists: [], albums: [], playlists: [], user: { likedSongIds: [], customPlaylists: [], recentlyPlayed: [] }, genres: [], lyrics: {} };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing to db.json:', err);
    return false;
  }
}

// Helper to resolve track by id
function getTrackById(db, id) {
  return db.tracks.find(t => String(t.id) === String(id));
}

// Helper to get time of day greeting
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

// GET /api/home
app.get('/api/home', (req, res) => {
  const db = readDB();
  
  // Top quick access items (Liked songs + 5 playlists/albums)
  const quickAccess = [
    {
      id: 'collection-tracks',
      type: 'liked',
      title: 'Liked Songs',
      cover: 'https://misc.scdn.co/liked-songs/liked-songs-300.png',
      route: '/collection/tracks',
      itemCount: db.user.likedSongIds.length
    },
    ...db.playlists.slice(0, 5).map(p => ({
      id: p.id,
      type: 'playlist',
      title: p.title,
      cover: p.cover,
      route: `/playlist/${p.id}`
    }))
  ];

  // Shelves
  const shelves = [
    {
      id: 'shelf-recently-played',
      title: 'Recently played',
      type: 'track',
      items: (db.user.recentlyPlayed || []).slice(0, 7).map(r => {
        const trk = getTrackById(db, r.trackId);
        return trk ? { ...trk, route: `/album/${trk.albumId}` } : null;
      }).filter(Boolean)
    },
    {
      id: 'shelf-made-for-you',
      title: 'Made For You',
      type: 'playlist',
      items: db.playlists.slice(0, 6).map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        cover: p.cover,
        route: `/playlist/${p.id}`
      }))
    },
    {
      id: 'shelf-popular-artists',
      title: 'Popular artists',
      type: 'artist',
      items: db.artists.slice(0, 6).map(a => ({
        id: a.id,
        title: a.name,
        description: 'Artist',
        cover: a.avatar,
        isRound: true,
        route: `/artist/${a.id}`
      }))
    },
    {
      id: 'shelf-popular-albums',
      title: 'Popular albums',
      type: 'album',
      items: db.albums.slice(0, 6).map(alb => ({
        id: alb.id,
        title: alb.title,
        description: alb.artist,
        cover: alb.cover,
        route: `/album/${alb.id}`
      }))
    },
    {
      id: 'shelf-featured-playlists',
      title: 'Featured Playlists',
      type: 'playlist',
      items: [...db.playlists.slice(2), ...db.user.customPlaylists].slice(0, 6).map(p => ({
        id: p.id,
        title: p.title,
        description: p.description || 'By Alex Mercer',
        cover: p.cover,
        route: `/playlist/${p.id}`
      }))
    }
  ];

  res.json({
    greeting: getGreeting(),
    quickAccess,
    shelves
  });
});

// GET /api/search
app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  const db = readDB();

  if (!query) {
    return res.json({
      genres: db.genres || []
    });
  }

  // Search local db
  let matchedTracks = db.tracks.filter(t => 
    t.title.toLowerCase().includes(query) || 
    t.artist.toLowerCase().includes(query) ||
    (t.album && t.album.toLowerCase().includes(query))
  );

  let matchedArtists = db.artists.filter(a => 
    a.name.toLowerCase().includes(query)
  );

  let matchedAlbums = db.albums.filter(alb => 
    alb.title.toLowerCase().includes(query) || 
    alb.artist.toLowerCase().includes(query)
  );

  let matchedPlaylists = [
    ...db.playlists,
    ...(db.user.customPlaylists || [])
  ].filter(p => 
    p.title.toLowerCase().includes(query) || 
    (p.description && p.description.toLowerCase().includes(query))
  );

  // If local tracks count is low, augment with live iTunes search API!
  if (matchedTracks.length < 5) {
    try {
      const itunesRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&country=US&limit=15`);
      const itunesData = await itunesRes.json();
      if (itunesData.results && itunesData.results.length > 0) {
        const liveTracks = itunesData.results.map(item => ({
          id: String(item.trackId),
          title: item.trackName,
          artist: item.artistName,
          artistId: String(item.artistId),
          album: item.collectionName,
          albumId: String(item.collectionId),
          cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
          audioUrl: item.previewUrl,
          duration: Math.round((item.trackTimeMillis || 30000) / 1000),
          releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '2023-01-01',
          genre: item.primaryGenreName || 'Pop',
          explicit: item.trackExplicitness === 'explicit'
        }));

        // Merge without duplicates
        const existingIds = new Set(matchedTracks.map(t => String(t.id)));
        liveTracks.forEach(lt => {
          if (!existingIds.has(String(lt.id))) {
            matchedTracks.push(lt);
            existingIds.add(String(lt.id));
            // Also register in db.tracks so it's playable everywhere
            if (!db.tracks.some(t => String(t.id) === String(lt.id))) {
              db.tracks.push(lt);
            }
          }
        });
        writeDB(db);
      }
    } catch (apiErr) {
      console.warn('iTunes fallback search error:', apiErr.message);
    }
  }

  // Top result selection
  let topResult = null;
  if (matchedArtists.length > 0 && matchedArtists[0].name.toLowerCase().startsWith(query)) {
    topResult = {
      type: 'artist',
      id: matchedArtists[0].id,
      title: matchedArtists[0].name,
      subtitle: 'Artist',
      cover: matchedArtists[0].avatar,
      isRound: true,
      route: `/artist/${matchedArtists[0].id}`,
      item: matchedArtists[0]
    };
  } else if (matchedTracks.length > 0) {
    topResult = {
      type: 'track',
      id: matchedTracks[0].id,
      title: matchedTracks[0].title,
      subtitle: `${matchedTracks[0].artist} • Song`,
      cover: matchedTracks[0].cover,
      route: `/album/${matchedTracks[0].albumId}`,
      item: matchedTracks[0]
    };
  } else if (matchedPlaylists.length > 0) {
    topResult = {
      type: 'playlist',
      id: matchedPlaylists[0].id,
      title: matchedPlaylists[0].title,
      subtitle: 'Playlist',
      cover: matchedPlaylists[0].cover,
      route: `/playlist/${matchedPlaylists[0].id}`,
      item: matchedPlaylists[0]
    };
  }

  res.json({
    topResult,
    tracks: matchedTracks.slice(0, 10),
    artists: matchedArtists.slice(0, 8),
    albums: matchedAlbums.slice(0, 8),
    playlists: matchedPlaylists.slice(0, 8)
  });
});

// GET /api/genres
app.get('/api/genres', (req, res) => {
  const db = readDB();
  res.json(db.genres || []);
});

// GET /api/genres/:id
app.get('/api/genres/:id', (req, res) => {
  const db = readDB();
  const genre = db.genres.find(g => g.id === req.params.id);
  if (!genre) return res.status(404).json({ error: 'Genre not found' });
  
  // Find related tracks and playlists
  const tracks = db.tracks.filter(t => (t.genre || '').toLowerCase().includes(genre.title.toLowerCase()) || genre.title === 'Music').slice(0, 20);
  const playlists = db.playlists.slice(0, 6);

  res.json({
    ...genre,
    tracks,
    playlists
  });
});

// GET /api/playlist/:id
app.get('/api/playlist/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;

  let playlist = db.playlists.find(p => p.id === id);
  let isCustom = false;

  if (!playlist) {
    playlist = db.user.customPlaylists.find(p => p.id === id);
    isCustom = true;
  }

  if (!playlist) {
    return res.status(404).json({ error: 'Playlist not found' });
  }

  const tracks = (playlist.tracks || []).map(tId => getTrackById(db, tId)).filter(Boolean);

  res.json({
    ...playlist,
    isCustom,
    tracks
  });
});

// GET /api/album/:id
app.get('/api/album/:id', async (req, res) => {
  const db = readDB();
  const { id } = req.params;

  let album = db.albums.find(a => String(a.id) === String(id));

  if (!album) {
    // Try to fetch album and its tracks from iTunes
    try {
      const itunesRes = await fetch(`https://itunes.apple.com/lookup?id=${id}&entity=song`);
      const itunesData = await itunesRes.json();
      if (itunesData.results && itunesData.results.length > 0) {
        const albMeta = itunesData.results[0];
        const albSongs = itunesData.results.slice(1).map(item => ({
          id: String(item.trackId),
          title: item.trackName,
          artist: item.artistName,
          artistId: String(item.artistId),
          album: item.collectionName,
          albumId: String(item.collectionId),
          cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : albMeta.artworkUrl100,
          audioUrl: item.previewUrl,
          duration: Math.round((item.trackTimeMillis || 30000) / 1000),
          releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '2023-01-01',
          genre: item.primaryGenreName || 'Pop'
        }));

        albSongs.forEach(s => {
          if (!db.tracks.some(t => String(t.id) === String(s.id))) {
            db.tracks.push(s);
          }
        });

        album = {
          id: String(albMeta.collectionId),
          title: albMeta.collectionName,
          artist: albMeta.artistName,
          artistId: String(albMeta.artistId),
          cover: albMeta.artworkUrl100 ? albMeta.artworkUrl100.replace('100x100bb', '600x600bb') : '',
          releaseDate: albMeta.releaseDate ? albMeta.releaseDate.split('T')[0] : '2023',
          tracks: albSongs.map(s => s.id),
          genre: albMeta.primaryGenreName
        };

        db.albums.push(album);
        writeDB(db);

        return res.json({
          ...album,
          tracks: albSongs
        });
      }
    } catch (e) {
      console.error('Error fetching album lookup:', e);
    }

    return res.status(404).json({ error: 'Album not found' });
  }

  const tracks = (album.tracks || []).map(tId => getTrackById(db, tId)).filter(Boolean);

  res.json({
    ...album,
    tracks
  });
});

// GET /api/artist/:id
app.get('/api/artist/:id', (req, res) => {
  const db = readDB();
  const { id } = req.params;

  const artist = db.artists.find(a => a.id === id || String(a.id) === String(id));
  if (!artist) {
    return res.status(404).json({ error: 'Artist not found' });
  }

  const topTracks = (artist.topTracks || []).map(tId => getTrackById(db, tId)).filter(Boolean);
  const artistAlbums = db.albums.filter(alb => alb.artistId === artist.id || alb.artist.toLowerCase() === artist.name.toLowerCase());
  const relatedArtists = db.artists.filter(a => a.id !== artist.id).slice(0, 5);

  res.json({
    ...artist,
    topTracks,
    albums: artistAlbums,
    relatedArtists
  });
});

// GET /api/track/:id
app.get('/api/track/:id', (req, res) => {
  const db = readDB();
  const track = getTrackById(db, req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  res.json(track);
});

// GET /api/lyrics/:id
app.get('/api/lyrics/:id', (req, res) => {
  const db = readDB();
  const track = getTrackById(db, req.params.id);
  
  // Return synced lyrics if track title matches sample or generate synced karaoke lines
  if (track && track.title.toLowerCase().includes('blind')) {
    return res.json({ lyrics: db.lyrics.sample });
  }

  // Realistic fallback synced lyrics
  const lines = [
    { time: 0, text: `♪ (Playing "${track ? track.title : 'Track'}") ♪` },
    { time: 3, text: `Vocals by ${track ? track.artist : 'Artist'}` },
    { time: 6, text: "Feel the rhythm in your heart tonight" },
    { time: 10, text: "Underneath the city neon light" },
    { time: 14, text: "Every beat is taking us higher" },
    { time: 18, text: "Burning bright like an endless fire" },
    { time: 22, text: "Don't let the music fade away" },
    { time: 26, text: "We're dancing 'til the break of day" }
  ];

  res.json({ lyrics: lines });
});

// USER CRUD ENDPOINTS

// GET /api/user/library
app.get('/api/user/library', (req, res) => {
  const db = readDB();
  const likedCount = db.user.likedSongIds.length;
  
  const libraryItems = [
    {
      id: 'collection-tracks',
      type: 'liked',
      title: 'Liked Songs',
      subtitle: `Playlist • ${likedCount} songs`,
      cover: 'https://misc.scdn.co/liked-songs/liked-songs-300.png',
      isPinned: true,
      route: '/collection/tracks'
    },
    ...db.user.customPlaylists.map(p => ({
      id: p.id,
      type: 'playlist',
      title: p.title,
      subtitle: `Playlist • ${db.user.profile.name}`,
      cover: p.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      isPinned: false,
      route: `/playlist/${p.id}`
    })),
    ...db.artists.slice(0, 4).map(a => ({
      id: a.id,
      type: 'artist',
      title: a.name,
      subtitle: 'Artist',
      cover: a.avatar,
      isRound: true,
      isPinned: false,
      route: `/artist/${a.id}`
    })),
    ...db.albums.slice(0, 3).map(alb => ({
      id: alb.id,
      type: 'album',
      title: alb.title,
      subtitle: `Album • ${alb.artist}`,
      cover: alb.cover,
      isPinned: false,
      route: `/album/${alb.id}`
    }))
  ];

  res.json({
    profile: db.user.profile,
    items: libraryItems
  });
});

// GET /api/user/playlists
app.get('/api/user/playlists', (req, res) => {
  const db = readDB();
  res.json(db.user.customPlaylists || []);
});

// POST /api/user/playlists
app.post('/api/user/playlists', (req, res) => {
  const db = readDB();
  const count = (db.user.customPlaylists || []).length + 1;
  const newPlaylist = {
    id: `user-playlist-${Date.now()}`,
    title: req.body.title || `My Playlist #${count}`,
    description: req.body.description || 'Made with Spotify Web Player',
    cover: req.body.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString().split('T')[0],
    color: '#1e3264',
    tracks: req.body.trackId ? [req.body.trackId] : []
  };

  db.user.customPlaylists = [newPlaylist, ...(db.user.customPlaylists || [])];
  writeDB(db);
  res.status(201).json(newPlaylist);
});

// PUT /api/user/playlists/:id
app.put('/api/user/playlists/:id', (req, res) => {
  const db = readDB();
  const idx = db.user.customPlaylists.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Playlist not found' });

  db.user.customPlaylists[idx] = {
    ...db.user.customPlaylists[idx],
    title: req.body.title !== undefined ? req.body.title : db.user.customPlaylists[idx].title,
    description: req.body.description !== undefined ? req.body.description : db.user.customPlaylists[idx].description,
    cover: req.body.cover !== undefined ? req.body.cover : db.user.customPlaylists[idx].cover
  };

  writeDB(db);
  res.json(db.user.customPlaylists[idx]);
});

// DELETE /api/user/playlists/:id
app.delete('/api/user/playlists/:id', (req, res) => {
  const db = readDB();
  db.user.customPlaylists = (db.user.customPlaylists || []).filter(p => p.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, message: 'Playlist deleted' });
});

// POST /api/user/playlists/:id/tracks
app.post('/api/user/playlists/:id/tracks', (req, res) => {
  const db = readDB();
  const playlist = db.user.customPlaylists.find(p => p.id === req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  const { trackId, trackData } = req.body;
  if (!trackId) return res.status(400).json({ error: 'trackId is required' });

  // Store track in db.tracks if passed
  if (trackData && !db.tracks.some(t => String(t.id) === String(trackId))) {
    db.tracks.push(trackData);
  }

  if (!playlist.tracks.includes(trackId)) {
    playlist.tracks.push(trackId);
    writeDB(db);
  }

  res.json({ success: true, playlist });
});

// DELETE /api/user/playlists/:id/tracks/:trackId
app.delete('/api/user/playlists/:id/tracks/:trackId', (req, res) => {
  const db = readDB();
  const playlist = db.user.customPlaylists.find(p => p.id === req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  playlist.tracks = (playlist.tracks || []).filter(id => String(id) !== String(req.params.trackId));
  writeDB(db);
  res.json({ success: true, playlist });
});

// GET /api/user/liked
app.get('/api/user/liked', (req, res) => {
  const db = readDB();
  const likedTracks = (db.user.likedSongIds || []).map(id => getTrackById(db, id)).filter(Boolean);
  res.json({
    id: 'collection-tracks',
    title: 'Liked Songs',
    description: 'All your favorite saved tracks in one place.',
    cover: 'https://misc.scdn.co/liked-songs/liked-songs-300.png',
    owner: db.user.profile.name,
    ownerAvatar: db.user.profile.avatar,
    color: '#5038a0',
    tracks: likedTracks
  });
});

// POST /api/user/liked
app.post('/api/user/liked', (req, res) => {
  const db = readDB();
  const { trackId, trackData } = req.body;
  if (!trackId) return res.status(400).json({ error: 'trackId is required' });

  if (trackData && !db.tracks.some(t => String(t.id) === String(trackId))) {
    db.tracks.push(trackData);
  }

  if (!db.user.likedSongIds.includes(String(trackId))) {
    db.user.likedSongIds.push(String(trackId));
    writeDB(db);
  }

  res.json({ success: true, likedSongIds: db.user.likedSongIds });
});

// DELETE /api/user/liked/:trackId
app.delete('/api/user/liked/:trackId', (req, res) => {
  const db = readDB();
  db.user.likedSongIds = (db.user.likedSongIds || []).filter(id => String(id) !== String(req.params.trackId));
  writeDB(db);
  res.json({ success: true, likedSongIds: db.user.likedSongIds });
});

// GET /api/user/recents
app.get('/api/user/recents', (req, res) => {
  const db = readDB();
  const recents = (db.user.recentlyPlayed || []).map(r => {
    const track = getTrackById(db, r.trackId);
    return track ? { ...track, playedAt: r.playedAt } : null;
  }).filter(Boolean);
  res.json(recents);
});

// POST /api/user/recents
app.post('/api/user/recents', (req, res) => {
  const db = readDB();
  const { trackId, trackData } = req.body;
  if (!trackId) return res.status(400).json({ error: 'trackId is required' });

  if (trackData && !db.tracks.some(t => String(t.id) === String(trackId))) {
    db.tracks.push(trackData);
  }

  // Prepend to recents, max 30 items, removing duplicate if already in recents
  const filtered = (db.user.recentlyPlayed || []).filter(r => String(r.trackId) !== String(trackId));
  db.user.recentlyPlayed = [
    { trackId: String(trackId), playedAt: new Date().toISOString() },
    ...filtered
  ].slice(0, 30);

  writeDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Spotify Clone backend API running on http://localhost:${PORT}`);
});


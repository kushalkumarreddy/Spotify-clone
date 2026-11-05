import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function searchSongs(term, limit = 5) {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&country=US&limit=${limit}`);
    const data = await res.json();
    return (data.results || []).map(item => ({
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
  } catch (err) {
    console.error(`Error fetching songs for ${term}:`, err.message);
    return [];
  }
}

async function runSeed() {
  console.log('Starting seed generation...');
  
  const artistsQueryList = [
    { name: 'The Weeknd', id: 'artist-the-weeknd', followers: '115,248,930', listeners: '112,492,100', bio: 'Abel Makkonen Tesfaye, known professionally as The Weeknd, is a Canadian singer, songwriter, and record producer. Renowned for his unconventional music production, artistic reinventions, and his signature use of the falsetto register.', verified: true, avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80', banner: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1600&auto=format&fit=crop&q=80', query: 'The Weeknd' },
    { name: 'Taylor Swift', id: 'artist-taylor-swift', followers: '118,924,140', listeners: '106,380,450', bio: 'Taylor Alison Swift is an American singer-songwriter. Her multifaceted songwriting, artistic reinventions, and cultural influence have made her a defining figure of contemporary popular culture.', verified: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80', banner: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&auto=format&fit=crop&q=80', query: 'Taylor Swift' },
    { name: 'Billie Eilish', id: 'artist-billie-eilish', followers: '98,421,700', listeners: '104,115,300', bio: 'Billie Eilish Pirate Baird O\'Connell is an American singer-songwriter. She first gained public attention in 2015 with her debut single Ocean Eyes and has won numerous Grammy Awards and Academy Awards.', verified: true, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80', banner: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&auto=format&fit=crop&q=80', query: 'Billie Eilish' },
    { name: 'Kendrick Lamar', id: 'artist-kendrick-lamar', followers: '34,812,000', listeners: '72,400,000', bio: 'Kendrick Lamar Duckworth is an American rapper and songwriter. Widely regarded as one of the most influential hip-hop artists of his generation and one of the greatest rappers of all time.', verified: true, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80', banner: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&auto=format&fit=crop&q=80', query: 'Kendrick Lamar' },
    { name: 'Dua Lipa', id: 'artist-dua-lipa', followers: '45,630,200', listeners: '68,910,000', bio: 'Dua Lipa is an English and Albanian singer and songwriter. Her mezzo-soprano vocal range and disco-pop production have earned her critical acclaim and global commercial success.', verified: true, avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80', banner: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1600&auto=format&fit=crop&q=80', query: 'Dua Lipa' },
    { name: 'Drake', id: 'artist-drake', followers: '88,140,000', listeners: '84,100,000', bio: 'Aubrey Drake Graham is a Canadian rapper, singer, and songwriter. An influential figure in contemporary popular music, he is credited with popularizing singing and R&B sensibilities in hip hop.', verified: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', banner: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1600&auto=format&fit=crop&q=80', query: 'Drake' },
    { name: 'Queen', id: 'artist-queen', followers: '52,300,000', listeners: '51,800,000', bio: 'Queen are a British rock band formed in London in 1970 by Freddie Mercury, Brian May, Roger Taylor, and later joined by John Deacon. Their classic hits remain timeless anthems.', verified: true, avatar: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=600&auto=format&fit=crop&q=80', banner: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1600&auto=format&fit=crop&q=80', query: 'Queen' },
    { name: 'Arctic Monkeys', id: 'artist-arctic-monkeys', followers: '28,900,000', listeners: '42,100,000', bio: 'Arctic Monkeys are an English rock band formed in Sheffield in 2002. The group consists of Alex Turner, Jamie Cook, Nick O\'Malley, and Matt Helders.', verified: true, avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80', banner: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1600&auto=format&fit=crop&q=80', query: 'Arctic Monkeys' }
  ];

  const allTracks = [];
  const artists = [];
  const albumsMap = new Map();

  for (const art of artistsQueryList) {
    console.log(`Fetching tracks for ${art.name}...`);
    const tracks = await searchSongs(art.query, 6);
    
    // Set actual artist avatar if track cover available
    if (tracks.length > 0 && tracks[0].cover) {
      art.avatar = tracks[0].cover;
    }

    const artistTrackIds = [];
    tracks.forEach(t => {
      t.artistId = art.id;
      allTracks.push(t);
      artistTrackIds.push(t.id);

      // Group into albums
      if (!albumsMap.has(t.albumId) && t.album) {
        albumsMap.set(t.albumId, {
          id: t.albumId,
          title: t.album,
          artist: t.artist,
          artistId: art.id,
          cover: t.cover,
          releaseDate: t.releaseDate,
          tracks: [t.id],
          genre: t.genre
        });
      } else if (albumsMap.has(t.albumId)) {
        const alb = albumsMap.get(t.albumId);
        if (!alb.tracks.includes(t.id)) alb.tracks.push(t.id);
      }
    });

    artists.push({
      id: art.id,
      name: art.name,
      followers: art.followers,
      monthlyListeners: art.listeners,
      bio: art.bio,
      verified: art.verified,
      avatar: art.avatar,
      banner: art.banner,
      topTracks: artistTrackIds
    });
  }

  // Convert albumsMap to array
  const albums = Array.from(albumsMap.values());

  // Additional curated playlists
  const playlists = [
    {
      id: 'playlist-todays-top-hits',
      title: "Today's Top Hits",
      description: "Billie Eilish, The Weeknd, Taylor Swift and the biggest songs right now. Cover: Billie Eilish",
      cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
      owner: 'Spotify',
      ownerAvatar: 'https://open.spotifycdn.com/cdn/images/favicon32.b64ecc03.png',
      likes: '34,921,489',
      duration: '2 hr 45 min',
      color: '#1e3264',
      tracks: allTracks.slice(0, 15).map(t => t.id)
    },
    {
      id: 'playlist-rapcaviar',
      title: 'RapCaviar',
      description: 'Music from Kendrick Lamar, Drake, Travis Scott and hip-hop heavyweights.',
      cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
      owner: 'Spotify',
      ownerAvatar: 'https://open.spotifycdn.com/cdn/images/favicon32.b64ecc03.png',
      likes: '15,820,110',
      duration: '3 hr 10 min',
      color: '#ba5d07',
      tracks: allTracks.filter(t => t.genre === 'Hip-Hop/Rap' || t.artist.includes('Kendrick') || t.artist.includes('Drake')).map(t => t.id)
    },
    {
      id: 'playlist-rock-classics',
      title: 'Rock Classics',
      description: 'Rock legends & epic songs that continue to inspire generations.',
      cover: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=600&auto=format&fit=crop&q=80',
      owner: 'Spotify',
      ownerAvatar: 'https://open.spotifycdn.com/cdn/images/favicon32.b64ecc03.png',
      likes: '11,402,890',
      duration: '4 hr 15 min',
      color: '#8400e7',
      tracks: allTracks.filter(t => t.genre === 'Rock' || t.artist.includes('Queen') || t.artist.includes('Monkeys')).map(t => t.id)
    },
    {
      id: 'playlist-mega-hit-mix',
      title: 'Mega Hit Mix',
      description: 'A mega mix of 75 favorites from the past few years.',
      cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
      owner: 'Spotify',
      ownerAvatar: 'https://open.spotifycdn.com/cdn/images/favicon32.b64ecc03.png',
      likes: '7,128,490',
      duration: '3 hr 40 min',
      color: '#e1118c',
      tracks: allTracks.slice(10, 25).map(t => t.id)
    },
    {
      id: 'playlist-deep-focus',
      title: 'Deep Focus',
      description: 'Keep calm and focus with ambient and post-rock music.',
      cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
      owner: 'Spotify',
      ownerAvatar: 'https://open.spotifycdn.com/cdn/images/favicon32.b64ecc03.png',
      likes: '4,231,900',
      duration: '5 hr 12 min',
      color: '#056952',
      tracks: allTracks.slice(5, 15).map(t => t.id)
    },
    {
      id: 'playlist-all-out-2010s',
      title: 'All Out 2010s',
      description: 'The biggest songs of the 2010s. Nostalgia at its peak.',
      cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
      owner: 'Spotify',
      ownerAvatar: 'https://open.spotifycdn.com/cdn/images/favicon32.b64ecc03.png',
      likes: '12,980,500',
      duration: '4 hr 02 min',
      color: '#d84000',
      tracks: allTracks.slice(2, 18).map(t => t.id)
    }
  ];

  // User's Liked Songs and Custom Playlists
  const user = {
    profile: {
      name: 'Alex Mercer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      plan: 'Spotify Premium Individual',
      followers: 14,
      following: 38
    },
    likedSongIds: allTracks.slice(0, 8).map(t => t.id),
    customPlaylists: [
      {
        id: 'user-playlist-1',
        title: 'Late Night Drives',
        description: 'Atmospheric vibes for midnight highways and neon lights.',
        cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
        createdAt: '2026-01-15',
        color: '#283c86',
        tracks: allTracks.slice(0, 6).map(t => t.id)
      },
      {
        id: 'user-playlist-2',
        title: 'Workout Energy & Hype',
        description: 'High octane beats to smash every personal record.',
        cover: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        createdAt: '2026-02-10',
        color: '#e8115b',
        tracks: allTracks.slice(4, 10).map(t => t.id)
      }
    ],
    recentlyPlayed: allTracks.slice(0, 10).map(t => ({
      trackId: t.id,
      playedAt: new Date().toISOString()
    }))
  };

  // Browse Categories / Genres
  const genres = [
    { id: 'genre-music', title: 'Music', color: '#dc148c', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-podcasts', title: 'Podcasts', color: '#006450', cover: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-live-events', title: 'Live Events', color: '#8400e7', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-made-for-you', title: 'Made For You', color: '#1e3264', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-new-releases', title: 'New Releases', color: '#e8115b', cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-pop', title: 'Pop', color: '#148a08', cover: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-hip-hop', title: 'Hip-Hop', color: '#bc5900', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-rock', title: 'Rock', color: '#e91429', cover: 'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-latin', title: 'Latin', color: '#e1118c', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-dance-electronic', title: 'Dance / Electronic', color: '#d84000', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-chill', title: 'Chill', color: '#477d95', cover: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-indie', title: 'Indie', color: '#608108', cover: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-workout', title: 'Workout', color: '#777777', cover: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-r-and-b', title: 'R&B', color: '#dc148c', cover: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-gaming', title: 'Gaming', color: '#e91429', cover: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&auto=format&fit=crop&q=80' },
    { id: 'genre-k-pop', title: 'K-Pop', color: '#1e3264', cover: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80' }
  ];

  // Synced Lyrics for signature songs
  const lyrics = {
    sample: [
      { time: 0, text: "♪ (Music playing) ♪" },
      { time: 4, text: "Yeah, yeah" },
      { time: 8, text: "I've been on my own for long enough" },
      { time: 13, text: "Maybe you can show me how to love, maybe" },
      { time: 18, text: "I'm going through withdrawals" },
      { time: 22, text: "You don't even have to do too much" },
      { time: 26, text: "You can turn me on with just a touch, baby" },
      { time: 30, text: "I look around and Sin City's cold and empty" },
      { time: 35, text: "No one's around to judge me" },
      { time: 39, text: "I can't see clearly when you're gone" },
      { time: 43, text: "I said, ooh, I'm blinded by the lights" },
      { time: 48, text: "No, I can't sleep until I feel your touch" },
      { time: 54, text: "I said, ooh, I'm drowning in the night" },
      { time: 59, text: "Oh, when I'm like this, you're the one I trust" }
    ]
  };

  const db = {
    tracks: allTracks,
    artists,
    albums,
    playlists,
    user,
    genres,
    lyrics
  };

  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  fs.writeFileSync(path.join(dataDir, 'db.json'), JSON.stringify(db, null, 2), 'utf-8');
  console.log(`Database seeded successfully with ${allTracks.length} tracks, ${artists.length} artists, ${albums.length} albums, and ${playlists.length} playlists!`);
}

runSeed();


# Spotify Web Player – Pixel-Perfect Clone

A high-fidelity, fully functional clone of the official [Spotify Web Player](https://open.spotify.com/) built with React, Vite, Tailwind CSS, Node.js, and Express.

---

## 🎧 Live Localhost URL

- **Frontend Client:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 🎨 Visual Design & Layout Accuracy

The application reproduces the official Spotify Web Player interface:
- **Theme & Colors:** Exact Spotify Dark Theme (`#000000`, `#121212`, `#181818`, `#242424`, `#282828`, and signature Spotify Green `#1ed760`).
- **Typography:** Custom font with geometric humanist proportions matching Spotify Circular.
- **Top Navigation Bar:**
  - Official Spotify logo with navigation back/forward history buttons.
  - Home circular pill button.
  - Spotify 2024 pill-shaped search input with search icon, clear button, and browse shortcut.
  - "Explore Premium" and "Install App" pill action buttons.
  - Notifications bell and user profile circular avatar with dropdown menu.
- **Left Sidebar ("Your Library"):**
  - Collapsible/expandable panel with rounded corners.
  - Header with "Your Library", "+" button (Create playlist), and collapse control.
  - Filter chips row: "Playlists", "Artists", "Albums" with interactive active states.
  - Inline search within library, sort dropdown ("Recents", "Recently Added", "Alphabetical", "Creator").
  - Liked Songs playlist card with iconic glowing purple gradient (`#450af5` to `#8e8ee5`) and green pin badge.
  - Custom playlists with right-click context menu (Edit details, Delete).
  - Followed artists (circular avatars) and saved albums.
- **Main Content Area:**
  - Ambient gradient hero header dynamically blending into `#121212`.
  - Greeting section ("Good morning", "Good afternoon", "Good evening").
  - 2x3 Quick Access cards with 64px square covers, bold titles, and floating play buttons.
  - Dynamic shelves: "Recently played", "Made For You", "Popular artists", "Popular albums", "Featured Playlists".
  - Media cards with Spotify green hover play button (smooth translateY animation and drop shadow).
- **Bottom Music Player:**
  - Fixed 80px black bar with seamless border.
  - Left: 56x56 Album cover thumbnail with expand arrow, song title (hover underline), artist name (hover underline), heart like button (animated pop with green fill).
  - Center: Shuffle (with green dot indicator), Previous, circular Play/Pause (hover scale), Next, Repeat (off / all / one with indicator), timeline with scrub bar (white filled, turns green on hover, draggable handle), timestamp indicators (`mm:ss`).
  - Right: Now Playing view toggle, Lyrics karaoke toggle, Queue toggle, Connect to device modal, Volume slider (scrubbable, green on hover, mute toggle), Fullscreen player toggle.
- **Dedicated Pages & Views:**
  - **Search & Browse:** 20+ genre cards with signature Spotify background colors and angled artwork; live search results with "Top result" hero card, songs table, artists, albums, playlists.
  - **Playlist View:** Dynamic color header, large album art with drop shadow, public playlist badge, creator info, total duration, green play button, and tracklist table.
  - **Album View:** Album details, release year, tracklist with track numbering.
  - **Artist Profile:** Verified artist checkmark badge, giant artist name, monthly listeners, follow button, popular top tracks, discography, and fans also like.
  - **Lyrics Mode:** Full karaoke-style synced lyrics view with active line scaling and animated blurred gradient background.
  - **Queue View:** Now playing track + upcoming tracks with removal and clear queue actions.
  - **Fullscreen Player Mode:** Immersive full-screen player with ambient lighting, huge artwork, and playback controls.

---

## ⚡ Functional Requirements Implemented

1. **Audio Playback:** Real, legally available official audio stream previews from Apple/iTunes and royalty-free sources.
2. **Player Controls:** Play, pause, seek through tracks, next track, previous track, volume control, mute/unmute.
3. **Shuffle & Repeat:** True shuffle and 3-state repeat (off, repeat-all, repeat-one).
4. **Likes System:** Like and unlike songs with persistent state and dedicated "Liked Songs" playlist.
5. **Custom Playlists:** Create playlists, edit playlist title/description, delete playlists, and add/remove songs.
6. **Live Search:** Instant search across tracks, artists, albums, and playlists with live fallback to iTunes Search API for any song in the world.
7. **Queue Management:** View queue, auto-advancement on song end, add to queue from any menu, remove from queue, clear queue.
8. **Responsive Layout:** Adaptive sidebar collapse, responsive cards grid, mobile/tablet friendly.

---

## 🛠️ Tech Stack

- **Frontend:**
  - React 19
  - Vite 8
  - Tailwind CSS v4 (`@tailwindcss/vite`)
  - React Router 7
  - Lucide React (Official icon set)
- **Backend:**
  - Node.js (v24+)
  - Express.js
  - CORS & Dotenv
- **Data & Storage:**
  - Persistent JSON database (`server/data/db.json`) with auto-seeding.
  - iTunes Search & Lookup API for dynamic music catalog integration.

---

## 📁 Project Folder Structure

```text
Spotify clone/
├── client/                     # Frontend React + Vite application
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── BottomPlayer.jsx # Fixed bottom playback bar
│   │   │   ├── Layout.jsx      # TopNav + Sidebar + Main + RightPanel wrapper
│   │   │   ├── MediaCard.jsx   # Spotify card with hover play button
│   │   │   ├── Modals.jsx      # Playlist creation, editing & Fullscreen player
│   │   │   ├── RightPanel.jsx  # Collapsible Now Playing view
│   │   │   ├── Sidebar.jsx     # "Your Library" collapsible sidebar
│   │   │   ├── TopNav.jsx      # Top navigation, search pill & profile dropdown
│   │   │   └── TrackRow.jsx    # Tracklist table row with actions & equalizer
│   │   ├── context/
│   │   │   └── PlayerContext.jsx # Global audio state, queue, playlists & likes
│   │   ├── pages/              # Application views
│   │   │   ├── AlbumView.jsx   # Album page
│   │   │   ├── ArtistView.jsx  # Artist profile page
│   │   │   ├── GenreView.jsx   # Browse category view
│   │   │   ├── Home.jsx        # Homepage with quick access & shelves
│   │   │   ├── LyricsView.jsx  # Karaoke-style synced lyrics view
│   │   │   ├── PlaylistView.jsx # Playlist & Liked Songs view
│   │   │   ├── QueueView.jsx   # Playback queue manager
│   │   │   └── Search.jsx      # Search input & browse all categories
│   │   ├── App.jsx             # React Router routing setup
│   │   ├── index.css           # Spotify design tokens, scrollbars & animations
│   │   └── main.jsx            # React root mount
│   ├── index.html              # Spotify metadata and Google Fonts
│   ├── package.json
│   └── vite.config.js          # Vite config with Tailwind & API proxy
├── server/                     # Backend Express server
│   ├── data/
│   │   └── db.json             # Persistent JSON database (tracks, artists, playlists)
│   ├── index.js                # Express API routes & iTunes live fallback
│   ├── package.json
│   └── seed.js                 # Seed script for curated top hits & artists
├── package.json                # Root package configuration
├── start.js                    # Concurrent process runner for client & server
└── README.md                   # Full documentation
```

---

## 🚀 Installation & Running Instructions

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

### 2. Install Dependencies
Run the following from the root directory:
```bash
# Install root, client, and server dependencies
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 3. Seed Database (Optional - already pre-seeded)
```bash
npm run seed
```

### 4. Run Both Frontend and Backend Simultaneously
```bash
npm start
```
Or run each individually in separate terminals:
```bash
# Terminal 1: Backend Server (Port 5000)
npm run server

# Terminal 2: Frontend Client (Port 3000)
npm run client
```

### 5. Open in Browser
Visit **[http://localhost:3000](http://localhost:3000)** in your browser.


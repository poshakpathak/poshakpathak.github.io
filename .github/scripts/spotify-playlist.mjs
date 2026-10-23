// Saves the songs in Poshak's Spotify playlist to playlist.json, so the site's
// player bar can show the song the Spotify embed is playing. Reads the public
// embed page, so no Spotify account or API key is needed.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const id = process.argv[2];
const out = 'playlist.json';
const res = await fetch(`https://open.spotify.com/embed/playlist/${id}`, {
  headers: { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36', 'accept-language': 'en-US,en' },
});
if (!res.ok) throw new Error(`Spotify returned ${res.status}`);
const html = await res.text();
const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) throw new Error('No __NEXT_DATA__ on the embed page');

const findTrackList = o => {
  if (!o || typeof o !== 'object') return null;
  if (Array.isArray(o.trackList)) return o.trackList;
  for (const v of Object.values(o)) { const r = findTrackList(v); if (r) return r; }
  return null;
};
const list = findTrackList(JSON.parse(m[1]));
if (!list || !list.length) throw new Error('No tracks found');

const tracks = list
  .filter(t => t.uri && t.title)
  .map(t => ({ uri: t.uri, title: t.title, artist: t.subtitle || '', ms: t.duration || 0 }));

const old = existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : null;
if (old && JSON.stringify(old.tracks) === JSON.stringify(tracks)) {
  console.log(`No change (${tracks.length} songs)`);
} else {
  writeFileSync(out, JSON.stringify({ id, tracks }, null, 1) + '\n');
  console.log(`Saved ${tracks.length} songs`);
}

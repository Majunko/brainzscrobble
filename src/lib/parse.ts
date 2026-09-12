export interface ParsedSong {
  artist: string;
  track: string;
  album?: string;
}

export interface ParsedList {
  items: ParsedSong[];
  invalid: number;
}

const DASH_RE = / - ?| ?- | ?[－–—] ?/;
const LASTFM_URL_RE =
  /last\.fm(?:\/[a-zA-Z]{2})?\/music\/([^/]+)\/([^/]+?)\/([^/]+)/;

function decodeComponent(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value.replace(/\+/g, ' ');
  }
}

function parseLastfmUrl(text: string): ParsedSong | null {
  const m = text.match(LASTFM_URL_RE);
  if (!m) return null;
  const album = decodeComponent(m[2]);
  return {
    artist: decodeComponent(m[1]),
    track: decodeComponent(m[3]),
    ...(album && album !== '_' ? { album } : {}),
  };
}

function parseDash(text: string): ParsedSong | null {
  if (text.length > 3 && DASH_RE.test(text)) {
    const parts = text.split(DASH_RE, 2);
    if (parts[0] && parts[1]) {
      return { artist: parts[0], track: parts[1] };
    }
  }
  return null;
}

export function parsePasted(text: string, reversed = false): ParsedSong | null {
  const input = text.trim();
  if (!input) return null;
  const fromUrl = parseLastfmUrl(input);
  if (fromUrl) return fromUrl;
  const fromDash = parseDash(input);
  if (!fromDash) return null;
  if (reversed) return { artist: fromDash.track, track: fromDash.artist };
  return fromDash;
}

export function parseList(text: string): ParsedList {
  const items: ParsedSong[] = [];
  let invalid = 0;
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const song = parsePasted(line);
    if (song) {
      items.push(song);
    } else {
      invalid++;
    }
  }
  return { items, invalid };
}
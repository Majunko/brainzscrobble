export const LB_API = 'https://api.listenbrainz.org';
export const MAX_LISTENS_PER_REQUEST = 100;

export interface TrackMetadata {
  artist_name: string;
  track_name: string;
  release_name?: string;
  additional_info?: Record<string, string | number | boolean | string[]>;
}

export interface Listen {
  listened_at?: number;
  track_metadata: TrackMetadata;
}

export type ListenType = 'single' | 'import' | 'playing_now';

export interface SubmitResponse {
  status: string;
  message?: string;
  [key: string]: unknown;
}

export interface TokenValidation {
  valid: boolean;
  message: string;
  user_name?: string;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Token ${token}`,
    'Content-Type': 'application/json',
  };
}

export async function submitListens(
  token: string,
  listenType: ListenType,
  listens: Listen[],
): Promise<SubmitResponse> {
  const res = await fetch(`${LB_API}/1/submit-listens`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ listen_type: listenType, payload: listens }),
  });
  if (!res.ok) throw new Error(await extractError(res));
  return (await res.json()) as SubmitResponse;
}

export async function submitImport(
  token: string,
  listens: Listen[],
): Promise<void> {
  for (let i = 0; i < listens.length; i += MAX_LISTENS_PER_REQUEST) {
    const chunk = listens.slice(i, i + MAX_LISTENS_PER_REQUEST);
    await submitListens(token, 'import', chunk);
  }
}

export async function validateToken(token: string): Promise<TokenValidation> {
  const res = await fetch(`${LB_API}/1/validate-token`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await extractError(res));
  const data = (await res.json()) as {
    valid?: boolean;
    message?: string;
    user_name?: string;
  };
  return {
    valid: data.valid === true,
    message: data.message ?? 'No response from server.',
    user_name: data.user_name,
  };
}

async function extractError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as Record<string, unknown>;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.message === 'string') return data.message;
    return JSON.stringify(data);
  } catch {
    return `HTTP ${res.status} ${res.statusText}`;
  }
}
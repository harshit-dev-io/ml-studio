import { auth } from '../js/firebase-config';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Global API Fetch Core
 * Automates request building and securely embeds current Firebase JWT tokens.
 */
export async function apiRequest(endpoint, options = {}) {
  // 1. Resolve secure authentication handshake token strings from active state
  let token = null;
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }

  // 2. Synthesize request header attributes securely
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  // 3. Dispatch data pipeline operation
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Network request error: ${response.status}`);
  }

  return response.json();
}

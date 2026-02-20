const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001/api';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

/**
 * Lightweight wrapper around fetch that centralises base URL,
 * default headers, and auth-token injection.
 *
 * @param {string}  endpoint       - Path appended to the API base (e.g. "/items")
 * @param {Object}  [options]      - Fetch options + extras
 * @param {string}  [options.method]       - HTTP method (defaults to GET)
 * @param {Object}  [options.headers]      - Merged on top of the defaults
 * @param {Object}  [options.params]       - Query-string key/values
 * @param {*}       [options.body]         - Will be JSON-stringified automatically
 * @param {boolean} [options.secure]       - If true, attaches the stored auth token
 * @param {AbortSignal} [options.signal]   - AbortController signal for cancellation
 */
export async function apiHelper(endpoint, options = {}) {
  const {
    method = 'GET',
    headers = {},
    params,
    body,
    secure = false,
    signal,
  } = options;

  const mergedHeaders = { ...DEFAULT_HEADERS, ...headers };

  if (secure) {
    const token = localStorage.getItem('authToken');
    if (token) {
      mergedHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let url = `${API_BASE}${endpoint}`;

  if (params) {
    const qs = new URLSearchParams(params).toString();
    url = `${url}?${qs}`;
  }

  const fetchOptions = {
    method,
    headers: mergedHeaders,
    signal,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message = errorBody?.error?.message || `Server error: ${res.status}`;
    throw new Error(message);
  }

  return res.json();
}

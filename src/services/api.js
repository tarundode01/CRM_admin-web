// Dynamic API URL resolution with Environment Variable support for Production (Vercel)
const ENV_API_URL = import.meta.env.VITE_API_URL;

const API_URLS = [
  ...(ENV_API_URL ? [ENV_API_URL] : []),
  ...(typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? ['http://localhost:5000/api/admin', 'https://reposetry5-rkf6.vercel.app/api/admin']
      : ['https://reposetry5-rkf6.vercel.app/api/admin', 'http://localhost:5000/api/admin'])
];

let activeUrlCache = API_URLS[0];

export const isAbortError = (err) => {
  if (!err) return false;
  return (
    err.name === 'AbortError' ||
    err.code === 20 ||
    (typeof err.message === 'string' && (
      err.message.includes('signal is aborted') ||
      err.message.includes('The user aborted a request') ||
      err.message.includes('user aborted')
    ))
  );
};

export const requestApi = async (endpoint, options = {}, token = null) => {
  const targetUrls = activeUrlCache
    ? [activeUrlCache, ...API_URLS.filter(u => u !== activeUrlCache)]
    : API_URLS;

  let lastError = null;

  for (const baseUrl of targetUrls) {
    let timeoutId = null;
    try {
      const controller = new AbortController();
      // Fast 5-second timeout instead of waiting 15 seconds
      timeoutId = setTimeout(() => {
        try {
          controller.abort('Request timeout after 5s');
        } catch (_) {
          controller.abort();
        }
      }, 5000);

      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      };

      // Support external cancellation signal while keeping internal timeout
      let signal = controller.signal;
      if (options.signal) {
        if (options.signal.aborted) {
          clearTimeout(timeoutId);
          return { success: false, aborted: true };
        }
        options.signal.addEventListener('abort', () => {
          try {
            controller.abort(options.signal.reason || 'User cancelled');
          } catch (_) {
            controller.abort();
          }
        });
      }

      const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
        signal
      });

      clearTimeout(timeoutId);

      if (!res.ok && res.status >= 500) {
        throw new Error(`Server returned ${res.status}`);
      }

      // If endpoint returns a 4xx client error (e.g. 401, 403, 404), return json gracefully
      if (res.status >= 400 && res.status < 500) {
        const errJson = await res.json().catch(() => ({}));
        return { success: false, status: res.status, ...errJson };
      }

      const data = await res.json();
      activeUrlCache = baseUrl;
      return data;
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);
      
      // If the caller cancelled intentionally, stop immediately without error popup
      if (isAbortError(err)) {
        return { success: false, aborted: true };
      }

      lastError = err;
      if (activeUrlCache === baseUrl) {
        activeUrlCache = null;
      }
    }
  }

  // If all URLs failed and lastError is an intentional abort, handle gracefully
  if (isAbortError(lastError)) {
    return { success: false, aborted: true };
  }

  throw lastError || new Error('Network request failed');
};

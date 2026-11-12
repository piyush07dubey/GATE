const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    if (err.name === 'TypeError' || err.message?.includes('fetch')) {
      throw new Error(`Unable to reach backend server at ${API_BASE}. Please ensure the backend is running on port 8001.`);
    }
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let error = new Error(`HTTP ${res.status}`);
    error.status = res.status;
    error.body = text;
    try {
      const parsed = JSON.parse(text);
      if (parsed.detail) {
        error.message = parsed.detail;
      }
    } catch (_) {}
    throw error;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: (path, formData) => {
    const token = localStorage.getItem('access_token');
    return request(path, {
      method: 'POST',
      body: new URLSearchParams(formData).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  },
};

export { API_BASE };

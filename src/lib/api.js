const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8001';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let error = new Error(`HTTP ${res.status}`);
    error.status = res.status;
    error.body = text;
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
  postForm: (path, formData) => request(path, { method: 'POST', body: new URLSearchParams(formData).toString(), headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }),
};

export { API_BASE };

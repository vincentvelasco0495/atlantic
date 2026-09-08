import { useAuthStore } from '../store/authStore';

const apiBase = import.meta.env.VITE_API_URL || '';

export function apiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${normalizedPath}`;
}

function authHeaders() {
  const token = useAuthStore.getState().token;
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed.');
    error.status = response.status;
    error.errors = data.errors || null;
    throw error;
  }

  return data;
}

export async function login(payload) {
  const response = await fetch(apiUrl('/api/login'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function logout() {
  const token = useAuthStore.getState().token;

  if (!token) {
    return null;
  }

  const response = await fetch(apiUrl('/api/logout'), {
    method: 'POST',
    headers: authHeaders(),
  });

  return parseResponse(response);
}

export async function registerCustomer(payload) {
  const response = await fetch(apiUrl('/api/register/customer'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function fetchCurrentUser() {
  const response = await fetch(apiUrl('/api/me'), {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseResponse(response);
}

export async function apiGet(path) {
  const response = await fetch(apiUrl(path), {
    method: 'GET',
    headers: authHeaders(),
  });

  return parseResponse(response);
}

export async function apiPost(path, payload) {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function apiPut(path, payload) {
  const response = await fetch(apiUrl(path), {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function apiDelete(path) {
  const response = await fetch(apiUrl(path), {
    method: 'DELETE',
    headers: authHeaders(),
  });

  return parseResponse(response);
}

function authHeadersForUpload() {
  const token = useAuthStore.getState().token;
  const headers = {
    Accept: 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function apiUpload(path, formData) {
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: authHeadersForUpload(),
    body: formData,
  });

  return parseResponse(response);
}

export async function apiDownload(path, filename) {
  const token = useAuthStore.getState().token;
  const headers = {
    Accept: '*/*',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl(path), {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let message = 'Download failed.';

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

/* ===================================================
   API Helper
   =================================================== */

const API_BASE = '/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Get auth headers from localStorage
 */
export function getAuthHeaders() {
  const token = localStorage.getItem('galeriyudi_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ── Public endpoints ── */

export async function fetchProducts() {
  return apiFetch('/products');
}

export async function fetchProduct(id) {
  return apiFetch(`/products/${id}`);
}

/* ── Auth endpoints ── */

export async function loginAPI(username, password) {
  return apiFetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export async function verifyToken() {
  return apiFetch('/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
  });
}

/* ── Admin endpoints (protected) ── */

export async function createProduct(formData) {
  return apiFetch('/products', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function updateProduct(id, formData) {
  return apiFetch(`/products/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function deleteProduct(id) {
  return apiFetch(`/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
}

export async function updateStock(id, delta) {
  return apiFetch(`/products/${id}/stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ delta }),
  });
}

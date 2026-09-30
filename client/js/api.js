/**
 * ============================================================================
 * API HELPER & AUTH UTILITY
 * Textile POS Billing System
 * Handles: Base URL resolution, JWT Authorization header injection,
 *          token expiration redirection, and role validation.
 * ============================================================================
 */

// Use relative API path so it works across all hosts and ports automatically
const BASE_URL = '/api';

/**
 * Standard API request wrapper with JWT Token injection
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('pos_token');
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    if (res.status === 401) {
      alert('Session expired or unauthorized. Please sign in again.');
      localStorage.clear();
      window.location.href = '/login/';
      return null;
    }
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || result.detail || JSON.stringify(result));
    }
    return result;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

/**
 * Multipart file upload wrapper with JWT Token
 */
async function apiUpload(endpoint, file) {
  const token = localStorage.getItem('pos_token');
  const formData = new FormData();
  formData.append('image', file);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (res.status === 401) {
      alert('Session expired or unauthorized. Please sign in again.');
      localStorage.clear();
      window.location.href = '/login/';
      return null;
    }

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error || result.detail || JSON.stringify(result));
    }
    return result;
  } catch (err) {
    console.error(`Upload error on ${endpoint}:`, err);
    throw err;
  }
}

/**
 * Check if user is authenticated and has the required role
 * @param {string|null} requiredRole - 'ADMIN' or null
 */
function checkAuth(requiredRole = null) {
  const userStr = localStorage.getItem('pos_user');
  if (!userStr) {
    window.location.href = '/login/';
    return null;
  }
  const user = JSON.parse(userStr);
  if (requiredRole && user.role !== requiredRole && !user.is_superuser) {
    alert('Access Denied: You do not have permission to view this portal.');
    window.location.href = '/billing/';
    return null;
  }
  return user;
}

/**
 * Clear local session and log out
 */
function logout() {
  localStorage.clear();
  window.location.href = '/login/';
}

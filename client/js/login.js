/**
 * ============================================================================
 * LOGIN SCRIPT
 * Textile POS Billing Management System
 * Handles: Authentication form submission and role-based redirect.
 * ============================================================================
 */

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorBox = document.getElementById('error-box');

  errorBox.style.display = 'none';

  try {
    const data = await apiRequest('/auth/login/', 'POST', { username, password });
    localStorage.setItem('pos_token', data.access);
    localStorage.setItem('pos_refresh', data.refresh);
    localStorage.setItem('pos_user', JSON.stringify(data.user));

    // Role-based clean redirect
    if (data.user.role === 'ADMIN') {
      window.location.href = '/admin-portal/';
    } else {
      window.location.href = '/billing/';
    }
  } catch (err) {
    errorBox.textContent = 'Invalid credentials. Please try again.';
    errorBox.style.display = 'block';
  }
});

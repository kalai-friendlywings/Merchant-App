// utils/auth.js
export const cleanupAuth = () => {
  const token = localStorage.getItem('access_token');
  if (!token || token === 'undefined' || token === 'null') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('is_onboarded');
    sessionStorage.clear(); // Optional: if you use sessionStorage too
  }
};

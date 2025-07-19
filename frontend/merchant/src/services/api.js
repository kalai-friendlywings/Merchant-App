import axios from 'axios';
import {jwtDecode} from 'jwt-decode';  // default import

const api = axios.create({
  baseURL: 'http://localhost:8000/api/merchant',
});

// Check if access token is expired
const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true; // Treat invalid token as expired
  }
};

// Request interceptor to attach token or refresh it
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('access_token');

    if (token && isTokenExpired(token)) {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('Refresh token missing');

        const { data } = await axios.post(
          'http://localhost:8000/api/merchant/token/refresh/',
          { refresh: refreshToken }
        );

        token = data.access;
        localStorage.setItem('access_token', token);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

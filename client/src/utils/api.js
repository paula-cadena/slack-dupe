import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api'
});

// Request interceptor to attach the JWT token from localStorage
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Clear authentication storage (token and any related state)
export function clearAuthStorage() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('belay_auth_state');
}

export default api;

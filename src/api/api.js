import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem('adminToken');
  const authToken = localStorage.getItem('authToken');
  const useAdminToken = config.url?.startsWith('/admin');
  const token = useAdminToken ? adminToken || authToken : authToken || adminToken;

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

const logoutOnUnauthorized = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  }
  return Promise.reject(error);
};

api.interceptors.response.use((response) => response, logoutOnUnauthorized);

export default api;

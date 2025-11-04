import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Auth APIs
export const authAPI = {
  signup: (data: { name: string; email: string; password: string }) =>
    apiClient.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
};

// Event APIs
export const eventAPI = {
  getAll: () => apiClient.get('/events'),
  getById: (id: string) => apiClient.get(`/events/${id}`),
  create: (data: any) => apiClient.post('/events', data),
  update: (id: string, data: any) => apiClient.put(`/events/${id}`, data),
  delete: (id: string) => apiClient.delete(`/events/${id}`),
};

// Swap APIs
export const swapAPI = {
  getSwappableSlots: () => apiClient.get('/swappable-slots'),
  getSwapRequests: (type?: 'incoming' | 'outgoing') =>
    apiClient.get('/swap-requests', { params: { type } }),
  createSwapRequest: (data: { mySlotId: string; theirSlotId: string }) =>
    apiClient.post('/swap-request', data),
  respondToSwap: (requestId: string, accepted: boolean) =>
    apiClient.post(`/swap-response/${requestId}`, { accepted }),
};

// AI APIs
export const aiAPI = {
  getSwapSuggestions: () => apiClient.post('/ai/swap-suggestions'),
  getScheduleAnalysis: () => apiClient.get('/ai/schedule-analysis'),
  chat: (message: string) => apiClient.post('/ai/chat', { message }),
};

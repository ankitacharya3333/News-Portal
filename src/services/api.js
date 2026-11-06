import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const newsService = {
  getArticles: (params) => api.get('/articles', { params }),
  getArticleBySlug: (slug) => api.get(`/articles/${slug}`),
  getBreakingNews: () => api.get('/articles/breaking'),
  getCategories: () => api.get('/categories'),
  getJournalists: () => api.get('/journalists'),
  postComment: (slug, data) => api.post(`/articles/${slug}/comments`, data),
  subscribeNewsletter: (email) => api.post('/newsletter/subscribe', { email })
};

export const formService = {
  submitInquiry: (data) => api.post('/inquiries', data),
  bookAppointment: (data) => api.post('/appointments', data)
};

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data)
};

export const adminService = {
  getOverview: () => api.get('/admin/overview'),
  createArticle: (data) => api.post('/admin/articles', data),
  updateArticle: (id, data) => api.put(`/admin/articles/${id}`, data),
  deleteArticle: (id) => api.delete(`/admin/articles/${id}`),
  getAppointments: () => api.get('/admin/appointments'),
  updateAppointment: (id, data) => api.patch(`/admin/appointments/${id}`, data),
  getInquiries: () => api.get('/admin/inquiries'),
  updateInquiry: (id, data) => api.patch(`/admin/inquiries/${id}`, data),
  triggerNewsSync: () => api.post('/admin/news-sync')
};

export default api;


import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put('/user/profile', data);
    return response.data;
  },
  
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/user/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getAppointments: async () => {
    const response = await api.get('/user/appointments');
    return response.data;
  },
};

// Doctors API
export const doctorsAPI = {
  getAll: async (speciality) => {
    const params = speciality && speciality !== 'all' ? { speciality } : {};
    const response = await api.get('/doctors', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },
  
  getBySpeciality: async (speciality) => {
    const response = await api.get(`/doctors/speciality/${speciality}`);
    return response.data;
  },
  
  getAvailableSlots: async (doctorId, date) => {
    const response = await api.get(`/doctors/${doctorId}/slots`, {
      params: { date },
    });
    return response.data;
  },
};

// Appointments API
export const appointmentsAPI = {
  book: async (data) => {
    const response = await api.post('/appointments/book', data);
    return response.data;
  },
  
  getUserAppointments: async () => {
    const response = await api.get('/appointments/user');
    return response.data;
  },
  
  cancel: async (id, reason) => {
    const response = await api.put(`/appointments/${id}/cancel`, { reason });
    return response.data;
  },
};

// Payment API
export const paymentAPI = {
  createIntent: async (appointmentId) => {
    const response = await api.post('/payment/create-intent', { appointmentId });
    return response.data;
  },
  
  verifyPayment: async (paymentIntentId) => {
    const response = await api.post('/payment/verify', { paymentIntentId });
    return response.data;
  },
};

export default api;

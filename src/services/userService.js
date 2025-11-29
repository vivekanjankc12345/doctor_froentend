import api from './api';

export const userService = {
  // Create a new user
  createUser: async (userData) => {
    const response = await api.post('/users/create', userData);
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update current user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Get all users (if endpoint exists)
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user by ID
  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user by ID
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // Get doctors list (available to RECEPTIONIST, HOSPITAL_ADMIN, SUPER_ADMIN)
  getDoctors: async () => {
    const response = await api.get('/users/doctors');
    return response.data;
  },

  // Get nurses list (available to DOCTOR, HOSPITAL_ADMIN, SUPER_ADMIN)
  getNurses: async () => {
    const response = await api.get('/users/nurses');
    return response.data;
  },

  // Get dashboard statistics (available to HOSPITAL_ADMIN)
  getDashboardStats: async () => {
    const response = await api.get('/users/dashboard/stats');
    return response.data;
  },
};


import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password }, {
      withCredentials: true, // Ensure cookies are sent
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('hospitalId');
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};


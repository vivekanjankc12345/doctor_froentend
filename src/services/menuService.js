import api from './api';

export const menuService = {
  // Get dynamic menu based on user roles and permissions
  getMenu: async () => {
    const response = await api.get('/menu');
    return response.data;
  },
};


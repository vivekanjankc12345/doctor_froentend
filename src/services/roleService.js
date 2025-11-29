import api from './api';

export const roleService = {
  // Get all roles
  getAllRoles: async (params = {}) => {
    const response = await api.get('/role', { params });
    return response.data;
  },

  // Get role by ID
  getRoleById: async (id) => {
    const response = await api.get(`/role/${id}`);
    return response.data;
  },
};


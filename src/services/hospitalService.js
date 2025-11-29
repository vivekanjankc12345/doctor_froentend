import api from './api';

export const hospitalService = {
  // Get all hospitals (for Super Admin)
  getAllHospitals: async (params = {}) => {
    const response = await api.get('/admin/hospitals', { params });
    return response.data;
  },

  // Get hospital by ID
  getHospitalById: async (id) => {
    const response = await api.get(`/admin/hospitals/${id}`);
    return response.data;
  },

  // Update hospital status
  updateHospitalStatus: async (id, status) => {
    const response = await api.put(`/admin/hospital/status/${id}`, { status });
    return response.data;
  },

  // Register new hospital (public endpoint)
  registerHospital: async (hospitalData) => {
    const response = await api.post('/hospital/register', hospitalData);
    return response.data;
  },
};


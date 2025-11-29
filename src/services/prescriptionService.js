import api from './api';

export const prescriptionService = {
  // Create new prescription
  createPrescription: async (prescriptionData) => {
    const response = await api.post('/prescriptions/create', prescriptionData);
    return response.data;
  },

  // Get all prescriptions with filters
  getPrescriptions: async (params = {}) => {
    const response = await api.get('/prescriptions/list', { params });
    return response.data;
  },

  // Get prescription by ID
  getPrescriptionById: async (id) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response.data;
  },

  // Get prescription templates
  getTemplates: async () => {
    const response = await api.get('/prescriptions/templates');
    return response.data;
  },
};


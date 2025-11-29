import api from './api';

export const patientService = {
  // Create new patient
  createPatient: async (patientData) => {
    const response = await api.post('/patients/create', patientData);
    return response.data;
  },

  // Search patients with filters
  searchPatients: async (params = {}) => {
    const response = await api.get('/patients/search', { params });
    return response.data;
  },

  // Get patient by ID
  getPatientById: async (id) => {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  // Export patients to CSV
  exportPatients: async (params = {}) => {
    const response = await api.get('/patients/export', { 
      params,
      responseType: 'blob' // For file download
    });
    return response.data;
  },

  // Update patient by ID
  updatePatient: async (id, patientData) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response.data;
  },
};


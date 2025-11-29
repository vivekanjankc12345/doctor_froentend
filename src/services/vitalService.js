import api from './api';

export const vitalService = {
  // Record vitals for a patient
  recordVitals: async (vitalData) => {
    const response = await api.post('/vitals/record', vitalData);
    return response.data;
  },

  // Get all vitals for a patient
  getPatientVitals: async (patientId, params = {}) => {
    const response = await api.get(`/vitals/patient/${patientId}`, { params });
    return response.data;
  },

  // Get latest vitals for a patient
  getLatestVitals: async (patientId) => {
    const response = await api.get(`/vitals/patient/${patientId}/latest`);
    return response.data;
  },

  // Get vital by ID
  getVitalById: async (id) => {
    const response = await api.get(`/vitals/${id}`);
    return response.data;
  },

  // Update vital record
  updateVitals: async (id, vitalData) => {
    const response = await api.put(`/vitals/${id}`, vitalData);
    return response.data;
  },
};


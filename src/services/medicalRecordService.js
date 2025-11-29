import api from './api';

export const medicalRecordService = {
  // Create new medical record
  createMedicalRecord: async (recordData) => {
    const response = await api.post('/medical-records/create', recordData);
    return response.data;
  },

  // Get all medical records for a patient
  getPatientMedicalRecords: async (patientId, params = {}) => {
    const response = await api.get(`/medical-records/patient/${patientId}`, { params });
    return response.data;
  },

  // Get latest medical record for a patient
  getLatestMedicalRecord: async (patientId) => {
    const response = await api.get(`/medical-records/patient/${patientId}/latest`);
    return response.data;
  },

  // Get medical record by ID
  getMedicalRecordById: async (id) => {
    const response = await api.get(`/medical-records/${id}`);
    return response.data;
  },

  // Update medical record
  updateMedicalRecord: async (id, recordData) => {
    const response = await api.put(`/medical-records/${id}`, recordData);
    return response.data;
  },
};


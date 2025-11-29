import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
  Save,
  Assignment,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { patientService } from '../../services/patientService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { vitalService } from '../../services/vitalService';
import { userService } from '../../services/userService';
import useApi from '../../hooks/useApi';

const AddMedicalRecord = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { apiCall, loading } = useApi();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patient, setPatient] = useState(null);
  const [nurses, setNurses] = useState([]);
  const [assignNurseDialogOpen, setAssignNurseDialogOpen] = useState(false);
  const [selectedNurse, setSelectedNurse] = useState('');

  // Medical Record Form State
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    diagnosis: [{ code: '', description: '', type: 'PRIMARY' }],
    treatment: {
      plan: '',
      procedures: [],
      followUp: { required: false, date: '', notes: '' }
    },
    history: {
      presentIllness: '',
      pastMedicalHistory: '',
      familyHistory: '',
      socialHistory: '',
      allergies: []
    },
    clinicalNotes: '',
    physicalExamination: {
      general: '',
      cardiovascular: '',
      respiratory: '',
      abdominal: '',
      neurological: '',
      other: ''
    },
    investigations: [],
    notes: ''
  });

  // Vitals Form State
  const [vitalsData, setVitalsData] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    pulse: '',
    temperature: '',
    temperatureUnit: 'F',
    respiratoryRate: '',
    oxygenSaturation: '',
    bloodSugar: { fasting: '', random: '', postPrandial: '' },
    hba1c: '',
    weight: '',
    height: '',
    testResults: [],
    notes: ''
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails();
      fetchNurses();
    }
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      const response = await apiCall(patientService.getPatientById, patientId);
      if (response.status === 1) {
        setPatient(response.patient);
        setSelectedNurse(response.patient.assignedNurse?._id || response.patient.assignedNurse || '');
      }
    } catch (err) {
      setError('Failed to fetch patient details');
    }
  };

  const fetchNurses = async () => {
    try {
      const response = await apiCall(userService.getNurses);
      if (response.status === 1) {
        setNurses(response.nurses || []);
      }
    } catch (err) {
      console.error('Failed to fetch nurses:', err);
      setError('Failed to fetch nurses. Please try again.');
    }
  };

  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleDiagnosisChange = (index, field, value) => {
    const newDiagnosis = [...formData.diagnosis];
    newDiagnosis[index] = { ...newDiagnosis[index], [field]: value };
    setFormData(prev => ({ ...prev, diagnosis: newDiagnosis }));
  };

  const addDiagnosis = () => {
    setFormData(prev => ({
      ...prev,
      diagnosis: [...prev.diagnosis, { code: '', description: '', type: 'PRIMARY' }]
    }));
  };

  const removeDiagnosis = (index) => {
    setFormData(prev => ({
      ...prev,
      diagnosis: prev.diagnosis.filter((_, i) => i !== index)
    }));
  };

  const handleVitalsChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setVitalsData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setVitalsData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAssignNurse = async () => {
    try {
      setError('');
      const response = await apiCall(patientService.updatePatient, patientId, {
        assignedNurse: selectedNurse || undefined
      });
      if (response.status === 1) {
        setSuccess('Nurse assigned successfully');
        setAssignNurseDialogOpen(false);
        fetchPatientDetails();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to assign nurse');
    }
  };

  const handleSaveMedicalRecord = async () => {
    try {
      setError('');
      setSuccess('');

      const recordData = {
        patient: patientId,
        ...formData,
        diagnosis: formData.diagnosis.filter(d => d.description.trim() !== '')
      };

      const response = await apiCall(medicalRecordService.createMedicalRecord, recordData);
      if (response.status === 1) {
        setSuccess('Medical record saved successfully!');
        setTimeout(() => {
          navigate(`/doctor/patients/${patientId}`);
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save medical record';
      setError(errorMessage);
    }
  };

  const handleSaveVitals = async () => {
    try {
      setError('');
      setSuccess('');

      // Prepare vitals data
      const vitalData = {
        patient: patientId,
        bloodPressure: vitalsData.bloodPressure.systolic && vitalsData.bloodPressure.diastolic
          ? {
              systolic: parseFloat(vitalsData.bloodPressure.systolic),
              diastolic: parseFloat(vitalsData.bloodPressure.diastolic)
            }
          : undefined,
        pulse: vitalsData.pulse ? parseFloat(vitalsData.pulse) : undefined,
        temperature: vitalsData.temperature ? parseFloat(vitalsData.temperature) : undefined,
        temperatureUnit: vitalsData.temperatureUnit,
        respiratoryRate: vitalsData.respiratoryRate ? parseFloat(vitalsData.respiratoryRate) : undefined,
        oxygenSaturation: vitalsData.oxygenSaturation ? parseFloat(vitalsData.oxygenSaturation) : undefined,
        bloodSugar: (vitalsData.bloodSugar.fasting || vitalsData.bloodSugar.random || vitalsData.bloodSugar.postPrandial)
          ? {
              fasting: vitalsData.bloodSugar.fasting ? parseFloat(vitalsData.bloodSugar.fasting) : undefined,
              random: vitalsData.bloodSugar.random ? parseFloat(vitalsData.bloodSugar.random) : undefined,
              postPrandial: vitalsData.bloodSugar.postPrandial ? parseFloat(vitalsData.bloodSugar.postPrandial) : undefined
            }
          : undefined,
        hba1c: vitalsData.hba1c ? parseFloat(vitalsData.hba1c) : undefined,
        weight: vitalsData.weight ? parseFloat(vitalsData.weight) : undefined,
        height: vitalsData.height ? parseFloat(vitalsData.height) : undefined,
        notes: vitalsData.notes || undefined
      };

      const response = await apiCall(vitalService.recordVitals, vitalData);
      if (response.status === 1) {
        setSuccess('Vitals recorded successfully!');
        setTimeout(() => {
          navigate(`/doctor/patients/${patientId}`);
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to record vitals';
      setError(errorMessage);
    }
  };

  if (loading && !patient) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4} display="flex" alignItems="center" gap={2}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(`/doctor/patients/${patientId}`)}>
            Back
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Add Medical Record & Vitals
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {patient && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {patient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Patient ID: {patient.patientId}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  onClick={() => setAssignNurseDialogOpen(true)}
                >
                  {patient.assignedNurse
                    ? `Assigned: ${patient.assignedNurse.firstName || ''} ${patient.assignedNurse.lastName || ''}`
                    : 'Assign Nurse'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Medical Record Form */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Medical Record
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Chief Complaint"
                  multiline
                  rows={2}
                  value={formData.chiefComplaint}
                  onChange={(e) => handleFormChange('chiefComplaint', e.target.value)}
                />
              </Grid>

              {/* Diagnosis */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Diagnosis
                  </Typography>
                  <Button size="small" startIcon={<Add />} onClick={addDiagnosis}>
                    Add Diagnosis
                  </Button>
                </Box>
                {formData.diagnosis.map((diag, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          label="ICD Code (Optional)"
                          value={diag.code}
                          onChange={(e) => handleDiagnosisChange(index, 'code', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Diagnosis Description"
                          required
                          value={diag.description}
                          onChange={(e) => handleDiagnosisChange(index, 'description', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <FormControl fullWidth>
                          <InputLabel>Type</InputLabel>
                          <Select
                            value={diag.type}
                            onChange={(e) => handleDiagnosisChange(index, 'type', e.target.value)}
                          >
                            <MenuItem value="PRIMARY">Primary</MenuItem>
                            <MenuItem value="SECONDARY">Secondary</MenuItem>
                            <MenuItem value="DIFFERENTIAL">Differential</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      {formData.diagnosis.length > 1 && (
                        <Grid item xs={12} sm={12} display="flex" justifyContent="flex-end">
                          <IconButton
                            color="error"
                            onClick={() => removeDiagnosis(index)}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                ))}
              </Grid>

              {/* Treatment Plan */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Treatment Plan"
                  multiline
                  rows={4}
                  value={formData.treatment.plan}
                  onChange={(e) => handleFormChange('treatment.plan', e.target.value)}
                />
              </Grid>

              {/* History */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="History of Present Illness (HPI)"
                  multiline
                  rows={3}
                  value={formData.history.presentIllness}
                  onChange={(e) => handleFormChange('history.presentIllness', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Past Medical History (PMH)"
                  multiline
                  rows={3}
                  value={formData.history.pastMedicalHistory}
                  onChange={(e) => handleFormChange('history.pastMedicalHistory', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Family History"
                  multiline
                  rows={2}
                  value={formData.history.familyHistory}
                  onChange={(e) => handleFormChange('history.familyHistory', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Social History"
                  multiline
                  rows={2}
                  value={formData.history.socialHistory}
                  onChange={(e) => handleFormChange('history.socialHistory', e.target.value)}
                />
              </Grid>

              {/* Physical Examination */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Physical Examination
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="General"
                  multiline
                  rows={2}
                  value={formData.physicalExamination.general}
                  onChange={(e) => handleFormChange('physicalExamination.general', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cardiovascular"
                  multiline
                  rows={2}
                  value={formData.physicalExamination.cardiovascular}
                  onChange={(e) => handleFormChange('physicalExamination.cardiovascular', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Respiratory"
                  multiline
                  rows={2}
                  value={formData.physicalExamination.respiratory}
                  onChange={(e) => handleFormChange('physicalExamination.respiratory', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Abdominal"
                  multiline
                  rows={2}
                  value={formData.physicalExamination.abdominal}
                  onChange={(e) => handleFormChange('physicalExamination.abdominal', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Clinical Notes"
                  multiline
                  rows={4}
                  value={formData.clinicalNotes}
                  onChange={(e) => handleFormChange('clinicalNotes', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                />
              </Grid>
            </Grid>

            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveMedicalRecord}
                disabled={loading}
              >
                Save Medical Record
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Vitals Form */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Vitals & Tests (BP, Sugar, Blood Tests)
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              {/* Blood Pressure */}
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Blood Pressure (mmHg)</Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Systolic"
                      type="number"
                      value={vitalsData.bloodPressure.systolic}
                      onChange={(e) => handleVitalsChange('bloodPressure.systolic', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Diastolic"
                      type="number"
                      value={vitalsData.bloodPressure.diastolic}
                      onChange={(e) => handleVitalsChange('bloodPressure.diastolic', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Pulse */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Pulse (bpm)"
                  type="number"
                  value={vitalsData.pulse}
                  onChange={(e) => handleVitalsChange('pulse', e.target.value)}
                />
              </Grid>

              {/* Temperature */}
              <Grid item xs={12} sm={6}>
                <Grid container spacing={1}>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="Temperature"
                      type="number"
                      value={vitalsData.temperature}
                      onChange={(e) => handleVitalsChange('temperature', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControl fullWidth>
                      <InputLabel>Unit</InputLabel>
                      <Select
                        value={vitalsData.temperatureUnit}
                        onChange={(e) => handleVitalsChange('temperatureUnit', e.target.value)}
                      >
                        <MenuItem value="F">°F</MenuItem>
                        <MenuItem value="C">°C</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              {/* Respiratory Rate */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Respiratory Rate (breaths/min)"
                  type="number"
                  value={vitalsData.respiratoryRate}
                  onChange={(e) => handleVitalsChange('respiratoryRate', e.target.value)}
                />
              </Grid>

              {/* Oxygen Saturation */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Oxygen Saturation (SpO2 %)"
                  type="number"
                  value={vitalsData.oxygenSaturation}
                  onChange={(e) => handleVitalsChange('oxygenSaturation', e.target.value)}
                />
              </Grid>

              {/* Blood Sugar */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>Blood Sugar (mg/dL)</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Fasting"
                      type="number"
                      value={vitalsData.bloodSugar.fasting}
                      onChange={(e) => handleVitalsChange('bloodSugar.fasting', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Random"
                      type="number"
                      value={vitalsData.bloodSugar.random}
                      onChange={(e) => handleVitalsChange('bloodSugar.random', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Post Prandial"
                      type="number"
                      value={vitalsData.bloodSugar.postPrandial}
                      onChange={(e) => handleVitalsChange('bloodSugar.postPrandial', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* HbA1c */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="HbA1c (%)"
                  type="number"
                  value={vitalsData.hba1c}
                  onChange={(e) => handleVitalsChange('hba1c', e.target.value)}
                />
              </Grid>

              {/* Weight & Height */}
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  type="number"
                  value={vitalsData.weight}
                  onChange={(e) => handleVitalsChange('weight', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  type="number"
                  value={vitalsData.height}
                  onChange={(e) => handleVitalsChange('height', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={vitalsData.notes}
                  onChange={(e) => handleVitalsChange('notes', e.target.value)}
                />
              </Grid>
            </Grid>

            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<Save />}
                onClick={handleSaveVitals}
                disabled={loading}
              >
                Save Vitals & Tests
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Assign Nurse Dialog */}
        <Dialog open={assignNurseDialogOpen} onClose={() => setAssignNurseDialogOpen(false)}>
          <DialogTitle>Assign Nurse to Patient</DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Nurse</InputLabel>
              <Select
                value={selectedNurse}
                onChange={(e) => setSelectedNurse(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {nurses.map((nurse) => (
                  <MenuItem key={nurse._id} value={nurse._id}>
                    {nurse.firstName} {nurse.lastName} ({nurse.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAssignNurseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignNurse} variant="contained">
              Assign
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default AddMedicalRecord;


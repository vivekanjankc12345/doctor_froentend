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
} from '@mui/material';
import {
  ArrowBack,
  Save,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { patientService } from '../../services/patientService';
import { vitalService } from '../../services/vitalService';
import useApi from '../../hooks/useApi';

const RecordVitals = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { apiCall, loading } = useApi();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patient, setPatient] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(patientId || '');
  const [patients, setPatients] = useState([]);

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
    notes: '',
    visitType: 'OPD'
  });

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails(patientId);
      setSelectedPatientId(patientId);
    } else {
      fetchPatients();
    }
  }, [patientId]);

  useEffect(() => {
    if (selectedPatientId && selectedPatientId !== patientId) {
      fetchPatientDetails(selectedPatientId);
    }
  }, [selectedPatientId]);

  const fetchPatients = async () => {
    try {
      const response = await apiCall(patientService.searchPatients, {
        page: 1,
        limit: 100,
      });
      if (response.status === 1) {
        setPatients(response.patients || []);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  const fetchPatientDetails = async (id) => {
    try {
      const response = await apiCall(patientService.getPatientById, id);
      if (response.status === 1) {
        setPatient(response.patient);
      }
    } catch (err) {
      setError('Failed to fetch patient details');
    }
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

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      const patientIdToUse = selectedPatientId || patientId;
      if (!patientIdToUse) {
        setError('Please select a patient');
        return;
      }

      console.log('🔍 Nurse - Saving vitals for patient:', patientIdToUse);
      console.log('🔍 Nurse - Vitals data:', vitalsData);

      // Prepare vitals data - only include fields that have values
      const vitalData = {
        patient: patientIdToUse,
        visitType: vitalsData.visitType || 'OPD'
      };

      // Add blood pressure if either systolic or diastolic is provided
      if (vitalsData.bloodPressure && (vitalsData.bloodPressure.systolic || vitalsData.bloodPressure.diastolic)) {
        vitalData.bloodPressure = {};
        if (vitalsData.bloodPressure.systolic && vitalsData.bloodPressure.systolic.toString().trim() !== '') {
          vitalData.bloodPressure.systolic = parseFloat(vitalsData.bloodPressure.systolic);
        }
        if (vitalsData.bloodPressure.diastolic && vitalsData.bloodPressure.diastolic.toString().trim() !== '') {
          vitalData.bloodPressure.diastolic = parseFloat(vitalsData.bloodPressure.diastolic);
        }
      }

      // Add other fields only if they have values
      if (vitalsData.pulse && vitalsData.pulse.toString().trim() !== '') {
        vitalData.pulse = parseFloat(vitalsData.pulse);
      }
      if (vitalsData.temperature && vitalsData.temperature.toString().trim() !== '') {
        vitalData.temperature = parseFloat(vitalsData.temperature);
      }
      if (vitalsData.temperatureUnit) {
        vitalData.temperatureUnit = vitalsData.temperatureUnit;
      }
      if (vitalsData.respiratoryRate && vitalsData.respiratoryRate.toString().trim() !== '') {
        vitalData.respiratoryRate = parseFloat(vitalsData.respiratoryRate);
      }
      if (vitalsData.oxygenSaturation && vitalsData.oxygenSaturation.toString().trim() !== '') {
        vitalData.oxygenSaturation = parseFloat(vitalsData.oxygenSaturation);
      }

      // Add blood sugar if any value is provided
      if (vitalsData.bloodSugar && (vitalsData.bloodSugar.fasting || vitalsData.bloodSugar.random || vitalsData.bloodSugar.postPrandial)) {
        vitalData.bloodSugar = {};
        if (vitalsData.bloodSugar.fasting && vitalsData.bloodSugar.fasting.toString().trim() !== '') {
          vitalData.bloodSugar.fasting = parseFloat(vitalsData.bloodSugar.fasting);
        }
        if (vitalsData.bloodSugar.random && vitalsData.bloodSugar.random.toString().trim() !== '') {
          vitalData.bloodSugar.random = parseFloat(vitalsData.bloodSugar.random);
        }
        if (vitalsData.bloodSugar.postPrandial && vitalsData.bloodSugar.postPrandial.toString().trim() !== '') {
          vitalData.bloodSugar.postPrandial = parseFloat(vitalsData.bloodSugar.postPrandial);
        }
      }

      if (vitalsData.hba1c && vitalsData.hba1c.toString().trim() !== '') {
        vitalData.hba1c = parseFloat(vitalsData.hba1c);
      }
      if (vitalsData.weight && vitalsData.weight.toString().trim() !== '') {
        vitalData.weight = parseFloat(vitalsData.weight);
      }
      if (vitalsData.height && vitalsData.height.toString().trim() !== '') {
        vitalData.height = parseFloat(vitalsData.height);
      }
      if (vitalsData.notes && vitalsData.notes.trim() !== '') {
        vitalData.notes = vitalsData.notes.trim();
      }

      console.log('🔍 Nurse - Prepared vital data to send:', vitalData);

      const response = await apiCall(vitalService.recordVitals, vitalData);
      console.log('🔍 Nurse - Response from server:', response);
      
      if (response && response.status === 1) {
        setSuccess('Vitals recorded successfully!');
        setTimeout(() => {
          if (patientId) {
            navigate(`/nurse/patients/${patientId}`);
          } else {
            navigate('/nurse/vitals');
          }
        }, 2000);
      } else {
        setError(response?.message || response?.error || 'Failed to record vitals');
      }
    } catch (err) {
      console.error('🔍 Nurse - Error recording vitals:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to record vitals';
      setError(errorMessage);
    }
  };

  if (loading && !patient && patientId) {
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
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/nurse/vitals')}>
            Back
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Record Vitals & Tests
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

        {/* Patient Selection */}
        {!patientId && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <FormControl fullWidth>
                <InputLabel>Select Patient</InputLabel>
                <Select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                >
                  <MenuItem value="">Select a patient</MenuItem>
                  {patients.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.name} ({p.patientId})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        )}

        {patient && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold">
                {patient.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Patient ID: {patient.patientId}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Vitals Form */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Vitals & Tests (BP, Sugar, Blood Tests)
            </Typography>

            <Grid container spacing={2} sx={{ mt: 1 }}>
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

              {/* Visit Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Visit Type</InputLabel>
                  <Select
                    value={vitalsData.visitType}
                    onChange={(e) => handleVitalsChange('visitType', e.target.value)}
                  >
                    <MenuItem value="OPD">OPD</MenuItem>
                    <MenuItem value="IPD">IPD</MenuItem>
                    <MenuItem value="EMERGENCY">Emergency</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={vitalsData.notes}
                  onChange={(e) => handleVitalsChange('notes', e.target.value)}
                />
              </Grid>
            </Grid>

            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSubmit}
                disabled={loading || !selectedPatientId}
              >
                Save Vitals
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/nurse/vitals')}
              >
                Cancel
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default RecordVitals;


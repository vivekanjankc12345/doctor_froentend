import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Delete,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { patientService } from '../../services/patientService';
import { prescriptionService } from '../../services/prescriptionService';
import useApi from '../../hooks/useApi';

const prescriptionSchema = yup.object().shape({
  patient: yup.string().required('Patient is required'),
  medicines: yup.array().of(
    yup.object().shape({
      name: yup.string().required('Medicine name is required'),
      dosage: yup.string().required('Dosage is required'),
      frequency: yup.string().required('Frequency is required'),
      duration: yup.string().required('Duration is required'),
      instructions: yup.string(),
    })
  ).min(1, 'At least one medicine is required'),
  notes: yup.string(),
});

const CreatePrescription = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { apiCall, loading } = useApi();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(prescriptionSchema),
    defaultValues: {
      patient: patientId || '',
      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'medicines',
  });

  const watchedPatient = watch('patient');

  useEffect(() => {
    fetchPatients();
    if (patientId) {
      fetchPatientDetails(patientId);
      setValue('patient', patientId);
    }
  }, [patientId, setValue]);

  useEffect(() => {
    if (watchedPatient) {
      fetchPatientDetails(watchedPatient);
    }
  }, [watchedPatient]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await apiCall(patientService.searchPatients, {
        page: 1,
        limit: 100,
      });

      if (response.status === 1) {
        setPatients(response.patients || []);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchPatientDetails = async (id) => {
    try {
      const response = await apiCall(patientService.getPatientById, id);
      if (response.status === 1) {
        setSelectedPatient(response.patient);
      }
    } catch (err) {
      console.error('Failed to fetch patient details:', err);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');

      const prescriptionData = {
        patient: data.patient,
        medicines: data.medicines,
        notes: data.notes || undefined,
      };

      const response = await apiCall(prescriptionService.createPrescription, prescriptionData);

      if (response.status === 1) {
        setSuccess('Prescription created successfully!');
        setTimeout(() => {
          navigate(`/doctor/patients/${data.patient}`);
        }, 2000);
      } else {
        setError(response.message || 'Failed to create prescription');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to create prescription';
      setError(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4} display="flex" alignItems="center" gap={2}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
            Back
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Create Prescription
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Patient Selection */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Patient Information
                  </Typography>
                  <FormControl fullWidth error={!!errors.patient}>
                    <InputLabel>Select Patient</InputLabel>
                    <Select
                      {...register('patient')}
                      label="Select Patient"
                      disabled={!!patientId || loadingPatients}
                      value={watch('patient')}
                    >
                      {patients.map((patient) => (
                        <MenuItem key={patient._id} value={patient._id}>
                          {patient.patientId} - {patient.name} ({patient.phone})
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.patient && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.patient.message}
                      </Typography>
                    )}
                  </FormControl>

                  {selectedPatient && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Patient Details:
                      </Typography>
                      <Typography variant="body2">
                        <strong>Name:</strong> {selectedPatient.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Age:</strong>{' '}
                        {selectedPatient.dob
                          ? Math.floor((new Date() - new Date(selectedPatient.dob)) / (365.25 * 24 * 60 * 60 * 1000))
                          : 'N/A'}{' '}
                        years
                      </Typography>
                      <Typography variant="body2">
                        <strong>Gender:</strong> {selectedPatient.gender}
                      </Typography>
                      {selectedPatient.bloodGroup && (
                        <Typography variant="body2">
                          <strong>Blood Group:</strong> {selectedPatient.bloodGroup}
                        </Typography>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Medicines */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Medicines</Typography>
                    <Button
                      startIcon={<Add />}
                      onClick={() => append({ name: '', dosage: '', frequency: '', duration: '', instructions: '' })}
                      variant="outlined"
                      size="small"
                    >
                      Add Medicine
                    </Button>
                  </Box>

                  {fields.map((field, index) => (
                    <Paper key={field.id} sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                          <TextField
                            fullWidth
                            label="Medicine Name"
                            {...register(`medicines.${index}.name`)}
                            error={!!errors.medicines?.[index]?.name}
                            helperText={errors.medicines?.[index]?.name?.message}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            fullWidth
                            label="Dosage"
                            placeholder="e.g., 500mg"
                            {...register(`medicines.${index}.dosage`)}
                            error={!!errors.medicines?.[index]?.dosage}
                            helperText={errors.medicines?.[index]?.dosage?.message}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            fullWidth
                            label="Frequency"
                            placeholder="e.g., Twice daily"
                            {...register(`medicines.${index}.frequency`)}
                            error={!!errors.medicines?.[index]?.frequency}
                            helperText={errors.medicines?.[index]?.frequency?.message}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            fullWidth
                            label="Duration"
                            placeholder="e.g., 5 days"
                            {...register(`medicines.${index}.duration`)}
                            error={!!errors.medicines?.[index]?.duration}
                            helperText={errors.medicines?.[index]?.duration?.message}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            fullWidth
                            label="Instructions"
                            placeholder="e.g., After meals"
                            {...register(`medicines.${index}.instructions`)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={1}>
                          <IconButton
                            color="error"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Delete />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}

                  {errors.medicines && typeof errors.medicines.message === 'string' && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.medicines.message}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Additional Notes
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes"
                    placeholder="Any additional instructions or notes for the patient..."
                    {...register('notes')}
                    error={!!errors.notes}
                    helperText={errors.notes?.message}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Actions */}
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating...' : 'Create Prescription'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </DashboardLayout>
  );
};

export default CreatePrescription;


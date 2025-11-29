import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';
import { userService } from '../../services/userService';
import useApi from '../../hooks/useApi';

const patientSchema = yup.object().shape({
  name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
  dob: yup.date().required('Date of birth is required').max(new Date(), 'Date cannot be in the future'),
  gender: yup.string().required('Gender is required').oneOf(['Male', 'Female', 'Other']),
  phone: yup.string().required('Phone is required'),
  email: yup.string().email('Invalid email format'),
  bloodGroup: yup.string(),
  type: yup.string().oneOf(['OPD', 'IPD']).default('OPD'),
  department: yup.string(),
  'address.street': yup.string(),
  'address.city': yup.string(),
  'address.state': yup.string(),
  'address.zipCode': yup.string(),
  'emergencyContact.name': yup.string(),
  'emergencyContact.relationship': yup.string(),
  'emergencyContact.phone': yup.string(),
});

const PatientRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasRole } = useAuth();
  const { apiCall, loading } = useApi();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(patientSchema),
    defaultValues: {
      type: 'OPD',
      gender: '',
      assignedDoctor: '',
    },
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      // Use the new getDoctors endpoint that's available to receptionists
      const response = await apiCall(userService.getDoctors);

      if (response.status === 1) {
        setDoctors(response.doctors || []);
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      setSuccess('');

      const patientData = {
        name: data.name,
        dob: data.dob,
        gender: data.gender,
        phone: data.phone,
        email: data.email || undefined,
        bloodGroup: data.bloodGroup || undefined,
        type: data.type,
        department: data.department || undefined,
        assignedDoctor: data.assignedDoctor || undefined,
        address: data.address?.street ? {
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.zipCode,
        } : undefined,
        emergencyContact: data.emergencyContact?.name ? {
          name: data.emergencyContact.name,
          relationship: data.emergencyContact.relationship,
          phone: data.emergencyContact.phone,
        } : undefined,
      };

      const response = await apiCall(patientService.createPatient, patientData);

      if (response.status === 1) {
        setSuccess(`Patient registered successfully! Patient ID: ${response.patient.patientId}`);
        reset();
        setTimeout(() => {
          // Navigate based on user role
          if (hasRole('RECEPTIONIST')) {
            navigate('/receptionist/dashboard');
          } else {
            navigate('/hospital/patients');
          }
        }, 2000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to register patient';
      setError(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4} display="flex" alignItems="center" gap={2}>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => {
              // Navigate back based on user role
              if (hasRole('RECEPTIONIST')) {
                navigate('/receptionist/dashboard');
              } else {
                navigate('/hospital/patients');
              }
            }}
          >
            Back
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Register New Patient
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

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Date of Birth"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    {...register('dob')}
                    error={!!errors.dob}
                    helperText={errors.dob?.message}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required error={!!errors.gender}>
                    <InputLabel>Gender</InputLabel>
                    <Select {...register('gender')} label="Gender">
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                    {errors.gender && (
                      <Typography variant="caption" color="error">
                        {errors.gender.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Blood Group"
                    {...register('bloodGroup')}
                    error={!!errors.bloodGroup}
                    helperText={errors.bloodGroup?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Patient Type</InputLabel>
                    <Select {...register('type')} label="Patient Type" defaultValue="OPD">
                      <MenuItem value="OPD">OPD (Outpatient)</MenuItem>
                      <MenuItem value="IPD">IPD (Inpatient)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    {...register('department')}
                    error={!!errors.department}
                    helperText={errors.department?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Assign Doctor</InputLabel>
                    <Select
                      {...register('assignedDoctor')}
                      label="Assign Doctor"
                      disabled={loadingDoctors}
                    >
                      <MenuItem value="">None</MenuItem>
                      {doctors.map((doctor) => (
                        <MenuItem key={doctor._id} value={doctor._id}>
                          {doctor.firstName} {doctor.lastName}
                          {doctor.specialization ? ` - ${doctor.specialization}` : ''}
                        </MenuItem>
                      ))}
                    </Select>
                    {loadingDoctors && (
                      <CircularProgress size={20} sx={{ position: 'absolute', right: 8, top: 8 }} />
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Address
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street"
                    {...register('address.street')}
                    error={!!errors.address?.street}
                    helperText={errors.address?.street?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    {...register('address.city')}
                    error={!!errors.address?.city}
                    helperText={errors.address?.city?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="State"
                    {...register('address.state')}
                    error={!!errors.address?.state}
                    helperText={errors.address?.state?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Zip Code"
                    {...register('address.zipCode')}
                    error={!!errors.address?.zipCode}
                    helperText={errors.address?.zipCode?.message}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Emergency Contact
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    {...register('emergencyContact.name')}
                    error={!!errors.emergencyContact?.name}
                    helperText={errors.emergencyContact?.name?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Relationship"
                    {...register('emergencyContact.relationship')}
                    error={!!errors.emergencyContact?.relationship}
                    helperText={errors.emergencyContact?.relationship?.message}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Contact Phone"
                    {...register('emergencyContact.phone')}
                    error={!!errors.emergencyContact?.phone}
                    helperText={errors.emergencyContact?.phone?.message}
                  />
                </Grid>

                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/hospital/patients')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      disabled={loading}
                    >
                      Register Patient
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default PatientRegistration;


import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  Link,
} from '@mui/material';
import { Save, LocalHospital, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';

// Yup validation schema
const hospitalSchema = yup.object().shape({
  name: yup
    .string()
    .required('Hospital name is required')
    .min(3, 'Hospital name must be at least 3 characters')
    .max(100, 'Hospital name must not exceed 100 characters'),
  address: yup
    .string()
    .required('Address is required')
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must not exceed 200 characters'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters'),
  licenseNumber: yup
    .string()
    .required('License number is required')
    .min(5, 'License number must be at least 5 characters')
    .max(50, 'License number must not exceed 50 characters')
    .matches(/^[A-Z0-9-]+$/, 'License number can only contain uppercase letters, numbers, and hyphens'),
});

const PublicHospitalRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(hospitalSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: '',
      licenseNumber: '',
    },
  });

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await hospitalService.registerHospital(data);

      if (response.status === 1) {
        setSuccess(response.message || 'Hospital registered successfully!');
        reset();
      } else {
        setError(response.message || 'Failed to register hospital');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to register hospital';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/login')}
            sx={{ color: 'white' }}
          >
            Back to Login
          </Button>
        </Box>

        <Card
          elevation={24}
          sx={{
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LocalHospital
                sx={{
                  fontSize: 60,
                  color: 'primary.main',
                  mb: 2,
                }}
              />
              <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                Hospital Registration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Register your hospital to get started with HMS
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {success.includes('verification email') && (
                    <>
                      Please check the hospital email for verification link. After verification, 
                      the hospital status will be VERIFIED and can be activated by the administrator.
                    </>
                  )}
                </Typography>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hospital Name"
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="License Number"
                    {...register('licenseNumber')}
                    error={!!errors.licenseNumber}
                    helperText={errors.licenseNumber?.message || 'Format: Uppercase letters, numbers, and hyphens only'}
                    required
                    disabled={loading}
                    placeholder="ABC-12345"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    {...register('address')}
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    required
                    disabled={loading}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message || 'Format: +1234567890 or (123) 456-7890'}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Registration Process:
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                      <li>After registration, a verification email will be sent to the hospital email address</li>
                      <li>The hospital status will be set to PENDING until email verification</li>
                      <li>After email verification, status changes to VERIFIED</li>
                      <li>Administrator will review and activate (ACTIVE) your hospital</li>
                      <li>Hospital admin credentials will be sent via email after verification</li>
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/login')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      disabled={loading}
                      size="large"
                      fullWidth
                    >
                      {loading ? 'Registering...' : 'Register Hospital'}
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link
                        component="button"
                        variant="body2"
                        onClick={() => navigate('/login')}
                        sx={{ cursor: 'pointer' }}
                      >
                        Sign In
                      </Link>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default PublicHospitalRegistration;


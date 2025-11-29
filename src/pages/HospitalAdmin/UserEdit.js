import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useParams, useNavigate } from 'react-router-dom';
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
  FormHelperText,
  Chip,
  Paper,
} from '@mui/material';
import { Save, ArrowBack } from '@mui/icons-material';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import useRole from '../../hooks/useRole';
import { userService } from '../../services/userService';
import useApi from '../../hooks/useApi';

// Yup validation schema (password optional for edit)
const userSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters')
    .matches(/^[A-Za-z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters')
    .matches(/^[A-Za-z\s]+$/, 'Last name can only contain letters and spaces'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format')
    .max(100, 'Email must not exceed 100 characters'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format'),
  roleIds: yup
    .array()
    .min(1, 'At least one role must be selected')
    .required('Role is required'),
  department: yup
    .string()
    .max(100, 'Department must not exceed 100 characters'),
  specialization: yup
    .string()
    .max(100, 'Specialization must not exceed 100 characters'),
  status: yup
    .string()
    .oneOf(['ACTIVE', 'INACTIVE', 'LOCKED'], 'Invalid status'),
});

const UserEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const { roles, loading: rolesLoading, error: rolesError } = useRole();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      roleIds: [],
      department: '',
      specialization: '',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoadingUser(true);
      setError('');
      const response = await apiCall(userService.getUserById, id);

      if (response.status === 1 && response.user) {
        const user = response.user;
        reset({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          roleIds: user.roles?.map(r => r._id || r) || [],
          department: user.department || '',
          specialization: user.specialization || '',
          status: user.status || 'ACTIVE',
        });
      } else {
        setError('User not found');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to load user';
      setError(errorMessage);
    } finally {
      setLoadingUser(false);
    }
  };

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');

    try {
      const response = await apiCall(userService.updateUser, id, data);

      if (response.status === 1) {
        setSuccess(response.message || 'User updated successfully!');
        setTimeout(() => {
          navigate('/hospital/users');
        }, 2000);
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to update user';
      setError(errorMessage);
    }
  };

  if (loadingUser) {
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Edit User
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/hospital/users')}
          >
            Back to Users
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {rolesError && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Failed to load roles: {rolesError}
          </Alert>
        )}

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    {...register('firstName')}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    required
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    {...register('lastName')}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    required
                    disabled={loading}
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

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.roleIds} required>
                    <InputLabel>Roles</InputLabel>
                    <Controller
                      name="roleIds"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          multiple
                          label="Roles"
                          disabled={loading || rolesLoading}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {selected.map((value) => {
                                const role = roles.find((r) => r._id === value);
                                return (
                                  <Chip
                                    key={value}
                                    label={role?.name || value}
                                    size="small"
                                  />
                                );
                              })}
                            </Box>
                          )}
                        >
                          {rolesLoading ? (
                            <MenuItem disabled>
                              <CircularProgress size={20} />
                              Loading roles...
                            </MenuItem>
                          ) : roles.length === 0 ? (
                            <MenuItem disabled>No roles available</MenuItem>
                          ) : (
                            roles
                              .filter(role => role.name !== 'SUPER_ADMIN' && role.name !== 'HOSPITAL_ADMIN')
                              .map((role) => (
                                <MenuItem key={role._id} value={role._id}>
                                  {role.name} {role.description && `- ${role.description}`}
                                </MenuItem>
                              ))
                          )}
                        </Select>
                      )}
                    />
                    <FormHelperText>
                      {errors.roleIds?.message || 'Select at least one role (Doctor, Nurse, Receptionist, etc.)'}
                    </FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} label="Status" disabled={loading}>
                          <MenuItem value="ACTIVE">Active</MenuItem>
                          <MenuItem value="INACTIVE">Inactive</MenuItem>
                          <MenuItem value="LOCKED">Locked</MenuItem>
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Department"
                    {...register('department')}
                    error={!!errors.department}
                    helperText={errors.department?.message}
                    disabled={loading}
                    placeholder="e.g., Cardiology, Emergency, etc."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Specialization"
                    {...register('specialization')}
                    error={!!errors.specialization}
                    helperText={errors.specialization?.message || 'For doctors only'}
                    disabled={loading}
                    placeholder="e.g., Cardiologist, Surgeon, etc."
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/hospital/users')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                      disabled={loading || rolesLoading}
                    >
                      {loading ? 'Updating...' : 'Update User'}
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

export default UserEdit;


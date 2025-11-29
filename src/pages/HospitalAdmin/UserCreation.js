import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
  FormHelperText,
  Chip,
  Paper,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Save, ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import useUser from '../../hooks/useUser';
import useRole from '../../hooks/useRole';
import { useAppSelector } from '../../store/hooks';

// Yup validation schema
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
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
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
});

const UserCreation = () => {
  const navigate = useNavigate();
  const { createUser } = useUser();
  const { roles, loading: rolesLoading, error: rolesError } = useRole();
  const { loading } = useAppSelector((state) => state.hospital);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      roleIds: [],
      department: '',
      specialization: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');

    // Remove confirmPassword before sending
    const { confirmPassword, ...userData } = data;

    try {
      const response = await createUser(userData);

      if (response.status === 1) {
        setSuccess(response.message || 'User created successfully!');
        reset();
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/hospital/users');
        }, 2000);
      } else {
        setError(response.message || 'Failed to create user');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to create user';
      setError(errorMessage);
    }
  };

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Create New User
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
            <Typography variant="body2" sx={{ mt: 1 }}>
              Welcome email with login credentials has been sent to the user's email address.
            </Typography>
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
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message || 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char'}
                    required
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            aria-label="toggle password visibility"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    required
                    disabled={loading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            aria-label="toggle confirm password visibility"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
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
                  <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Password Requirements:
                    </Typography>
                    <Typography variant="body2" component="ul" sx={{ pl: 2, m: 0 }}>
                      <li>Minimum 8 characters</li>
                      <li>At least one uppercase letter (A-Z)</li>
                      <li>At least one lowercase letter (a-z)</li>
                      <li>At least one number (0-9)</li>
                      <li>At least one special character (!@#$%^&*...)</li>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Note:</strong> The user will receive a welcome email with their login credentials.
                    </Typography>
                  </Paper>
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
                      {loading ? 'Creating...' : 'Create User'}
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

export default UserCreation;


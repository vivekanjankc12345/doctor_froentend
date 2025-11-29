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
  Tabs,
  Tab,
  Divider,
  Chip,
} from '@mui/material';
import {
  Person,
  Lock,
  Save,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import useApi from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';

const profileSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'First name must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Last name must be at least 2 characters'),
  phone: yup.string().matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Invalid phone number format'),
  department: yup.string(),
  specialization: yup.string(),
  shift: yup.string(),
});

const passwordSchema = yup.object().shape({
  oldPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

const Profile = () => {
  const { user: authUser, login } = useAuth();
  const { apiCall, loading } = useApi();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setError('');
      const response = await apiCall(userService.getCurrentUser);
      if (response.status === 1) {
        // Log roles for debugging
        console.log('Profile roles:', response.user.roles);
        setUser(response.user);
        resetProfile({
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phone: response.user.phone || '',
          department: response.user.department || '',
          specialization: response.user.specialization || '',
          shift: response.user.shift || '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const onSubmitProfile = async (data) => {
    try {
      setError('');
      setSuccess('');
      const response = await apiCall(userService.updateProfile, data);
      if (response.status === 1) {
        setSuccess('Profile updated successfully');
        setUser(response.user);
        // Update auth context
        const updatedUser = {
          ...authUser,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          phone: response.user.phone,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        fetchProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      setError('');
      setSuccess('');
      const response = await apiCall(authService.changePassword, data.oldPassword, data.newPassword);
      if (response.status === 1) {
        setSuccess('Password changed successfully');
        resetPassword();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loadingProfile) {
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
        <Box mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Profile & Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your profile information and account settings
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
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab icon={<Person />} label="Profile Information" />
              <Tab icon={<Lock />} label="Change Password" />
            </Tabs>
          </Box>

          <CardContent>
            {tabValue === 0 && (
              <form onSubmit={handleSubmitProfile(onSubmitProfile)}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      {...registerProfile('firstName')}
                      error={!!profileErrors.firstName}
                      helperText={profileErrors.firstName?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      {...registerProfile('lastName')}
                      error={!!profileErrors.lastName}
                      helperText={profileErrors.lastName?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={user?.email || ''}
                      disabled
                      helperText="Email cannot be changed"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={user?.username || ''}
                      disabled
                      helperText="Username cannot be changed"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      {...registerProfile('phone')}
                      error={!!profileErrors.phone}
                      helperText={profileErrors.phone?.message}
                    />
                  </Grid>

                  {user?.hospital && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Hospital"
                        value={user.hospital.name || ''}
                        disabled
                      />
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Professional Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Department"
                      {...registerProfile('department')}
                      error={!!profileErrors.department}
                      helperText={profileErrors.department?.message}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Specialization"
                      {...registerProfile('specialization')}
                      error={!!profileErrors.specialization}
                      helperText={profileErrors.specialization?.message}
                      placeholder="e.g., Cardiologist"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Shift"
                      {...registerProfile('shift')}
                      error={!!profileErrors.shift}
                      helperText={profileErrors.shift?.message}
                      placeholder="e.g., Morning, Evening"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Account Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Status
                    </Typography>
                    <Chip
                      label={user?.status || 'ACTIVE'}
                      color={user?.status === 'ACTIVE' ? 'success' : 'default'}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Roles
                    </Typography>
                    {user?.roles && user.roles.length > 0 ? (
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {user.roles.map((role, index) => {
                          // Backend should return role objects with name property
                          // Handle both object and string formats
                          let roleName = 'Unknown';
                          if (typeof role === 'object' && role !== null) {
                            roleName = role.name || role._id || 'Unknown';
                          } else if (typeof role === 'string') {
                            // Check if it's an ObjectId (24 hex characters)
                            if (role.length === 24 && /^[0-9a-fA-F]{24}$/.test(role)) {
                              // It's an ID - this shouldn't happen if backend is working correctly
                              roleName = 'Loading...';
                              console.warn('Role is still an ID:', role);
                            } else {
                              // It's already a role name string
                              roleName = role;
                            }
                          }
                          return (
                            <Chip
                              key={index}
                              label={roleName}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No roles assigned
                      </Typography>
                    )}
                  </Grid>

                  {user?.lastLogin && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Last Login
                      </Typography>
                      <Typography variant="body2">
                        {new Date(user.lastLogin).toLocaleString()}
                      </Typography>
                    </Grid>
                  )}

                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Box display="flex" gap={2} justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        disabled={loading}
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}

            {tabValue === 1 && (
              <form onSubmit={handleSubmitPassword(onSubmitPassword)}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Change Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Please enter your current password and choose a new password.
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      {...registerPassword('oldPassword')}
                      error={!!passwordErrors.oldPassword}
                      helperText={passwordErrors.oldPassword?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}></Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      {...registerPassword('newPassword')}
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      {...registerPassword('confirmPassword')}
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.
                    </Alert>
                  </Grid>

                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Box display="flex" gap={2} justifyContent="flex-end">
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                        disabled={loading}
                      >
                        Change Password
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default Profile;


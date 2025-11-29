import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocalHospital,
  People,
  Assignment,
  Event,
} from '@mui/icons-material';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { patientService } from '../../services/patientService';
import useApi from '../../hooks/useApi';

const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
  <Card
    sx={{
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: 4 } : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Icon sx={{ fontSize: 40, color: `${color}.main` }} />
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalPatients: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setError('');
      
      // Fetch dashboard statistics
      const statsResponse = await apiCall(userService.getDashboardStats);
      
      if (statsResponse.status === 1 && statsResponse.stats) {
        setStats(statsResponse.stats);
      } else {
        // Fallback: fetch individual counts if stats endpoint doesn't work
        await fetchIndividualStats();
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      // Fallback: try to fetch individual stats
      await fetchIndividualStats();
    }
  };

  const fetchIndividualStats = async () => {
    try {
      // Fetch users count
      const usersResponse = await apiCall(userService.getAllUsers, { page: 1, limit: 1 });
      if (usersResponse.status === 1) {
        setStats(prev => ({
          ...prev,
          totalUsers: usersResponse.pagination?.total || 0,
        }));
      }

      // Fetch doctors count
      const doctorsResponse = await apiCall(userService.getDoctors);
      if (doctorsResponse.status === 1) {
        setStats(prev => ({
          ...prev,
          totalDoctors: doctorsResponse.doctors?.length || 0,
        }));
      }

      // Fetch patients count
      const patientsResponse = await apiCall(patientService.searchPatients, { page: 1, limit: 1 });
      if (patientsResponse.status === 1) {
        setStats(prev => ({
          ...prev,
          totalPatients: patientsResponse.pagination?.total || 0,
        }));
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
    }
  };

  if (loading) {
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
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Hospital Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back, {user?.firstName} {user?.lastName}
          </Typography>
          {user?.hospital && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {user.hospital}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={People}
              color="primary"
              onClick={() => navigate('/hospital/users')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Doctors"
              value={stats.totalDoctors}
              icon={LocalHospital}
              color="success"
              onClick={() => navigate('/hospital/users?role=DOCTOR')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Appointments"
              value={stats.totalAppointments}
              icon={Event}
              color="info"
              onClick={() => navigate('/hospital/appointments')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Patients"
              value={stats.totalPatients}
              icon={People}
              color="warning"
              onClick={() => navigate('/hospital/patients')}
            />
          </Grid>
        </Grid>

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Box display="flex" gap={2} mt={2} flexWrap="wrap">
              <Box
                component="button"
                onClick={() => navigate('/hospital/users/create')}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  Create New User
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add doctor, nurse, or staff
                </Typography>
              </Box>
              <Box
                component="button"
                onClick={() => navigate('/hospital/users')}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography variant="body1" fontWeight="medium">
                  Manage Users
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  View and manage all users
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;


import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People,
  Event,
  LocalHospital,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { patientService } from '../../services/patientService';
import useApi from '../../hooks/useApi';

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayRegistrations: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      
      // Fetch recent patients
      const patientsResponse = await apiCall(patientService.searchPatients, {
        page: 1,
        limit: 5,
      });

      if (patientsResponse.status === 1) {
        const patients = patientsResponse.patients || [];
        setRecentPatients(patients);
        setStats(prev => ({
          ...prev,
          totalPatients: patientsResponse.pagination?.total || 0,
          todayRegistrations: patients.filter(p => {
            const today = new Date();
            const regDate = new Date(p.createdAt);
            return regDate.toDateString() === today.toDateString();
          }).length,
        }));
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: <People />,
      color: '#1976d2',
      path: '/receptionist/patients/create',
    },
    {
      title: 'Today\'s Registrations',
      value: stats.todayRegistrations,
      icon: <Add />,
      color: '#2e7d32',
      path: '/receptionist/patients/create',
    },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Receptionist Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage patient registration and appointments.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate(stat.path)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {loading ? <CircularProgress size={24} color="inherit" /> : stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                        {stat.title}
                      </Typography>
                    </Box>
                    <Box sx={{ fontSize: 48, opacity: 0.3 }}>
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Patients */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Recent Patient Registrations
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/receptionist/patients/create')}
              >
                Register Patient
              </Button>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Patient ID</strong></TableCell>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Assigned Doctor</strong></TableCell>
                      <TableCell><strong>Phone</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary" py={2}>
                            No patients found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentPatients.map((patient) => (
                        <TableRow key={patient._id} hover>
                          <TableCell>{patient.patientId}</TableCell>
                          <TableCell>{patient.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={patient.type || 'OPD'}
                              size="small"
                              color={patient.type === 'IPD' ? 'primary' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            {patient.assignedDoctor 
                              ? `${patient.assignedDoctor.firstName} ${patient.assignedDoctor.lastName}`
                              : 'Not Assigned'}
                          </TableCell>
                          <TableCell>{patient.phone}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => navigate(`/receptionist/patients/${patient._id}`)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<Add />}
                    onClick={() => navigate('/receptionist/patients/create')}
                  >
                    Register New Patient
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default ReceptionistDashboard;


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
  LocalHospital,
  Assignment,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { patientService } from '../../services/patientService';
import { vitalService } from '../../services/vitalService';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';

const NurseDashboard = () => {
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assignedPatients: 0,
    testsToday: 0,
    pendingTests: 0,
    totalTests: 0,
  });
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      
      // Fetch patients assigned to this nurse
      const patientsResponse = await apiCall(patientService.searchPatients, {
        page: 1,
        limit: 10,
        nurse: user?.id, // Filter by assigned nurse
      });

      if (patientsResponse.status === 1) {
        // Backend already filters by assignedNurse via ABAC, so use all returned patients
        const allPatients = patientsResponse.patients || [];
        setAssignedPatients(allPatients);
        setStats(prev => ({
          ...prev,
          assignedPatients: patientsResponse.pagination?.total || allPatients.length,
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
      title: 'Assigned Patients',
      value: stats.assignedPatients,
      icon: <People />,
      color: '#1976d2',
      path: '/nurse/patients',
    },
    {
      title: 'Tests Today',
      value: stats.testsToday,
      icon: <LocalHospital />,
      color: '#2e7d32',
      path: '/nurse/vitals',
    },
    {
      title: 'Pending Tests',
      value: stats.pendingTests,
      icon: <Assignment />,
      color: '#ed6c02',
      path: '/nurse/vitals',
    },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Nurse Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage patient tests and vitals for assigned patients.
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
            <Grid item xs={12} sm={6} md={4} key={index}>
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

        {/* Assigned Patients */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Assigned Patients
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/nurse/patients')}
              >
                View All
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
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignedPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="text.secondary" py={2}>
                            No patients assigned to you
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignedPatients.map((patient) => (
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
                            {patient.assignedDoctor && typeof patient.assignedDoctor === 'object'
                              ? `${patient.assignedDoctor.firstName || ''} ${patient.assignedDoctor.lastName || ''}`.trim() || 'N/A'
                              : patient.assignedDoctor
                              ? String(patient.assignedDoctor)
                              : 'Not Assigned'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Add />}
                              onClick={() => navigate(`/nurse/vitals/create/${patient._id}`)}
                            >
                              Record Test
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
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/nurse/patients')}
                  >
                    View Assigned Patients
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => navigate('/nurse/vitals')}
                  >
                    View Test History
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

export default NurseDashboard;


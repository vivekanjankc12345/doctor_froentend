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
  IconButton,
} from '@mui/material';
import {
  LocalPharmacy,
  Assignment,
  People,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { prescriptionService } from '../../services/prescriptionService';
import { patientService } from '../../services/patientService';
import useApi from '../../hooks/useApi';

const PharmacistDashboard = () => {
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const [stats, setStats] = useState({
    pendingPrescriptions: 0,
    dispensedToday: 0,
    totalPatients: 0,
    totalPrescriptions: 0,
  });
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      
      // Fetch prescriptions with ACTIVE status (pending dispensing)
      const prescriptionsResponse = await apiCall(prescriptionService.getPrescriptions, {
        page: 1,
        limit: 10,
        status: 'ACTIVE',
      });

      // Fetch patients count
      const patientsResponse = await apiCall(patientService.searchPatients, {
        page: 1,
        limit: 1,
      });

      if (prescriptionsResponse.status === 1) {
        const prescriptions = prescriptionsResponse.prescriptions || [];
        setPendingPrescriptions(prescriptions);
        setStats(prev => ({
          ...prev,
          pendingPrescriptions: prescriptions.length,
          totalPrescriptions: prescriptionsResponse.pagination?.total || 0,
        }));
      }

      if (patientsResponse.status === 1) {
        setStats(prev => ({
          ...prev,
          totalPatients: patientsResponse.data?.pagination?.total || 0,
        }));
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to load dashboard data';
      setError(errorMessage);
    }
  };

  const handleDispense = async (prescriptionId) => {
    try {
      // TODO: Implement dispense API call
      alert(`Dispensing prescription ${prescriptionId}`);
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Failed to dispense prescription');
    }
  };

  const statCards = [
    {
      title: 'Pending Prescriptions',
      value: stats.pendingPrescriptions,
      icon: <Assignment />,
      color: '#ed6c02',
      path: '/pharmacist/prescriptions',
    },
    {
      title: 'Dispensed Today',
      value: stats.dispensedToday,
      icon: <CheckCircle />,
      color: '#2e7d32',
      path: '/pharmacist/prescriptions',
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: <People />,
      color: '#1976d2',
      path: '/pharmacist/patients',
    },
    {
      title: 'Total Prescriptions',
      value: stats.totalPrescriptions,
      icon: <LocalPharmacy />,
      color: '#9c27b0',
      path: '/pharmacist/prescriptions',
    },
  ];

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Pharmacist Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage prescription dispensing and pharmacy operations.
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

        {/* Pending Prescriptions */}
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                Pending Prescriptions
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/pharmacist/prescriptions')}
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
                      <TableCell><strong>Prescription ID</strong></TableCell>
                      <TableCell><strong>Patient</strong></TableCell>
                      <TableCell><strong>Doctor</strong></TableCell>
                      <TableCell><strong>Medicines</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingPrescriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="text.secondary" py={2}>
                            No pending prescriptions
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      pendingPrescriptions.map((prescription) => (
                        <TableRow key={prescription._id} hover>
                          <TableCell>{prescription.prescriptionId}</TableCell>
                          <TableCell>
                            {prescription.patient?.name || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                          </TableCell>
                          <TableCell>{prescription.medicines?.length || 0}</TableCell>
                          <TableCell>
                            <Chip
                              label={prescription.status || 'ACTIVE'}
                              size="small"
                              color={prescription.status === 'ACTIVE' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleDispense(prescription._id)}
                            >
                              Dispense
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
      </Box>
    </DashboardLayout>
  );
};

export default PharmacistDashboard;


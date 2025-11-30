import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  LocalHospital,
  History,
  Add,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { patientService } from '../../services/patientService';
import { vitalService } from '../../services/vitalService';
import { medicalRecordService } from '../../services/medicalRecordService';
import useApi from '../../hooks/useApi';

const NursePatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apiCall, loading } = useApi();
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [loadingVitals, setLoadingVitals] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPatientDetails();
    }
  }, [id]);

  useEffect(() => {
    if (patient && activeTab === 1) {
      fetchVitals();
    }
  }, [patient, activeTab]);

  // Refetch vitals when switching to vitals tab if empty
  useEffect(() => {
    if (activeTab === 1 && patient && vitals.length === 0) {
      fetchVitals();
    }
  }, [activeTab]);

  const fetchPatientDetails = async () => {
    try {
      setError('');
      const response = await apiCall(patientService.getPatientById, id);
      if (response.status === 1) {
        setPatient(response.patient);
      } else {
        setError(response.message || 'Failed to fetch patient details');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch patient details';
      setError(errorMessage);
    }
  };

  const fetchVitals = async () => {
    try {
      setLoadingVitals(true);
      const response = await apiCall(vitalService.getPatientVitals, id, {
        page: 1,
        limit: 50,
      });
      console.log('🔍 Nurse - Vitals response:', response);
      if (response.status === 1) {
        // Backend returns { status: 1, vitals: [...], pagination: {...} }
        setVitals(response.vitals || response.data?.vitals || []);
      }
    } catch (err) {
      console.error('Failed to fetch vitals:', err);
      setVitals([]); // Set empty array on error
    } finally {
      setLoadingVitals(false);
    }
  };

  const handleRecordVitals = () => {
    navigate(`/nurse/vitals/create/${id}`);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (error && !patient) {
    return (
      <DashboardLayout>
        <Box>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/nurse/patients')}
            sx={{ mb: 2 }}
          >
            Back to Patients
          </Button>
          <Alert severity="error">{error}</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return null;
  }

  return (
    <DashboardLayout>
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/nurse/patients')}
          sx={{ mb: 2 }}
        >
          Back to Patients
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Patient Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                  {patient.name}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Patient ID: {patient.patientId}
                </Typography>
              </Box>
              <Box display="flex" gap={2} alignItems="center">
                <Chip
                  label={patient.type}
                  color={patient.type === 'IPD' ? 'primary' : 'default'}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleRecordVitals}
                >
                  Record Vitals
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate(`/nurse/patients/${patient._id}/add-record`)}
                >
                  Create Report
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab label="Patient Information" icon={<LocalHospital />} iconPosition="start" />
              <Tab label="Vitals History" icon={<History />} iconPosition="start" />
            </Tabs>
          </Box>

          <CardContent>
            {/* Patient Information Tab */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Personal Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Name</strong></TableCell>
                          <TableCell>{patient.name}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Patient ID</strong></TableCell>
                          <TableCell>{patient.patientId}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Date of Birth</strong></TableCell>
                          <TableCell>{formatDate(patient.dob)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Gender</strong></TableCell>
                          <TableCell>{patient.gender}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Blood Group</strong></TableCell>
                          <TableCell>{patient.bloodGroup || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Phone</strong></TableCell>
                          <TableCell>{patient.phone}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Email</strong></TableCell>
                          <TableCell>{patient.email || 'N/A'}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom fontWeight="bold">
                    Medical Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell>
                            <Chip
                              label={patient.type}
                              color={patient.type === 'IPD' ? 'primary' : 'default'}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Department</strong></TableCell>
                          <TableCell>{patient.department || 'N/A'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Assigned Doctor</strong></TableCell>
                          <TableCell>
                            {patient.assignedDoctor && typeof patient.assignedDoctor === 'object'
                              ? `${patient.assignedDoctor.firstName || ''} ${patient.assignedDoctor.lastName || ''}`.trim() || 'N/A'
                              : patient.assignedDoctor
                              ? String(patient.assignedDoctor)
                              : 'Not Assigned'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>Registration Date</strong></TableCell>
                          <TableCell>{formatDate(patient.createdAt)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {patient.address && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Address
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body1">
                      {[
                        patient.address.street,
                        patient.address.city,
                        patient.address.state,
                        patient.address.zipCode,
                        patient.address.country,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                    </Typography>
                  </Grid>
                )}

                {patient.emergencyContact && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Emergency Contact
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell>{patient.emergencyContact.name || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Relationship</strong></TableCell>
                            <TableCell>{patient.emergencyContact.relationship || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Phone</strong></TableCell>
                            <TableCell>{patient.emergencyContact.phone || 'N/A'}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell>{patient.emergencyContact.email || 'N/A'}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                )}
              </Grid>
            )}

            {/* Vitals History Tab */}
            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    Vitals History
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleRecordVitals}
                  >
                    Record New Vitals
                  </Button>
                </Box>

                {loadingVitals ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : vitals.length === 0 ? (
                  <Alert severity="info">No vitals recorded for this patient yet.</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Date & Time</strong></TableCell>
                          <TableCell><strong>BP</strong></TableCell>
                          <TableCell><strong>Pulse</strong></TableCell>
                          <TableCell><strong>Temperature</strong></TableCell>
                          <TableCell><strong>Blood Sugar</strong></TableCell>
                          <TableCell><strong>Recorded By</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vitals.map((vital) => (
                          <TableRow key={vital._id} hover>
                            <TableCell>{formatDateTime(vital.recordedAt)}</TableCell>
                            <TableCell>
                              {vital.bloodPressure?.systolic && vital.bloodPressure?.diastolic
                                ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{vital.pulse || 'N/A'}</TableCell>
                            <TableCell>
                              {vital.temperature
                                ? `${vital.temperature} ${vital.temperatureUnit || '°C'}`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {vital.bloodSugar?.random
                                ? `Random: ${vital.bloodSugar.random}`
                                : vital.bloodSugar?.fasting
                                ? `Fasting: ${vital.bloodSugar.fasting}`
                                : vital.bloodSugar?.postPrandial
                                ? `PP: ${vital.bloodSugar.postPrandial}`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {vital.recordedBy
                                ? `${vital.recordedBy.firstName || ''} ${vital.recordedBy.lastName || ''}`
                                : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default NursePatientDetail;


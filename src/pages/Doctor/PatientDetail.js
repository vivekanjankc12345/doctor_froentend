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
  Assignment,
  LocalHospital,
  History,
  Add,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { patientService } from '../../services/patientService';
import { prescriptionService } from '../../services/prescriptionService';
import { vitalService } from '../../services/vitalService';
import { medicalRecordService } from '../../services/medicalRecordService';
import useApi from '../../hooks/useApi';

const PatientDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apiCall, loading } = useApi();
  const [patient, setPatient] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [loadingVitals, setLoadingVitals] = useState(false);
  const [loadingMedicalRecords, setLoadingMedicalRecords] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPatientDetails();
      fetchPrescriptions();
      fetchVitals();
      fetchMedicalRecords();
    }
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      setError('');
      const response = await apiCall(patientService.getPatientById, id);
      if (response.status === 1) {
        setPatient(response.patient);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch patient details';
      setError(errorMessage);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      setLoadingPrescriptions(true);
      const response = await apiCall(prescriptionService.getPrescriptions, {
        patient: id,
        page: 1,
        limit: 50,
      });
      if (response.status === 1) {
        setPrescriptions(response.prescriptions || []);
      }
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  const fetchVitals = async () => {
    try {
      setLoadingVitals(true);
      const response = await apiCall(vitalService.getPatientVitals, id, {
        page: 1,
        limit: 50,
      });
      if (response.status === 1) {
        setVitals(response.data?.vitals || []);
      }
    } catch (err) {
      console.error('Failed to fetch vitals:', err);
    } finally {
      setLoadingVitals(false);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      setLoadingMedicalRecords(true);
      const response = await apiCall(medicalRecordService.getPatientMedicalRecords, id, {
        page: 1,
        limit: 50,
      });
      if (response.status === 1) {
        setMedicalRecords(response.data?.medicalRecords || []);
      }
    } catch (err) {
      console.error('Failed to fetch medical records:', err);
    } finally {
      setLoadingMedicalRecords(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading && !patient) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!patient) {
    return (
      <DashboardLayout>
        <Box>
          <Alert severity="error">Patient not found</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4} display="flex" alignItems="center" gap={2}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/doctor/patients')}>
            Back
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Patient Details
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Patient Information Card */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {patient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Patient ID: {patient.patientId}
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate(`/doctor/prescriptions/create/${patient._id}`)}
                >
                  Write Prescription
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => navigate(`/doctor/patients/${patient._id}/add-record`)}
                >
                  Add Medical Record
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Age
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {calculateAge(patient.dob)} years
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Gender
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {patient.gender}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {patient.phone}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {patient.email || 'N/A'}
                </Typography>
              </Grid>
              {patient.bloodGroup && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Blood Group
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {patient.bloodGroup}
                  </Typography>
                </Grid>
              )}
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Chip
                  label={patient.type}
                  color={patient.type === 'IPD' ? 'primary' : 'default'}
                  size="small"
                />
              </Grid>
              {patient.department && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Department
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {patient.department}
                  </Typography>
                </Grid>
              )}
              {patient.assignedNurse && (
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="caption" color="text.secondary">
                    Assigned Nurse
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {patient.assignedNurse.firstName} {patient.assignedNurse.lastName}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {patient.address && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body2">
                  {[
                    patient.address.street,
                    patient.address.city,
                    patient.address.state,
                    patient.address.zipCode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Tabs for History */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
              <Tab icon={<LocalHospital />} iconPosition="start" label="Prescriptions" />
              <Tab icon={<History />} iconPosition="start" label="Vitals & Tests" />
              <Tab icon={<History />} iconPosition="start" label="Medical Records" />
            </Tabs>
          </Box>

          <CardContent>
            {activeTab === 0 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Prescription History</Typography>
                </Box>

                {loadingPrescriptions ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : prescriptions.length === 0 ? (
                  <Typography color="text.secondary" align="center" py={4}>
                    No prescriptions found
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Prescription ID</strong></TableCell>
                          <TableCell><strong>Date</strong></TableCell>
                          <TableCell><strong>Medicines</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {prescriptions.map((prescription) => (
                          <TableRow key={prescription._id}>
                            <TableCell>{prescription.prescriptionId}</TableCell>
                            <TableCell>
                              {new Date(prescription.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {prescription.medicines?.length || 0} medicine(s)
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={prescription.status}
                                color={
                                  prescription.status === 'ACTIVE'
                                    ? 'success'
                                    : prescription.status === 'COMPLETED'
                                    ? 'default'
                                    : 'warning'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                onClick={() => navigate(`/doctor/prescriptions/${prescription._id}`)}
                              >
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Vitals & Test History</Typography>
                </Box>

                {loadingVitals ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : vitals.length === 0 ? (
                  <Typography color="text.secondary" align="center" py={4}>
                    No vitals or test records found
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Date</strong></TableCell>
                          <TableCell><strong>Recorded By</strong></TableCell>
                          <TableCell><strong>BP</strong></TableCell>
                          <TableCell><strong>Pulse</strong></TableCell>
                          <TableCell><strong>Blood Sugar</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vitals.map((vital) => (
                          <TableRow key={vital._id}>
                            <TableCell>
                              {new Date(vital.recordedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {vital.recordedBy?.firstName} {vital.recordedBy?.lastName}
                            </TableCell>
                            <TableCell>
                              {vital.bloodPressure?.systolic && vital.bloodPressure?.diastolic
                                ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}`
                                : '-'}
                            </TableCell>
                            <TableCell>{vital.pulse || '-'}</TableCell>
                            <TableCell>
                              {vital.bloodSugar?.fasting
                                ? `F: ${vital.bloodSugar.fasting}`
                                : vital.bloodSugar?.random
                                ? `R: ${vital.bloodSugar.random}`
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Button size="small">View</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Medical Records</Typography>
                </Box>

                {loadingMedicalRecords ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : medicalRecords.length === 0 ? (
                  <Typography color="text.secondary" align="center" py={4}>
                    No medical records found
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Record ID</strong></TableCell>
                          <TableCell><strong>Visit Date</strong></TableCell>
                          <TableCell><strong>Chief Complaint</strong></TableCell>
                          <TableCell><strong>Diagnosis</strong></TableCell>
                          <TableCell><strong>Actions</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {medicalRecords.map((record) => (
                          <TableRow key={record._id}>
                            <TableCell>{record.recordId}</TableCell>
                            <TableCell>
                              {new Date(record.visitDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{record.chiefComplaint || '-'}</TableCell>
                            <TableCell>
                              {record.diagnosis?.length > 0
                                ? record.diagnosis.map((d, i) => (
                                    <Chip key={i} label={d.description} size="small" sx={{ mr: 0.5 }} />
                                  ))
                                : '-'}
                            </TableCell>
                            <TableCell>
                              <Button size="small">View</Button>
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

export default PatientDetail;


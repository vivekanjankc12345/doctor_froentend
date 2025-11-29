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
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  Print,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { prescriptionService } from '../../services/prescriptionService';
import useApi from '../../hooks/useApi';

const PrescriptionDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apiCall, loading } = useApi();
  const [prescription, setPrescription] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchPrescriptionDetails();
    }
  }, [id]);

  const fetchPrescriptionDetails = async () => {
    try {
      setError('');
      const response = await apiCall(prescriptionService.getPrescriptionById, id);
      if (response.status === 1) {
        setPrescription(response.prescription);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch prescription details';
      setError(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'COMPLETED':
        return 'default';
      case 'CANCELLED':
        return 'error';
      case 'DRAFT':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading && !prescription) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (!prescription) {
    return (
      <DashboardLayout>
        <Box>
          <Alert severity="error">Prescription not found</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4} display="flex" alignItems="center" gap={2}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/doctor/prescriptions')}>
            Back
          </Button>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Prescription Details
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Prescription Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Prescription #{prescription.prescriptionId}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(prescription.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Chip
                  label={prescription.status}
                  color={getStatusColor(prescription.status)}
                />
                <Button
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Patient
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {prescription.patient?.name || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {prescription.patient?.patientId || 'N/A'}
                </Typography>
                {prescription.patient?.phone && (
                  <Typography variant="body2" color="text.secondary">
                    Phone: {prescription.patient.phone}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Doctor
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                </Typography>
                {prescription.doctor?.specialization && (
                  <Typography variant="body2" color="text.secondary">
                    {prescription.doctor.specialization}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Medicines */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Medicines
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {prescription.medicines && prescription.medicines.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Medicine Name</strong></TableCell>
                      <TableCell><strong>Dosage</strong></TableCell>
                      <TableCell><strong>Frequency</strong></TableCell>
                      <TableCell><strong>Duration</strong></TableCell>
                      <TableCell><strong>Instructions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prescription.medicines.map((medicine, index) => (
                      <TableRow key={index}>
                        <TableCell>{medicine.name}</TableCell>
                        <TableCell>{medicine.dosage}</TableCell>
                        <TableCell>{medicine.frequency}</TableCell>
                        <TableCell>{medicine.duration}</TableCell>
                        <TableCell>{medicine.instructions || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography color="text.secondary">No medicines found</Typography>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {prescription.notes && (
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Notes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                {prescription.notes}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default PrescriptionDetail;


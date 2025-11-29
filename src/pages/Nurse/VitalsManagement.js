import React, { useEffect, useState } from 'react';
import {
  Box,
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
  TextField,
  InputAdornment,
  TablePagination,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { vitalService } from '../../services/vitalService';
import { patientService } from '../../services/patientService';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';

const VitalsManagement = () => {
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const { user } = useAuth();
  const [vitals, setVitals] = useState([]);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [patientFilter, setPatientFilter] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (patients.length > 0 || patientFilter) {
      fetchVitals();
    }
  }, [page, rowsPerPage, patientFilter, patients.length]);

  const fetchPatients = async () => {
    try {
      const response = await apiCall(patientService.searchPatients, {
        page: 1,
        limit: 100,
        nurse: user?.id, // Filter by assigned nurse
      });
      if (response.status === 1) {
        // Backend already filters by assignedNurse via ABAC, but double-check on frontend
        const allPatients = response.patients || [];
        const nursePatients = allPatients.filter(patient => {
          if (!patient.assignedNurse) return false;
          const nurseId = patient.assignedNurse._id || patient.assignedNurse;
          const userId = user?.id;
          return nurseId?.toString() === userId?.toString();
        });
        setPatients(nursePatients);
      }
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    }
  };

  const fetchVitals = async () => {
    try {
      setError('');
      
      // If patient filter is set, fetch vitals for that patient
      if (patientFilter) {
        const response = await apiCall(vitalService.getPatientVitals, patientFilter, {
          page: page + 1,
          limit: rowsPerPage,
        });
        if (response.status === 1) {
          setVitals(response.vitals || response.data?.vitals || []);
          setTotal(response.pagination?.total || response.data?.pagination?.total || 0);
        }
      } else {
        // Fetch vitals for all assigned patients
        const allVitals = [];
        for (const patient of patients) {
          try {
            const response = await apiCall(vitalService.getPatientVitals, patient._id, {
              page: 1,
              limit: 50,
            });
            if (response.status === 1) {
              allVitals.push(...(response.vitals || response.data?.vitals || []));
            }
          } catch (err) {
            console.error(`Failed to fetch vitals for patient ${patient._id}:`, err);
          }
        }
        // Sort by date, most recent first
        allVitals.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt));
        setVitals(allVitals);
        setTotal(allVitals.length);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch vitals';
      setError(errorMessage);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchVitals();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Vitals & Tests
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Record and view patient vitals and test results
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/nurse/vitals/create')}
          >
            Record Vitals
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Patient</InputLabel>
                  <Select
                    value={patientFilter}
                    onChange={(e) => {
                      setPatientFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All Patients</MenuItem>
                    {patients.map((patient) => (
                      <MenuItem key={patient._id} value={patient._id}>
                        {patient.name} ({patient.patientId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by Patient ID or Name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Search />}
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setSearchTerm('');
                    setPatientFilter('');
                    setPage(0);
                    fetchVitals();
                  }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Vitals Table */}
        <Card>
          <CardContent>
            {loading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Patient</strong></TableCell>
                        <TableCell><strong>BP</strong></TableCell>
                        <TableCell><strong>Pulse</strong></TableCell>
                        <TableCell><strong>Temperature</strong></TableCell>
                        <TableCell><strong>Blood Sugar</strong></TableCell>
                        <TableCell><strong>Recorded By</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {vitals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            <Typography color="text.secondary" py={3}>
                              No vitals records found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        vitals
                          .filter(vital => {
                            if (!searchTerm) return true;
                            const searchLower = searchTerm.toLowerCase();
                            return (
                              vital.patient?.patientId?.toLowerCase().includes(searchLower) ||
                              vital.patient?.name?.toLowerCase().includes(searchLower)
                            );
                          })
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((vital) => (
                            <TableRow key={vital._id} hover>
                              <TableCell>
                                {new Date(vital.recordedAt).toLocaleDateString()}
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {new Date(vital.recordedAt).toLocaleTimeString()}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {vital.patient?.name || 'N/A'}
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {vital.patient?.patientId || ''}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {vital.bloodPressure?.systolic && vital.bloodPressure?.diastolic
                                  ? `${vital.bloodPressure.systolic}/${vital.bloodPressure.diastolic}`
                                  : '-'}
                              </TableCell>
                              <TableCell>{vital.pulse || '-'}</TableCell>
                              <TableCell>
                                {vital.temperature
                                  ? `${vital.temperature}°${vital.temperatureUnit || 'F'}`
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {vital.bloodSugar?.fasting
                                  ? `F: ${vital.bloodSugar.fasting}`
                                  : vital.bloodSugar?.random
                                  ? `R: ${vital.bloodSugar.random}`
                                  : '-'}
                              </TableCell>
                              <TableCell>
                                {vital.recordedBy?.firstName} {vital.recordedBy?.lastName}
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Visibility />}
                                  onClick={() => navigate(`/nurse/vitals/${vital._id}`)}
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

                <TablePagination
                  component="div"
                  count={vitals.filter(vital => {
                    if (!searchTerm) return true;
                    const searchLower = searchTerm.toLowerCase();
                    return (
                      vital.patient?.patientId?.toLowerCase().includes(searchLower) ||
                      vital.patient?.name?.toLowerCase().includes(searchLower)
                    );
                  }).length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[10, 20, 50, 100]}
                />
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default VitalsManagement;


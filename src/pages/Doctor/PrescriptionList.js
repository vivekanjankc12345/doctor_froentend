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
import { prescriptionService } from '../../services/prescriptionService';
import useApi from '../../hooks/useApi';

const PrescriptionList = () => {
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const [prescriptions, setPrescriptions] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, [page, rowsPerPage, statusFilter]);

  const fetchPrescriptions = async () => {
    try {
      setError('');
      const filters = {
        page: page + 1,
        limit: rowsPerPage,
        status: statusFilter || undefined,
      };

      const response = await apiCall(prescriptionService.getPrescriptions, filters);

      if (response.status === 1) {
        setPrescriptions(response.prescriptions || []);
        setTotal(response.pagination?.total || 0);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch prescriptions';
      setError(errorMessage);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchPrescriptions();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Prescriptions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage and view all your prescriptions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/doctor/prescriptions/create')}
          >
            Create Prescription
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
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(0);
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="ACTIVE">Active</MenuItem>
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
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
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setPage(0);
                    fetchPrescriptions();
                  }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Prescriptions Table */}
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
                        <TableCell><strong>Prescription ID</strong></TableCell>
                        <TableCell><strong>Patient</strong></TableCell>
                        <TableCell><strong>Date</strong></TableCell>
                        <TableCell><strong>Medicines</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {prescriptions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="text.secondary" py={3}>
                              No prescriptions found
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        prescriptions.map((prescription) => (
                          <TableRow key={prescription._id} hover>
                            <TableCell>{prescription.prescriptionId}</TableCell>
                            <TableCell>
                              {prescription.patient?.name || 'N/A'}
                              <Typography variant="caption" display="block" color="text.secondary">
                                {prescription.patient?.patientId || ''}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {new Date(prescription.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {prescription.medicines?.length || 0} medicine(s)
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={prescription.status}
                                color={getStatusColor(prescription.status)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Visibility />}
                                onClick={() => navigate(`/doctor/prescriptions/${prescription._id}`)}
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
                  count={total}
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

export default PrescriptionList;


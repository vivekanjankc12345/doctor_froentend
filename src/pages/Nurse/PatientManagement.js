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
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { patientService } from '../../services/patientService';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';

const NursePatientManagement = () => {
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, [page, rowsPerPage]);

  const fetchPatients = async () => {
    try {
      setError('');
      const filters = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        nurse: user?.id, // Filter by assigned nurse - backend will handle this with ABAC
      };

      const response = await apiCall(patientService.searchPatients, filters);

      if (response.status === 1) {
        // Backend already filters by assignedNurse via ABAC, so use all returned patients
        // The ABAC filter ensures only assigned patients are returned
        setPatients(response.patients || []);
        setTotal(response.pagination?.total || 0);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch patients';
      setError(errorMessage);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchPatients();
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
        <Box mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Assigned Patients
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage patients assigned to you
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={8} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search by Patient ID, Name, or Phone"
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
              <Grid item xs={12} sm={4} md={3}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Search />}
                  onClick={handleSearch}
                >
                  Search
                </Button>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => {
                    setSearchTerm('');
                    setPage(0);
                    fetchPatients();
                  }}
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Patients Table */}
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
                        <TableCell><strong>Patient ID</strong></TableCell>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Phone</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Assigned Doctor</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {patients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            <Typography color="text.secondary" py={3}>
                              {searchTerm
                                ? 'No patients found matching your search'
                                : 'No patients assigned to you'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        patients.map((patient) => (
                          <TableRow key={patient._id} hover>
                            <TableCell>{patient.patientId}</TableCell>
                            <TableCell>{patient.name}</TableCell>
                            <TableCell>{patient.phone}</TableCell>
                            <TableCell>
                              <Chip
                                label={patient.type}
                                color={patient.type === 'IPD' ? 'primary' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {patient.assignedDoctor
                                ? `${patient.assignedDoctor.firstName || ''} ${patient.assignedDoctor.lastName || ''}`
                                : 'Not Assigned'}
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Visibility />}
                                onClick={() => navigate(`/nurse/patients/${patient._id}`)}
                                sx={{ mr: 1 }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
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

export default NursePatientManagement;


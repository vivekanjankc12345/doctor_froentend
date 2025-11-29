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
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Refresh,
  Visibility,
  Assignment,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { patientService } from '../../services/patientService';
import { userService } from '../../services/userService';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';

const PatientManagement = () => {
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [nurses, setNurses] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState('');
  const [loadingNurses, setLoadingNurses] = useState(false);

  useEffect(() => {
    fetchPatients();
    fetchNurses();
  }, [page, rowsPerPage]);

  const fetchPatients = async () => {
    try {
      setError('');
      const filters = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        doctor: user?.id, // Filter by assigned doctor
      };

      const response = await apiCall(patientService.searchPatients, filters);

      if (response.status === 1) {
        setPatients(response.patients || []);
        setTotal(response.pagination?.total || 0);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch patients';
      setError(errorMessage);
    }
  };

  const fetchNurses = async () => {
    try {
      setLoadingNurses(true);
      const response = await apiCall(userService.getNurses);

      if (response.status === 1) {
        setNurses(response.nurses || []);
      }
    } catch (err) {
      console.error('Failed to fetch nurses:', err);
    } finally {
      setLoadingNurses(false);
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

  const handleAssignNurse = (patient) => {
    setSelectedPatient(patient);
    setSelectedNurse(patient.assignedNurse?._id || patient.assignedNurse || '');
    setAssignDialogOpen(true);
  };

  const handleAssignConfirm = async () => {
    if (!selectedPatient) return;

    try {
      setError('');
      setSuccess('');
      const response = await apiCall(patientService.updatePatient, selectedPatient._id, {
        assignedNurse: selectedNurse || null,
      });

      if (response.status === 1) {
        setSuccess('Nurse assigned successfully');
        setAssignDialogOpen(false);
        setSelectedPatient(null);
        fetchPatients();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.message || 'Failed to assign nurse');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to assign nurse';
      setError(errorMessage);
    }
  };

  const handleAssignCancel = () => {
    setAssignDialogOpen(false);
    setSelectedPatient(null);
    setSelectedNurse('');
  };

  const handleViewPatient = (patientId) => {
    navigate(`/doctor/patients/${patientId}`);
  };

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1" fontWeight="bold">
            Patient Management
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Search Patients"
                  placeholder="Patient ID, Name, Phone, Email"
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
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  Search
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchPatients}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {loading && patients.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
                        <TableCell><strong>Department</strong></TableCell>
                        <TableCell><strong>Assigned Nurse</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {patients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
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
                            <TableCell>{patient.department || '-'}</TableCell>
                            <TableCell>
                              {patient.assignedNurse
                                ? `${patient.assignedNurse.firstName || ''} ${patient.assignedNurse.lastName || ''}`
                                : 'Not Assigned'}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleViewPatient(patient._id)}
                                title="View Patient"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleAssignNurse(patient)}
                                title="Assign Nurse"
                              >
                                <Assignment />
                              </IconButton>
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
                  rowsPerPageOptions={[10, 20, 50]}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Assign Nurse Dialog */}
        <Dialog
          open={assignDialogOpen}
          onClose={handleAssignCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Assign Nurse to Patient</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Patient: <strong>{selectedPatient?.name}</strong> ({selectedPatient?.patientId})
              </Typography>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Nurse</InputLabel>
                <Select
                  value={selectedNurse}
                  onChange={(e) => setSelectedNurse(e.target.value)}
                  label="Select Nurse"
                  disabled={loadingNurses}
                >
                  <MenuItem value="">None (Unassign)</MenuItem>
                  {nurses.map((nurse) => (
                    <MenuItem key={nurse._id} value={nurse._id}>
                      {nurse.firstName} {nurse.lastName}
                      {nurse.department ? ` - ${nurse.department}` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAssignCancel}>Cancel</Button>
            <Button
              onClick={handleAssignConfirm}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Assign'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default PatientManagement;


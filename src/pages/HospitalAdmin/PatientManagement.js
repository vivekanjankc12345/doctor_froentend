import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
  Paper,
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
} from '@mui/material';
import {
  Add,
  Search,
  Download,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { patientService } from '../../services/patientService';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';

const filterSchema = yup.object().shape({
  search: yup.string(),
  patientType: yup.string(),
  department: yup.string(),
});

const PatientManagement = () => {
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
  const { hasRole } = useAuth();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  // Only RECEPTIONIST can create patients
  const canCreatePatient = hasRole('RECEPTIONIST');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(filterSchema),
    defaultValues: {
      search: '',
      patientType: '',
      department: '',
    },
  });

  const searchValue = watch('search');
  const patientTypeValue = watch('patientType');
  const departmentValue = watch('department');

  useEffect(() => {
    fetchPatients();
  }, [page, rowsPerPage]);

  const fetchPatients = async () => {
    try {
      setError('');
      const filters = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchValue || undefined,
        patientType: patientTypeValue || undefined,
        department: departmentValue || undefined,
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

  const handleSearch = () => {
    setPage(0);
    fetchPatients();
  };

  const handleExport = async () => {
    try {
      setError('');
      const filters = {
        search: searchValue || undefined,
        patientType: patientTypeValue || undefined,
        department: departmentValue || undefined,
      };

      const blob = await apiCall(patientService.exportPatients, filters);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `patients_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccess('Patients exported successfully');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to export patients';
      setError(errorMessage);
    }
  };

  const handleViewPatient = async (patientId) => {
    try {
      const response = await apiCall(patientService.getPatientById, patientId);
      if (response.status === 1) {
        setSelectedPatient(response.patient);
        setViewDialogOpen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patient details');
    }
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
          <Typography variant="h4" component="h1" fontWeight="bold">
            Patient Management
          </Typography>
          {canCreatePatient && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/hospital/patients/create')}
            >
              Register Patient
            </Button>
          )}
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
            <form onSubmit={handleSubmit(handleSearch)}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Search"
                    placeholder="Patient ID, Name, Phone, Email"
                    {...register('search')}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Patient Type"
                    {...register('patientType')}
                    SelectProps={{ native: true }}
                  >
                    <option value="">All Types</option>
                    <option value="OPD">OPD</option>
                    <option value="IPD">IPD</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="Department"
                    {...register('department')}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Search'}
                  </Button>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Download />}
                    onClick={handleExport}
                    disabled={loading}
                  >
                    Export CSV
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Assigned Doctor</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading && patients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : patients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    patients.map((patient) => (
                      <TableRow key={patient._id}>
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
                          {patient.assignedDoctor
                            ? `${patient.assignedDoctor.firstName} ${patient.assignedDoctor.lastName}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleViewPatient(patient._id)}
                          >
                            <Visibility />
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
              rowsPerPageOptions={[10, 20, 50, 100]}
            />
          </CardContent>
        </Card>

        {/* View Patient Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Patient Details</DialogTitle>
          <DialogContent>
            {selectedPatient && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Patient ID
                    </Typography>
                    <Typography variant="body1">{selectedPatient.patientId}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1">{selectedPatient.name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1">
                      {selectedPatient.dob
                        ? new Date(selectedPatient.dob).toLocaleDateString()
                        : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography variant="body1">{selectedPatient.gender}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{selectedPatient.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{selectedPatient.email || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Blood Group
                    </Typography>
                    <Typography variant="body1">{selectedPatient.bloodGroup || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type
                    </Typography>
                    <Chip
                      label={selectedPatient.type}
                      color={selectedPatient.type === 'IPD' ? 'primary' : 'default'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default PatientManagement;


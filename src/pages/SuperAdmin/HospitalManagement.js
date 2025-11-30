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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import {
  MoreVert,
  CheckCircle,
  Cancel,
  Block,
  Search,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  setFilters,
  setPagination,
  setError,
} from '../../store/slices/hospitalSlice';
import useHospital from '../../hooks/useHospital';

const statusColors = {
  PENDING: 'warning',
  VERIFIED: 'info',
  ACTIVE: 'success',
  SUSPENDED: 'error',
  INACTIVE: 'default',
};

const statusLabels = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  ACTIVE: 'Active',
  SUSPENDED: 'Suspended',
  INACTIVE: 'Inactive',
};

// Yup validation schema for filters
const filterSchema = yup.object().shape({
  search: yup.string(),
  status: yup.string().oneOf(['', 'PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'], 'Invalid status'),
});

const HospitalManagement = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { hospitals, pagination, filters, loading, error } = useAppSelector(
    (state) => state.hospital
  );
  const { fetchHospitals, updateHospitalStatus } = useHospital();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [success, setSuccess] = useState('');

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(filterSchema),
    defaultValues: {
      search: filters.search || '',
      status: filters.status || '',
    },
  });

  const searchValue = watch('search');
  const statusValue = watch('status');

  useEffect(() => {
    fetchHospitals({
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      status: filters.status,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        dispatch(setFilters({ search: searchValue }));
        dispatch(setPagination({ page: 1 }));
        fetchHospitals({
          page: 1,
          limit: pagination.limit,
          search: searchValue,
          status: filters.status,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  // Status filter effect
  useEffect(() => {
    if (statusValue !== filters.status) {
      dispatch(setFilters({ status: statusValue }));
      dispatch(setPagination({ page: 1 }));
      fetchHospitals({
        page: 1,
        limit: pagination.limit,
        search: filters.search,
        status: statusValue,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusValue]);

  const onSubmit = (data) => {
    dispatch(setFilters({ search: data.search, status: data.status }));
    dispatch(setPagination({ page: 1 }));
    fetchHospitals({
      page: 1,
      limit: pagination.limit,
      search: data.search,
      status: data.status,
    });
  };

  const handleMenuOpen = (event, hospital) => {
    setAnchorEl(event.currentTarget);
    setSelectedHospital(hospital);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedHospital here - it's needed for the dialog
  };

  const handleStatusChange = (status) => {
    if (!selectedHospital) {
      console.error('No hospital selected');
      return;
    }
    setNewStatus(status);
    setStatusDialogOpen(true);
    setAnchorEl(null); // Close menu but keep selectedHospital
  };

  const confirmStatusChange = async () => {
    if (!selectedHospital || !newStatus) {
      console.error('Missing data:', { selectedHospital, newStatus });
      dispatch(setError('Missing hospital or status information'));
      return;
    }

    try {
      setSuccess('');
      dispatch(setError(null));
      console.log('Updating hospital status:', {
        hospitalId: selectedHospital._id,
        hospitalName: selectedHospital.name,
        currentStatus: selectedHospital.status,
        newStatus: newStatus
      });
      
      await updateHospitalStatus(selectedHospital._id, newStatus);
      
      setSuccess(`Hospital status updated to ${statusLabels[newStatus] || newStatus} successfully`);
      
      // Refresh the hospitals list
      await fetchHospitals({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
      });
      
      setStatusDialogOpen(false);
      setNewStatus('');
      setSelectedHospital(null); // Clear after dialog closes
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      // Error is handled by the hook and will be displayed
      console.error('Error updating hospital status:', err);
      const errorMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to update hospital status';
      dispatch(setError(errorMessage));
    }
  };

  const handleChangePage = (event, newPage) => {
    dispatch(setPagination({ page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    dispatch(setPagination({ limit: newLimit, page: 1 }));
  };

  const handleResetFilters = () => {
    reset({
      search: '',
      status: '',
    });
    dispatch(setFilters({ search: '', status: '' }));
    dispatch(setPagination({ page: 1 }));
    fetchHospitals({
      page: 1,
      limit: pagination.limit,
      search: '',
      status: '',
    });
  };

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Hospital Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Review and manage hospital registrations. Hospitals register publicly and await your approval.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() =>
              fetchHospitals({
                page: pagination.page,
                limit: pagination.limit,
                search: filters.search,
                status: filters.status,
              })
            }
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(setError(null))}>
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
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Search"
                    placeholder="Search by name, email, phone, license, or address..."
                    {...register('search')}
                    error={!!errors.search}
                    helperText={errors.search?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status Filter</InputLabel>
                    <Select
                      {...register('status')}
                      value={statusValue}
                      label="Status Filter"
                      error={!!errors.status}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="VERIFIED">Verified</MenuItem>
                      <MenuItem value="ACTIVE">Active</MenuItem>
                      <MenuItem value="SUSPENDED">Suspended</MenuItem>
                      <MenuItem value="INACTIVE">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box display="flex" gap={1}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<FilterList />}
                      fullWidth
                    >
                      Apply Filters
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleResetFilters}
                      fullWidth
                    >
                      Reset
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {loading && hospitals.length === 0 ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Hospital Name</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Phone</strong></TableCell>
                        <TableCell><strong>License Number</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Registered</strong></TableCell>
                        <TableCell align="right"><strong>Actions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {hospitals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography color="text.secondary" py={3}>
                              {filters.search || filters.status
                                ? 'No hospitals found matching your filters'
                                : 'No hospitals registered yet'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        hospitals.map((hospital) => (
                          <TableRow key={hospital._id} hover>
                            <TableCell>
                              <Typography fontWeight="medium">
                                {hospital.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {hospital.address}
                              </Typography>
                            </TableCell>
                            <TableCell>{hospital.email}</TableCell>
                            <TableCell>{hospital.phone}</TableCell>
                            <TableCell>
                              <Typography variant="body2" fontFamily="monospace">
                                {hospital.licenseNumber}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={statusLabels[hospital.status] || hospital.status}
                                color={statusColors[hospital.status] || 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(hospital.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                onClick={(e) => handleMenuOpen(e, hospital)}
                                size="small"
                                disabled={loading}
                              >
                                <MoreVert />
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
                  count={pagination.total}
                  page={pagination.page - 1}
                  onPageChange={handleChangePage}
                  rowsPerPage={pagination.limit}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                />
              </>
            )}
          </CardContent>
        </Card>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {selectedHospital?.status === 'VERIFIED' && (
            <MenuItem
              onClick={() => handleStatusChange('ACTIVE')}
            >
              <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
              Activate Hospital
            </MenuItem>
          )}
          {selectedHospital?.status === 'ACTIVE' && (
            <MenuItem
              onClick={() => handleStatusChange('SUSPENDED')}
            >
              <Block sx={{ mr: 1, color: 'error.main' }} />
              Suspend
            </MenuItem>
          )}
          {(selectedHospital?.status === 'PENDING' || selectedHospital?.status === 'VERIFIED') && (
            <MenuItem
              onClick={() => handleStatusChange('INACTIVE')}
            >
              <Cancel sx={{ mr: 1, color: 'text.secondary' }} />
              Reject / Deactivate
            </MenuItem>
          )}
          {selectedHospital?.status === 'ACTIVE' && (
            <MenuItem
              onClick={() => handleStatusChange('INACTIVE')}
            >
              <Cancel sx={{ mr: 1, color: 'text.secondary' }} />
              Deactivate
            </MenuItem>
          )}
        </Menu>

        <Dialog 
          open={statusDialogOpen} 
          onClose={() => {
            if (!loading) {
              setStatusDialogOpen(false);
              setSelectedHospital(null);
              setNewStatus('');
            }
          }}
        >
          <DialogTitle>Confirm Status Change</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to change the status of{' '}
              <strong>{selectedHospital?.name || 'this hospital'}</strong> from{' '}
              <strong>{statusLabels[selectedHospital?.status] || selectedHospital?.status || 'current status'}</strong> to{' '}
              <strong>{statusLabels[newStatus] || newStatus}</strong>?
            </Typography>
            {newStatus === 'ACTIVE' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Activating this hospital will allow them to access the system and create users.
              </Alert>
            )}
            {(newStatus === 'INACTIVE' || newStatus === 'SUSPENDED') && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This will prevent the hospital from accessing the system.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setStatusDialogOpen(false);
                setSelectedHospital(null);
                setNewStatus('');
              }} 
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Confirm button clicked', { 
                  selectedHospital: selectedHospital?._id, 
                  newStatus, 
                  loading,
                  hospitalName: selectedHospital?.name 
                });
                if (!loading && selectedHospital && newStatus) {
                  confirmStatusChange();
                } else {
                  console.warn('Button click ignored:', { loading, selectedHospital: !!selectedHospital, newStatus });
                }
              }}
              variant="contained"
              color={newStatus === 'ACTIVE' ? 'success' : newStatus === 'INACTIVE' ? 'error' : 'primary'}
              disabled={loading || !selectedHospital || !newStatus}
              type="button"
            >
              {loading ? <CircularProgress size={20} /> : 'Confirm'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default HospitalManagement;

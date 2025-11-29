import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LocalHospital,
  People,
  Assignment,
  TrendingUp,
  Add,
} from '@mui/icons-material';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';

const StatCard = ({ title, value, icon, color, onClick }) => (
  <Card
    sx={{
      height: '100%',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': onClick
        ? {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          }
        : {},
    }}
    onClick={onClick}
  >
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="text.secondary" gutterBottom variant="h6">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold" color={color}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            borderRadius: '50%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(icon, {
            sx: { fontSize: 40, color: `${color}.main` },
          })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalHospitals: 0,
    activeHospitals: 0,
    pendingHospitals: 0,
    suspendedHospitals: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Note: You'll need to create this endpoint in the backend
      // For now, we'll fetch hospitals and calculate stats
      const response = await hospitalService.getAllHospitals();
      
      if (response.status === 1 && response.data) {
        const hospitals = response.data.hospitals || [];
        setStats({
          totalHospitals: hospitals.length,
          activeHospitals: hospitals.filter((h) => h.status === 'ACTIVE').length,
          pendingHospitals: hospitals.filter((h) => h.status === 'PENDING' || h.status === 'VERIFIED').length,
          suspendedHospitals: hospitals.filter((h) => h.status === 'SUSPENDED').length,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
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

  return (
    <DashboardLayout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Super Admin Dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/hospitals')}
          >
            Manage Hospitals
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Hospitals"
              value={stats.totalHospitals}
              icon={<LocalHospital />}
              color="primary"
              onClick={() => navigate('/hospitals')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Hospitals"
              value={stats.activeHospitals}
              icon={<TrendingUp />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Approval"
              value={stats.pendingHospitals}
              icon={<Assignment />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Suspended"
              value={stats.suspendedHospitals}
              icon={<People />}
              color="error"
            />
          </Grid>
        </Grid>

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Box display="flex" gap={2} mt={2} flexWrap="wrap">
              <Button
                variant="outlined"
                startIcon={<LocalHospital />}
                onClick={() => navigate('/hospitals')}
              >
                View All Hospitals
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;


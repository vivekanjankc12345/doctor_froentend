import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LocalHospital,
  Email,
  Lock,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      console.log('Login result:', result);

      if (result.success) {
        // Get user data and determine redirect based on role
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('User data from localStorage:', userData);
        const roles = userData.roles.map((el)=>el.name) || [];
        console.log('User roles:', roles);
        
        // Helper to check role
        const checkRole = (roleName) => {
          return roles.some(role => 
            role === roleName || role?.name === roleName
          );
        };
        
        // Redirect based on role
        if (checkRole('SUPER_ADMIN')) {
          navigate('/dashboard');
        } else if (checkRole('HOSPITAL_ADMIN')) {
          navigate('/hospital/dashboard');
        } else if (checkRole('DOCTOR')) {
          navigate('/doctor/dashboard');
        } else if (checkRole('PHARMACIST')) {
          navigate('/pharmacist/dashboard');
        } else if (checkRole('RECEPTIONIST')) {
          navigate('/receptionist/dashboard');
        } else if (checkRole('NURSE')) {
          navigate('/nurse/dashboard');
        } else {
          // Default fallback
          navigate('/hospital/dashboard');
        }
      } else {
        setError(result.message || 'Login failed. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LocalHospital
              sx={{
                fontSize: 60,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Hospital Management System
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Default Super Admin Credentials:
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block', mb: 2 }}>
                Email: super@hms.com | Password: Super@123
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/register-hospital')}
                sx={{ mt: 1 }}
              >
                Register Your Hospital
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;


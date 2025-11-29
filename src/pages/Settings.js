import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Notifications,
  Security,
  Language,
  Save,
} from '@mui/icons-material';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode, setDarkMode } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: (() => {
      const saved = localStorage.getItem('emailNotifications');
      return saved ? JSON.parse(saved) : true;
    })(),
    smsNotifications: (() => {
      const saved = localStorage.getItem('smsNotifications');
      return saved ? JSON.parse(saved) : false;
    })(),
    twoFactorAuth: (() => {
      const saved = localStorage.getItem('twoFactorAuth');
      return saved ? JSON.parse(saved) : false;
    })(),
    language: (() => {
      const saved = localStorage.getItem('language');
      return saved || 'en';
    })(),
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  // Sync darkMode with settings
  useEffect(() => {
    setSettings((prev) => ({ ...prev, darkMode }));
  }, [darkMode]);

  const handleSettingChange = (setting) => (event) => {
    const newValue = event.target.checked;
    setSettings({
      ...settings,
      [setting]: newValue,
    });
    
    // Save to localStorage immediately
    localStorage.setItem(setting, JSON.stringify(newValue));
    
    // If it's darkMode, use the theme context
    if (setting === 'darkMode') {
      if (newValue !== darkMode) {
        toggleDarkMode();
      }
    }
  };

  const handleDarkModeChange = (event) => {
    const newValue = event.target.checked;
    setDarkMode(newValue);
    setSettings({
      ...settings,
      darkMode: newValue,
    });
  };

  const handleSave = () => {
    // Save all settings to localStorage
    Object.keys(settings).forEach((key) => {
      if (key !== 'darkMode') {
        localStorage.setItem(key, JSON.stringify(settings[key]));
      }
    });
    
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <DashboardLayout>
      <Box>
        <Box mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your application settings and preferences
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Notifications sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Notifications
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.emailNotifications}
                        onChange={handleSettingChange('emailNotifications')}
                      />
                    }
                    label="Email Notifications"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
                    Receive email notifications for important updates
                  </Typography>
                </Box>
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.smsNotifications}
                        onChange={handleSettingChange('smsNotifications')}
                      />
                    }
                    label="SMS Notifications"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Receive SMS notifications for urgent alerts
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Security sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Security
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.twoFactorAuth}
                        onChange={handleSettingChange('twoFactorAuth')}
                      />
                    }
                    label="Two-Factor Authentication"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Add an extra layer of security to your account
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Appearance Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Language sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Appearance
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={darkMode}
                        onChange={handleDarkModeChange}
                      />
                    }
                    label="Dark Mode"
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                    Switch to dark theme for better viewing in low light conditions
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Account Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Account Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{user?.email || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Username
                    </Typography>
                    <Typography variant="body1">{user?.username || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="outlined"
                      onClick={() => window.location.href = '/profile'}
                    >
                      Edit Profile
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </Box>
      </Box>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default Settings;


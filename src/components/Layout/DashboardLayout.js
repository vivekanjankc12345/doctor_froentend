import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  LocalHospital,
  People,
  Settings,
  Logout,
  Notifications,
  AccountCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';

const drawerWidth = 280;

// Super Admin menu items
const superAdminMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Hospitals', icon: <LocalHospital />, path: '/hospitals' },
  // { text: 'Users', icon: <People />, path: '/users' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

// Hospital Admin menu items
const hospitalAdminMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/hospital/dashboard' },
  { text: 'Users', icon: <People />, path: '/hospital/users' },
  { text: 'Patients', icon: <LocalHospital />, path: '/hospital/patients' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

// Doctor menu items
const doctorMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/doctor/dashboard' },
  { text: 'Patients', icon: <People />, path: '/doctor/patients' },
  { text: 'Prescriptions', icon: <LocalHospital />, path: '/doctor/prescriptions' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

// Pharmacist menu items
const pharmacistMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/pharmacist/dashboard' },
  { text: 'Prescriptions', icon: <LocalHospital />, path: '/pharmacist/prescriptions' },
  { text: 'Patients', icon: <People />, path: '/pharmacist/patients' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

// Receptionist menu items
const receptionistMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/receptionist/dashboard' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

// Nurse menu items
const nurseMenuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/nurse/dashboard' },
  { text: 'Patients', icon: <People />, path: '/nurse/patients' },
  { text: 'Vitals & Tests', icon: <LocalHospital />, path: '/nurse/vitals' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

const DashboardLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isSuperAdmin, hasRole } = useAuth();
  const theme = useMuiTheme();
  
  // Get menu items based on user role
  const getMenuItems = () => {
    if (isSuperAdmin()) return superAdminMenuItems;
    if (hasRole('HOSPITAL_ADMIN')) return hospitalAdminMenuItems;
    if (hasRole('DOCTOR')) return doctorMenuItems;
    if (hasRole('PHARMACIST')) return pharmacistMenuItems;
    if (hasRole('RECEPTIONIST')) return receptionistMenuItems;
    if (hasRole('NURSE')) return nurseMenuItems;
    return hospitalAdminMenuItems; // Default fallback
  };
  
  const menuItems = getMenuItems();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Typography variant="h6" noWrap component="div" fontWeight="bold">
          HMS Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'white' : 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find((item) => location.pathname.startsWith(item.path))?.text || 
             (location.pathname.includes('/profile') ? 'Profile' : 
              location.pathname.includes('/settings') ? 'Settings' : 
              location.pathname.includes('/create') ? 'Create' : 'Dashboard')}
          </Typography>
          <IconButton color="inherit" sx={{ mr: 2 }}>
            <Badge badgeContent={4} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => {
              navigate('/profile');
              handleMenuClose();
            }}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;


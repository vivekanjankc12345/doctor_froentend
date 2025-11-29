import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.status === 1) {
        // Handle roles - can be array of objects or array of IDs
        let roles = response.roles || response.role || [];
        
        // Normalize roles to array format
        if (!Array.isArray(roles)) {
          roles = [roles];
        }

        const userData = {
          id: response.user.id,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          email: response.user.email,
          roles: roles,
          hospital: response.hospital,
          hospitalId: response.hospitalId ? response.hospitalId.toString() : null,
        };

        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
        if (response.hospitalId) {
          localStorage.setItem('hospitalId', response.hospitalId.toString());
        }

        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, data: response };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('hospitalId');
    }
  };

  const isSuperAdmin = () => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => {
      if (typeof role === 'string') {
        return role === 'SUPER_ADMIN';
      }
      if (typeof role === 'object' && role !== null) {
        return role.name === 'SUPER_ADMIN' || role === 'SUPER_ADMIN';
      }
      return false;
    });
  };

  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.some(role => {
      if (typeof role === 'string') {
        return role === roleName;
      }
      if (typeof role === 'object' && role !== null) {
        return role.name === roleName || role === roleName;
      }
      return false;
    });
  };

  const getUserRole = () => {
    if (!user || !user.roles) return null;
    // Return the first role name (users typically have one primary role)
    const role = user.roles[0];
    if (typeof role === 'string') {
      return role;
    }
    if (typeof role === 'object' && role !== null) {
      return role.name;
    }
    return null;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    isSuperAdmin,
    hasRole,
    getUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


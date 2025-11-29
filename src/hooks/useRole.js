import { useState, useCallback, useEffect } from 'react';
import { roleService } from '../services/roleService';
import useApi from './useApi';

const useRole = () => {
  const { apiCall } = useApi();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall(roleService.getAllRoles);

      if (response.status === 1 && response.data) {
        setRoles(response.data.roles || []);
      } else {
        setError(response.message || 'Failed to fetch roles');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to fetch roles';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    fetchRoles,
  };
};

export default useRole;


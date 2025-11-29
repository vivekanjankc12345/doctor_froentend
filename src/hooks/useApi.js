import { useState, useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { updateToken, logout } from '../store/slices/authSlice';
import api from '../services/api';
import API_BASE_URL from '../config/api';
import axios from 'axios';

const useApi = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshAccessToken = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
        withCredentials: true,
      });

      if (response.data.status === 1 && response.data.accessToken) {
        dispatch(updateToken(response.data.accessToken));
        return response.data.accessToken;
      }
      throw new Error('Failed to refresh token');
    } catch (err) {
      dispatch(logout());
      window.location.href = '/login';
      throw err;
    }
  }, [dispatch]);

  const apiCall = useCallback(
    async (apiFunction, ...args) => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiFunction(...args);
        return response;
      } catch (err) {
        // If 401, try to refresh token and retry
        if (err.response?.status === 401 && !err.config?._retry) {
          try {
            const newToken = await refreshAccessToken();
            
            // Retry the original request with new token
            err.config._retry = true;
            err.config.headers.Authorization = `Bearer ${newToken}`;
            const response = await apiFunction(...args);
            return response;
          } catch (refreshErr) {
            const errorMessage =
              refreshErr.response?.data?.message ||
              refreshErr.message ||
              'An error occurred';
            setError(errorMessage);
            throw refreshErr;
          }
        }

        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'An error occurred';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshAccessToken]
  );

  return { apiCall, loading, error, refreshAccessToken };
};

export default useApi;


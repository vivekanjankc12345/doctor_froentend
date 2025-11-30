import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import {
  setHospitals,
  setLoading,
  setError,
  setFilters,
  setPagination,
  updateHospital,
} from '../store/slices/hospitalSlice';
import { hospitalService } from '../services/hospitalService';
import useApi from './useApi';

const useHospital = () => {
  const dispatch = useAppDispatch();
  const { apiCall } = useApi();

  const fetchHospitals = useCallback(
    async (params = {}) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const response = await apiCall(hospitalService.getAllHospitals, params);

        if (response.status === 1 && response.data) {
          dispatch(
            setHospitals({
              hospitals: response.data.hospitals || [],
              pagination: response.data.pagination || {},
            })
          );
          
          // Update filters if provided
          if (params.search !== undefined) {
            dispatch(setFilters({ search: params.search }));
          }
          if (params.status !== undefined) {
            dispatch(setFilters({ status: params.status }));
          }
          
          // Update pagination
          if (params.page !== undefined) {
            dispatch(setPagination({ page: params.page }));
          }
          if (params.limit !== undefined) {
            dispatch(setPagination({ limit: params.limit }));
          }
        } else {
          dispatch(setError(response.message || 'Failed to fetch hospitals'));
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || 'Failed to fetch hospitals';
        dispatch(setError(errorMessage));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [apiCall, dispatch]
  );

  const updateHospitalStatus = useCallback(
    async (id, status) => {
      if (!id || !status) {
        const errorMsg = 'Hospital ID and status are required';
        dispatch(setError(errorMsg));
        throw new Error(errorMsg);
      }

      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        console.log('Calling updateHospitalStatus API:', { id, status });
        const response = await apiCall(
          hospitalService.updateHospitalStatus,
          id,
          status
        );

        console.log('API Response:', response);

        if (response && response.status === 1) {
          // Update the hospital in the store if hospital data is provided
          // Backend returns: { status: 1, message: "...", hospital: {...} }
          if (response.hospital) {
            // Map backend response to match frontend structure
            const updatedHospital = {
              _id: response.hospital.id || response.hospital._id,
              name: response.hospital.name,
              email: response.hospital.email,
              status: response.hospital.status,
              tenantId: response.hospital.tenantId,
            };
            console.log('Updating hospital in store:', updatedHospital);
            dispatch(updateHospital(updatedHospital));
          }
          return response;
        } else {
          const errorMsg = response?.message || response?.error || 'Failed to update hospital status';
          console.error('API returned error:', errorMsg, response);
          dispatch(setError(errorMsg));
          throw new Error(errorMsg);
        }
      } catch (err) {
        console.error('Error in updateHospitalStatus:', err);
        const errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to update hospital status';
        dispatch(setError(errorMessage));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [apiCall, dispatch]
  );

  return {
    fetchHospitals,
    updateHospitalStatus,
  };
};

export default useHospital;


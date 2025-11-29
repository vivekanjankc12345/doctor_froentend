import { useCallback } from 'react';
import { useAppDispatch } from '../store/hooks';
import { setLoading, setError } from '../store/slices/hospitalSlice';
import { userService } from '../services/userService';
import useApi from './useApi';

const useUser = () => {
  const dispatch = useAppDispatch();
  const { apiCall } = useApi();

  const createUser = useCallback(
    async (userData) => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const response = await apiCall(userService.createUser, userData);

        if (response.status === 1) {
          return response;
        } else {
          dispatch(setError(response.message || 'Failed to create user'));
          throw new Error(response.message || 'Failed to create user');
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          'Failed to create user';
        dispatch(setError(errorMessage));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [apiCall, dispatch]
  );

  return {
    createUser,
  };
};

export default useUser;


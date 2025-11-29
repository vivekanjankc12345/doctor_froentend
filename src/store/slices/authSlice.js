import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  accessToken: localStorage.getItem('accessToken') || null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, user } = action.payload;
      state.accessToken = accessToken;
      state.user = user;
      state.isAuthenticated = true;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('hospitalId');
    },
    updateToken: (state, action) => {
      state.accessToken = action.payload;
      if (action.payload) {
        localStorage.setItem('accessToken', action.payload);
      }
    },
  },
});

export const { setCredentials, setLoading, setError, logout, updateToken } = authSlice.actions;
export default authSlice.reducer;


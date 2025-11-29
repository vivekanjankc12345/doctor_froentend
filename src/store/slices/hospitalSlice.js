import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  hospitals: [],
  currentHospital: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {
    search: '',
    status: '',
  },
  loading: false,
  error: null,
};

const hospitalSlice = createSlice({
  name: 'hospital',
  initialState,
  reducers: {
    setHospitals: (state, action) => {
      state.hospitals = action.payload.hospitals || [];
      if (action.payload.pagination) {
        state.pagination = action.payload.pagination;
      }
    },
    setCurrentHospital: (state, action) => {
      state.currentHospital = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateHospital: (state, action) => {
      const hospitalId = action.payload._id || action.payload.id;
      const index = state.hospitals.findIndex(
        (h) => h._id === hospitalId || h._id?.toString() === hospitalId?.toString()
      );
      if (index !== -1) {
        // Update the hospital with new status
        state.hospitals[index] = {
          ...state.hospitals[index],
          ...action.payload,
          _id: state.hospitals[index]._id, // Preserve original _id
        };
      }
    },
  },
});

export const {
  setHospitals,
  setCurrentHospital,
  setLoading,
  setError,
  setFilters,
  setPagination,
  updateHospital,
} = hospitalSlice.actions;
export default hospitalSlice.reducer;


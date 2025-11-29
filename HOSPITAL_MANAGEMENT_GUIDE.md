# Hospital Management System Guide

## Overview
The hospital management system uses React Hook Form, Yup validation, Redux Toolkit, and custom hooks with automatic refresh token handling.

## Architecture

### 1. **Redux Store Structure**
```javascript
// State structure in hospitalSlice
{
  hospitals: [],           // Array of hospital objects
  currentHospital: null,   // Currently selected hospital
  pagination: {
    page: 1,              // Current page number
    limit: 10,            // Items per page
    total: 0,             // Total number of hospitals
    pages: 0              // Total number of pages
  },
  filters: {
    search: '',           // Search query string
    status: ''            // Status filter (PENDING, ACTIVE, etc.)
  },
  loading: false,        // Loading state
  error: null            // Error message
}
```

### 2. **Custom Hook: `useHospital`**

#### Available Functions

##### `fetchHospitals(params)`
Fetches hospitals from the backend with optional filters and pagination.

**Parameters:**
```javascript
{
  page: 1,        // Page number (optional, default: 1)
  limit: 10,      // Items per page (optional, default: 10)
  search: '',     // Search query (optional)
  status: ''      // Status filter (optional)
}
```

**Example Usage:**
```javascript
import useHospital from '../../hooks/useHospital';

const MyComponent = () => {
  const { fetchHospitals } = useHospital();
  
  // Fetch all hospitals (first page, default limit)
  fetchHospitals();
  
  // Fetch with pagination
  fetchHospitals({ page: 2, limit: 25 });
  
  // Fetch with search
  fetchHospitals({ search: 'hospital name' });
  
  // Fetch with status filter
  fetchHospitals({ status: 'ACTIVE' });
  
  // Fetch with all filters
  fetchHospitals({
    page: 1,
    limit: 20,
    search: 'hospital',
    status: 'ACTIVE'
  });
};
```

##### `updateHospitalStatus(id, status)`
Updates the status of a hospital.

**Parameters:**
- `id` (string): Hospital ID
- `status` (string): New status ('ACTIVE', 'SUSPENDED', 'INACTIVE')

**Example Usage:**
```javascript
const { updateHospitalStatus } = useHospital();

// Update hospital status
try {
  await updateHospitalStatus('hospital-id-123', 'ACTIVE');
  console.log('Status updated successfully');
} catch (error) {
  console.error('Failed to update status:', error);
}
```

### 3. **Using Redux State in Components**

```javascript
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setFilters, setPagination } from '../../store/slices/hospitalSlice';

const MyComponent = () => {
  // Access Redux state
  const { hospitals, pagination, filters, loading, error } = useAppSelector(
    (state) => state.hospital
  );
  
  const dispatch = useAppDispatch();
  
  // Update filters
  dispatch(setFilters({ search: 'new search', status: 'ACTIVE' }));
  
  // Update pagination
  dispatch(setPagination({ page: 2, limit: 25 }));
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {hospitals.map(hospital => (
        <div key={hospital._id}>{hospital.name}</div>
      ))}
    </div>
  );
};
```

### 4. **Complete Example: Hospital Management Component**

```javascript
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setFilters, setPagination } from '../../store/slices/hospitalSlice';
import useHospital from '../../hooks/useHospital';

// Validation schema
const filterSchema = yup.object().shape({
  search: yup.string(),
  status: yup.string().oneOf(['', 'PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE']),
});

const HospitalList = () => {
  const dispatch = useAppDispatch();
  const { hospitals, pagination, filters, loading, error } = useAppSelector(
    (state) => state.hospital
  );
  const { fetchHospitals, updateHospitalStatus } = useHospital();

  // React Hook Form
  const { register, handleSubmit, watch, reset } = useForm({
    resolver: yupResolver(filterSchema),
    defaultValues: {
      search: filters.search || '',
      status: filters.status || '',
    },
  });

  const searchValue = watch('search');
  const statusValue = watch('status');

  // Initial load
  useEffect(() => {
    fetchHospitals({
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      status: filters.status,
    });
  }, [pagination.page, pagination.limit]);

  // Debounced search (500ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== filters.search) {
        dispatch(setFilters({ search: searchValue }));
        dispatch(setPagination({ page: 1 }));
        fetchHospitals({
          page: 1,
          limit: pagination.limit,
          search: searchValue,
          status: filters.status,
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Status filter change
  useEffect(() => {
    if (statusValue !== filters.status) {
      dispatch(setFilters({ status: statusValue }));
      dispatch(setPagination({ page: 1 }));
      fetchHospitals({
        page: 1,
        limit: pagination.limit,
        search: filters.search,
        status: statusValue,
      });
    }
  }, [statusValue]);

  // Form submit handler
  const onSubmit = (data) => {
    dispatch(setFilters({ search: data.search, status: data.status }));
    dispatch(setPagination({ page: 1 }));
    fetchHospitals({
      page: 1,
      limit: pagination.limit,
      search: data.search,
      status: data.status,
    });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    dispatch(setPagination({ page: newPage + 1 }));
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    dispatch(setPagination({ limit: newLimit, page: 1 }));
  };

  // Update status handler
  const handleStatusUpdate = async (hospitalId, newStatus) => {
    try {
      await updateHospitalStatus(hospitalId, newStatus);
      // Refresh the list
      fetchHospitals({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div>
      {/* Search and Filter Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('search')} placeholder="Search hospitals..." />
        <select {...register('status')}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button type="submit">Apply Filters</button>
      </form>

      {/* Error Display */}
      {error && <div>Error: {error}</div>}

      {/* Loading State */}
      {loading && <div>Loading...</div>}

      {/* Hospital List */}
      {hospitals.map((hospital) => (
        <div key={hospital._id}>
          <h3>{hospital.name}</h3>
          <p>Email: {hospital.email}</p>
          <p>Status: {hospital.status}</p>
          <button onClick={() => handleStatusUpdate(hospital._id, 'ACTIVE')}>
            Activate
          </button>
        </div>
      ))}

      {/* Pagination */}
      <div>
        <p>Page {pagination.page} of {pagination.pages}</p>
        <p>Total: {pagination.total} hospitals</p>
        <button onClick={() => dispatch(setPagination({ page: pagination.page - 1 }))}>
          Previous
        </button>
        <button onClick={() => dispatch(setPagination({ page: pagination.page + 1 }))}>
          Next
        </button>
      </div>
    </div>
  );
};

export default HospitalList;
```

## Data Flow

1. **Component** calls `fetchHospitals()` from `useHospital` hook
2. **useHospital** hook dispatches `setLoading(true)` to Redux
3. **useApi** hook makes API call via `hospitalService.getAllHospitals()`
4. **API interceptor** adds auth token and handles refresh token if needed
5. **Backend** returns hospitals data with pagination
6. **useHospital** dispatches `setHospitals()` with data
7. **Component** reads updated state from Redux and re-renders

## Refresh Token Handling

The system automatically handles token refresh:
- When API returns 401 (unauthorized)
- `useApi` hook automatically calls refresh token endpoint
- Updates token in Redux store and localStorage
- Retries the original request with new token
- If refresh fails, user is logged out and redirected to login

## Available Hospital Statuses

- `PENDING`: Hospital registered but not verified
- `VERIFIED`: Email verified, waiting for activation
- `ACTIVE`: Hospital is active and operational
- `SUSPENDED`: Temporarily suspended
- `INACTIVE`: Deactivated

## Backend API Endpoints

- `GET /api/admin/hospitals` - Get all hospitals (with pagination, search, status filter)
- `GET /api/admin/hospitals/:id` - Get hospital by ID
- `PUT /api/admin/hospital/status/:id` - Update hospital status

## Best Practices

1. **Always use the hook**: Use `useHospital` hook instead of calling `hospitalService` directly
2. **Use Redux state**: Access hospital data from Redux state, not local component state
3. **Handle loading/error**: Always check `loading` and `error` states from Redux
4. **Debounce search**: Use debouncing for search inputs (already implemented in HospitalManagement)
5. **Update state after mutations**: After updating hospital status, refresh the list


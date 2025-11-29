import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import HospitalManagement from './pages/SuperAdmin/HospitalManagement';
import PublicHospitalRegistration from './pages/Public/HospitalRegistration';
import SuperAdminUserCreation from './pages/SuperAdmin/UserCreation';
import SuperAdminUserManagement from './pages/SuperAdmin/UserManagement';
import HospitalAdminDashboard from './pages/HospitalAdmin/Dashboard';
import HospitalAdminUserManagement from './pages/HospitalAdmin/UserManagement';
import HospitalAdminUserCreation from './pages/HospitalAdmin/UserCreation';
import HospitalAdminUserEdit from './pages/HospitalAdmin/UserEdit';
import PatientManagement from './pages/HospitalAdmin/PatientManagement';
import PatientRegistration from './pages/HospitalAdmin/PatientRegistration';
import DoctorDashboard from './pages/Doctor/Dashboard';
import DoctorPatientManagement from './pages/Doctor/PatientManagement';
import DoctorPatientDetail from './pages/Doctor/PatientDetail';
import DoctorCreatePrescription from './pages/Doctor/CreatePrescription';
import DoctorPrescriptionList from './pages/Doctor/PrescriptionList';
import DoctorPrescriptionDetail from './pages/Doctor/PrescriptionDetail';
import DoctorAddMedicalRecord from './pages/Doctor/AddMedicalRecord';
import PharmacistDashboard from './pages/Pharmacist/Dashboard';
import ReceptionistDashboard from './pages/Receptionist/Dashboard';
import NurseDashboard from './pages/Nurse/Dashboard';
import NursePatientManagement from './pages/Nurse/PatientManagement';
import NursePatientDetail from './pages/Nurse/PatientDetail';
import NurseVitalsManagement from './pages/Nurse/VitalsManagement';
import NurseRecordVitals from './pages/Nurse/RecordVitals';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, loading, user, isSuperAdmin, hasRole } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Determine default route based on user role
  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    if (isSuperAdmin()) return '/dashboard';
    if (hasRole('HOSPITAL_ADMIN')) return '/hospital/dashboard';
    if (hasRole('DOCTOR')) return '/doctor/dashboard';
    if (hasRole('PHARMACIST')) return '/pharmacist/dashboard';
    if (hasRole('RECEPTIONIST')) return '/receptionist/dashboard';
    if (hasRole('NURSE')) return '/nurse/dashboard';
    return '/hospital/dashboard';
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />
        }
      />
      <Route
        path="/register-hospital"
        element={<PublicHospitalRegistration />}
      />
      
      {/* Super Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireSuperAdmin={true}>
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospitals"
        element={
          <ProtectedRoute requireSuperAdmin={true}>
            <HospitalManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute requireSuperAdmin={true}>
            <SuperAdminUserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/create"
        element={
          <ProtectedRoute requireSuperAdmin={true}>
            <SuperAdminUserCreation />
          </ProtectedRoute>
        }
      />
      
      {/* Hospital Admin Routes */}
      <Route
        path="/hospital/dashboard"
        element={
          <ProtectedRoute>
            <HospitalAdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital/users"
        element={
          <ProtectedRoute requiredRoles={['HOSPITAL_ADMIN', 'SUPER_ADMIN']}>
            <HospitalAdminUserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital/users/create"
        element={
          <ProtectedRoute requiredRoles={['HOSPITAL_ADMIN', 'SUPER_ADMIN']}>
            <HospitalAdminUserCreation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital/users/:id/edit"
        element={
          <ProtectedRoute requiredRoles={['HOSPITAL_ADMIN', 'SUPER_ADMIN']}>
            <HospitalAdminUserEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital/patients"
        element={
          <ProtectedRoute>
            <PatientManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hospital/patients/create"
        element={
          <ProtectedRoute>
            <PatientRegistration />
          </ProtectedRoute>
        }
      />
      
      {/* Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients"
        element={
          <ProtectedRoute>
            <DoctorPatientManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients/:id"
        element={
          <ProtectedRoute>
            <DoctorPatientDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions"
        element={
          <ProtectedRoute>
            <DoctorPrescriptionList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions/create"
        element={
          <ProtectedRoute>
            <DoctorCreatePrescription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions/create/:patientId"
        element={
          <ProtectedRoute>
            <DoctorCreatePrescription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/prescriptions/:id"
        element={
          <ProtectedRoute>
            <DoctorPrescriptionDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patients/:patientId/add-record"
        element={
          <ProtectedRoute>
            <DoctorAddMedicalRecord />
          </ProtectedRoute>
        }
      />
      
      {/* Pharmacist Routes */}
      <Route
        path="/pharmacist/dashboard"
        element={
          <ProtectedRoute>
            <PharmacistDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Receptionist Routes */}
      <Route
        path="/receptionist/dashboard"
        element={
          <ProtectedRoute>
            <ReceptionistDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receptionist/patients/create"
        element={
          <ProtectedRoute requiredRoles={['RECEPTIONIST']}>
            <PatientRegistration />
          </ProtectedRoute>
        }
      />
      
      {/* Nurse Routes */}
      <Route
        path="/nurse/dashboard"
        element={
          <ProtectedRoute requiredRoles={['NURSE']}>
            <NurseDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nurse/patients"
        element={
          <ProtectedRoute requiredRoles={['NURSE']}>
            <NursePatientManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nurse/patients/:id"
        element={
          <ProtectedRoute requiredRoles={['NURSE']}>
            <NursePatientDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nurse/vitals"
        element={
          <ProtectedRoute requiredRoles={['NURSE']}>
            <NurseVitalsManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nurse/vitals/create"
        element={
          <ProtectedRoute requiredRoles={['NURSE']}>
            <NurseRecordVitals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nurse/vitals/create/:patientId"
        element={
          <ProtectedRoute requiredRoles={['NURSE']}>
            <NurseRecordVitals />
          </ProtectedRoute>
        }
      />
      
      {/* Profile & Settings - Available to all authenticated users */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}

export default App;


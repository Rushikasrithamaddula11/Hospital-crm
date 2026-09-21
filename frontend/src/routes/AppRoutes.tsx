import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { QRRegistrationPage } from '../pages/QRRegistrationPage';
import { PatientsPage } from '../pages/PatientsPage';
import { PatientDetailPage } from '../pages/PatientDetailPage';
import { AppointmentsPage } from '../pages/AppointmentsPage';
import { DoctorsPage } from '../pages/DoctorsPage';
import { NursesPage } from '../pages/NursesPage';
import { DepartmentsPage } from '../pages/DepartmentsPage';
import { PrescriptionsPage } from '../pages/PrescriptionsPage';
import { LabReportsPage } from '../pages/LabReportsPage';
import { OCRDemoPage } from '../pages/OCRDemoPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { AuditLogsPage } from '../pages/AuditLogsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/user';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const RoleRoute: React.FC<{ allowedRoles: UserRole[]; children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Patients & Details */}
        <Route
          path="/patients"
          element={
            <RoleRoute allowedRoles={['Admin', 'Doctor', 'Nurse']}>
              <PatientsPage />
            </RoleRoute>
          }
        />
        <Route path="/patients/:id" element={<PatientDetailPage />} />

        {/* Admin Patient QR Verification Scanner */}
        <Route
          path="/qr-register"
          element={
            <RoleRoute allowedRoles={['Admin']}>
              <QRRegistrationPage />
            </RoleRoute>
          }
        />

        {/* Appointments */}
        <Route path="/appointments" element={<AppointmentsPage />} />

        {/* Staff Directories */}
        <Route
          path="/doctors"
          element={
            <RoleRoute allowedRoles={['Admin', 'Nurse']}>
              <DoctorsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/nurses"
          element={
            <RoleRoute allowedRoles={['Admin', 'Doctor', 'Nurse']}>
              <NursesPage />
            </RoleRoute>
          }
        />

        {/* Clinical Departments */}
        <Route
          path="/departments"
          element={
            <RoleRoute allowedRoles={['Admin', 'Doctor', 'Nurse']}>
              <DepartmentsPage />
            </RoleRoute>
          }
        />

        {/* Prescriptions & Lab Reports */}
        <Route
          path="/prescriptions"
          element={
            <RoleRoute allowedRoles={['Doctor', 'Patient']}>
              <PrescriptionsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/lab-reports"
          element={
            <RoleRoute allowedRoles={['Doctor', 'Patient']}>
              <LabReportsPage />
            </RoleRoute>
          }
        />

        {/* AI OCR Parser */}
        <Route
          path="/ocr-demo"
          element={
            <RoleRoute allowedRoles={['Admin', 'Doctor']}>
              <OCRDemoPage />
            </RoleRoute>
          }
        />

        {/* System Operations */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route
          path="/analytics"
          element={
            <RoleRoute allowedRoles={['Admin']}>
              <AnalyticsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <RoleRoute allowedRoles={['Admin']}>
              <AuditLogsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <RoleRoute allowedRoles={['Admin']}>
              <SettingsPage />
            </RoleRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

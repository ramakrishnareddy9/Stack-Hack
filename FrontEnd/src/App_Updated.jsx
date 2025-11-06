import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Toaster } from 'react-hot-toast';
import { Box } from '@mui/material';

// Layout Components
import ModernNavbar from './components/ModernNavbar';
import ModernFooter from './components/ModernFooter';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import AdminEvents from './pages/Admin/Events';
import AdminParticipations from './pages/Admin/Participations';
import AdminReports from './pages/Admin/Reports';
import CertificateConfig from './pages/Admin/CertificateConfig';
import ManageStudents from './pages/Admin/ManageStudents';

// Faculty Pages
import FacultyModernDashboard from './pages/Faculty/ModernDashboard';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentEvents from './pages/Student/Events';
import StudentProfile from './pages/Student/Profile';
import CertificatesPage from './pages/CertificatesPage';

// Components
import EvidenceUpload from './components/EvidenceUpload';

// Context
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <Router>
              <Box className="min-h-screen flex flex-col" sx={{ bgcolor: 'background.default' }}>
                <ModernNavbar />
                
                <Box component="main" className="flex-grow">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* Admin Routes */}
                    <Route
                      path="/admin"
                      element={
                        <PrivateRoute roles={['admin', 'faculty']}>
                          <AdminDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin/dashboard"
                      element={
                        <PrivateRoute roles={['admin', 'faculty']}>
                          <AdminDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin/create-event"
                      element={
                        <PrivateRoute roles={['admin', 'faculty']}>
                          <CreateEvent />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin/events"
                      element={
                        <PrivateRoute roles={['admin', 'faculty']}>
                          <AdminEvents />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin/participations"
                      element={
                        <PrivateRoute roles={['admin', 'faculty']}>
                          <AdminParticipations />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin/reports"
                      element={
                        <PrivateRoute roles={['admin', 'faculty']}>
                          <AdminReports />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin/certificates/:eventId"
                      element={
                        <PrivateRoute roles={['admin', 'faculty']}>
                          <CertificateConfig />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin/students"
                      element={
                        <PrivateRoute roles={['admin', 'faculty']}>
                          <ManageStudents />
                        </PrivateRoute>
                      }
                    />
                    
                    {/* Faculty Routes */}
                    <Route
                      path="/faculty/dashboard"
                      element={
                        <PrivateRoute roles={['faculty']}>
                          <FacultyModernDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/faculty"
                      element={
                        <PrivateRoute roles={['faculty']}>
                          <FacultyModernDashboard />
                        </PrivateRoute>
                      }
                    />
                    
                    {/* Student Routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <PrivateRoute roles={['student']}>
                          <StudentDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/events"
                      element={
                        <PrivateRoute>
                          <StudentEvents />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/student/events"
                      element={
                        <PrivateRoute roles={['student']}>
                          <StudentEvents />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/participation/:id/evidence"
                      element={
                        <PrivateRoute roles={['student']}>
                          <EvidenceUpload />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/certificates"
                      element={
                        <PrivateRoute roles={['student']}>
                          <CertificatesPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <StudentProfile />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/student/profile"
                      element={
                        <PrivateRoute roles={['student']}>
                          <StudentProfile />
                        </PrivateRoute>
                      }
                    />
                    
                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/login" />} />
                  </Routes>
                </Box>
                
                <ModernFooter />
              </Box>
              
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 5000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              </Router>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

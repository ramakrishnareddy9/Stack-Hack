import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Toaster } from 'react-hot-toast';
import theme from './theme/muiTheme';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import ManageEvents from './pages/ManageEvents';
import ManageStudents from './pages/ManageStudents';
import Reports from './pages/Reports';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import Events from './pages/Events';
import MyParticipations from './pages/MyParticipations';
import CertificatesPage from './pages/CertificatesPage';
import Profile from './pages/Profile';

// Components
import EvidenceUpload from './components/EvidenceUpload';

// Context
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Box className="min-h-screen flex flex-col bg-gray-50">
                <Navbar />
                
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
                          <ManageEvents />
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
                    <Route
                      path="/admin/reports"
                      element={
                        <PrivateRoute roles={['admin', 'faculty']}>
                          <Reports />
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
                          <Events />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/my-participations"
                      element={
                        <PrivateRoute roles={['student']}>
                          <MyParticipations />
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
                          <Profile />
                        </PrivateRoute>
                      }
                    />
                    
                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/login" />} />
                  </Routes>
                </Box>
                
                <Footer />
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
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;

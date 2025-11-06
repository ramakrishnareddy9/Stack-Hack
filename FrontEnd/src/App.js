import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import theme from './theme/muiTheme';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import StudentDashboard from './pages/StudentDashboard';
import CertificatesPage from './pages/CertificatesPage';
import EvidenceUpload from './components/EvidenceUpload';
// Faculty role removed

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <Router>
              <Box className="min-h-screen flex flex-col" sx={{ bgcolor: 'background.default' }}>
                <Navbar />
                <Box component="main" className="flex-grow">
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
            
                    {/* Admin Routes */}
                    <Route
                      path="/admin/dashboard"
                      element={
                        <PrivateRoute roles={['admin']}>
                          <AdminDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin/events/create"
                      element={
                        <PrivateRoute roles={['admin']}>
                          <CreateEvent />
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
                      path="/certificates"
                      element={
                        <PrivateRoute roles={['student']}>
                          <CertificatesPage />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/evidence/:participationId"
                      element={
                        <PrivateRoute roles={['student']}>
                          <EvidenceUpload />
                        </PrivateRoute>
                      }
                    />

                    <Route path="/" element={<Navigate to="/login" replace />} />
                  </Routes>
                </Box>
                <Footer />
              </Box>
              <Toaster position="top-right" />
            </Router>
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;


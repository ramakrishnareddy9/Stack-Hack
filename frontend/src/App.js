import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Layout/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminEvents from './pages/Admin/Events';
import AdminParticipations from './pages/Admin/Participations';
import AdminReports from './pages/Admin/Reports';
import AIReports from './pages/Admin/AIReports';
import CertificateConfig from './pages/Admin/CertificateConfigNew';
import StudentDashboard from './pages/Student/Dashboard';
import StudentEvents from './pages/Student/Events';
import StudentProfile from './pages/Student/Profile';
import SubmitReport from './pages/Student/SubmitReport';
import MyReports from './pages/Student/MyReports';
import FacultyDashboard from './pages/Faculty/Dashboard';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-gradient-mesh">
              <Navbar />
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
              path="/admin/events"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminEvents />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/participations"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminParticipations />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <PrivateRoute roles={['admin']}>
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
              path="/admin/ai-reports"
              element={
                <PrivateRoute roles={['admin', 'faculty']}>
                  <AIReports />
                </PrivateRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/faculty/dashboard"
              element={
                <PrivateRoute roles={['faculty', 'admin']}>
                  <FacultyDashboard />
                </PrivateRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <PrivateRoute roles={['student']}>
                  <StudentDashboard />
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
              path="/student/profile"
              element={
                <PrivateRoute roles={['student']}>
                  <StudentProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/submit-report/:eventId"
              element={
                <PrivateRoute roles={['student']}>
                  <SubmitReport />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/my-reports"
              element={
                <PrivateRoute roles={['student']}>
                  <MyReports />
                </PrivateRoute>
              }
            />

            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;


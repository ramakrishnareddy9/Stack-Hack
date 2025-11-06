import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Fade,
  Container,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import nssLogo from '../../assets/nss-logo.svg';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        setTimeout(() => {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const role = user.role || 'student';
          navigate(`/${role}/dashboard`);
        }, 100);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-50 via-accent-indigo/10 to-accent-purple/10">
      {/* Animated Background Shapes */}
      <Box className="absolute inset-0 overflow-hidden">
        <Box className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-primary rounded-full opacity-20 blur-3xl animate-float" />
        <Box className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-secondary-400 to-accent-pink rounded-full opacity-20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary-300 to-secondary-300 rounded-full opacity-10 blur-3xl animate-pulse-slow" />
      </Box>

      <Container maxWidth="sm" className="relative z-10 flex items-center justify-center min-h-screen py-12">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <MotionPaper
            elevation={0}
            className="p-8 md:p-10 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {/* Header */}
            <Box className="text-center mb-8">
              <MotionBox
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-block mb-4"
              >
                <img 
                  src={nssLogo} 
                  alt="NSS Logo" 
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    filter: 'drop-shadow(0 10px 20px rgba(99, 102, 241, 0.3))'
                  }} 
                />
              </MotionBox>
              
              <Typography variant="h4" className="font-bold gradient-text mb-2">
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to NSS Portal to continue your journey
              </Typography>
            </Box>

            {/* Error Alert */}
            <Fade in={!!error}>
              <Alert severity="error" className="mb-4 rounded-xl">
                {error}
              </Alert>
            </Fade>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Please enter a valid email'
                  }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon className="text-primary-500" />
                    </InputAdornment>
                  ),
                  className: "rounded-xl"
                }}
                className="bg-white/50 dark:bg-gray-800/50 rounded-xl"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon className="text-primary-500" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        className="text-primary-500"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  className: "rounded-xl"
                }}
                className="bg-white/50 dark:bg-gray-800/50 rounded-xl"
              />

              <Box className="flex items-center justify-between">
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                  Forgot password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                className="mt-6 py-3 bg-gradient-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-glow transform transition-all duration-300 hover:-translate-y-1"
                startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Divider className="my-6">
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            {/* Register Link */}
            <Box className="text-center">
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Sign up now
                </Link>
              </Typography>
            </Box>

            {/* Footer */}
            <Box className="mt-8 text-center">
              <Typography variant="caption" color="text.secondary">
                © 2024 NSS Portal. All rights reserved.
              </Typography>
            </Box>
          </MotionPaper>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Login;


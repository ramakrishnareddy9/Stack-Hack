import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

// Set axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Add token to requests if it exists
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiry
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        const response = await axios.get('/auth/profile');
        if (response.data) {
          setUser(response.data);
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.name);
      
      setUser(user);
      setIsAuthenticated(true);
      
      // Navigate based on role
      if (user.role === 'admin' || user.role === 'faculty') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userName', user.name);
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('Registration successful!');
      window.location.href = '/dashboard';
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
    toast.success('Logged out successfully');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/update-profile', profileData);
      const updatedUser = response.data;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
      return { success: true, user: updatedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

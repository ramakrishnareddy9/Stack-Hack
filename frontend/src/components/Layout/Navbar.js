import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import {
  HomeIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  const getNavLinks = () => {
    if (user?.role === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon },
        { path: '/admin/events', label: 'Events', icon: CalendarIcon },
        { path: '/admin/participations', label: 'Participations', icon: UserIcon },
        { path: '/admin/reports', label: 'Reports', icon: ChartBarIcon },
      ];
    } else if (user?.role === 'faculty') {
      return [
        { path: '/faculty/dashboard', label: 'Dashboard', icon: HomeIcon },
        { path: '/admin/events', label: 'Events', icon: CalendarIcon },
        { path: '/admin/participations', label: 'Participations', icon: UserIcon },
      ];
    } else {
      return [
        { path: '/student/dashboard', label: 'Dashboard', icon: HomeIcon },
        { path: '/student/events', label: 'Events', icon: CalendarIcon },
        { path: '/student/profile', label: 'Profile', icon: UserIcon },
      ];
    }
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">NSS Portal</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {getNavLinks().map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="inline-flex items-center px-3 py-1 mx-1 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50/50 transition-all duration-300 relative group"
                  >
                    <Icon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    {link.label}
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full" />
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user?.role === 'student' && <NotificationBell />}
            <span className="text-sm text-gray-600 font-medium px-3 py-1.5 bg-gray-50 rounded-lg">
              {user?.name} <span className="text-xs text-gray-400">({user?.role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


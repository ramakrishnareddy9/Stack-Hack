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
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary-600">NSS Portal</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {getNavLinks().map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user?.role === 'student' && <NotificationBell />}
            <span className="text-sm text-gray-700">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
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


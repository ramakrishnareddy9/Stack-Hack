import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, participationsRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/participations')
      ]);
      setUser(userRes.data);
      setParticipations(participationsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Volunteer Hours',
      value: user?.totalVolunteerHours || 0,
      icon: ClockIcon,
      color: 'bg-orange-500'
    },
    {
      title: 'Events Participated',
      value: participations.filter(p => p.status !== 'rejected').length,
      icon: CalendarIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'Completed Events',
      value: participations.filter(p => p.status === 'completed').length,
      icon: CheckCircleIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Certificate Eligible',
      value: (user?.totalVolunteerHours || 0) >= 120 ? 'Yes' : 'No',
      icon: DocumentTextIcon,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
        <p className="mt-2 text-gray-600">Track your NSS activities and contributions</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/student/events"
              className="block w-full text-left px-4 py-2 bg-primary-50 hover:bg-primary-100 rounded-md text-primary-700 font-medium"
            >
              Browse Events
            </Link>
            <Link
              to="/student/profile"
              className="block w-full text-left px-4 py-2 bg-primary-50 hover:bg-primary-100 rounded-md text-primary-700 font-medium"
            >
              View My Profile
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Participations</h2>
          <div className="space-y-3">
            {participations.slice(0, 5).map((participation) => (
              <div key={participation._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {participation.event?.title}
                  </p>
                  <p className="text-xs text-gray-500">{participation.status}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  participation.status === 'approved' ? 'bg-green-100 text-green-800' :
                  participation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  participation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {participation.status}
                </span>
              </div>
            ))}
            {participations.length === 0 && (
              <p className="text-gray-500 text-sm">No participations yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;


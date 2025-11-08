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
  const [certificates, setCertificates] = useState([]);
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
      
      // Fetch certificates separately with error handling
      try {
        const certificatesRes = await api.get('/certificates/my-certificates');
        setCertificates(certificatesRes.data);
      } catch (certError) {
        console.error('Failed to fetch certificates:', certError);
        setCertificates([]);
        // Don't show error toast for certificates, just log it
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (cert) => {
    try {
      // Certificate URL is now a full URL from backend
      const response = await fetch(cert.certificate.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate_${cert.event.title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      <div className="mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Welcome back, {user?.name}!</h1>
        <p className="mt-3 text-lg text-gray-600">Track your NSS activities and contributions</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white overflow-hidden shadow-soft hover:shadow-xl rounded-2xl border border-gray-100/50 transition-all duration-300 hover:-translate-y-1 group">
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`${stat.color} rounded-xl p-3.5 bg-gradient-to-br shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900 mt-1">
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
        <div className="bg-white shadow-soft rounded-2xl p-6 border border-gray-100/50 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center">
            <span className="w-1 h-6 bg-primary-500 rounded-full mr-3"></span>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/student/events"
              className="block w-full text-left px-5 py-3.5 bg-gradient-to-r from-primary-50 to-primary-100 hover:from-primary-100 hover:to-primary-200 rounded-xl text-primary-700 font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
            >
              📅 Browse Events
            </Link>
            <Link
              to="/student/profile"
              className="block w-full text-left px-5 py-3.5 bg-gradient-to-r from-secondary-50 to-secondary-100 hover:from-secondary-100 hover:to-secondary-200 rounded-xl text-secondary-700 font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
            >
              👤 View My Profile
            </Link>
          </div>
        </div>

        <div className="bg-white shadow-soft rounded-2xl p-6 border border-gray-100/50 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center">
            <span className="w-1 h-6 bg-secondary-500 rounded-full mr-3"></span>
            Recent Participations
          </h2>
          <div className="space-y-3">
            {participations.slice(0, 5).map((participation) => (
              <div key={participation._id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl hover:from-gray-100 hover:to-gray-200/50 transition-all duration-300">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {participation.event?.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Status: {participation.status}</p>
                </div>
                <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm ${
                  participation.status === 'approved' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800' :
                  participation.status === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800' :
                  participation.status === 'rejected' ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800' :
                  'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800'
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

      {/* My Certificates Section */}
      <div className="mt-8 bg-white shadow-soft rounded-2xl p-7 border border-gray-100/50 hover:shadow-lg transition-shadow duration-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <DocumentTextIcon className="h-6 w-6 text-white" />
          </div>
          My Certificates
        </h2>
        
        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <div key={cert.id} className="border-2 border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:border-purple-200 transition-all duration-300 bg-gradient-to-br from-white to-purple-50/30 group hover:-translate-y-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {new Date(cert.certificate.generatedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {cert.event.title}
                </h3>
                
                <div className="text-sm text-gray-600 mb-3">
                  <p className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {new Date(cert.event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(cert.event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <a
                    href={cert.certificate.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDownloadCertificate(cert)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No certificates yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Certificates will appear here once you complete events and they are issued by organizers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;


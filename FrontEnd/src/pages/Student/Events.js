import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const StudentEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/events', { params });
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await api.post('/participations/register', { eventId });
      toast.success('Registration successful! Waiting for approval.');
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Events</h1>
        <p className="mt-2 text-gray-600">Browse and register for NSS events</p>
      </div>

      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Events</option>
          <option value="published">Published</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event._id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                  {event.eventType}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(new Date(event.startDate), 'MMM dd, yyyy')}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  {event.currentParticipants}/{event.maxParticipants || '∞'} participants
                </div>
              </div>

              <div className="flex space-x-2">
                {event.participationStatus === null && (
                  <button
                    onClick={() => handleRegister(event._id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                  >
                    Register
                  </button>
                )}
                {event.participationStatus === 'pending' && (
                  <span className="flex-1 px-4 py-2 text-sm font-medium text-center text-yellow-800 bg-yellow-100 rounded-md">
                    Pending Approval
                  </span>
                )}
                {event.participationStatus === 'approved' && (
                  <span className="flex-1 px-4 py-2 text-sm font-medium text-center text-green-800 bg-green-100 rounded-md">
                    Approved
                  </span>
                )}
                {event.participationStatus === 'rejected' && (
                  <span className="flex-1 px-4 py-2 text-sm font-medium text-center text-red-800 bg-red-100 rounded-md">
                    Rejected
                  </span>
                )}
                {event.participationStatus === 'completed' && (
                  <span className="flex-1 px-4 py-2 text-sm font-medium text-center text-purple-800 bg-purple-100 rounded-md">
                    Completed
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No events available</p>
        </div>
      )}
    </div>
  );
};

export default StudentEvents;


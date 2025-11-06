import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminParticipations = () => {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchParticipations();
  }, [filter]);

  const fetchParticipations = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/participations', { params });
      setParticipations(response.data);
    } catch (error) {
      toast.error('Failed to fetch participations');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/participations/${id}/approve`);
      toast.success('Participation approved');
      fetchParticipations();
    } catch (error) {
      toast.error('Failed to approve participation');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/participations/${id}/reject`);
      toast.success('Participation rejected');
      fetchParticipations();
    } catch (error) {
      toast.error('Failed to reject participation');
    }
  };

  const handleAttendance = async (id, attended) => {
    try {
      await api.put(`/participations/${id}/attendance`, { attended });
      toast.success(`Attendance ${attended ? 'marked' : 'removed'}`);
      fetchParticipations();
    } catch (error) {
      toast.error('Failed to update attendance');
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
        <h1 className="text-3xl font-bold text-gray-900">Participation Management</h1>
        <p className="mt-2 text-gray-600">Review and manage student participation requests</p>
      </div>

      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="attended">Attended</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {participations.map((participation) => (
            <li key={participation._id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {participation.student?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {participation.student?.email} | {participation.student?.studentId}
                      </p>
                    </div>
                    <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${
                      participation.status === 'approved' ? 'bg-green-100 text-green-800' :
                      participation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      participation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      participation.status === 'attended' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {participation.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-900">
                      <strong>Event:</strong> {participation.event?.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      {participation.event?.eventType} | {participation.event?.location}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Registered: {format(new Date(participation.registeredAt), 'PPP')}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {participation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(participation._id)}
                        className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(participation._id)}
                        className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {participation.status === 'approved' && (
                    <button
                      onClick={() => handleAttendance(participation._id, true)}
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Mark Attendance
                    </button>
                  )}
                  {participation.attendance && (
                    <span className="px-3 py-2 text-sm font-medium text-green-800 bg-green-100 rounded-md">
                      Attended
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {participations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No participations found</p>
        </div>
      )}
    </div>
  );
};

export default AdminParticipations;


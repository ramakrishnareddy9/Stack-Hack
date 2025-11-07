import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentTextIcon,
  CloudArrowDownIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import EventModal from '../../components/Admin/EventModal';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [submissionsModalEvent, setSubmissionsModalEvent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handlePublish = async (id) => {
    try {
      const response = await api.post(`/events/${id}/publish`);
      toast.success('Event published successfully! Notifications sent to all students.');
      fetchEvents();
    } catch (error) {
      console.error('Publish error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to publish event';
      toast.error(errorMessage);
      if (error.response?.status === 403) {
        toast.error(`Access denied. Your role: ${error.response?.data?.userRole || 'unknown'}`);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    fetchEvents();
  };

  const openSubmissionsModal = async (event) => {
    setSubmissionsModalEvent(event);
    setSubmissions([]);
    setSubmissionsLoading(true);
    try {
      const response = await api.get(`/reports/admin/event/${event._id}/submissions`);
      setSubmissions(response.data.reports || []);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch student submissions';
      toast.error(message);
      setSubmissionsModalEvent(null);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const closeSubmissionsModal = () => {
    setSubmissionsModalEvent(null);
    setSubmissions([]);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="mt-2 text-gray-600">Create and manage NSS events</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event._id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.status === 'published' ? 'bg-green-100 text-green-800' :
                  event.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {event.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{event.eventType}</p>
              <p className="text-sm text-gray-500 mb-4">{event.location}</p>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{new Date(event.startDate).toLocaleDateString()}</span>
                <span>{event.currentParticipants}/{event.maxParticipants || '∞'}</span>
              </div>
              <div className="flex space-x-2 mb-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
                {event.status === 'draft' && (
                  <button
                    onClick={() => handlePublish(event._id)}
                    className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    Publish
                  </button>
                )}
                <button
                  onClick={() => handleDelete(event._id)}
                  className="inline-flex justify-center items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              <Link
                to={`/admin/certificates/${event._id}`}
                className="w-full inline-flex justify-center items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                Certificate Config
              </Link>
              <div className="mt-2 grid grid-cols-1 gap-2">
                <button
                  onClick={() => openSubmissionsModal(event)}
                  className="inline-flex justify-center items-center px-3 py-2 border border-emerald-300 shadow-sm text-sm font-medium rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Student Submissions
                </button>
                {event.summaryReport?.url && (
                  <a
                    href={event.summaryReport.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex justify-center items-center px-3 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                  >
                    <CloudArrowDownIcon className="h-4 w-4 mr-1" />
                    View Summary PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No events found. Create your first event!</p>
        </div>
      )}

      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          onClose={handleModalClose}
        />
      )}

      {submissionsModalEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Student Submissions</h2>
                <p className="text-sm text-gray-500">
                  {submissionsModalEvent.title} • {new Date(submissionsModalEvent.startDate).toLocaleDateString()} - {new Date(submissionsModalEvent.endDate).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={closeSubmissionsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {submissionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-sm">No student reports submitted yet for this event.</p>
                </div>
              ) : (
                submissions.map((submission) => (
                  <div key={submission.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{submission.title}</h3>
                        <p className="text-sm text-gray-600">Submitted on {new Date(submission.submittedAt).toLocaleString()}</p>
                      </div>
                      {submission.student && (
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{submission.student.name}</p>
                          <p>{submission.student.email}</p>
                          {submission.student.studentId && <p>ID: {submission.student.studentId}</p>}
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{submission.description}</p>

                    {submission.files.length > 0 ? (
                      <div className="space-y-2">
                        {submission.files.map((file, index) => (
                          <a
                            key={`${submission.id}-file-${index}`}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <span>{file.fileName || `Attachment ${index + 1}`}</span>
                            <CloudArrowDownIcon className="h-5 w-5 text-emerald-600" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No files uploaded for this submission.</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;


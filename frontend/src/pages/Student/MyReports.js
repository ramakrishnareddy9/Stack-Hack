import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  SparklesIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports/student/my-reports');
      setReports(response.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'reviewed':
        return <EyeIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Event Reports</h1>
        <p className="text-gray-600">View your submitted reports and AI-generated analysis</p>
      </div>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">No reports submitted yet</p>
          <p className="text-sm text-gray-400 mb-6">
            Submit a report for events you've attended to see AI-powered analysis
          </p>
          <Link
            to="/student/events"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    {report.event.title}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(report.status)}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
              </div>

              {/* AI Summary */}
              {report.aiSummary && (
                <div className="bg-purple-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <SparklesIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-semibold text-purple-900">AI Summary</span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-3">{report.aiSummary}</p>
                </div>
              )}

              {/* Description Preview */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {report.description}
              </p>

              {/* Files */}
              {report.files && report.files.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <CloudArrowDownIcon className="h-4 w-4" />
                  <span>{report.files.length} file(s) attached</span>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                <span className="text-blue-600 font-medium">Click to view details →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{selectedReport.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedReport.event.title}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Date:</strong> {new Date(selectedReport.event.startDate).toLocaleDateString()} - {new Date(selectedReport.event.endDate).toLocaleDateString()}</p>
                  <p><strong>Location:</strong> {selectedReport.event.location}</p>
                  <p><strong>Submitted:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                  <p><strong>Academic Year:</strong> {selectedReport.academicYear}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedReport.status)}`}>
                  {selectedReport.status}
                </span>
              </div>

              {/* AI Analysis */}
              {selectedReport.aiAnalysis && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <SparklesIcon className="h-6 w-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">AI Analysis</h3>
                  </div>

                  {selectedReport.aiSummary && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                      <p className="text-gray-700">{selectedReport.aiSummary}</p>
                    </div>
                  )}

                  {selectedReport.aiAnalysis.keyPoints && selectedReport.aiAnalysis.keyPoints.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Key Points</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedReport.aiAnalysis.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedReport.aiAnalysis.learnings && selectedReport.aiAnalysis.learnings.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Learnings</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedReport.aiAnalysis.learnings.map((learning, idx) => (
                          <li key={idx} className="text-gray-700">{learning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedReport.aiAnalysis.impact && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Community Impact</h4>
                      <p className="text-gray-700">{selectedReport.aiAnalysis.impact}</p>
                    </div>
                  )}

                  {selectedReport.aiAnalysis.recommendations && selectedReport.aiAnalysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedReport.aiAnalysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Full Report</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.description}</p>
                </div>
              </div>

              {/* Files */}
              {selectedReport.files && selectedReport.files.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Attached Files</h3>
                  <div className="space-y-2">
                    {selectedReport.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg hover:bg-gray-100"
                      >
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <span className="flex-1 text-sm text-gray-700">{file.fileName}</span>
                        <CloudArrowDownIcon className="h-5 w-5 text-blue-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Notes */}
              {selectedReport.reviewNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Review Notes</h3>
                  <p className="text-gray-700">{selectedReport.reviewNotes}</p>
                  {selectedReport.reviewedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Reviewed on {new Date(selectedReport.reviewedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReports;

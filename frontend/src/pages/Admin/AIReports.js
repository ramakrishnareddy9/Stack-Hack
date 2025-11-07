import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  DocumentTextIcon,
  FunnelIcon,
  DocumentChartBarIcon,
  CloudArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const AIReports = () => {
  const [reports, setReports] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [consolidatedReport, setConsolidatedReport] = useState(null);
  
  const [filters, setFilters] = useState({
    eventId: '',
    academicYear: new Date().getFullYear().toString(),
    status: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [reportsRes, eventsRes] = await Promise.all([
        api.get('/reports/admin/all'),
        api.get('/events')
      ]);
      setReports(reportsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.eventId) params.append('eventId', filters.eventId);
      if (filters.academicYear) params.append('academicYear', filters.academicYear);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/reports/admin/all?${params}`);
      setReports(response.data);
    } catch (error) {
      console.error('Fetch reports error:', error);
    }
  };

  const handleGenerateNAAC = async () => {
    if (!filters.academicYear) {
      toast.error('Please select an academic year');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/reports/admin/generate-naac', {
        academicYear: filters.academicYear
      });
      setConsolidatedReport(response.data.report);
      toast.success('NAAC report generated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate NAAC report';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateUGC = async () => {
    if (!filters.academicYear) {
      toast.error('Please select an academic year');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/reports/admin/generate-ugc', {
        academicYear: filters.academicYear
      });
      setConsolidatedReport(response.data.report);
      toast.success('UGC report generated successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to generate UGC report';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  const handleReviewReport = async (reportId, status, notes) => {
    try {
      await api.put(`/reports/admin/review/${reportId}`, {
        status,
        reviewNotes: notes
      });
      toast.success(`Report ${status} successfully`);
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const downloadReport = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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
        <div className="flex items-center gap-3 mb-2">
          <SparklesIcon className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Reports</h1>
        </div>
        <p className="text-gray-600">Manage student reports and generate NAAC/UGC reports with AI</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.academicYear}
            onChange={(e) => setFilters({ ...filters, academicYear: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            <option value="2024">2024-2025</option>
            <option value="2023">2023-2024</option>
            <option value="2022">2022-2023</option>
          </select>

          <select
            value={filters.eventId}
            onChange={(e) => setFilters({ ...filters, eventId: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>{event.title}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button
            onClick={() => setFilters({ eventId: '', academicYear: new Date().getFullYear().toString(), status: '' })}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* AI Report Generation */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <DocumentChartBarIcon className="h-6 w-6 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Generate Consolidated Reports</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Use Gemini AI to analyze all student reports and generate comprehensive NAAC/UGC reports for the selected academic year
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleGenerateNAAC}
            disabled={generating || !filters.academicYear}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <AcademicCapIcon className="h-5 w-5" />
                Generate NAAC Report
              </>
            )}
          </button>
          <button
            onClick={handleGenerateUGC}
            disabled={generating || !filters.academicYear}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <DocumentChartBarIcon className="h-5 w-5" />
                Generate UGC Report
              </>
            )}
          </button>
        </div>
        {filters.academicYear && (
          <p className="text-xs text-gray-600 mt-2">
            Selected Academic Year: {filters.academicYear}-{parseInt(filters.academicYear) + 1}
          </p>
        )}
      </div>

      {/* Consolidated Report View */}
      {consolidatedReport && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {consolidatedReport.reportType} Report - {consolidatedReport.academicYear}
            </h2>
            <button
              onClick={() => downloadReport(
                consolidatedReport.content,
                `${consolidatedReport.reportType}_Report_${consolidatedReport.academicYear}.txt`
              )}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <CloudArrowDownIcon className="h-5 w-5" />
              Download
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{consolidatedReport.totalEvents}</p>
                <p className="text-sm text-gray-600">Events</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{consolidatedReport.totalReports}</p>
                <p className="text-sm text-gray-600">Reports</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">{consolidatedReport.totalStudents}</p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {new Date(consolidatedReport.generatedAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Generated</p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {consolidatedReport.content}
            </pre>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Student Reports ({reports.length})</h2>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reports found for the selected filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {report.student.name} • {report.event.title}
                    </p>
                    {report.aiSummary && (
                      <div className="bg-purple-50 rounded p-2 mb-2">
                        <p className="text-xs text-gray-700 line-clamp-2">
                          <SparklesIcon className="h-3 w-3 inline mr-1 text-purple-600" />
                          {report.aiSummary}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      <span>Academic Year: {report.academicYear}</span>
                      {report.files && report.files.length > 0 && (
                        <span>{report.files.length} file(s)</span>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    report.status === 'approved' ? 'bg-green-100 text-green-800' :
                    report.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
              {/* Student & Event Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Student</h3>
                  <p className="text-sm">{selectedReport.student.name}</p>
                  <p className="text-xs text-gray-600">{selectedReport.student.email}</p>
                  {selectedReport.student.studentId && (
                    <p className="text-xs text-gray-600">ID: {selectedReport.student.studentId}</p>
                  )}
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Event</h3>
                  <p className="text-sm">{selectedReport.event.title}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(selectedReport.event.startDate).toLocaleDateString()} - {new Date(selectedReport.event.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* AI Analysis */}
              {selectedReport.aiAnalysis && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <SparklesIcon className="h-6 w-6 text-purple-600" />
                    <h3 className="text-lg font-bold">AI Analysis</h3>
                  </div>
                  {selectedReport.aiSummary && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <p className="text-gray-700">{selectedReport.aiSummary}</p>
                    </div>
                  )}
                  {selectedReport.aiAnalysis.keyPoints?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Key Points</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedReport.aiAnalysis.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-gray-700">{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Full Report</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.description}</p>
                </div>
              </div>

              {/* Files */}
              {selectedReport.files?.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Attached Files</h3>
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
                        <span className="flex-1 text-sm">{file.fileName}</span>
                        <CloudArrowDownIcon className="h-5 w-5 text-blue-600" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Actions */}
              {selectedReport.status !== 'approved' && selectedReport.status !== 'rejected' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReviewReport(selectedReport._id, 'approved', 'Report approved by admin')}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReviewReport(selectedReport._id, 'rejected', 'Report needs revision')}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIReports;

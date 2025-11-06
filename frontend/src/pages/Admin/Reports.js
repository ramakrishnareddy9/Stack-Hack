import React, { useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { DocumentArrowDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const AdminReports = () => {
  const [year, setYear] = useState(new Date().getFullYear());

  const downloadEventReport = async (eventId) => {
    try {
      const response = await api.get(`/reports/event/${eventId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event-report-${eventId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Event report downloaded');
    } catch (error) {
      toast.error('Failed to download event report');
    }
  };

  const downloadAnnualSummary = async (format) => {
    try {
      const response = await api.get(`/reports/annual-summary?year=${year}&format=${format}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      link.setAttribute('download', `nss-annual-summary-${year}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Annual summary downloaded (${format.toUpperCase()})`);
    } catch (error) {
      toast.error('Failed to download annual summary');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports & Certificates</h1>
        <p className="mt-2 text-gray-600">Generate and download reports and certificates</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Annual Summary</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => downloadAnnualSummary('pdf')}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Download PDF
            </button>
            <button
              onClick={() => downloadAnnualSummary('excel')}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Download Excel
            </button>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Info</h2>
          <p className="text-gray-600 mb-4">
            Generate comprehensive annual summaries including:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Total events and participants</li>
            <li>Volunteer hours statistics</li>
            <li>Events by type breakdown</li>
            <li>Top volunteers list</li>
            <li>Student participation details</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;


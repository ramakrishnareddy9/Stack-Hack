import React, { useEffect, useState, useRef } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { usePdfParser } from '../../hooks/usePdfParser';

const AdminParticipations = () => {
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [attendanceData, setAttendanceData] = useState({}); // Map of regNo -> attendance percentage
  const [fileUploaded, setFileUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoProcessed, setAutoProcessed] = useState(false); // Flag to prevent re-processing
  const [editingId, setEditingId] = useState(null); // Track which participation is being edited
  const fileInputRef = useRef(null);
  const { parsePdf } = usePdfParser();

  useEffect(() => {
    fetchParticipations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Auto-match students when attendance data is loaded and auto-approve/reject
  useEffect(() => {
    if (fileUploaded && Object.keys(attendanceData).length > 0 && participations.length > 0 && !autoProcessed) {
      autoProcessPendingStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendanceData, fileUploaded, participations.length]);

  // Automatically approve/reject students based on attendance
  const autoProcessPendingStudents = async () => {
    const pendingStudents = participations.filter(p => p.status === 'pending');
    
    if (pendingStudents.length === 0) {
      setAutoProcessed(true);
      return;
    }
    
    setAutoProcessed(true); // Set flag to prevent re-processing
    
    const processPromises = [];
    
    for (const participation of pendingStudents) {
      const attendancePercent = getStudentAttendance(participation.student?.studentId);
      
      if (attendancePercent !== null) {
        // Auto-approve if >= 75%, auto-reject if < 75%
        if (attendancePercent >= 75) {
          processPromises.push(
            api.put(`/participations/${participation._id}/approve`)
              .then(() => {
                console.log(`Auto-approved ${participation.student?.studentId} (${attendancePercent}%)`);
              })
              .catch(error => {
                console.error(`Failed to auto-approve ${participation._id}:`, error);
              })
          );
        } else {
          processPromises.push(
            api.put(`/participations/${participation._id}/reject`)
              .then(() => {
                console.log(`Auto-rejected ${participation.student?.studentId} (${attendancePercent}%)`);
              })
              .catch(error => {
                console.error(`Failed to auto-reject ${participation._id}:`, error);
              })
          );
        }
      }
    }
    
    // Wait for all requests to complete
    if (processPromises.length > 0) {
      await Promise.all(processPromises);
      // Refresh participations after processing
      setTimeout(() => {
        fetchParticipations();
      }, 500);
    }
  };

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


  // Process Excel files
  const handleExcelFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      setUploading(true);
      setUploadProgress(0);

      setTimeout(() => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          processExcelDataInChunks(jsonData);
        } catch (error) {
          console.error('Error processing file:', error);
          toast.error('Error processing file. Please check the format.');
          setUploading(false);
        }
      }, 100);
    };

    reader.readAsArrayBuffer(file);
  };

  // Process Excel data in chunks
  const processExcelDataInChunks = (data) => {
    const studentsData = {};
    const CHUNK_SIZE = 1000;

    // Find header row
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(100, data.length); i++) {
      const row = data[i];
      if (Array.isArray(row)) {
        const rowString = row.join(' ').toUpperCase();
        if (rowString.includes('REGD') && rowString.includes('TOTAL')) {
          headerRowIndex = i;
          break;
        }
      }
    }

    if (headerRowIndex === -1) {
      toast.error('Could not find header row with REGD and TOTAL %');
      setUploading(false);
      return;
    }

    const headers = data[headerRowIndex];
    const regdIndex = headers.findIndex(col =>
      String(col).toUpperCase().includes('REGD')
    );
    const totalIndex = headers.findIndex(col =>
      String(col).toUpperCase().includes('TOTAL')
    );

    if (regdIndex === -1 || totalIndex === -1) {
      toast.error('Could not find REGD or TOTAL columns');
      setUploading(false);
      return;
    }

    const processChunk = (startIndex) => {
      const endIndex = Math.min(startIndex + CHUNK_SIZE, data.length);

      for (let i = startIndex; i < endIndex; i++) {
        if (i <= headerRowIndex) continue;

        const row = data[i];
        if (!row || row.length === 0) continue;

        const regNo = row[regdIndex];
        const totalPercent = row[totalIndex];

        if (!regNo || totalPercent === undefined || totalPercent === null) continue;

        // Normalize registration number: handle both string and number types
        // Convert to string, trim, lowercase, remove all spaces and special characters that might cause issues
        let regNoStr = String(regNo).trim();
        // Remove any non-alphanumeric characters except common separators, then normalize
        regNoStr = regNoStr.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
        
        if (regNoStr) {
          studentsData[regNoStr] = parseFloat(totalPercent) || 0;
        }

        if (i % 100 === 0) {
          setUploadProgress(Math.round(((i - headerRowIndex) / (data.length - headerRowIndex)) * 100));
        }
      }

      if (endIndex < data.length) {
        setTimeout(() => processChunk(endIndex), 50);
      } else {
        setAttendanceData(studentsData);
        setUploading(false);
        setUploadProgress(100);
        setFileUploaded(true);
        setAutoProcessed(false); // Reset flag so auto-processing can run
        toast.success(`Successfully loaded attendance for ${Object.keys(studentsData).length} students`);
      }
    };

    processChunk(headerRowIndex + 1);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Please use files smaller than 50MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setFileUploaded(false);
    setAttendanceData({});
    setAutoProcessed(false); // Reset flag for new file

    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls')) {
        handleExcelFile(file);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        setUploading(true);
        try {
          await parsePdf(file);
          toast.error('PDF parsing is supported but Excel files are recommended for better accuracy.');
          setUploading(false);
        } catch (error) {
          console.error('PDF parsing error:', error);
          toast.error('Error parsing PDF. Please use Excel format for better results.');
          setUploading(false);
        }
      } else {
        toast.error('Please upload either Excel (.xlsx, .xls) or PDF file');
        setUploading(false);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing file. Please check the format.');
      setUploading(false);
    }
  };

  const clearAttendanceFile = () => {
    setAttendanceData({});
    setFileUploaded(false);
    setAutoProcessed(false); // Reset flag when clearing file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success('Attendance file cleared');
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/participations/${id}/approve`);
      toast.success('Participation approved');
      setEditingId(null); // Reset editing state
      fetchParticipations();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      console.error('Approve error details:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        id
      });
      toast.error(`Failed to approve: ${errorMessage}`);
      setEditingId(null); // Reset editing state even on error
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/participations/${id}/reject`);
      toast.success('Participation rejected');
      setEditingId(null); // Reset editing state
      fetchParticipations();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      console.error('Reject error details:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        id
      });
      toast.error(`Failed to reject: ${errorMessage}`);
      setEditingId(null); // Reset editing state even on error
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

  // Get attendance for a student
  const getStudentAttendance = (studentId) => {
    if (!studentId || !fileUploaded) return null;
    // Normalize studentId: same normalization as attendance file processing
    // Convert to string, trim, lowercase, remove all spaces and special characters
    let normalizedStudentId = String(studentId).trim();
    normalizedStudentId = normalizedStudentId.toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '');
    
    if (!normalizedStudentId) return null;
    
    // First try exact match
    if (attendanceData[normalizedStudentId] !== undefined) {
      return attendanceData[normalizedStudentId];
    }
    
    // If exact match not found, try partial match (check if studentId is a suffix of any registration number)
    // Example: studentId "c33" should match "231fa04c33" in attendance file
    // Prioritize endsWith for better accuracy (studentId is typically the last part of registration number)
    let matchedAttendance = null;
    for (const [regNo, attendance] of Object.entries(attendanceData)) {
      // First check if registration number ends with studentId (most common case)
      if (regNo.endsWith(normalizedStudentId)) {
        matchedAttendance = attendance;
        break; // Take the first match
      }
    }
    
    // If endsWith didn't find a match, try contains (but only if studentId is at least 3 characters to avoid false matches)
    if (!matchedAttendance && normalizedStudentId.length >= 3) {
      for (const [regNo, attendance] of Object.entries(attendanceData)) {
        if (regNo.includes(normalizedStudentId)) {
          matchedAttendance = attendance;
          break;
        }
      }
    }
    
    return matchedAttendance;
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

      {/* Global Attendance File Upload Section */}
      <div className="mb-6 bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Attendance File</h2>
        <div className="flex items-center gap-4">
          <input
            type="file"
            accept=".xlsx,.xls,.pdf"
            onChange={handleFileUpload}
            ref={fileInputRef}
            disabled={uploading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
          />
          {fileUploaded && (
            <button
              onClick={clearAttendanceFile}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Clear File
            </button>
          )}
        </div>
        {uploading && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Processing file... {uploadProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
        {fileUploaded && !uploading && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium">
              ✓ Attendance file loaded successfully ({Object.keys(attendanceData).length} students)
            </p>
            <p className="text-xs text-green-700 mt-1">
              Registration numbers are normalized (lowercase, spaces removed) for matching with student IDs.
            </p>
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Upload an Excel file (.xlsx, .xls) containing student attendance. The file should have REGD and TOTAL % columns.
        </p>
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
          {participations.map((participation) => {
            const attendancePercent = getStudentAttendance(participation.student?.studentId);
            return (
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
                      <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${participation.status === 'approved' ? 'bg-green-100 text-green-800' :
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
                      {/* Display Attendance Percentage */}
                      {fileUploaded && (
                        <div className="mt-2">
                          {attendancePercent !== null ? (
                            <div className={`inline-flex items-center px-3 py-1 rounded-md border ${
                              attendancePercent >= 75 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <span className={`text-sm font-medium ${
                                attendancePercent >= 75 ? 'text-green-900' : 'text-red-900'
                              }`}>
                                Attendance: <strong>{attendancePercent}%</strong>
                                {participation.status === 'pending' && attendancePercent !== null && (
                                  <span className="ml-2 text-xs opacity-75">
                                    (Will {attendancePercent >= 75 ? 'auto-approve' : 'auto-reject'})
                                  </span>
                                )}
                              </span>
                            </div>
                          ) : participation.status === 'pending' ? (
                            <div className="inline-flex items-center px-3 py-1 rounded-md bg-yellow-50 border border-yellow-200">
                              <span className="text-sm font-medium text-yellow-900">
                                ⚠ Attendance not found in file
                              </span>
                            </div>
                          ) : null}
                        </div>
                      )}
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
                    {(participation.status === 'approved' || participation.status === 'rejected' || participation.status === 'attended') && fileUploaded && (
                      <>
                        {editingId === participation._id ? (
                          // Show Approve/Reject buttons when editing
                          <>
                            <button
                              onClick={() => {
                                handleApprove(participation._id);
                                setEditingId(null);
                              }}
                              className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                handleReject(participation._id);
                                setEditingId(null);
                              }}
                              className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          // Show Edit button
                          <button
                            onClick={() => setEditingId(participation._id)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300"
                            title="Edit status"
                          >
                            Edit
                          </button>
                        )}
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
            );
          })}
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

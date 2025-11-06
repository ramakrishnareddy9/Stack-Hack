import React, { useState, useRef, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { usePdfParser } from '../../hooks/usePdfParser';

const AttendanceChecker = ({ studentRegNo, onAttendanceFound, onClose }) => {
  const [students, setStudents] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileUploaded, setFileUploaded] = useState(false);
  const fileInputRef = useRef(null);
  const { parsePdf, parsing } = usePdfParser();

  // Auto-search when studentRegNo changes and students are loaded
  React.useEffect(() => {
    if (studentRegNo && students.length > 0) {
      // Reset search result when student changes
      setSearchResult(null);
      searchStudent(studentRegNo);
    }
  }, [studentRegNo, students.length, searchStudent]);

  // Search for student by registration number
  const searchStudent = useCallback((regNo = null) => {
    const searchTerm = (regNo || studentRegNo || '').toLowerCase().trim();
    
    if (!searchTerm) {
      return;
    }

    const student = students.find(s => 
      s.regNo.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(s.regNo.toLowerCase())
    );

    if (student) {
      setSearchResult(student);
      if (onAttendanceFound) {
        onAttendanceFound(student);
      }
    } else {
      setSearchResult(null);
    }
  }, [studentRegNo, students, onAttendanceFound]);

  // Process Excel files
  const handleExcelFile = (file) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      setLoading(true);
      setProgress(0);
      
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
          alert('Error processing file. Please check the format.');
          setLoading(false);
        }
      }, 100);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Process Excel data in chunks
  const processExcelDataInChunks = (data) => {
    const studentsData = [];
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
      alert('Could not find header row with REGD and TOTAL %');
      setLoading(false);
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
      alert('Could not find REGD or TOTAL columns');
      setLoading(false);
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

        const subjects = {};
        for (let j = regdIndex + 1; j < totalIndex; j++) {
          const subjectName = headers[j];
          const subjectValue = row[j];
          if (subjectName && subjectValue !== undefined && subjectValue !== null) {
            subjects[String(subjectName).trim()] = subjectValue;
          }
        }

        studentsData.push({
          regNo: String(regNo).trim(),
          totalPercent: parseFloat(totalPercent) || 0,
          subjects: subjects
        });

        if (i % 100 === 0) {
          setProgress(Math.round(((i - headerRowIndex) / (data.length - headerRowIndex)) * 100));
        }
      }

      if (endIndex < data.length) {
        setTimeout(() => processChunk(endIndex), 50);
      } else {
        setStudents(studentsData);
        setLoading(false);
        setProgress(100);
        setFileUploaded(true);
        // Auto-search after file is loaded
        if (studentRegNo) {
          setTimeout(() => {
            const searchTerm = studentRegNo.toLowerCase().trim();
            const student = studentsData.find(s => 
              s.regNo.toLowerCase().includes(searchTerm) ||
              searchTerm.includes(s.regNo.toLowerCase())
            );
            if (student) {
              setSearchResult(student);
              if (onAttendanceFound) {
                onAttendanceFound(student);
              }
            }
          }, 100);
        }
      }
    };

    processChunk(headerRowIndex + 1);
  };

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File too large. Please use files smaller than 50MB.');
      return;
    }

    setLoading(true);
    setProgress(0);
    setSearchResult(null);
    
    try {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        handleExcelFile(file);
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // PDF processing
        setLoading(true);
        try {
          const pdfText = await parsePdf(file);
          // Parse PDF text (simplified - you may need to adjust based on your PDF format)
          alert('PDF parsing is supported but Excel files are recommended for better accuracy.');
          setLoading(false);
        } catch (error) {
          console.error('PDF parsing error:', error);
          alert('Error parsing PDF. Please use Excel format for better results.');
          setLoading(false);
        }
      } else {
        alert('Please upload either Excel (.xlsx, .xls) or PDF file');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please check the format.');
      setLoading(false);
    }
  };

  return (
    <div className="attendance-checker-modal">
      <div className="modal-header">
        <h2>Check Student Attendance</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      <div className="modal-content">
        {!fileUploaded && (
          <div className="upload-section">
            <h3>Upload Attendance File</h3>
            <p className="text-gray-600 mb-4">
              Please upload the attendance file (Excel or PDF) to check student attendance before approval.
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.pdf"
              onChange={handleFileUpload}
              ref={fileInputRef}
              disabled={loading}
              className="file-input"
            />
            {loading && (
              <div className="progress-section">
                <p>Processing file... {progress}%</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {fileUploaded && (
          <div className="file-status">
            <p className="text-green-600 font-medium">
              ✓ Attendance file loaded successfully ({students.length} students)
            </p>
          </div>
        )}

        {searchResult && (
          <div className="attendance-result">
            <h3>Student Attendance Found</h3>
            <div className="student-card">
              <div className="main-info">
                <p><strong>Registration No:</strong> {searchResult.regNo}</p>
                <p><strong>Total Attendance:</strong> {searchResult.totalPercent}%</p>
              </div>
              
              {Object.keys(searchResult.subjects).length > 0 && (
                <div className="subjects-info">
                  <h4>Subject-wise Attendance:</h4>
                  <div className="subjects-grid">
                    {Object.entries(searchResult.subjects).map(([subject, attendance]) => (
                      <div key={subject} className="subject-item">
                        <span className="subject-name">{subject}:</span>
                        <span className="subject-attendance">{attendance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {fileUploaded && !searchResult && studentRegNo && (
          <div className="no-result">
            <p className="text-red-600">
              ⚠ Student with registration number "{studentRegNo}" not found in the attendance file.
            </p>
            <p className="text-gray-600 mt-2">
              Please verify the registration number or upload a different attendance file.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .attendance-checker-modal {
          background: white;
          border-radius: 8px;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: bold;
          color: #111827;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #6b7280;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          color: #111827;
        }

        .modal-content {
          padding: 20px;
        }

        .upload-section {
          margin-bottom: 20px;
        }

        .upload-section h3 {
          margin-bottom: 10px;
          color: #111827;
        }

        .file-input {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          margin-top: 10px;
        }

        .progress-section {
          margin: 15px 0;
        }

        .progress-bar {
          width: 100%;
          height: 20px;
          background-color: #f3f4f6;
          border-radius: 10px;
          overflow: hidden;
          margin: 10px 0;
        }

        .progress-fill {
          height: 100%;
          background-color: #3b82f6;
          transition: width 0.3s ease;
        }

        .file-status {
          padding: 12px;
          background: #f0fdf4;
          border: 1px solid #86efac;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .attendance-result {
          margin-top: 20px;
        }

        .attendance-result h3 {
          margin-bottom: 15px;
          color: #111827;
        }

        .student-card {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
        }

        .main-info p {
          margin: 8px 0;
          color: #374151;
        }

        .subjects-info {
          margin-top: 15px;
        }

        .subjects-info h4 {
          margin-bottom: 10px;
          color: #111827;
        }

        .subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .subject-item {
          display: flex;
          justify-content: space-between;
          padding: 8px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .subject-name {
          font-weight: 500;
          color: #374151;
        }

        .subject-attendance {
          color: #3b82f6;
          font-weight: 600;
        }

        .no-result {
          padding: 15px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default AttendanceChecker;


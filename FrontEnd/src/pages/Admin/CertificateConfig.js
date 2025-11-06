import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker - use local worker file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

export default function CertificateConfig() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [templateFile, setTemplateFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  
  // Field coordinates
  const [fields, setFields] = useState({
    name: { x: 0, y: 0, fontSize: 24, color: '#000000' },
    eventName: { x: 0, y: 0, fontSize: 20, color: '#000000' },
    date: { x: 0, y: 0, fontSize: 18, color: '#000000' }
  });
  
  const [activeField, setActiveField] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [autoSend, setAutoSend] = useState(true);

  useEffect(() => {
    fetchEventConfig();
  }, [eventId]);

  const fetchEventConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/certificates/config/${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setEvent({
        id: eventId,
        title: response.data.eventTitle,
        endDate: response.data.endDate
      });
      
      if (response.data.certificate) {
        if (response.data.certificate.fields) {
          setFields(response.data.certificate.fields);
          // Set markers from saved fields
          const savedMarkers = [];
          Object.entries(response.data.certificate.fields).forEach(([key, value]) => {
            if (value.x !== undefined && value.y !== undefined) {
              savedMarkers.push({
                field: key,
                x: value.x,
                y: value.y,
                label: key.charAt(0).toUpperCase() + key.slice(1)
              });
            }
          });
          setMarkers(savedMarkers);
        }
        if (response.data.certificate.autoSend !== undefined) {
          setAutoSend(response.data.certificate.autoSend);
        }
        if (response.data.certificate.templateUrl) {
          setPdfUrl(`http://localhost:5000${response.data.certificate.templateUrl}`);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching event config:', error);
      toast.error('Failed to load event configuration');
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setTemplateFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
    } else {
      toast.error('Please select a valid PDF file');
    }
  };

  const handleUploadTemplate = async () => {
    if (!templateFile) {
      toast.error('Please select a PDF template first');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('template', templateFile);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/certificates/config/${eventId}/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Certificate template uploaded successfully');
      fetchEventConfig();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload template');
    } finally {
      setUploading(false);
    }
  };

  const handlePdfClick = (e) => {
    if (!activeField) {
      toast.error('Please select a field to place first');
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / scale);
    const y = Math.round((e.clientY - rect.top) / scale);
    
    // Update field coordinates
    setFields(prev => ({
      ...prev,
      [activeField]: {
        ...prev[activeField],
        x,
        y
      }
    }));
    
    // Update or add marker
    setMarkers(prev => {
      const filtered = prev.filter(m => m.field !== activeField);
      return [...filtered, {
        field: activeField,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        label: activeField.charAt(0).toUpperCase() + activeField.slice(1)
      }];
    });
    
    toast.success(`${activeField.charAt(0).toUpperCase() + activeField.slice(1)} position set`);
  };

  const handleDebug = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/certificates/debug/${eventId}`, {
        headers: { 'x-auth-token': token }
      });
      
      console.log('🔍 Debug Info:', response.data);
      toast.success('Debug info logged to console. Press F12 to view.', { duration: 4000 });
      
      // Show summary in alert
      const summary = `
Event: ${response.data.eventTitle}
Has Certificate Config: ${response.data.hasCertificate ? '✅' : '❌'}
Has Template: ${response.data.hasTemplateUrl ? '✅' : '❌'}
Template URL: ${response.data.templateUrl || 'None'}
Has Fields: ${response.data.hasFields ? '✅' : '❌'}
Fields Set: ${response.data.fields ? JSON.stringify(response.data.fields, null, 2) : 'None'}
      `.trim();
      
      alert(summary);
    } catch (error) {
      console.error('Debug error:', error);
      toast.error('Debug failed. Check console.');
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/certificates/config/${eventId}`, {
        fields,
        autoSend
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Configuration saved successfully');
      fetchEventConfig();
    } catch (error) {
      console.error('Save config error:', error);
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    }
  };

  const handleTestPreview = async () => {
    if (!pdfUrl) {
      toast.error('Please upload a certificate template first');
      return;
    }
    
    // Check if coordinates are set
    const hasCoordinates = fields.name.x > 0 || fields.eventName.x > 0 || fields.date.x > 0;
    if (!hasCoordinates) {
      toast.error('Please set field positions before generating preview');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/certificates/test/${eventId}`, {
        testName: 'Sample Student Name'
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });
      
      // Create a URL for the PDF blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new tab
      window.open(url, '_blank');
      
      toast.success('Test certificate preview opened in new tab');
    } catch (error) {
      console.error('Test preview error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Failed to generate test certificate';
      toast.error(errorMessage, { duration: 6000 });
      
      // Show specific guidance based on error
      if (error.response?.data?.requiresSetup) {
        setTimeout(() => toast.error('📤 Please upload a certificate template first', { duration: 4000 }), 500);
      } else if (error.response?.data?.requiresFieldSetup) {
        setTimeout(() => toast.error('📍 Please set field positions by clicking on the PDF', { duration: 4000 }), 500);
      } else if (error.response?.data?.templateMissing) {
        setTimeout(() => toast.error('🔄 Template file is missing. Please re-upload it', { duration: 4000 }), 500);
      }
    }
  };

  const handleGenerateCertificates = async () => {
    // Validation checks
    if (!pdfUrl) {
      toast.error('Please upload a certificate template first');
      return;
    }
    
    const hasCoordinates = fields.name.x > 0 || fields.eventName.x > 0 || fields.date.x > 0;
    if (!hasCoordinates) {
      toast.error('Please set field positions before generating certificates');
      return;
    }
    
    if (!window.confirm('This will generate and send certificates to all participated students via:\n\n✉️ Email (as PDF attachment)\n📱 In-App Notification\n\nContinue?')) {
      return;
    }
    
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/api/certificates/generate/${eventId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success(
          `🎉 Certificates sent successfully!\n✅ Successful: ${response.data.successful}\n❌ Failed: ${response.data.failed}\n📧 Total: ${response.data.total}`,
          { duration: 6000 }
        );
        
        if (response.data.failed > 0) {
          console.error('Failed sends:', response.data.errors);
          toast.error(`${response.data.failed} certificates failed to send. Check console for details.`, { duration: 5000 });
        }
      }
      
      fetchEventConfig();
    } catch (error) {
      console.error('Generate certificates error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Failed to generate certificates';
      toast.error(errorMessage, { duration: 6000 });
      
      // Show specific guidance based on error
      if (error.response?.data?.requiresSetup) {
        setTimeout(() => toast.error('📤 Please complete certificate setup first', { duration: 4000 }), 500);
      }
    } finally {
      setGenerating(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/events')}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Events
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">
          Certificate Configuration
        </h1>
        <p className="text-gray-600 mt-2">Event: {event?.title}</p>
        
        {/* Quick Guide */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Quick Setup Guide:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Upload your PDF certificate template</li>
            <li>Select a field (Name, Event Name, or Date) from the left panel</li>
            <li>Click on the PDF preview where you want that field to appear</li>
            <li>Adjust font size and color as needed</li>
            <li>Click "Test Preview" to verify the output</li>
            <li>Click "Save Configuration" to save your settings</li>
            <li>Click "Generate & Send Certificates" to send to all participants</li>
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Template */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Template</h2>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleUploadTemplate}
              disabled={!templateFile || uploading}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Template'}
            </button>
          </div>

          {/* Field Placement */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Field Placement</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a field, then click on the PDF to place it.
            </p>
            
            {['name', 'eventName', 'date'].map((field) => (
              <div key={field} className="mb-4">
                <button
                  onClick={() => setActiveField(field)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    activeField === field
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold">
                    {field === 'name' && '👤 Student Name'}
                    {field === 'eventName' && '🎯 Event Name'}
                    {field === 'date' && '📅 Date'}
                  </div>
                  {fields[field].x !== 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Position: ({fields[field].x}, {fields[field].y})
                    </div>
                  )}
                </button>
                
                {/* Font Size and Color */}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">Font Size</label>
                    <input
                      type="number"
                      value={fields[field].fontSize}
                      onChange={(e) => setFields(prev => ({
                        ...prev,
                        [field]: { ...prev[field], fontSize: parseInt(e.target.value) }
                      }))}
                      className="w-full px-2 py-1 border rounded text-sm"
                      min="8"
                      max="72"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Color</label>
                    <input
                      type="color"
                      value={fields[field].color}
                      onChange={(e) => setFields(prev => ({
                        ...prev,
                        [field]: { ...prev[field], color: e.target.value }
                      }))}
                      className="w-full h-8 border rounded"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => setAutoSend(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">Auto-send after event completion</span>
            </label>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow p-6 space-y-3">
            <button
              onClick={handleSaveConfiguration}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              💾 Save Configuration
            </button>
            <button
              onClick={handleTestPreview}
              disabled={!pdfUrl}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              👁️ Test Preview
            </button>
            <button
              onClick={handleGenerateCertificates}
              disabled={!pdfUrl || generating}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {generating ? '⏳ Generating...' : '📧 Generate & Send Certificates'}
            </button>
            <button
              onClick={handleDebug}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-sm"
            >
              🔍 Debug Configuration
            </button>
          </div>
        </div>

        {/* Right Panel - PDF Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">PDF Preview</h2>
            
            {pdfUrl ? (
              <div className="space-y-4">
                {/* Zoom Controls */}
                <div className="flex items-center gap-4 justify-center">
                  <button
                    onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    −
                  </button>
                  <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
                  <button
                    onClick={() => setScale(s => Math.min(2, s + 0.1))}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>

                {/* PDF with markers */}
                <div className="relative inline-block border-2 border-gray-300 rounded overflow-auto max-h-[800px]">
                  <div
                    onClick={handlePdfClick}
                    className="relative cursor-crosshair"
                    style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                  >
                    <Document
                      file={pdfUrl}
                      onLoadSuccess={onDocumentLoadSuccess}
                      loading={<div className="p-8 text-center">Loading PDF...</div>}
                    >
                      <Page pageNumber={pageNumber} />
                    </Document>
                    
                    {/* Markers overlay */}
                    {markers.map((marker, index) => (
                      <div
                        key={index}
                        className="absolute"
                        style={{
                          left: marker.x - 8,
                          top: marker.y - 8,
                          pointerEvents: 'none'
                        }}
                      >
                        <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                        <div className="absolute top-5 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          {marker.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {numPages && (
                  <p className="text-sm text-gray-600 text-center">
                    Page {pageNumber} of {numPages}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No PDF template uploaded yet.</p>
                <p className="text-sm mt-2">Upload a PDF template to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

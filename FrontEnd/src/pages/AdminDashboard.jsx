import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  School as SchoolIcon,
  VolunteerActivism as VolunteerIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalEvents: 0,
    totalHours: 0,
    pendingApprovals: 0,
    activeEvents: 0,
    eligibleStudents: 0
  });
  const [events, setEvents] = useState([]);
  const [students, setStudents] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedParticipation, setSelectedParticipation] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [emailData, setEmailData] = useState({
    recipients: 'all',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, eventsRes, studentsRes, participationsRes] = await Promise.all([
        axios.get('/api/admin/stats', { headers }),
        axios.get('/api/events', { headers }),
        axios.get('/api/users/students', { headers }),
        axios.get('/api/participations/pending', { headers })
      ]);

      setStats(statsRes.data);
      setEvents(eventsRes.data);
      setStudents(studentsRes.data);
      setParticipations(participationsRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveParticipation = async (participationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/participations/${participationId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Participation approved successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to approve participation');
    }
  };

  const handleRejectParticipation = async (participationId, reason) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/participations/${participationId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Participation rejected');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to reject participation');
    }
  };

  const handleImportAttendance = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        '/api/attendance/import',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success(`Attendance imported: ${response.data.successful} successful, ${response.data.failed} failed`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to import attendance');
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Event deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleGenerateReport = async (type) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/reports/generate/${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      // Download the report
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const handleSendBulkEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/admin/send-bulk-email',
        emailData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Bulk email sent successfully');
      setEmailData({ recipients: 'all', subject: '', message: '' });
      setOpenDialog(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send bulk email');
    }
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            {trend && (
              <Box display="flex" alignItems="center" mt={1}>
                <TrendingUpIcon fontSize="small" color={trend > 0 ? "success" : "error"} />
                <Typography variant="body2" color={trend > 0 ? "success.main" : "error.main"}>
                  {Math.abs(trend)}% from last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  const chartData = [
    { month: 'Jan', events: 4, participants: 120 },
    { month: 'Feb', events: 6, participants: 180 },
    { month: 'Mar', events: 5, participants: 150 },
    { month: 'Apr', events: 8, participants: 240 },
    { month: 'May', events: 7, participants: 210 }
  ];

  const pieData = [
    { name: 'Tree Plantation', value: 35, color: '#4caf50' },
    { name: 'Blood Donation', value: 25, color: '#f44336' },
    { name: 'Cleanliness Drive', value: 20, color: '#2196f3' },
    { name: 'Health Camp', value: 15, color: '#ff9800' },
    { name: 'Other', value: 5, color: '#9c27b0' }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's an overview of NSS activities
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<SchoolIcon />}
            color="primary.main"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Events"
            value={stats.totalEvents}
            icon={<EventIcon />}
            color="success.main"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Volunteer Hours"
            value={`${stats.totalHours}h`}
            icon={<VolunteerIcon />}
            color="warning.main"
            trend={15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<WarningIcon />}
            color="error.main"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Activity Overview
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="events" fill="#8884d8" name="Events" />
                <Bar dataKey="participants" fill="#82ca9d" name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Event Categories
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabs for different sections */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Pending Approvals" icon={<WarningIcon />} iconPosition="start" />
          <Tab label="Events" icon={<EventIcon />} iconPosition="start" />
          <Tab label="Students" icon={<PeopleIcon />} iconPosition="start" />
          <Tab label="Reports" icon={<AssessmentIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Participation Approvals
          </Typography>
          {participations.length === 0 ? (
            <Alert severity="info">No pending approvals</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student</TableCell>
                    <TableCell>Event</TableCell>
                    <TableCell>Submitted On</TableCell>
                    <TableCell>Evidence</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {participations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((participation) => (
                    <TableRow key={participation._id}>
                      <TableCell>{participation.student.name}</TableCell>
                      <TableCell>{participation.event.title}</TableCell>
                      <TableCell>{format(new Date(participation.createdAt), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          startIcon={<VisibilityIcon />}
                          onClick={() => {
                            setSelectedParticipation(participation);
                            setDialogType('viewEvidence');
                            setOpenDialog(true);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="success"
                          onClick={() => handleApproveParticipation(participation._id)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => {
                            setSelectedParticipation(participation);
                            setDialogType('reject');
                            setOpenDialog(true);
                          }}
                        >
                          <CancelIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={participations.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Events Management</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/create-event')}
            >
              Create Event
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Participants</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>{event.title}</TableCell>
                    <TableCell>{event.eventType}</TableCell>
                    <TableCell>{format(new Date(event.startDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Chip
                        label={event.status}
                        color={event.status === 'published' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{event.currentParticipants}/{event.maxParticipants || '∞'}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => navigate(`/admin/event/${event._id}`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => {
                        if (window.confirm('Are you sure you want to delete this event?')) {
                          handleDeleteEvent(event._id);
                        }
                      }}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Students Management</Typography>
            <Box>
              <input
                accept=".xlsx,.xls,.csv"
                style={{ display: 'none' }}
                id="upload-attendance"
                type="file"
                onChange={(e) => handleImportAttendance(e.target.files[0])}
              />
              <label htmlFor="upload-attendance">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mr: 2 }}
                >
                  Import Attendance
                </Button>
              </label>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                onClick={() => {
                  setDialogType('bulkEmail');
                  setOpenDialog(true);
                }}
                sx={{ mr: 2 }}
              >
                Send Bulk Email
              </Button>
              <Button
                variant="contained"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/admin/students')}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
              >
                Manage Students
              </Button>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reg. Number</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Attendance %</TableCell>
                  <TableCell>Volunteer Hours</TableCell>
                  <TableCell>Eligibility</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>{student.registrationNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.department}</TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <LinearProgress
                          variant="determinate"
                          value={student.attendancePercentage}
                          sx={{ width: 60, mr: 1 }}
                          color={student.attendancePercentage >= 75 ? 'success' : 'error'}
                        />
                        {student.attendancePercentage}%
                      </Box>
                    </TableCell>
                    <TableCell>{student.totalVolunteerHours}h</TableCell>
                    <TableCell>
                      <Chip
                        label={student.isEligible ? 'Eligible' : 'Not Eligible'}
                        color={student.isEligible ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => navigate(`/admin/student/${student._id}`)}>
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 3 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generate Reports
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Event Summary Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Generate a comprehensive report of all events including participation details and statistics.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleGenerateReport('event-summary')}
                    fullWidth
                  >
                    Generate Event Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Student Activity Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Generate detailed reports of student participation and volunteer hours.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleGenerateReport('student-activity')}
                    fullWidth
                  >
                    Generate Student Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Attendance Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Generate attendance reports with eligibility status for all students.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleGenerateReport('attendance')}
                    fullWidth
                  >
                    Generate Attendance Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Annual Summary Report
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Generate comprehensive annual report with all NSS activities and achievements.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleGenerateReport('annual-summary')}
                    fullWidth
                  >
                    Generate Annual Report
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Dialogs */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'viewEvidence' && 'View Evidence'}
          {dialogType === 'reject' && 'Reject Participation'}
          {dialogType === 'bulkEmail' && 'Send Bulk Email'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'viewEvidence' && selectedParticipation && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Submitted Evidence
              </Typography>
              {selectedParticipation.evidence?.map((item, index) => (
                <Box key={index} mb={2}>
                  <Typography variant="body2">
                    {item.type === 'image' ? 'Image' : 'Document'}: {item.filename}
                  </Typography>
                  {item.type === 'image' && (
                    <img src={item.url} alt="Evidence" style={{ maxWidth: '100%', marginTop: 8 }} />
                  )}
                </Box>
              ))}
              {selectedParticipation.aiGeneratedReport && (
                <Box mt={3}>
                  <Typography variant="h6" gutterBottom>
                    AI Generated Report
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2">
                      {selectedParticipation.aiGeneratedReport}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
          {dialogType === 'reject' && (
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Rejection Reason"
              placeholder="Please provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
          {dialogType === 'bulkEmail' && (
            <Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Recipients</InputLabel>
                <Select 
                  value={emailData.recipients}
                  onChange={(e) => setEmailData({ ...emailData, recipients: e.target.value })}
                  label="Recipients"
                >
                  <MenuItem value="all">All Students</MenuItem>
                  <MenuItem value="eligible">Eligible Students Only</MenuItem>
                  <MenuItem value="notEligible">Non-Eligible Students</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Subject"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Message"
                placeholder="Enter your message here..."
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenDialog(false);
            setRejectionReason('');
            setEmailData({ recipients: 'all', subject: '', message: '' });
          }}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            if (dialogType === 'reject') {
              if (!rejectionReason.trim()) {
                toast.error('Please provide a rejection reason');
                return;
              }
              handleRejectParticipation(selectedParticipation._id, rejectionReason);
              setRejectionReason('');
            } else if (dialogType === 'bulkEmail') {
              handleSendBulkEmail();
            }
            setOpenDialog(false);
          }}>
            {dialogType === 'reject' ? 'Reject' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;

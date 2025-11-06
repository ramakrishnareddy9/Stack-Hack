import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Alert,
  Badge,
  IconButton,
  Divider,
  Tooltip,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  AssignmentTurnedIn as AssignmentIcon,
  EmojiEvents as TrophyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PendingActions as PendingIcon,
  CloudUpload as UploadIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  VolunteerActivism as VolunteerIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Star as StarIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  Timer as TimerIcon,
  NotificationsActive as NotificationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, formatDistanceToNow, isFuture, isPast } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip, Legend } from 'recharts';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    participatedEvents: 0,
    totalHours: 0,
    pendingApprovals: 0,
    certificates: 0,
    attendance: 0,
    isEligible: false,
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, statsRes, eventsRes, participationsRes, certsRes] = await Promise.all([
        axios.get('/api/auth/profile', { headers }),
        axios.get('/api/students/stats', { headers }),
        axios.get('/api/events/upcoming', { headers }),
        axios.get('/api/participations/my', { headers }),
        axios.get('/api/certificates/my', { headers }),
      ]);

      setUserData(userRes.data);
      setStats(statsRes.data);
      setUpcomingEvents(eventsRes.data);
      setMyParticipations(participationsRes.data);
      setCertificates(certsRes.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    try {
      if (!stats.isEligible) {
        toast.error('You need at least 75% attendance to register for events');
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(
        '/api/participations/register',
        { eventId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Successfully registered for the event!');
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register for event');
    }
  };

  const handleDownloadCertificate = async (participationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/participations/${participationId}/certificate`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${participationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Certificate downloaded successfully');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      completed: 'info',
    };
    return statusColors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: <PendingIcon />,
      approved: <CheckCircleIcon />,
      rejected: <CancelIcon />,
      completed: <CheckCircleIcon />,
    };
    return statusIcons[status] || <InfoIcon />;
  };

  const pieData = [
    { name: 'Completed', value: stats.participatedEvents - stats.pendingApprovals, color: '#059669' },
    { name: 'Pending', value: stats.pendingApprovals, color: '#f59e0b' },
    { name: 'Available', value: stats.totalEvents - stats.participatedEvents, color: '#3b82f6' },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" className="py-8">
      {/* Header Section */}
      <Box className="mb-8">
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" gap={3}>
              <Avatar
                sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                className="shadow-lg"
              >
                {userData?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight="bold" className="text-gray-900">
                  Welcome back, {userData?.name}!
                </Typography>
                <Typography variant="body1" className="text-gray-600 mt-1">
                  Registration No: {userData?.registrationNumber} | {userData?.department} - Year {userData?.year}
                </Typography>
                <Box display="flex" alignItems="center" gap={2} className="mt-2">
                  {stats.isEligible ? (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Eligible for Events"
                      color="success"
                      size="small"
                      className="font-medium"
                    />
                  ) : (
                    <Chip
                      icon={<WarningIcon />}
                      label="Not Eligible (Attendance < 75%)"
                      color="error"
                      size="small"
                      className="font-medium"
                    />
                  )}
                  <Chip
                    icon={<SchoolIcon />}
                    label={`Attendance: ${stats.attendance}%`}
                    color={stats.attendance >= 75 ? 'success' : 'warning'}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <CardContent>
                <Typography variant="h6" className="font-medium mb-2">
                  Total Volunteer Hours
                </Typography>
                <Typography variant="h3" className="font-bold">
                  {stats.totalHours}
                </Typography>
                <Typography variant="body2" className="mt-1 opacity-90">
                  Keep up the great work!
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Attendance Alert */}
      {stats.attendance < 75 && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          className="mb-6"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/attendance')}>
              View Details
            </Button>
          }
        >
          <Typography variant="body1" fontWeight="medium">
            Low Attendance Alert
          </Typography>
          <Typography variant="body2">
            Your current attendance is {stats.attendance}%. You need at least 75% attendance to participate in NSS events.
            You are short by {(75 - stats.attendance).toFixed(1)}%.
          </Typography>
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Events Participated
                  </Typography>
                  <Typography variant="h4" component="div" className="font-bold">
                    {stats.participatedEvents}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mt-1">
                    of {stats.totalEvents} available
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <EventIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.participatedEvents / stats.totalEvents) * 100} 
                className="mt-3"
                sx={{ height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Certificates Earned
                  </Typography>
                  <Typography variant="h4" component="div" className="font-bold">
                    {stats.certificates}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mt-1">
                    Ready to download
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <TrophyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Pending Approvals
                  </Typography>
                  <Typography variant="h4" component="div" className="font-bold">
                    {stats.pendingApprovals}
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mt-1">
                    Awaiting review
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light' }}>
                  <PendingIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    Volunteer Hours
                  </Typography>
                  <Typography variant="h4" component="div" className="font-bold">
                    {stats.totalHours}h
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mt-1">
                    Total contributed
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'secondary.light' }}>
                  <VolunteerIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Participation Chart */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} md={8}>
          <Paper className="p-6">
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Upcoming Events" icon={<EventIcon />} iconPosition="start" />
              <Tab label="My Participations" icon={<AssignmentIcon />} iconPosition="start" />
              <Tab label="Certificates" icon={<TrophyIcon />} iconPosition="start" />
            </Tabs>

            <Box className="mt-4">
              {/* Upcoming Events Tab */}
              {tabValue === 0 && (
                <Box>
                  {upcomingEvents.length === 0 ? (
                    <Alert severity="info">No upcoming events at the moment</Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {upcomingEvents.map((event) => (
                        <Grid item xs={12} key={event._id}>
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent>
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={8}>
                                  <Typography variant="h6" className="font-semibold mb-1">
                                    {event.title}
                                  </Typography>
                                  <Box display="flex" gap={2} flexWrap="wrap" className="mb-2">
                                    <Chip
                                      size="small"
                                      icon={<CalendarIcon />}
                                      label={format(new Date(event.startDate), 'dd MMM yyyy')}
                                      variant="outlined"
                                    />
                                    <Chip
                                      size="small"
                                      icon={<LocationIcon />}
                                      label={event.location}
                                      variant="outlined"
                                    />
                                    <Chip
                                      size="small"
                                      icon={<TimerIcon />}
                                      label={`${event.hoursAwarded}h`}
                                      variant="outlined"
                                      color="primary"
                                    />
                                    <Chip
                                      size="small"
                                      icon={<GroupIcon />}
                                      label={`${event.currentParticipants}/${event.maxParticipants || '∞'}`}
                                      variant="outlined"
                                      color={event.currentParticipants >= event.maxParticipants ? 'error' : 'success'}
                                    />
                                  </Box>
                                  <Typography variant="body2" color="text.secondary" className="line-clamp-2">
                                    {event.description}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Box display="flex" gap={1} justifyContent="flex-end">
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => {
                                        setSelectedEvent(event);
                                        setDialogType('viewEvent');
                                        setOpenDialog(true);
                                      }}
                                    >
                                      View Details
                                    </Button>
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => handleRegisterForEvent(event._id)}
                                      disabled={!stats.isEligible || event.currentParticipants >= event.maxParticipants}
                                    >
                                      Register
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* My Participations Tab */}
              {tabValue === 1 && (
                <Box>
                  {myParticipations.length === 0 ? (
                    <Alert severity="info">You haven't participated in any events yet</Alert>
                  ) : (
                    <List>
                      {myParticipations.map((participation, index) => (
                        <React.Fragment key={participation._id}>
                          {index > 0 && <Divider />}
                          <ListItem className="py-3">
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: getStatusColor(participation.status) + '.light' }}>
                                {getStatusIcon(participation.status)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="h6" className="font-medium">
                                  {participation.event.title}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="text.secondary">
                                    {format(new Date(participation.event.startDate), 'dd MMM yyyy')} • {participation.event.location}
                                  </Typography>
                                  <Box display="flex" gap={1} className="mt-1">
                                    <Chip
                                      label={participation.status.charAt(0).toUpperCase() + participation.status.slice(1)}
                                      size="small"
                                      color={getStatusColor(participation.status)}
                                    />
                                    {participation.volunteerHours > 0 && (
                                      <Chip
                                        label={`${participation.volunteerHours}h earned`}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                      />
                                    )}
                                  </Box>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Box display="flex" gap={1}>
                                {participation.status === 'approved' && participation.certificateUrl && (
                                  <Tooltip title="Download Certificate">
                                    <IconButton
                                      edge="end"
                                      onClick={() => handleDownloadCertificate(participation._id)}
                                      color="primary"
                                    >
                                      <DownloadIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                {participation.status === 'pending' && (
                                  <Tooltip title="Upload Evidence">
                                    <IconButton
                                      edge="end"
                                      onClick={() => navigate(`/participation/${participation._id}/evidence`)}
                                      color="warning"
                                    >
                                      <UploadIcon />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                <Tooltip title="View Details">
                                  <IconButton
                                    edge="end"
                                    onClick={() => navigate(`/participation/${participation._id}`)}
                                  >
                                    <ViewIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </Box>
              )}

              {/* Certificates Tab */}
              {tabValue === 2 && (
                <Box>
                  {certificates.length === 0 ? (
                    <Alert severity="info">No certificates available yet</Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {certificates.map((cert) => (
                        <Grid item xs={12} sm={6} key={cert._id}>
                          <Card className="hover:shadow-md transition-shadow">
                            <CardContent>
                              <Box display="flex" alignItems="center" gap={2} className="mb-2">
                                <Avatar sx={{ bgcolor: 'success.main' }}>
                                  <TrophyIcon />
                                </Avatar>
                                <Box flex={1}>
                                  <Typography variant="h6" className="font-medium">
                                    {cert.eventTitle}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Issued on {format(new Date(cert.issuedDate), 'dd MMM yyyy')}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box display="flex" gap={1} className="mt-3">
                                <Chip
                                  size="small"
                                  label={`${cert.hoursAwarded}h`}
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip
                                  size="small"
                                  label={cert.eventType}
                                  variant="outlined"
                                />
                              </Box>
                            </CardContent>
                            <CardActions>
                              <Button
                                fullWidth
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadCertificate(cert.participationId)}
                              >
                                Download Certificate
                              </Button>
                            </CardActions>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Participation Summary Chart */}
        <Grid item xs={12} md={4}>
          <Paper className="p-6">
            <Typography variant="h6" className="font-semibold mb-4">
              Participation Overview
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            <Box className="mt-4">
              <Typography variant="body2" className="text-gray-600 mb-2">
                Quick Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EventIcon />}
                  onClick={() => navigate('/events')}
                >
                  Browse All Events
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  onClick={() => navigate('/my-participations')}
                >
                  View All Participations
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => navigate('/annual-report')}
                >
                  Download Annual Report
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Event Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogType === 'viewEvent' && selectedEvent?.title}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'viewEvent' && selectedEvent && (
            <Box className="mt-2">
              <Typography variant="body1" paragraph>
                {selectedEvent.description}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Event Type
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {selectedEvent.eventType}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {format(new Date(selectedEvent.startDate), 'dd MMM yyyy, hh:mm a')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {selectedEvent.location}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Volunteer Hours
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {selectedEvent.hoursAwarded} hours
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Available Slots
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {selectedEvent.maxParticipants - selectedEvent.currentParticipants} / {selectedEvent.maxParticipants}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Registration Deadline
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {format(new Date(selectedEvent.registrationDeadline), 'dd MMM yyyy')}
                  </Typography>
                </Grid>
              </Grid>
              {selectedEvent.requirements && selectedEvent.requirements.length > 0 && (
                <Box className="mt-4">
                  <Typography variant="h6" className="font-medium mb-2">
                    Requirements
                  </Typography>
                  <List>
                    {selectedEvent.requirements.map((req, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={req} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
          {dialogType === 'viewEvent' && (
            <Button
              variant="contained"
              onClick={() => {
                handleRegisterForEvent(selectedEvent._id);
                setOpenDialog(false);
              }}
              disabled={!stats.isEligible}
            >
              Register for Event
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentDashboard;

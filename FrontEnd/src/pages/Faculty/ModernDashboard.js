import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Paper,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Tooltip,
  useTheme,
  alpha,
  Stack,
  Divider
} from '@mui/material';
import {
  Event as EventIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  ArrowForward as ArrowForwardIcon,
  WorkspacePremium as CertificateIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const FacultyModernDashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalParticipations: 0,
    pendingApprovals: 0,
    totalStudents: 0,
    completedEvents: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [pendingParticipations, setPendingParticipations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, participationsRes] = await Promise.all([
        api.get('/events'),
        api.get('/participations')
      ]);

      const events = eventsRes.data;
      const participations = participationsRes.data;

      setStats({
        totalEvents: events.length,
        activeEvents: events.filter(e => e.status === 'published').length,
        totalParticipations: participations.length,
        pendingApprovals: participations.filter(p => p.status === 'registered').length,
        totalStudents: new Set(participations.map(p => p.student?._id)).size,
        completedEvents: events.filter(e => e.status === 'completed').length
      });

      setRecentEvents(events.slice(0, 3));
      setPendingParticipations(participations.filter(p => p.status === 'registered').slice(0, 5));
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Events',
      value: stats.totalEvents,
      icon: EventIcon,
      color: theme.palette.primary.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
      link: '/admin/events'
    },
    {
      title: 'Active Events',
      value: stats.activeEvents,
      icon: TrendingUpIcon,
      color: theme.palette.success.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(theme.palette.success.dark, 0.2)} 100%)`,
      link: '/admin/events'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: PendingIcon,
      color: theme.palette.warning.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.2)} 0%, ${alpha(theme.palette.warning.dark, 0.2)} 100%)`,
      link: '/admin/participations'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: PeopleIcon,
      color: theme.palette.info.main,
      gradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.2)} 0%, ${alpha(theme.palette.info.dark, 0.2)} 100%)`,
      link: '/admin/participations'
    }
  ];

  const quickActions = [
    {
      title: 'Create Event',
      description: 'Organize a new NSS activity',
      icon: EventIcon,
      color: 'primary',
      link: '/admin/create-event'
    },
    {
      title: 'Manage Events',
      description: 'View and edit existing events',
      icon: CalendarIcon,
      color: 'secondary',
      link: '/admin/events'
    },
    {
      title: 'Review Participations',
      description: 'Approve or reject requests',
      icon: AssignmentIcon,
      color: 'warning',
      link: '/admin/participations'
    },
    {
      title: 'Generate Reports',
      description: 'Export activity reports',
      icon: AssessmentIcon,
      color: 'info',
      link: '/admin/reports'
    },
    {
      title: 'Certificates',
      description: 'Configure and send certificates',
      icon: CertificateIcon,
      color: 'success',
      link: '/admin/events'
    }
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <MotionBox
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          borderRadius: 3,
          p: 4,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Faculty Dashboard
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Manage NSS activities, review student participations, and track event progress
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: alpha(theme.palette.common.white, 0.1),
          }}
        />
      </MotionBox>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                component={Link}
                to={stat.link}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                sx={{
                  textDecoration: 'none',
                  height: '100%',
                  background: stat.gradient,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 10px 30px ${alpha(stat.color, 0.3)}`
                  }
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold" sx={{ color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {stat.title}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        bgcolor: alpha(stat.color, 0.1),
                        color: stat.color,
                        width: 56,
                        height: 56
                      }}
                    >
                      <Icon fontSize="large" />
                    </Avatar>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
              <MotionCard
                component={Link}
                to={action.link}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.4 + index * 0.1 }}
                sx={{
                  textDecoration: 'none',
                  height: '100%',
                  background: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.background.paper, 0.8)
                    : 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.palette[action.color].main, 0.3)}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                    borderColor: theme.palette[action.color].main,
                    '& .action-icon': {
                      transform: 'scale(1.1) rotate(5deg)'
                    }
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Avatar
                    className="action-icon"
                    sx={{
                      bgcolor: alpha(theme.palette[action.color].main, 0.1),
                      color: theme.palette[action.color].main,
                      width: 48,
                      height: 48,
                      margin: '0 auto',
                      mb: 2,
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <Icon />
                  </Avatar>
                  <Typography variant="subtitle1" fontWeight="600" color="text.primary">
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {action.description}
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Events */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              background: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.8)
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="600">
                Recent Events
              </Typography>
              <Button
                component={Link}
                to="/admin/events"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            <Stack spacing={2}>
              {recentEvents.map((event, index) => (
                <Box
                  key={event._id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: alpha(theme.palette.background.default, 0.5),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.05),
                      transform: 'translateX(5px)'
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="500">
                        {event.title}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(event.startDate).toLocaleDateString()}
                        </Typography>
                        <Chip
                          label={event.status}
                          size="small"
                          color={event.status === 'published' ? 'success' : 'default'}
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      component={Link}
                      to={`/admin/certificates/${event._id}`}
                      size="small"
                      sx={{
                        color: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <CertificateIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))}
              {recentEvents.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No events created yet
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Pending Participations */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              height: '100%',
              background: theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.8)
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight="600">
                Pending Approvals
              </Typography>
              <Button
                component={Link}
                to="/admin/participations"
                size="small"
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            <Stack spacing={2}>
              {pendingParticipations.map((participation) => (
                <Box
                  key={participation._id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: alpha(theme.palette.warning.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateX(5px)',
                      borderColor: theme.palette.warning.main
                    }
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="500">
                    {participation.student?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {participation.event?.title}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <PendingIcon sx={{ fontSize: 14, color: theme.palette.warning.main }} />
                    <Typography variant="caption" color="warning.main">
                      Awaiting approval
                    </Typography>
                  </Box>
                </Box>
              ))}
              {pendingParticipations.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No pending approvals
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FacultyModernDashboard;

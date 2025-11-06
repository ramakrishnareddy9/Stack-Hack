import React, { useState, useRef, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Divider,
  Avatar,
  Chip,
  alpha,
  useTheme,
  Paper,
  Stack,
  Tooltip,
  Fade
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  EmojiEvents as TrophyIcon,
  WorkspacePremium as CertificateIcon,
  Clear as ClearIcon,
  DoneAll as DoneAllIcon,
  Info as InfoIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import { useSocket } from '../../context/SocketContext';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);

const ModernNotificationBell = () => {
  const theme = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useSocket();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new-event':
        return <EventIcon sx={{ color: theme.palette.info.main }} />;
      case 'participation-approved':
        return <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
      case 'participation-rejected':
        return <CampaignIcon sx={{ color: theme.palette.error.main }} />;
      case 'contribution-verified':
        return <TrophyIcon sx={{ color: theme.palette.warning.main }} />;
      case 'certificate':
        return <CertificateIcon sx={{ color: theme.palette.secondary.main }} />;
      default:
        return <InfoIcon sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'new-event':
        return theme.palette.info.light;
      case 'participation-approved':
        return theme.palette.success.light;
      case 'participation-rejected':
        return theme.palette.error.light;
      case 'contribution-verified':
        return theme.palette.warning.light;
      case 'certificate':
        return theme.palette.secondary.light;
      default:
        return theme.palette.grey[300];
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    if (notification.type === 'new-event') {
      navigate('/student/events');
    } else if (notification.type === 'participation-approved') {
      navigate('/student/profile');
    } else if (notification.type === 'certificate') {
      navigate('/certificates');
    }
    
    handleClose();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now - date) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true });
      } else {
        return format(date, 'MMM dd, yyyy');
      }
    } catch {
      return 'Recently';
    }
  };

  return (
    <>
      <Tooltip title={unreadCount > 0 ? `${unreadCount} new notifications` : 'Notifications'}>
        <IconButton
          onClick={handleOpen}
          sx={{
            color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.700',
            '&:hover': {
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }
          }}
        >
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.4)}`
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 380,
            maxWidth: 420,
            maxHeight: 520,
            overflow: 'hidden',
            background: theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.95)
              : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight="600">
              Notifications
            </Typography>
            <Stack direction="row" spacing={1}>
              {unreadCount > 0 && (
                <Tooltip title="Mark all as read">
                  <IconButton
                    size="small"
                    onClick={markAllAsRead}
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                      }
                    }}
                  >
                    <DoneAllIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {notifications.length > 0 && (
                <Tooltip title="Clear all">
                  <IconButton
                    size="small"
                    onClick={clearNotifications}
                    sx={{
                      color: theme.palette.grey[600],
                      '&:hover': {
                        bgcolor: alpha(theme.palette.grey[500], 0.1)
                      }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Box>

        {/* Notifications List */}
        <Box
          sx={{
            maxHeight: 400,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: 6,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              borderRadius: 3,
            }
          }}
        >
          {notifications.length === 0 ? (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                color: 'text.secondary'
              }}
            >
              <NotificationsIcon sx={{ fontSize: 48, opacity: 0.3, mb: 2 }} />
              <Typography variant="body1">
                No notifications yet
              </Typography>
              <Typography variant="caption">
                You'll see updates about events and activities here
              </Typography>
            </Box>
          ) : (
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <MotionBox
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ListItem
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      borderLeft: !notification.read ? `4px solid ${getNotificationColor(notification.type)}` : 'none',
                      bgcolor: !notification.read 
                        ? alpha(getNotificationColor(notification.type), 0.05)
                        : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transform: 'translateX(4px)'
                      }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: alpha(getNotificationColor(notification.type), 0.15)
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={!notification.read ? 600 : 400}>
                          {notification.message}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          {notification.event && (
                            <Typography variant="caption" color="text.secondary" component="div">
                              {notification.event.title} • {notification.event.location}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.disabled">
                            {formatTime(notification.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.read && (
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: theme.palette.primary.main,
                          boxShadow: `0 0 8px ${theme.palette.primary.main}`,
                          animation: 'pulse 2s infinite'
                        }}
                      />
                    )}
                  </ListItem>
                  {index < notifications.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </MotionBox>
              ))}
            </AnimatePresence>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: alpha(theme.palette.background.default, 0.5)
            }}
          >
            <Button
              fullWidth
              size="small"
              onClick={() => {
                navigate('/notifications');
                handleClose();
              }}
              sx={{
                textTransform: 'none',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              View All Notifications
            </Button>
          </Box>
        )}
      </Popover>

      {/* Pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)};
          }
          70% {
            box-shadow: 0 0 0 10px ${alpha(theme.palette.primary.main, 0)};
          }
          100% {
            box-shadow: 0 0 0 0 ${alpha(theme.palette.primary.main, 0)};
          }
        }
      `}</style>
    </>
  );
};

export default ModernNotificationBell;

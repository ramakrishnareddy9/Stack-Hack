import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  AdminPanelSettings as AdminIcon,
  School as SchoolIcon,
  Close as CloseIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
  };

  const studentMenuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Events', icon: <EventIcon />, path: '/events' },
    { text: 'My Participations', icon: <AssignmentIcon />, path: '/my-participations' },
    { text: 'Certificates', icon: <TrophyIcon />, path: '/certificates' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' }
  ];

  const adminMenuItems = [
    { text: 'Admin Dashboard', icon: <AdminIcon />, path: '/admin/dashboard' },
    { text: 'Manage Events', icon: <EventIcon />, path: '/admin/events' },
    { text: 'Manage Students', icon: <SchoolIcon />, path: '/admin/students' },
    { text: 'Reports', icon: <AssignmentIcon />, path: '/admin/reports' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' }
  ];

  const menuItems = user?.role === 'admin' || user?.role === 'faculty' ? adminMenuItems : studentMenuItems;

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" color="primary">
          NSS Portal
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      {isAuthenticated && (
        <>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Avatar sx={{ width: 60, height: 60, mx: 'auto', mb: 1, bgcolor: 'primary.main' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="subtitle1">{user?.name}</Typography>
            <Chip
              label={user?.role}
              size="small"
              color={user?.role === 'admin' ? 'error' : user?.role === 'faculty' ? 'warning' : 'primary'}
              sx={{ mt: 1 }}
            />
          </Box>
          <Divider />
        </>
      )}
      <List>
        {isAuthenticated ? (
          <>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ color: location.pathname === item.path ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button onClick={() => handleNavigation('/login')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button onClick={() => handleNavigation('/register')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={2}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <SchoolIcon sx={{ mr: 1 }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              NSS Activity Portal
            </Typography>
          </Box>

          {!isMobile && isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 2, mr: 2 }}>
              {menuItems.slice(0, 3).map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    backgroundColor: location.pathname === item.path ? 'rgba(255,255,255,0.1)' : 'transparent'
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          {isAuthenticated ? (
            <>
              <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={handleNotificationMenuOpen}>
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Account">
                <IconButton onClick={handleProfileMenuOpen} color="inherit">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle1">{user?.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.email}
                  </Typography>
                  <Chip
                    label={user?.role}
                    size="small"
                    color={user?.role === 'admin' ? 'error' : user?.role === 'faculty' ? 'warning' : 'primary'}
                    sx={{ mt: 1 }}
                  />
                </Box>
                <Divider />
                <MenuItem onClick={() => handleNavigation('/profile')}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                {(user?.role === 'admin' || user?.role === 'faculty') && (
                  <MenuItem onClick={() => handleNavigation('/admin/dashboard')}>
                    <ListItemIcon>
                      <AdminIcon fontSize="small" />
                    </ListItemIcon>
                    Admin Panel
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>

              <Menu
                anchorEl={notificationAnchor}
                open={Boolean(notificationAnchor)}
                onClose={handleNotificationMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: { width: 320, maxHeight: 400 }
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography variant="h6">Notifications</Typography>
                  {unreadCount > 0 && (
                    <Chip label={`${unreadCount} unread`} size="small" color="primary" sx={{ mt: 1 }} />
                  )}
                </Box>
                <Divider />
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No new notifications
                  </Typography>
                </Box>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button 
                color="inherit" 
                variant="outlined" 
                sx={{ borderColor: 'white' }}
                onClick={() => navigate('/register')}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;

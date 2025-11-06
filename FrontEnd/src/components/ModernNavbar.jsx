import React, { useState, useEffect } from 'react';
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
  Chip,
  Fade,
  Slide,
  Grow,
  Paper,
  alpha,
  Stack,
  Collapse,
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
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Settings as SettingsIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Circle as CircleIcon,
  Explore as ExploreIcon,
  AccountBalanceWallet as WalletIcon,
  VerifiedUser as VerifiedIcon,
  KeyboardArrowRight as ArrowRightIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme as useThemeContext } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import nssLogo from '../assets/nss-logo.svg';

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

const ModernNavbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const { mode, toggleColorMode } = useThemeContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', color: '#6366f1' },
    { text: 'Events', icon: <EventIcon />, path: '/events', color: '#14b8a6' },
    { text: 'Participations', icon: <AssignmentIcon />, path: '/my-participations', color: '#f59e0b' },
    { text: 'Certificates', icon: <TrophyIcon />, path: '/certificates', color: '#ec4899' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile', color: '#8b5cf6' }
  ];

  const adminMenuItems = [
    { text: 'Admin Dashboard', icon: <AdminIcon />, path: '/admin/dashboard', color: '#ef4444' },
    { text: 'Manage Events', icon: <EventIcon />, path: '/admin/events', color: '#3b82f6' },
    { text: 'Manage Students', icon: <SchoolIcon />, path: '/admin/students', color: '#10b981' },
    { text: 'Reports', icon: <AssignmentIcon />, path: '/admin/reports', color: '#f59e0b' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile', color: '#8b5cf6' }
  ];

  const menuItems = user?.role === 'admin' || user?.role === 'faculty' ? adminMenuItems : studentMenuItems;

  const navbarVariants = {
    initial: { y: -100 },
    animate: { y: 0 },
    exit: { y: -100 },
  };

  const menuItemVariants = {
    hover: {
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 300,
      },
    },
  };

  const drawer = (
    <Box className="h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Box className="p-4 flex items-center justify-between bg-gradient-primary">
        <Box className="flex items-center gap-2">
          <img 
            src={nssLogo} 
            alt="NSS Logo" 
            style={{ 
              width: '35px', 
              height: '35px',
              filter: 'brightness(0) invert(1)'
            }} 
          />
          <Typography variant="h6" className="text-white font-bold">
            NSS Portal
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} className="text-white">
          <CloseIcon />
        </IconButton>
      </Box>
      
      {isAuthenticated && (
        <>
          <Box className="p-6 text-center bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700">
            <Avatar 
              className="w-20 h-20 mx-auto mb-3 shadow-glow"
              sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '2rem' 
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h6" className="font-semibold">
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mb-2">
              {user?.email}
            </Typography>
            <Chip
              label={user?.role?.toUpperCase()}
              className="bg-gradient-primary text-white font-semibold"
              size="small"
            />
          </Box>
          <Divider />
        </>
      )}
      
      <List className="p-2">
        {isAuthenticated ? (
          <>
            <AnimatePresence>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ListItem
                    button
                    onClick={() => handleNavigation(item.path)}
                    selected={location.pathname === item.path}
                    className="rounded-xl mb-2 transition-all duration-300 hover:shadow-md"
                    sx={{
                      backgroundColor: location.pathname === item.path 
                        ? alpha(item.color, 0.1)
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: alpha(item.color, 0.05),
                      },
                    }}
                  >
                    <ListItemIcon>
                      <Box
                        className="p-2 rounded-lg"
                        sx={{
                          backgroundColor: alpha(item.color, 0.1),
                          color: item.color,
                        }}
                      >
                        {item.icon}
                      </Box>
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.path ? 600 : 400,
                      }}
                    />
                    {location.pathname === item.path && (
                      <ArrowRightIcon className="text-primary-500" />
                    )}
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
            
            <Divider className="my-4" />
            
            <ListItem
              button
              onClick={toggleColorMode}
              className="rounded-xl mb-2 transition-all duration-300"
            >
              <ListItemIcon>
                <Box className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                  {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </Box>
              </ListItemIcon>
              <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
            </ListItem>
            
            <ListItem
              button
              onClick={handleLogout}
              className="rounded-xl text-red-500 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <ListItemIcon>
                <Box className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <LogoutIcon className="text-red-500" />
                </Box>
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem
              button
              onClick={() => handleNavigation('/login')}
              className="rounded-xl mb-2 bg-gradient-primary text-white"
            >
              <ListItemIcon>
                <PersonIcon className="text-white" />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem
              button
              onClick={() => handleNavigation('/register')}
              className="rounded-xl"
            >
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
      <MotionBox
        initial="initial"
        animate="animate"
        exit="exit"
        variants={navbarVariants}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'shadow-lg' : ''
        }`}
      >
        <AppBar
          position="static"
          elevation={0}
          className="backdrop-blur-xl border-b"
          sx={{
            backgroundColor: scrolled
              ? alpha(theme.palette.background.default, 0.95)
              : alpha(theme.palette.background.default, 0.9),
            borderColor: theme.palette.divider,
          }}
        >
          <Toolbar className="py-3">
            {isMobile && (
              <MotionIconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                className="mr-3"
                whileTap={{ scale: 0.9 }}
              >
                <MenuIcon />
              </MotionIconButton>
            )}

            <Box className="flex items-center flex-grow gap-3">
              <MotionBox
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="cursor-pointer"
                onClick={() => navigate('/')}
              >
                <img 
                  src={nssLogo} 
                  alt="NSS Logo" 
                  style={{ 
                    width: '45px', 
                    height: '45px',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                  }} 
                />
              </MotionBox>
              <Typography
                variant="h6"
                component="div"
                className="font-bold gradient-text cursor-pointer"
                onClick={() => navigate('/')}
              >
                NSS Activity Portal
              </Typography>
            </Box>

            {!isMobile && isAuthenticated && (
              <Box className="flex gap-1 mr-4">
                {menuItems.slice(0, 3).map((item) => (
                  <MotionBox
                    key={item.text}
                    whileHover="hover"
                    variants={menuItemVariants}
                    onHoverStart={() => setHoveredItem(item.text)}
                    onHoverEnd={() => setHoveredItem(null)}
                  >
                    <Button
                      color="inherit"
                      startIcon={item.icon}
                      onClick={() => handleNavigation(item.path)}
                      className="rounded-xl transition-all duration-300"
                      sx={{
                        backgroundColor: location.pathname === item.path
                          ? alpha(theme.palette.primary.main, 0.1)
                          : hoveredItem === item.text
                          ? alpha(theme.palette.primary.main, 0.05)
                          : 'transparent',
                        color: location.pathname === item.path
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                      }}
                    >
                      {item.text}
                    </Button>
                  </MotionBox>
                ))}
              </Box>
            )}

            {isAuthenticated ? (
              <Box className="flex items-center gap-2">
                <Tooltip title="Toggle Dark Mode" arrow>
                  <MotionIconButton
                    color="inherit"
                    onClick={toggleColorMode}
                    whileTap={{ scale: 0.9 }}
                    className="hidden sm:inline-flex"
                  >
                    {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                  </MotionIconButton>
                </Tooltip>

                <Tooltip title="Notifications" arrow>
                  <MotionIconButton
                    color="inherit"
                    onClick={handleNotificationMenuOpen}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      sx={{
                        '& .MuiBadge-badge': {
                          background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
                          animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none',
                        },
                      }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </MotionIconButton>
                </Tooltip>

                <Tooltip title="Account" arrow>
                  <MotionIconButton
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </MotionIconButton>
                </Tooltip>

                {/* Profile Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  TransitionComponent={Fade}
                  PaperProps={{
                    sx: {
                      borderRadius: '16px',
                      minWidth: 280,
                      mt: 1.5,
                      backdropFilter: 'blur(20px)',
                      backgroundColor: alpha(theme.palette.background.paper, 0.95),
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <Box className="px-4 py-3 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        }}
                      >
                        {user?.name?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {user?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user?.email}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={user?.role?.toUpperCase()}
                      size="small"
                      className="mt-2 bg-gradient-primary text-white font-semibold"
                    />
                  </Box>
                  <Divider />
                  <MenuItem
                    onClick={() => handleNavigation('/profile')}
                    className="py-3 hover:bg-primary-50 dark:hover:bg-gray-700"
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" className="text-primary-500" />
                    </ListItemIcon>
                    <ListItemText primary="My Profile" />
                  </MenuItem>
                  {(user?.role === 'admin' || user?.role === 'faculty') && (
                    <MenuItem
                      onClick={() => handleNavigation('/admin/dashboard')}
                      className="py-3 hover:bg-primary-50 dark:hover:bg-gray-700"
                    >
                      <ListItemIcon>
                        <AdminIcon fontSize="small" className="text-primary-500" />
                      </ListItemIcon>
                      <ListItemText primary="Admin Panel" />
                    </MenuItem>
                  )}
                  <MenuItem
                    onClick={() => handleNavigation('/settings')}
                    className="py-3 hover:bg-primary-50 dark:hover:bg-gray-700"
                  >
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" className="text-primary-500" />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={handleLogout}
                    className="py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" className="text-red-500" />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </MenuItem>
                </Menu>

                {/* Notifications Menu */}
                <Menu
                  anchorEl={notificationAnchor}
                  open={Boolean(notificationAnchor)}
                  onClose={handleNotificationMenuClose}
                  TransitionComponent={Grow}
                  PaperProps={{
                    sx: {
                      borderRadius: '16px',
                      width: 360,
                      maxHeight: 480,
                      mt: 1.5,
                      backdropFilter: 'blur(20px)',
                      backgroundColor: alpha(theme.palette.background.paper, 0.95),
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <Box className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={600}>
                        Notifications
                      </Typography>
                      {unreadCount > 0 && (
                        <Chip
                          label={`${unreadCount} new`}
                          size="small"
                          className="bg-gradient-primary text-white"
                        />
                      )}
                    </Stack>
                  </Box>
                  <Divider />
                  <Box className="p-4">
                    {unreadCount > 0 ? (
                      <Stack spacing={2}>
                        {/* Sample notification items */}
                        <Paper className="p-3 hover:shadow-md transition-all duration-300 cursor-pointer">
                          <Stack direction="row" spacing={2}>
                            <CircleIcon className="text-primary-500 text-xs mt-1" />
                            <Box flex={1}>
                              <Typography variant="body2" fontWeight={500}>
                                New event registration open
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                2 hours ago
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Stack>
                    ) : (
                      <Box className="text-center py-8">
                        <NotificationsIcon className="text-gray-300 text-5xl mb-2" />
                        <Typography variant="body2" color="text.secondary">
                          No new notifications
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Menu>
              </Box>
            ) : (
              <Box className="flex gap-2">
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => navigate('/login')}
                  className="rounded-xl"
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/register')}
                  className="rounded-xl bg-gradient-primary text-white shadow-md hover:shadow-lg"
                >
                  Get Started
                </Button>
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </MotionBox>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            borderRadius: '0 20px 20px 0',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default ModernNavbar;

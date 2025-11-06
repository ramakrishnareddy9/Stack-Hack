import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  Paper,
  Stack,
  Chip,
  alpha,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Favorite as HeartIcon,
  ArrowForward as ArrowIcon,
  Send as SendIcon,
  Groups as GroupsIcon,
  Handshake as HandshakeIcon,
  EmojiEvents as TrophyIcon,
  VolunteerActivism as VolunteerIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import nssLogo from '../assets/nss-logo.svg';

const MotionBox = motion(Box);
const MotionIconButton = motion(IconButton);

const ModernFooter = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const socialMediaLinks = [
    { icon: <FacebookIcon />, color: '#1877f2', href: '#', label: 'Facebook' },
    { icon: <TwitterIcon />, color: '#1da1f2', href: '#', label: 'Twitter' },
    { icon: <InstagramIcon />, color: '#e4405f', href: '#', label: 'Instagram' },
    { icon: <LinkedInIcon />, color: '#0077b5', href: '#', label: 'LinkedIn' },
    { icon: <YouTubeIcon />, color: '#ff0000', href: '#', label: 'YouTube' },
  ];

  const quickLinks = [
    { title: 'Events', path: '/events' },
    { title: 'About NSS', path: '/about' },
    { title: 'Gallery', path: '/gallery' },
    { title: 'Contact Us', path: '/contact' },
  ];

  const resources = [
    { title: 'Guidelines', path: '/guidelines' },
    { title: 'Downloads', path: '/downloads' },
    { title: 'FAQs', path: '/faq' },
    { title: 'Help Center', path: '/help' },
  ];

  const stats = [
    { icon: <GroupsIcon />, value: '500+', label: 'Volunteers' },
    { icon: <HandshakeIcon />, value: '100+', label: 'Events' },
    { icon: <TrophyIcon />, value: '50+', label: 'Awards' },
    { icon: <VolunteerIcon />, value: '10K+', label: 'Service Hours' },
  ];

  return (
    <Box
      component="footer"
      className="relative mt-auto overflow-hidden"
      sx={{
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #1a1a2e 0%, #0f0f23 100%)',
      }}
    >
      {/* Animated Background Pattern */}
      <Box className="absolute inset-0 opacity-10">
        <Box
          className="absolute -top-20 -left-20 w-60 h-60 bg-white rounded-full animate-float"
          style={{ animationDelay: '0s' }}
        />
        <Box
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-white rounded-full animate-float"
          style={{ animationDelay: '2s' }}
        />
        <Box
          className="absolute top-1/2 left-1/3 w-40 h-40 bg-white rounded-full animate-float"
          style={{ animationDelay: '4s' }}
        />
      </Box>

      {/* Stats Section - Simplified */}
      <Container maxWidth="lg" className="relative z-10 pt-12 pb-6">
        <Grid container spacing={4} className="mb-12">
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <Box sx={{ mb: 1.5, color: 'rgba(255, 255, 255, 0.9)' }}>
                  {React.cloneElement(stat.icon, { fontSize: 'large' })}
                </Box>
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#ffffff',
                    mb: 0.5,
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
                  }}
                >
                  {stat.label}
                </Typography>
              </MotionBox>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 6, opacity: 0.2, backgroundColor: 'white' }} />

        {/* Main Footer Content */}
        <Grid container spacing={6}>
          {/* Brand Section */}
          <Grid item xs={12} md={5}>
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box className="flex items-center mb-3 gap-2">
                <img 
                  src={nssLogo} 
                  alt="NSS Logo" 
                  style={{ 
                    width: '50px', 
                    height: '50px',
                    filter: 'brightness(0) invert(1)'
                  }} 
                />
                <Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      color: '#ffffff',
                      mb: 0.5
                    }}
                  >
                    NSS Portal
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.75rem'
                    }}
                  >
                    Not Me But You
                  </Typography>
                </Box>
              </Box>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.75)',
                  lineHeight: 1.7,
                  mb: 3,
                  maxWidth: '400px'
                }}
              >
                Building character through community service, fostering social 
                responsibility, and creating leaders of tomorrow.
              </Typography>

              {/* Social Media - Moved here */}
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#ffffff',
                    mb: 2,
                    fontWeight: 600,
                    fontSize: '0.875rem'
                  }}
                >
                  Connect With Us
                </Typography>
                <Box className="flex gap-2">
                  {socialMediaLinks.map((social, index) => (
                    <MotionIconButton
                      key={index}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                          color: '#ffffff',
                        }
                      }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={social.label}
                    >
                      {social.icon}
                    </MotionIconButton>
                  ))}
                </Box>
              </Box>
            </MotionBox>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                color: '#ffffff',
                mb: 2,
                fontSize: '0.95rem'
              }}
            >
              Quick Links
            </Typography>
            <Stack spacing={1.2}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(link.path);
                  }}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#ffffff',
                      paddingLeft: '4px'
                    }
                  }}
                >
                  {link.title}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Resources */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                color: '#ffffff',
                mb: 2,
                fontSize: '0.95rem'
              }}
            >
              Resources
            </Typography>
            <Stack spacing={1.2}>
              {resources.map((resource, index) => (
                <Link
                  key={index}
                  href={resource.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(resource.path);
                  }}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#ffffff',
                      paddingLeft: '4px'
                    }
                  }}
                >
                  {resource.title}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={4} md={3}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                color: '#ffffff',
                mb: 2,
                fontSize: '0.95rem'
              }}
            >
              Contact
            </Typography>
            
            <Stack spacing={1.5}>
              <Box className="flex items-start gap-2">
                <LocationIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px', mt: 0.3 }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem',
                    lineHeight: 1.6
                  }}
                >
                  College Campus, Main Road<br />
                  City - 123456, State
                </Typography>
              </Box>
              
              <Box className="flex items-center gap-2">
                <PhoneIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
                  }}
                >
                  +91 98765 43210
                </Typography>
              </Box>
              
              <Box className="flex items-center gap-2">
                <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px' }} />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.875rem'
                  }}
                >
                  nss@college.edu.in
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5, opacity: 0.15, backgroundColor: 'white' }} />

        {/* Bottom Footer - Simplified */}
        <Box sx={{ pb: 4 }}>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'center', md: 'center' }}
            spacing={2}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.875rem',
                textAlign: { xs: 'center', md: 'left' }
              }}
            >
              © {currentYear} NSS Activity Portal. All rights reserved.
            </Typography>
            
            <Stack 
              direction="row" 
              spacing={3}
              sx={{ 
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}
            >
              {['Privacy', 'Terms', 'Contact'].map((item, index) => (
                <Link
                  key={index}
                  href="#"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: '#ffffff'
                    }
                  }}
                >
                  {item}
                </Link>
              ))}
            </Stack>
          </Stack>

          {/* Government Links - Simplified */}
          <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Stack spacing={1.5} alignItems="center">
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '0.75rem'
                }}
              >
                Ministry of Youth Affairs & Sports, Government of India
              </Typography>
              <Stack direction="row" spacing={3}>
                <Link
                  href="https://nss.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: 'rgba(255, 255, 255, 0.8)'
                    }
                  }}
                >
                  NSS Official
                </Link>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>•</Typography>
                <Link
                  href="https://yas.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    textDecoration: 'none',
                    fontSize: '0.75rem',
                    transition: 'color 0.2s',
                    '&:hover': {
                      color: 'rgba(255, 255, 255, 0.8)'
                    }
                  }}
                >
                  Youth Affairs
                </Link>
              </Stack>
            </Stack>
          </Box>
        </Box>
      </Container>

      {/* Wave Animation at Bottom */}
      <Box className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
        <svg
          className="absolute bottom-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-white/10"
          />
        </svg>
      </Box>
    </Box>
  );
};

export default ModernFooter;

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
  Paper
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Paper
      component="footer"
      elevation={3}
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
        mt: 'auto',
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="primary" fontWeight="bold">
                NSS Activity Portal
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              The National Service Scheme (NSS) Activity Portal is dedicated to managing
              and tracking volunteer activities, fostering community service, and building
              character through social engagement.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Motto:</strong> "Not Me But You"
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Quick Links
            </Typography>
            <Box>
              <Link
                href="/events"
                color="text.secondary"
                display="block"
                sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Events
              </Link>
              <Link
                href="/about"
                color="text.secondary"
                display="block"
                sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                About NSS
              </Link>
              <Link
                href="/gallery"
                color="text.secondary"
                display="block"
                sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Gallery
              </Link>
              <Link
                href="/contact"
                color="text.secondary"
                display="block"
                sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Contact Us
              </Link>
            </Box>
          </Grid>

          {/* Resources */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Resources
            </Typography>
            <Box>
              <Link
                href="/guidelines"
                color="text.secondary"
                display="block"
                sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Guidelines
              </Link>
              <Link
                href="/downloads"
                color="text.secondary"
                display="block"
                sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Downloads
              </Link>
              <Link
                href="/faq"
                color="text.secondary"
                display="block"
                sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                FAQs
              </Link>
              <Link
                href="/help"
                color="text.secondary"
                display="block"
                sx={{ mb: 1, textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                Help Center
              </Link>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Contact Information
            </Typography>
            <Box display="flex" alignItems="center" mb={1}>
              <LocationIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                College Campus, Main Road,<br />
                City - 123456, State
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={1}>
              <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                +91 98765 43210
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" mb={2}>
              <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">
                nss@college.edu.in
              </Typography>
            </Box>

            {/* Social Media */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Follow Us:
              </Typography>
              <Box>
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: '#1877f2' } }}
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: '#1da1f2' } }}
                  aria-label="Twitter"
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: '#e4405f' } }}
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton
                  size="small"
                  sx={{ color: 'text.secondary', '&:hover': { color: '#0077b5' } }}
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Bottom Footer */}
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              © {currentYear} NSS Activity Portal. All rights reserved.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} gap={2}>
              <Link
                href="/privacy"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                <Typography variant="body2">Privacy Policy</Typography>
              </Link>
              <Typography variant="body2" color="text.secondary">|</Typography>
              <Link
                href="/terms"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                <Typography variant="body2">Terms of Service</Typography>
              </Link>
              <Typography variant="body2" color="text.secondary">|</Typography>
              <Link
                href="/sitemap"
                color="text.secondary"
                sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
              >
                <Typography variant="body2">Sitemap</Typography>
              </Link>
            </Box>
          </Grid>
        </Grid>

        {/* Government Links */}
        <Box mt={3} pt={2} borderTop={1} borderColor="divider">
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
            An initiative under the Ministry of Youth Affairs & Sports, Government of India
          </Typography>
          <Box display="flex" justifyContent="center" gap={3} mt={1}>
            <Link
              href="https://nss.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              <Typography variant="caption">Official NSS Website</Typography>
            </Link>
            <Typography variant="caption" color="text.secondary">|</Typography>
            <Link
              href="https://yas.nic.in"
              target="_blank"
              rel="noopener noreferrer"
              color="text.secondary"
              sx={{ textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              <Typography variant="caption">Ministry of Youth Affairs</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default Footer;

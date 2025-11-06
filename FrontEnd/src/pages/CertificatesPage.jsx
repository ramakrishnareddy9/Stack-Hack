import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  EmojiEvents as TrophyIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  VerifiedUser as VerifiedIcon,
  CalendarMonth as CalendarIcon,
  Timer as TimerIcon,
  QrCode2 as QrCodeIcon,
  School as SchoolIcon,
  Star as StarIcon,
  WorkspacePremium as PremiumIcon,
  CardMembership as MembershipIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CertificatesPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    totalCertificates: 0,
    totalHours: 0,
    uniqueEvents: 0,
    mostRecentCertificate: null,
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [searchQuery, filterType, certificates]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/certificates/my', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const certificateData = response.data;
      setCertificates(certificateData);
      setFilteredCertificates(certificateData);

      // Calculate statistics
      const totalHours = certificateData.reduce((sum, cert) => sum + cert.hoursAwarded, 0);
      const uniqueEventTypes = [...new Set(certificateData.map(cert => cert.eventType))];
      const mostRecent = certificateData.sort((a, b) => 
        new Date(b.issuedDate) - new Date(a.issuedDate)
      )[0];

      setStats({
        totalCertificates: certificateData.length,
        totalHours: totalHours,
        uniqueEvents: uniqueEventTypes.length,
        mostRecentCertificate: mostRecent,
      });
    } catch (error) {
      toast.error('Failed to fetch certificates');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterCertificates = () => {
    let filtered = [...certificates];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(cert =>
        cert.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.eventType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(cert => cert.eventType === filterType);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate));

    setFilteredCertificates(filtered);
  };

  const handleDownloadCertificate = async (certificateId, eventTitle) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/certificates/${certificateId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificate_${eventTitle.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Certificate downloaded successfully');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const handleShareCertificate = async (certificate) => {
    const shareUrl = `${window.location.origin}/verify/${certificate.verificationId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `NSS Certificate - ${certificate.eventTitle}`,
          text: `Check out my NSS participation certificate for ${certificate.eventTitle}!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Verification link copied to clipboard!');
    }
  };

  const handlePrintCertificate = async (certificateId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/certificates/${certificateId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const printWindow = window.open(url);
      printWindow.addEventListener('load', () => {
        printWindow.print();
      });
    } catch (error) {
      toast.error('Failed to print certificate');
    }
  };

  const generateBulkDownload = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/certificates/download-all', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `All_Certificates_${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('All certificates downloaded successfully');
    } catch (error) {
      toast.error('Failed to download certificates');
    }
  };

  const getCertificateBadge = (hoursAwarded) => {
    if (hoursAwarded >= 50) return { icon: <PremiumIcon />, color: 'gold', label: 'Gold' };
    if (hoursAwarded >= 25) return { icon: <StarIcon />, color: 'silver', label: 'Silver' };
    if (hoursAwarded >= 10) return { icon: <MembershipIcon />, color: '#cd7f32', label: 'Bronze' };
    return null;
  };

  const eventTypeColors = {
    tree_plantation: '#059669',
    blood_donation: '#dc2626',
    cleanliness_drive: '#3b82f6',
    awareness_campaign: '#f59e0b',
    health_camp: '#8b5cf6',
    education: '#06b6d4',
    community_service: '#ec4899',
    other: '#6b7280',
  };

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
      <Box className="mb-6">
        <Typography variant="h4" className="font-bold mb-2">
          My Certificates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and download your NSS participation certificates
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} className="mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {stats.totalCertificates}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Total Certificates
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <TrophyIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {stats.totalHours}h
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Total Hours
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <TimerIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" className="font-bold">
                    {stats.uniqueEvents}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Event Types
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" className="font-bold truncate">
                    {stats.mostRecentCertificate?.eventTitle || 'N/A'}
                  </Typography>
                  <Typography variant="body2" className="opacity-90">
                    Latest Certificate
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)' }}>
                  <CalendarIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper className="p-4 mb-6">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter by Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="tree_plantation">Tree Plantation</MenuItem>
                <MenuItem value="blood_donation">Blood Donation</MenuItem>
                <MenuItem value="cleanliness_drive">Cleanliness Drive</MenuItem>
                <MenuItem value="awareness_campaign">Awareness Campaign</MenuItem>
                <MenuItem value="health_camp">Health Camp</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="community_service">Community Service</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={generateBulkDownload}
              disabled={certificates.length === 0}
            >
              Download All
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Certificates Tabs */}
      <Paper>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`All Certificates (${filteredCertificates.length})`} />
          <Tab label="Recent" />
          <Tab label="Achievements" />
        </Tabs>

        <Box className="p-4">
          {tabValue === 0 && (
            <>
              {filteredCertificates.length === 0 ? (
                <Alert severity="info">
                  {searchQuery || filterType !== 'all'
                    ? 'No certificates found matching your search criteria'
                    : 'No certificates available yet. Complete NSS events to earn certificates!'}
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {filteredCertificates.map((certificate) => {
                    const badge = getCertificateBadge(certificate.hoursAwarded);
                    return (
                      <Grid item xs={12} md={6} lg={4} key={certificate._id}>
                        <Card className="hover:shadow-lg transition-shadow h-full">
                          <Box
                            className="h-2"
                            sx={{ bgcolor: eventTypeColors[certificate.eventType] || '#6b7280' }}
                          />
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="start" className="mb-3">
                              <Box flex={1}>
                                <Typography variant="h6" className="font-semibold line-clamp-2">
                                  {certificate.eventTitle}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {certificate.eventType.replace(/_/g, ' ').charAt(0).toUpperCase() + 
                                   certificate.eventType.replace(/_/g, ' ').slice(1)}
                                </Typography>
                              </Box>
                              {badge && (
                                <Tooltip title={`${badge.label} Achievement`}>
                                  <Avatar sx={{ bgcolor: badge.color, width: 32, height: 32 }}>
                                    {badge.icon}
                                  </Avatar>
                                </Tooltip>
                              )}
                            </Box>

                            <Box display="flex" gap={1} flexWrap="wrap" className="mb-3">
                              <Chip
                                size="small"
                                icon={<CalendarIcon />}
                                label={format(new Date(certificate.issuedDate), 'dd MMM yyyy')}
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                icon={<TimerIcon />}
                                label={`${certificate.hoursAwarded}h`}
                                color="primary"
                                variant="outlined"
                              />
                              <Chip
                                size="small"
                                icon={<VerifiedIcon />}
                                label="Verified"
                                color="success"
                                variant="outlined"
                              />
                            </Box>

                            <Box display="flex" alignItems="center" gap={1} className="mb-2">
                              <QrCodeIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                ID: {certificate.certificateId}
                              </Typography>
                            </Box>

                            {certificate.description && (
                              <Typography variant="body2" color="text.secondary" className="line-clamp-2">
                                {certificate.description}
                              </Typography>
                            )}
                          </CardContent>
                          <CardActions className="px-4 pb-4">
                            <Button
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownloadCertificate(certificate._id, certificate.eventTitle)}
                            >
                              Download
                            </Button>
                            <Button
                              size="small"
                              startIcon={<ViewIcon />}
                              onClick={() => {
                                setSelectedCertificate(certificate);
                                setOpenPreview(true);
                              }}
                            >
                              Preview
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => handleShareCertificate(certificate)}
                            >
                              <ShareIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handlePrintCertificate(certificate._id)}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </>
          )}

          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" className="mb-4">
                Recent Certificates (Last 30 Days)
              </Typography>
              {filteredCertificates
                .filter(cert => {
                  const certDate = new Date(cert.issuedDate);
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  return certDate >= thirtyDaysAgo;
                })
                .length === 0 ? (
                <Alert severity="info">No certificates issued in the last 30 days</Alert>
              ) : (
                <List>
                  {filteredCertificates
                    .filter(cert => {
                      const certDate = new Date(cert.issuedDate);
                      const thirtyDaysAgo = new Date();
                      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                      return certDate >= thirtyDaysAgo;
                    })
                    .map((certificate) => (
                      <React.Fragment key={certificate._id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: eventTypeColors[certificate.eventType] }}>
                              <TrophyIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={certificate.eventTitle}
                            secondary={`Issued on ${format(new Date(certificate.issuedDate), 'dd MMM yyyy')} • ${certificate.hoursAwarded} hours`}
                          />
                          <Button
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadCertificate(certificate._id, certificate.eventTitle)}
                          >
                            Download
                          </Button>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                </List>
              )}
            </Box>
          )}

          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" className="mb-4">
                Your Achievements
              </Typography>
              <Grid container spacing={3}>
                {stats.totalHours >= 100 && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card className="text-center p-4">
                      <Avatar sx={{ bgcolor: 'gold', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                        <PremiumIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h6" className="font-bold">
                        Century Achiever
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        100+ volunteer hours
                      </Typography>
                    </Card>
                  </Grid>
                )}
                {stats.totalCertificates >= 10 && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card className="text-center p-4">
                      <Avatar sx={{ bgcolor: 'silver', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                        <StarIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h6" className="font-bold">
                        Active Volunteer
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        10+ events participated
                      </Typography>
                    </Card>
                  </Grid>
                )}
                {stats.uniqueEvents >= 5 && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Card className="text-center p-4">
                      <Avatar sx={{ bgcolor: '#cd7f32', width: 80, height: 80, mx: 'auto', mb: 2 }}>
                        <MembershipIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h6" className="font-bold">
                        Versatile Contributor
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        5+ different event types
                      </Typography>
                    </Card>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Certificate Preview Dialog */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>Certificate Preview</DialogTitle>
        <DialogContent>
          {selectedCertificate && (
            <Box className="p-4">
              <Paper className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
                <Box className="text-center mb-4">
                  <Typography variant="h4" className="font-bold text-blue-900 mb-2">
                    Certificate of Participation
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    National Service Scheme
                  </Typography>
                </Box>

                <Divider className="my-4" />

                <Box className="text-center mb-4">
                  <Typography variant="body1" className="mb-2">
                    This is to certify that
                  </Typography>
                  <Typography variant="h5" className="font-bold text-purple-900 mb-2">
                    {localStorage.getItem('userName') || 'Student Name'}
                  </Typography>
                  <Typography variant="body1">
                    has successfully participated in
                  </Typography>
                  <Typography variant="h6" className="font-semibold text-blue-800 mt-2">
                    {selectedCertificate.eventTitle}
                  </Typography>
                </Box>

                <Box className="text-center mb-4">
                  <Chip
                    label={`${selectedCertificate.hoursAwarded} Volunteer Hours`}
                    color="primary"
                    size="large"
                  />
                </Box>

                <Grid container spacing={2} className="mt-4">
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Date of Event
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(selectedCertificate.eventDate), 'dd MMMM yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Certificate ID
                    </Typography>
                    <Typography variant="body1">
                      {selectedCertificate.certificateId}
                    </Typography>
                  </Grid>
                </Grid>

                <Box className="mt-6 text-center">
                  <Typography variant="caption" color="text.secondary">
                    This certificate is digitally generated and can be verified at
                  </Typography>
                  <Typography variant="caption" color="primary">
                    {` ${window.location.origin}/verify/${selectedCertificate.verificationId}`}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={() => {
              handleDownloadCertificate(selectedCertificate._id, selectedCertificate.eventTitle);
              setOpenPreview(false);
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CertificatesPage;

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Chip,
  Grid,
  Card,
  CardMedia,
  CardActions,
  LinearProgress,
  Alert,
  alpha,
  useTheme,
  Paper,
  Stack,
  Tooltip,
  Fab
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Description as DocumentIcon,
  Image as ImageIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  AttachFile as AttachFileIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MotionCard = motion(Card);

const ModernContributionForm = ({ participation, open, onClose, onSuccess }) => {
  const theme = useTheme();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [evidence, setEvidence] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should not exceed 10MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Handle response
      let fileUrl = response.data.url;
      if (fileUrl.startsWith('/uploads/')) {
        fileUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${fileUrl}`;
      }

      const newEvidence = {
        type: file.type.startsWith('image/') ? 'photo' : 'document',
        url: fileUrl,
        publicId: response.data.publicId,
        description: file.name,
        size: file.size,
        mimeType: file.type
      };

      setEvidence(prev => [...prev, newEvidence]);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeEvidence = async (index) => {
    const item = evidence[index];
    if (item.publicId) {
      try {
        await api.delete(`/upload/${item.publicId}`);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    setEvidence(prev => prev.filter((_, i) => i !== index));
    toast.success('File removed');
  };

  const onSubmit = async (data) => {
    if (evidence.length === 0) {
      toast.error('Please upload at least one piece of evidence');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/contributions', {
        participationId: participation._id,
        report: data.report,
        volunteerHours: parseFloat(data.volunteerHours),
        evidence: evidence
      });

      toast.success('Contribution submitted successfully! 🎉', {
        duration: 4000,
        icon: '✅'
      });

      reset();
      setEvidence([]);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit contribution');
    } finally {
      setSubmitting(false);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <ImageIcon />;
    if (mimeType?.includes('pdf')) return <PdfIcon />;
    return <DocumentIcon />;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.paper, 0.95)
            : 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight="600">
              Submit Contribution Report
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Event: {participation?.event?.title}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={3}>
            {/* Report Text */}
            <Box>
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Activity Report *
              </Typography>
              <TextField
                {...register('report', {
                  required: 'Report is required',
                  minLength: {
                    value: 100,
                    message: 'Report should be at least 100 characters'
                  }
                })}
                multiline
                rows={6}
                fullWidth
                placeholder="Describe your participation, activities performed, what you learned, and your contribution to the event..."
                error={!!errors.report}
                helperText={errors.report?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: alpha(theme.palette.background.default, 0.5),
                  }
                }}
              />
            </Box>

            {/* Volunteer Hours */}
            <Box>
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Volunteer Hours *
              </Typography>
              <TextField
                {...register('volunteerHours', {
                  required: 'Volunteer hours are required',
                  min: {
                    value: 0.5,
                    message: 'Must be at least 0.5 hours'
                  },
                  max: {
                    value: 24,
                    message: 'Cannot exceed 24 hours per day'
                  }
                })}
                type="number"
                inputProps={{ step: 0.5, min: 0.5, max: 24 }}
                fullWidth
                error={!!errors.volunteerHours}
                helperText={errors.volunteerHours?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimeIcon color="action" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: alpha(theme.palette.background.default, 0.5),
                  }
                }}
              />
            </Box>

            {/* Evidence Upload */}
            <Box>
              <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                Evidence (Photos, Documents) *
              </Typography>
              <Paper
                sx={{
                  p: 2,
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 2,
                  background: alpha(theme.palette.primary.main, 0.02),
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    background: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
                component="label"
              >
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  disabled={uploading}
                />
                <UploadIcon sx={{ fontSize: 48, color: theme.palette.primary.main, mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Images, PDF, DOC up to 10MB
                </Typography>
              </Paper>

              {/* Upload Progress */}
              {uploading && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Uploading... {uploadProgress}%
                  </Typography>
                </Box>
              )}

              {/* Evidence Grid */}
              {evidence.length > 0 && (
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <AnimatePresence>
                    {evidence.map((item, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <MotionCard
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                          sx={{
                            position: 'relative',
                            background: alpha(theme.palette.background.paper, 0.8),
                            backdropFilter: 'blur(10px)',
                            '&:hover .delete-btn': {
                              opacity: 1
                            }
                          }}
                        >
                          {item.type === 'photo' ? (
                            <CardMedia
                              component="img"
                              height="140"
                              image={item.url}
                              alt="Evidence"
                              sx={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 140,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.05)
                              }}
                            >
                              {getFileIcon(item.mimeType)}
                              <Typography variant="caption" sx={{ mt: 1, px: 1 }} noWrap>
                                {item.description}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatFileSize(item.size)}
                              </Typography>
                            </Box>
                          )}
                          <IconButton
                            className="delete-btn"
                            onClick={() => removeEvidence(index)}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: alpha(theme.palette.error.main, 0.9),
                              color: 'white',
                              opacity: 0,
                              transition: 'opacity 0.3s',
                              '&:hover': {
                                bgcolor: theme.palette.error.main,
                              }
                            }}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </MotionCard>
                      </Grid>
                    ))}
                  </AnimatePresence>
                </Grid>
              )}

              {evidence.length === 0 && !uploading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Upload at least one file as evidence of your participation
                </Alert>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            background: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || uploading || evidence.length === 0}
            startIcon={submitting ? null : <CheckIcon />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              }
            }}
          >
            {submitting ? 'Submitting...' : 'Submit Contribution'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ModernContributionForm;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  AttachFile as FileIcon,
  Send as SendIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import toast from 'react-hot-toast';

const EvidenceUpload = ({ participationId, eventDetails, onSubmitSuccess }) => {
  const [files, setFiles] = useState([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [previewFile, setPreviewFile] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [existingEvidence, setExistingEvidence] = useState([]);

  const steps = ['Upload Evidence', 'Add Description', 'Review & Submit'];

  useEffect(() => {
    fetchExistingEvidence();
  }, [participationId]);

  const fetchExistingEvidence = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/participations/${participationId}/evidence`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExistingEvidence(response.data.evidence || []);
    } catch (error) {
      console.error('Failed to fetch existing evidence:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 10,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((file) => {
          if (file.errors[0].code === 'file-too-large') {
            toast.error(`${file.file.name} is too large. Max size is 10MB`);
          } else if (file.errors[0].code === 'file-invalid-type') {
            toast.error(`${file.file.name} is not a supported file type`);
          }
        });
      }

      const newFiles = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        type: getFileType(file),
      }));

      setFiles([...files, ...newFiles]);
    },
  });

  const getFileType = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.includes('document')) return 'document';
    return 'file';
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon />;
      case 'pdf':
        return <PdfIcon />;
      case 'document':
        return <DescriptionIcon />;
      default:
        return <FileIcon />;
    }
  };

  const removeFile = (id) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setOpenPreview(true);
  };

  const handleSubmit = async () => {
    if (files.length === 0 && existingEvidence.length === 0) {
      toast.error('Please upload at least one evidence file');
      return;
    }

    if (!description.trim()) {
      toast.error('Please provide a description of your participation');
      return;
    }

    try {
      setLoading(true);
      setAiProcessing(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();

      files.forEach((fileObj) => {
        formData.append('evidence', fileObj.file);
      });
      formData.append('description', description);
      formData.append('participationId', participationId);

      const response = await axios.post(
        `/api/participations/${participationId}/evidence`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      // Generate AI report
      setAiProcessing(true);
      try {
        await axios.post(
          `/api/participations/${participationId}/generate-report`,
          { description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Evidence uploaded and AI report generated successfully!');
      } catch (aiError) {
        toast.success('Evidence uploaded successfully! AI report generation is pending.');
      }

      if (onSubmitSuccess) {
        onSubmitSuccess(response.data);
      }

      // Reset form
      setFiles([]);
      setDescription('');
      setUploadProgress(0);
      setActiveStep(0);
      fetchExistingEvidence();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload evidence');
    } finally {
      setLoading(false);
      setAiProcessing(false);
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && files.length === 0 && existingEvidence.length === 0) {
      toast.error('Please upload at least one evidence file');
      return;
    }
    if (activeStep === 1 && !description.trim()) {
      toast.error('Please provide a description');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Alert severity="info" className="mb-4">
              <Typography variant="body2">
                Upload photos, PDFs, or documents as evidence of your participation in{' '}
                <strong>{eventDetails?.title}</strong>
              </Typography>
            </Alert>

            <Box
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${isDragReject ? 'border-red-500 bg-red-50' : ''}`}
            >
              <input {...getInputProps()} />
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive
                  ? 'Drop your files here'
                  : 'Drag & drop files here, or click to browse'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported: Images (JPEG, PNG, GIF), PDFs, Word Documents
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Max 10 files, 10MB each
              </Typography>
            </Box>

            {files.length > 0 && (
              <Box className="mt-4">
                <Typography variant="h6" className="mb-2">
                  Uploaded Files ({files.length})
                </Typography>
                <Grid container spacing={2}>
                  {files.map((fileObj) => (
                    <Grid item xs={12} sm={6} md={4} key={fileObj.id}>
                      <Card className="hover:shadow-md transition-shadow">
                        {fileObj.type === 'image' ? (
                          <CardMedia
                            component="img"
                            height="140"
                            image={fileObj.preview}
                            alt={fileObj.file.name}
                            className="object-cover h-32"
                          />
                        ) : (
                          <Box
                            className="h-32 bg-gray-100 flex items-center justify-center"
                          >
                            {getFileIcon(fileObj.type)}
                          </Box>
                        )}
                        <CardContent className="p-2">
                          <Typography variant="body2" noWrap>
                            {fileObj.file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </CardContent>
                        <CardActions className="p-2">
                          <IconButton
                            size="small"
                            onClick={() => handlePreview(fileObj)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeFile(fileObj.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {existingEvidence.length > 0 && (
              <Box className="mt-4">
                <Typography variant="h6" className="mb-2">
                  Previously Uploaded Evidence
                </Typography>
                <List>
                  {existingEvidence.map((evidence, index) => (
                    <ListItem key={index} className="bg-gray-50 rounded mb-1">
                      <ListItemIcon>{getFileIcon(evidence.type)}</ListItemIcon>
                      <ListItemText
                        primary={`${evidence.type} file`}
                        secondary={`Uploaded on ${new Date(
                          evidence.uploadedAt
                        ).toLocaleDateString()}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Alert severity="info" className="mb-4">
              <Typography variant="body2">
                Describe your participation, activities performed, and any notable contributions
              </Typography>
            </Alert>

            <TextField
              fullWidth
              multiline
              rows={8}
              label="Participation Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your role and activities during the event. Include specific contributions, tasks completed, and any impact you made..."
              variant="outlined"
              helperText={`${description.length}/1000 characters`}
              inputProps={{ maxLength: 1000 }}
            />

            <Box className="mt-4 p-4 bg-blue-50 rounded">
              <Box display="flex" alignItems="center" gap={1} className="mb-2">
                <AIIcon color="primary" />
                <Typography variant="subtitle1" fontWeight="medium">
                  AI-Powered Report Generation
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Your description and uploaded evidence will be analyzed by AI to generate a
                comprehensive participation report automatically.
              </Typography>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Alert severity="success" className="mb-4">
              Ready to submit your evidence for review
            </Alert>

            <Card variant="outlined" className="mb-4">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Submission Summary
                </Typography>
                <Divider className="my-2" />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Event
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {eventDetails?.title}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Files Uploaded
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {files.length + existingEvidence.length} file(s)
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Size
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {(
                        files.reduce((acc, f) => acc + f.file.size, 0) /
                        1024 /
                        1024
                      ).toFixed(2)}{' '}
                      MB
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description Preview
                    </Typography>
                    <Paper className="p-2 bg-gray-50 mt-1">
                      <Typography variant="body2">
                        {description || 'No description provided'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <Box className="mt-4">
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    File List:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {files.map((fileObj) => (
                      <Chip
                        key={fileObj.id}
                        icon={getFileIcon(fileObj.type)}
                        label={fileObj.file.name}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <Alert severity="warning" icon={<WarningIcon />}>
              Once submitted, your evidence will be reviewed by the NSS coordinator. You'll be
              notified once your participation is approved.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Paper className="p-6">
      <Typography variant="h5" className="font-bold mb-4">
        Upload Participation Evidence
      </Typography>

      <Stepper activeStep={activeStep} className="mb-6">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {loading && (
        <Box className="mb-4">
          <Typography variant="body2" className="mb-1">
            {aiProcessing ? 'Generating AI report...' : 'Uploading files...'}
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      <Box className="min-h-[400px]">{getStepContent(activeStep)}</Box>

      <Box className="mt-6 flex justify-between">
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Box display="flex" gap={2}>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              {loading ? 'Submitting...' : 'Submit Evidence'}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Continue
            </Button>
          )}
        </Box>
      </Box>

      {/* File Preview Dialog */}
      <Dialog open={openPreview} onClose={() => setOpenPreview(false)} maxWidth="md" fullWidth>
        <DialogTitle>File Preview</DialogTitle>
        <DialogContent>
          {previewFile?.type === 'image' ? (
            <img
              src={previewFile.preview}
              alt="Preview"
              className="w-full h-auto max-h-[500px] object-contain"
            />
          ) : (
            <Box className="p-8 text-center">
              <Box className="mb-4">{getFileIcon(previewFile?.type)}</Box>
              <Typography variant="h6">{previewFile?.file.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {previewFile?.type === 'pdf'
                  ? 'PDF preview not available'
                  : 'Document preview not available'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default EvidenceUpload;

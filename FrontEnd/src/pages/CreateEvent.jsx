import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormControlLabel,
  Switch,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Tooltip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Save as SaveIcon,
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  VolunteerActivism as VolunteerIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(),
    registrationDeadline: new Date(),
    maxParticipants: '',
    hoursAwarded: 2,
    requirements: [],
    images: [],
    approvalRequired: true,
    status: 'draft',
  });
  const [requirement, setRequirement] = useState('');
  const [errors, setErrors] = useState({});

  const eventTypes = [
    { value: 'tree_plantation', label: 'Tree Plantation', icon: '🌳' },
    { value: 'blood_donation', label: 'Blood Donation', icon: '🩸' },
    { value: 'cleanliness_drive', label: 'Cleanliness Drive', icon: '🧹' },
    { value: 'awareness_campaign', label: 'Awareness Campaign', icon: '📢' },
    { value: 'health_camp', label: 'Health Camp', icon: '🏥' },
    { value: 'education', label: 'Education Program', icon: '📚' },
    { value: 'community_service', label: 'Community Service', icon: '🤝' },
    { value: 'other', label: 'Other', icon: '📌' },
  ];

  const steps = [
    'Basic Information',
    'Schedule & Location',
    'Participation Details',
    'Requirements & Media',
    'Review & Publish',
  ];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    setErrors({ ...errors, [field]: '' });
  };

  const handleDateChange = (field) => (date) => {
    setFormData({
      ...formData,
      [field]: date,
    });
    setErrors({ ...errors, [field]: '' });
  };

  const handleAddRequirement = () => {
    if (requirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirement.trim()],
      });
      setRequirement('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index),
    });
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 0:
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.description) newErrors.description = 'Description is required';
        if (!formData.eventType) newErrors.eventType = 'Event type is required';
        break;
      case 1:
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (!formData.registrationDeadline) newErrors.registrationDeadline = 'Registration deadline is required';
        if (formData.endDate < formData.startDate) {
          newErrors.endDate = 'End date must be after start date';
        }
        if (formData.registrationDeadline > formData.startDate) {
          newErrors.registrationDeadline = 'Registration deadline must be before event start';
        }
        break;
      case 2:
        if (formData.maxParticipants && formData.maxParticipants < 1) {
          newErrors.maxParticipants = 'Max participants must be at least 1';
        }
        if (!formData.hoursAwarded || formData.hoursAwarded < 1) {
          newErrors.hoursAwarded = 'Hours awarded must be at least 1';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (publish = false) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const eventData = {
        ...formData,
        status: publish ? 'published' : 'draft',
        maxParticipants: formData.maxParticipants || null,
      };

      const response = await axios.post('/api/events', eventData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (publish) {
        await axios.post(`/api/events/${response.data._id}/publish`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success(`Event ${publish ? 'published' : 'saved as draft'} successfully!`);
      navigate('/admin/events');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      setFormData({
        ...formData,
        images: [...formData.images, ...acceptedFiles],
      });
    },
  });

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={formData.title}
                  onChange={handleChange('title')}
                  error={!!errors.title}
                  helperText={errors.title}
                  placeholder="e.g., Annual Tree Plantation Drive"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Event Description"
                  value={formData.description}
                  onChange={handleChange('description')}
                  error={!!errors.description}
                  helperText={errors.description}
                  placeholder="Provide a detailed description of the event..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.eventType}>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={formData.eventType}
                    onChange={handleChange('eventType')}
                    label="Event Type"
                  >
                    {eventTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>{type.icon}</span>
                          <span>{type.label}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Location"
                    value={formData.location}
                    onChange={handleChange('location')}
                    error={!!errors.location}
                    helperText={errors.location}
                    placeholder="e.g., Community Center, Main Street"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Start Date & Time"
                    value={formData.startDate}
                    onChange={handleDateChange('startDate')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.startDate}
                        helperText={errors.startDate}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="End Date & Time"
                    value={formData.endDate}
                    onChange={handleDateChange('endDate')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.endDate}
                        helperText={errors.endDate}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <DateTimePicker
                    label="Registration Deadline"
                    value={formData.registrationDeadline}
                    onChange={handleDateChange('registrationDeadline')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.registrationDeadline}
                        helperText={errors.registrationDeadline || 'Students must register before this date'}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </LocalizationProvider>
        );

      case 2:
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Participants"
                  value={formData.maxParticipants}
                  onChange={handleChange('maxParticipants')}
                  error={!!errors.maxParticipants}
                  helperText={errors.maxParticipants || 'Leave empty for unlimited'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GroupIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Volunteer Hours Awarded"
                  value={formData.hoursAwarded}
                  onChange={handleChange('hoursAwarded')}
                  error={!!errors.hoursAwarded}
                  helperText={errors.hoursAwarded || 'Hours students will receive for participation'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VolunteerIcon />
                      </InputAdornment>
                    ),
                    inputProps: { min: 1, max: 100 },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.approvalRequired}
                      onChange={(e) => setFormData({ ...formData, approvalRequired: e.target.checked })}
                      color="primary"
                    />
                  }
                  label="Require approval for student registrations"
                />
                <Typography variant="body2" color="text.secondary" className="ml-8">
                  If enabled, you'll need to manually approve each student's registration
                </Typography>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" className="mb-2">
                  Requirements
                </Typography>
                <Box display="flex" gap={2} className="mb-2">
                  <TextField
                    fullWidth
                    size="small"
                    label="Add Requirement"
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                    placeholder="e.g., Bring water bottle"
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddRequirement}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                {formData.requirements.length > 0 && (
                  <List>
                    {formData.requirements.map((req, index) => (
                      <ListItem key={index} className="bg-gray-50 rounded mb-1">
                        <ListItemText primary={req} />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" onClick={() => handleRemoveRequirement(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" className="mb-2">
                  Event Images (Optional)
                </Typography>
                <Box
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <input {...getInputProps()} />
                  <ImageIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
                  <Typography variant="body1" className="mt-2">
                    {isDragActive
                      ? 'Drop the images here...'
                      : 'Drag & drop images here, or click to select'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Max 5 images, 5MB each
                  </Typography>
                </Box>
                {formData.images.length > 0 && (
                  <Box className="mt-3">
                    <Grid container spacing={2}>
                      {formData.images.map((file, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Card>
                            <CardContent className="relative p-2">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded"
                              />
                              <IconButton
                                size="small"
                                className="absolute top-1 right-1 bg-white"
                                onClick={() => removeImage(index)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <Typography variant="caption" className="mt-1 block truncate">
                                {file.name}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Alert severity="info" className="mb-4">
              Please review all event details before publishing
            </Alert>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" className="font-bold mb-3">
                  {formData.title || 'Untitled Event'}
                </Typography>
                <Divider className="my-3" />
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Event Type
                    </Typography>
                    <Typography variant="body1" className="font-medium mb-2">
                      {eventTypes.find(t => t.value === formData.eventType)?.label}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1" className="font-medium mb-2">
                      {formData.location}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Start Date
                    </Typography>
                    <Typography variant="body1" className="font-medium mb-2">
                      {formData.startDate.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      End Date
                    </Typography>
                    <Typography variant="body1" className="font-medium mb-2">
                      {formData.endDate.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Registration Deadline
                    </Typography>
                    <Typography variant="body1" className="font-medium mb-2">
                      {formData.registrationDeadline.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Max Participants
                    </Typography>
                    <Typography variant="body1" className="font-medium mb-2">
                      {formData.maxParticipants || 'Unlimited'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Volunteer Hours
                    </Typography>
                    <Typography variant="body1" className="font-medium mb-2">
                      {formData.hoursAwarded} hours
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Approval Required
                    </Typography>
                    <Typography variant="body1" className="font-medium mb-2">
                      {formData.approvalRequired ? 'Yes' : 'No'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1" className="mb-2">
                      {formData.description}
                    </Typography>
                  </Grid>
                  {formData.requirements.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Requirements
                      </Typography>
                      <Box className="mt-1">
                        {formData.requirements.map((req, index) => (
                          <Chip
                            key={index}
                            label={req}
                            size="small"
                            className="mr-1 mb-1"
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                  {formData.images.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Images
                      </Typography>
                      <Typography variant="body1">
                        {formData.images.length} image(s) uploaded
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="md" className="py-8">
      <Paper className="p-6">
        <Typography variant="h4" className="font-bold mb-6">
          Create New Event
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel
                optional={
                  index === steps.length - 1 ? (
                    <Typography variant="caption">Last step</Typography>
                  ) : null
                }
              >
                {label}
              </StepLabel>
              <StepContent>
                {getStepContent(index)}
                <Box className="mt-4">
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    className="mr-2"
                  >
                    Back
                  </Button>
                  {activeStep === steps.length - 1 ? (
                    <>
                      <Button
                        variant="outlined"
                        onClick={() => handleSubmit(false)}
                        disabled={loading}
                        className="mr-2"
                        startIcon={<SaveIcon />}
                      >
                        Save as Draft
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => handleSubmit(true)}
                        disabled={loading}
                        startIcon={<SendIcon />}
                      >
                        Publish Event
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                    >
                      Continue
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === steps.length && (
          <Box className="mt-4 p-4 bg-green-50 rounded">
            <Alert severity="success">
              <Typography variant="h6">Event created successfully!</Typography>
              <Typography variant="body2">
                Your event has been created and published. Students can now register for it.
              </Typography>
            </Alert>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CreateEvent;

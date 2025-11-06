import React, { useState, useEffect } from 'react';
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
  Grid,
  MenuItem,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Stack,
  alpha,
  useTheme,
  Tooltip,
  FormHelperText
} from '@mui/material';
import {
  Close as CloseIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const MotionBox = motion(Box);

const eventTypes = [
  'Tree Plantation',
  'Blood Donation',
  'Cleanliness Drive',
  'Awareness Campaign',
  'Health Camp',
  'Education Support',
  'Community Service',
  'Disaster Relief',
  'Other'
];

const ModernEventModal = ({ event, open, onClose }) => {
  const theme = useTheme();
  const { register, handleSubmit, control, formState: { errors }, setValue, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [requirementInput, setRequirementInput] = useState('');

  useEffect(() => {
    if (event) {
      setValue('title', event.title);
      setValue('description', event.description);
      setValue('eventType', event.eventType);
      setValue('location', event.location);
      setValue('startDate', new Date(event.startDate));
      setValue('endDate', new Date(event.endDate));
      setValue('registrationDeadline', new Date(event.registrationDeadline));
      setValue('maxParticipants', event.maxParticipants || '');
      setRequirements(event.requirements || []);
    } else {
      reset();
      setRequirements([]);
    }
  }, [event, setValue, reset]);

  const handleAddRequirement = () => {
    if (requirementInput.trim()) {
      setRequirements([...requirements, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const eventData = {
        ...data,
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
        registrationDeadline: data.registrationDeadline?.toISOString(),
        requirements,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null
      };

      if (event) {
        await api.put(`/events/${event._id}`, eventData);
        toast.success('Event updated successfully! 🎉');
      } else {
        await api.post('/events', eventData);
        toast.success('Event created successfully! 🚀');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
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
      <DialogTitle 
        sx={{ 
          pb: 1,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <EventIcon sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h5" fontWeight="600">
              {event ? 'Edit Event' : 'Create New Event'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              {/* Title */}
              <Grid item xs={12}>
                <TextField
                  {...register('title', { required: 'Event title is required' })}
                  label="Event Title"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  {...register('description', { required: 'Description is required' })}
                  label="Description"
                  multiline
                  rows={4}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />
              </Grid>

              {/* Event Type and Location */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="eventType"
                  control={control}
                  rules={{ required: 'Event type is required' }}
                  defaultValue=""
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.eventType}>
                      <InputLabel>Event Type</InputLabel>
                      <Select
                        {...field}
                        label="Event Type"
                        startAdornment={
                          <InputAdornment position="start">
                            <CategoryIcon color="action" />
                          </InputAdornment>
                        }
                        sx={{
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.divider, 0.3),
                          },
                          background: alpha(theme.palette.background.default, 0.5),
                        }}
                      >
                        {eventTypes.map((type) => (
                          <MenuItem key={type} value={type.toLowerCase().replace(' ', '-')}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.eventType && (
                        <FormHelperText>{errors.eventType.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('location', { required: 'Location is required' })}
                  label="Location"
                  fullWidth
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />
              </Grid>

              {/* Date and Time Fields */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="startDate"
                  control={control}
                  rules={{ required: 'Start date is required' }}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="Start Date & Time"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.startDate,
                          helperText: errors.startDate?.message,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarIcon color="action" />
                              </InputAdornment>
                            )
                          },
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              background: alpha(theme.palette.background.default, 0.5),
                            }
                          }
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="endDate"
                  control={control}
                  rules={{ required: 'End date is required' }}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="End Date & Time"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endDate,
                          helperText: errors.endDate?.message,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarIcon color="action" />
                              </InputAdornment>
                            )
                          },
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              background: alpha(theme.palette.background.default, 0.5),
                            }
                          }
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Registration Deadline */}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="registrationDeadline"
                  control={control}
                  rules={{ required: 'Registration deadline is required' }}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="Registration Deadline"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.registrationDeadline,
                          helperText: errors.registrationDeadline?.message,
                          InputProps: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <ScheduleIcon color="action" />
                              </InputAdornment>
                            )
                          },
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              background: alpha(theme.palette.background.default, 0.5),
                            }
                          }
                        }
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Max Participants */}
              <Grid item xs={12} sm={6}>
                <TextField
                  {...register('maxParticipants')}
                  label="Max Participants"
                  type="number"
                  fullWidth
                  placeholder="Leave empty for unlimited"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PeopleIcon color="action" />
                      </InputAdornment>
                    ),
                    inputProps: { min: 1 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: alpha(theme.palette.background.default, 0.5),
                    }
                  }}
                />
              </Grid>

              {/* Requirements */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight="500" gutterBottom>
                  Requirements
                </Typography>
                <Box display="flex" gap={1} alignItems="center">
                  <TextField
                    size="small"
                    placeholder="Add requirement (e.g., Comfortable shoes)"
                    value={requirementInput}
                    onChange={(e) => setRequirementInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        background: alpha(theme.palette.background.default, 0.5),
                      }
                    }}
                  />
                  <Button 
                    variant="contained" 
                    onClick={handleAddRequirement}
                    disabled={!requirementInput.trim()}
                  >
                    Add
                  </Button>
                </Box>
                {requirements.length > 0 && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
                    {requirements.map((req, index) => (
                      <Chip
                        key={index}
                        label={req}
                        onDelete={() => handleRemoveRequirement(index)}
                        color="primary"
                        variant="outlined"
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Stack>
                )}
              </Grid>
            </Grid>
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
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? null : <SaveIcon />}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                }
              }}
            >
              {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogActions>
        </form>
      </LocalizationProvider>
    </Dialog>
  );
};

export default ModernEventModal;

import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, FormControl, InputLabel, Select, MenuItem, Chip, Avatar,
  InputAdornment, Alert, CircularProgress, Tooltip, Card, CardContent, LinearProgress
} from '@mui/material';
import {
  Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon, Add as AddIcon,
  Search as SearchIcon, CloudUpload as UploadIcon, CloudDownload as DownloadIcon,
  School as SchoolIcon, Groups as GroupsIcon, CheckCircle as CheckIcon, Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import axios from '../../utils/api';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    registrationNumber: '', name: '', email: '', password: '',
    department: '', year: '', phoneNumber: '',
    attendancePercentage: 0, totalVolunteerHours: 0, isEligible: false
  });

  // Statistics
  const [stats, setStats] = useState({
    totalStudents: 0, eligibleStudents: 0, avgAttendance: 0, avgVolunteerHours: 0
  });

  const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE', 'IT'];
  const years = [1, 2, 3, 4];

  useEffect(() => {
    fetchStudents();
    fetchStats();
  }, [page, rowsPerPage, searchTerm, departmentFilter, yearFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/students', {
        params: {
          page: page + 1, limit: rowsPerPage, search: searchTerm,
          department: departmentFilter, year: yearFilter
        }
      });
      setStudents(response.data.students || []);
      setTotalStudents(response.data.totalStudents || 0);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/student-analytics');
      setStats({
        totalStudents: response.data.totalStudents || 0,
        eligibleStudents: response.data.eligibleStudents || 0,
        avgAttendance: parseFloat(response.data.averageAttendance || 0).toFixed(1),
        avgVolunteerHours: parseFloat(response.data.averageVolunteerHours || 0).toFixed(1)
      });
    } catch (error) {
      console.error('Stats error:', error);
    }
  };

  const handleOpenDialog = (mode, student = null) => {
    setDialogMode(mode);
    if (mode === 'edit' && student) {
      setFormData({
        ...student,
        password: '',
        phoneNumber: student.phoneNumber || ''
      });
      setSelectedStudent(student);
    } else if (mode === 'view' && student) {
      setSelectedStudent(student);
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      registrationNumber: '', name: '', email: '', password: '',
      department: '', year: '', phoneNumber: '',
      attendancePercentage: 0, totalVolunteerHours: 0, isEligible: false
    });
    setSelectedStudent(null);
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await axios.post('/api/admin/students', formData);
        toast.success('Student added successfully');
      } else if (dialogMode === 'edit') {
        const updateData = { ...formData };
        delete updateData._id;
        delete updateData.password;
        await axios.put(`/api/admin/students/${selectedStudent._id}`, updateData);
        toast.success('Student updated successfully');
      }
      handleCloseDialog();
      fetchStudents();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`/api/admin/students/${studentId}`);
        toast.success('Student deleted successfully');
        fetchStudents();
        fetchStats();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Manage Students</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog('add')}
          sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          Add Student
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold">{stats.totalStudents}</Typography>
              <Typography variant="body2">Total Students</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold">{stats.eligibleStudents}</Typography>
              <Typography variant="body2">Eligible Students</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold">{stats.avgAttendance}%</Typography>
              <Typography variant="body2">Avg Attendance</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold">{stats.avgVolunteerHours}h</Typography>
              <Typography variant="body2">Avg Volunteer Hours</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search by name, email or registration..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select value={departmentFilter} label="Department" onChange={(e) => setDepartmentFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Year</InputLabel>
              <Select value={yearFilter} label="Year" onChange={(e) => setYearFilter(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {years.map(y => <MenuItem key={y} value={y}>Year {y}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button fullWidth onClick={fetchStudents} startIcon={<RefreshIcon />}>Refresh</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Reg. Number</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Year</TableCell>
                    <TableCell align="center">Attendance</TableCell>
                    <TableCell align="center">Hours</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student._id} hover>
                      <TableCell>{student.registrationNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell align="center">{student.year}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <LinearProgress
                            variant="determinate" value={student.attendancePercentage}
                            sx={{ width: 60, mr: 1 }}
                            color={student.attendancePercentage >= 75 ? 'success' : 'error'}
                          />
                          {student.attendancePercentage}%
                        </Box>
                      </TableCell>
                      <TableCell align="center">{student.totalVolunteerHours}h</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={student.isEligible ? 'Eligible' : 'Not Eligible'}
                          color={student.isEligible ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog('view', student)}>
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small" color="secondary" onClick={() => handleOpenDialog('edit', student)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDelete(student._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalStudents}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            />
          </>
        )}
      </Paper>

      {/* Dialog for Add/Edit/View */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' && 'Add New Student'}
          {dialogMode === 'edit' && 'Edit Student'}
          {dialogMode === 'view' && 'Student Details'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {dialogMode !== 'view' ? (
              <>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Registration Number" value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    disabled={dialogMode === 'edit'} required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Name" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email" type="email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </Grid>
                {dialogMode === 'add' && (
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Password" type="password" value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required helperText="Min 6 characters" />
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Department</InputLabel>
                    <Select value={formData.department} label="Department"
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}>
                      {departments.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Year</InputLabel>
                    <Select value={formData.year} label="Year"
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}>
                      {years.map(y => <MenuItem key={y} value={y}>Year {y}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Phone Number" value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} />
                </Grid>
                {dialogMode === 'edit' && (
                  <>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Attendance %" type="number" value={formData.attendancePercentage}
                        onChange={(e) => setFormData({ ...formData, attendancePercentage: parseInt(e.target.value) })}
                        inputProps={{ min: 0, max: 100 }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Volunteer Hours" type="number" value={formData.totalVolunteerHours}
                        onChange={(e) => setFormData({ ...formData, totalVolunteerHours: parseInt(e.target.value) })}
                        inputProps={{ min: 0 }} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Eligibility</InputLabel>
                        <Select value={formData.isEligible} label="Eligibility"
                          onChange={(e) => setFormData({ ...formData, isEligible: e.target.value })}>
                          <MenuItem value={true}>Eligible</MenuItem>
                          <MenuItem value={false}>Not Eligible</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </>
            ) : selectedStudent && (
              <>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Registration Number</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedStudent.registrationNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedStudent.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{selectedStudent.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                  <Typography variant="body1">{selectedStudent.phoneNumber || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                  <Typography variant="body1">{selectedStudent.department}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Year</Typography>
                  <Typography variant="body1">Year {selectedStudent.year}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Attendance</Typography>
                  <Typography variant="body1">{selectedStudent.attendancePercentage}%</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Volunteer Hours</Typography>
                  <Typography variant="body1">{selectedStudent.totalVolunteerHours} hours</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={selectedStudent.isEligible ? 'Eligible' : 'Not Eligible'}
                    color={selectedStudent.isEligible ? 'success' : 'error'} />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSubmit} variant="contained">
              {dialogMode === 'add' ? 'Add Student' : 'Update Student'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageStudents;

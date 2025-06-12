import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Checkbox,
  IconButton,
  AppBar,
  Toolbar,
  Box,
  CssBaseline,
  CircularProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Add,
  Delete,
  Edit,
  Search,
  Brightness4,
  Brightness7,
  Label
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Glassmorphism theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { // Re-emphasize primary for consistent actions
      main: '#3f51b5', // Default Material primary blue
      light: '#757de8',
      dark: '#002984',
    },
    priority: {
      high: '#ff1744',
      medium: '#ff9100',
      low: '#00e676'
    },
    glass: {
      main: 'rgba(255, 255, 255, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      shadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      blur: 'blur(8px)'
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif', // Apply Inter as the default font for general text
  }
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { // Dark mode primary color
      main: '#9fa8da', // Lighter blue for dark mode visibility
      light: '#cfd8ef',
      dark: '#6f79a8',
    },
    priority: {
      high: '#ff616f',
      medium: '#ffb74d',
      low: '#69f0ae'
    },
    glass: {
      main: 'rgba(30, 30, 30, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      shadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
      blur: 'blur(8px)'
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif', // Apply Inter as the default font for general text
  }
});

const API_URL = 'http://localhost:5000/api/tasks';

// Analytics Component displays a summary of tasks
const Analytics = ({ tasks, darkMode }) => {
  const completed = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const priorityCounts = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  return (
    <Box sx={{
      mb: 4,
      p: 3,
      background: theme => theme.palette.glass.main,
      backdropFilter: theme => theme.palette.glass.blur,
      borderRadius: '16px',
      boxShadow: theme => theme.palette.glass.shadow,
      border: theme => theme.palette.glass.border
    }}>
      <Typography variant="h6" gutterBottom sx={{ color: darkMode ? 'white' : 'text.primary' }}>
        Task Analytics
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
          Completion Progress: {percentage}%
        </Typography>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 10,
            borderRadius: 5,
            mt: 1,
            '& .MuiLinearProgress-bar': {
              borderRadius: 5,
              background: darkMode
                ? darkTheme.palette.priority.medium
                : lightTheme.palette.priority.medium
            }
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: darkMode ? 'white' : 'text.primary' }}>
            {total}
          </Typography>
          <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
            Total Tasks
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: darkMode ? darkTheme.palette.priority.low : lightTheme.palette.priority.low }}>
            {completed}
          </Typography>
          <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
            Completed
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: darkMode ? darkTheme.palette.priority.high : lightTheme.palette.priority.high }}>
            {total - completed}
          </Typography>
          <Typography variant="caption" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
            Pending
          </Typography>
        </Box>
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary', mb: 1 }}>
          Priority Distribution
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {Object.entries(priorityCounts).map(([priority, count]) => (
            <Box key={priority} sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{
                display: 'block',
                color: darkMode
                  ? darkTheme.palette.priority[priority]
                  : lightTheme.palette.priority[priority]
              }}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(count / total) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: darkMode
                      ? darkTheme.palette.priority[priority]
                      : lightTheme.palette.priority[priority]
                  }
                }}
              />
              <Typography variant="caption" sx={{
                display: 'block',
                color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'
              }}>
                {count} tasks
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskTags, setNewTaskTags] = useState([]);
  const [gradientAngle, setGradientAngle] = useState(135);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const draggedItemRef = useRef(null);

  const availableTags = ['work', 'personal', 'urgent', 'shopping', 'study'];

  useEffect(() => {
    fetchTasks();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      if (maxScroll === 0) {
        setGradientAngle(135);
        return;
      }
      const newAngle = 135 + (scrollY / maxScroll) * 90;
      setGradientAngle(Math.min(225, Math.max(135, newAngle)));
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.dueDate && !task.completed) {
          const dueDate = new Date(task.dueDate);
          const twentyFourHours = 24 * 60 * 60 * 1000;
          if (dueDate.getTime() - now.getTime() > 0 && dueDate.getTime() - now.getTime() <= twentyFourHours) {
            setSnackbarMessage(`Reminder: Task "${task.text}" is due soon!`);
            setSnackbarSeverity('warning');
            setSnackbarOpen(true);
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 3600000);

    return () => clearInterval(interval);
  }, [tasks]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL);
      setTasks(data);
      setTimeout(() => setLoading(false), 800);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
      setSnackbarMessage('Failed to fetch tasks.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) {
      setSnackbarMessage('Task cannot be empty.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    try {
      const task = {
        id: Date.now(),
        text: newTask,
        completed: false,
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
        tags: newTaskTags
      };
      await axios.post(API_URL, task);
      setNewTask('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskTags([]);
      fetchTasks();
      setSnackbarMessage('Task added successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error adding task:', error);
      setLoading(false);
      setSnackbarMessage('Failed to add task.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const toggleComplete = async (task) => {
    setLoading(true);
    try {
      const updatedTask = { ...task, completed: !task.completed };
      await axios.put(`${API_URL}/${task.id}`, updatedTask);
      fetchTasks();
      setSnackbarMessage(`Task "${task.text}" marked as ${updatedTask.completed ? 'completed' : 'pending'}.`);
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating task:', error);
      setLoading(false);
      setSnackbarMessage('Failed to update task.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const deleteTask = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
      setSnackbarMessage('Task deleted successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error deleting task:', error);
      setLoading(false);
      setSnackbarMessage('Failed to delete task.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setNewTask(task.text);
    setNewTaskPriority(task.priority || 'medium');
    setNewTaskDueDate(task.dueDate || '');
    setNewTaskTags(task.tags || []);
  };

  const updateTask = async () => {
    if (!newTask.trim()) {
      setSnackbarMessage('Task cannot be empty.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    setLoading(true);
    try {
      const updatedTask = {
        ...editingTask,
        text: newTask,
        priority: newTaskPriority,
        dueDate: newTaskDueDate,
        tags: newTaskTags
      };
      await axios.put(`${API_URL}/${editingTask.id}`, updatedTask);
      setEditingTask(null);
      setNewTask('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskTags([]);
      fetchTasks();
      setSnackbarMessage('Task updated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error updating task:', error);
      setLoading(false);
      setSnackbarMessage('Failed to update task.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const toggleTag = (tag) => {
    setNewTaskTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredTasks = tasks.filter(task =>
    task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Drag and Drop Handlers
  const handleDragStart = (e, task) => {
    draggedItemRef.current = task;
    e.dataTransfer.setData('text/plain', task.id);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, targetTask) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const draggedTask = draggedItemRef.current;
    if (!draggedTask || draggedTask.id === targetTask.id) {
      return;
    }

    const currentTasks = [...tasks];
    const draggedIndex = currentTasks.findIndex(task => task.id === draggedTask.id);
    const targetIndex = currentTasks.findIndex(task => task.id === targetTask.id);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    const [removed] = currentTasks.splice(draggedIndex, 1);
    currentTasks.splice(targetIndex, 0, removed);

    setTasks(currentTasks);
    draggedItemRef.current = null;
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    const dragOverElements = document.querySelectorAll('.drag-over');
    dragOverElements.forEach(el => el.classList.remove('drag-over'));
  };

  if (loading && tasks.length === 0) return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        // Colorful background gradient for loading state
        background: darkMode
          ? `linear-gradient(135deg, #1d2b64, #3d1a58, #0f0c29)`
          : `linear-gradient(135deg, #a1c4fd, #c2e9fb, #fccb90)`
      }}>
        <CircularProgress />
      </Box>
    </ThemeProvider>
  );

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      {/* Import the Montserrat and Inter fonts from Google Fonts */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Inter:wght@400;700&display=swap');
        `}
      </style>
      <Box sx={{
        minHeight: '100vh',
        // Dynamic colorful background gradient based on scroll angle
        background: darkMode
          ? `linear-gradient(${gradientAngle}deg, #1d2b64, #3d1a58, #0f0c29)`
          : `linear-gradient(${gradientAngle}deg, #a1c4fd, #c2e9fb, #fccb90)`,
        backgroundAttachment: 'fixed', // Keep background fixed while scrolling
        paddingBottom: '2rem',
        '& .dragging': {
          opacity: 0.5,
          border: `2px dashed ${darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'}`,
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          transform: 'translateY(-2px)', // Small lift while dragging
        },
        '& .drag-over': {
          boxShadow: '0 0 15px rgba(0,255,255,0.7)',
          transform: 'scale(1.01)', // Slightly larger scale for drop target
        }
      }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            background: 'transparent',
            backdropFilter: 'blur(10px)',
            boxShadow: 'none',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Toolbar>
            {/* TaskMaster Pro Headline - uses Montserrat font */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                color: darkMode ? 'white' : 'black',
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontFamily: 'Montserrat, sans-serif'
              }}
            >
              TaskMaster Pro
            </Typography>
            <IconButton
              onClick={() => setDarkMode(!darkMode)}
              color="inherit"
              sx={{
                color: darkMode ? 'white' : 'black',
                background: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  background: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" sx={{ mt: 4 }}>
          {/* Search Bar - uses Inter font by inheriting from theme */}
          <TextField
            fullWidth
            placeholder="Search tasks by title or tag..."
            variant="outlined"
            sx={{
              mb: 2,
              background: theme => theme.palette.glass.main,
              backdropFilter: theme => theme.palette.glass.blur,
              borderRadius: '12px',
              boxShadow: theme => theme.palette.glass.shadow,
              border: theme => theme.palette.glass.border,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'transparent'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.2)'
                }
              },
              '& .MuiInputBase-input': {
                color: darkMode ? 'white' : 'inherit',
                fontFamily: 'inherit', // Ensures Inter font is applied
              },
              '& .MuiInputLabel-root': {
                color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                fontFamily: 'inherit', // Ensures Inter font is applied to label
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: darkMode ? 'white' : 'primary.main',
              },
            }}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: darkMode ? 'white' : 'action.active' }} />,
              style: { color: darkMode ? 'white' : 'inherit' }
            }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Task Input Section - uses Inter font by inheriting from theme */}
          <Box sx={{
            mb: 4,
            p: 3,
            background: theme => theme.palette.glass.main,
            backdropFilter: theme => theme.palette.glass.blur,
            borderRadius: '16px',
            boxShadow: theme => theme.palette.glass.shadow,
            border: theme => theme.palette.glass.border,
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: theme => darkMode ? '0 8px 40px rgba(0, 0, 0, 0.4)' : '0 8px 40px rgba(0, 0, 0, 0.2)',
            }
          }}>
            <Box sx={{ display: 'flex', mb: 2 }}>
              <TextField
                id="task-input"
                fullWidth
                variant="outlined"
                label={editingTask ? "Edit Task" : "New Task"}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (editingTask ? updateTask() : addTask())}
                disabled={loading}
                autoFocus
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'transparent'
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)'
                    }
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'inherit', // Ensures Inter font
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'inherit', // Ensures Inter font to label
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                sx={{
                  ml: 2,
                  borderRadius: '12px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                    backgroundColor: theme => theme.palette.primary.dark,
                  }
                }}
                onClick={editingTask ? updateTask : addTask}
                startIcon={<Add />}
                disabled={loading}
              >
                {editingTask ? "Update" : "Add"}
              </Button>
            </Box>

            {/* Priority Selector - uses Inter font by inheriting from theme */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)', fontFamily: 'inherit' }}>
                Priority
              </InputLabel>
              <Select
                value={newTaskPriority}
                label="Priority"
                onChange={(e) => setNewTaskPriority(e.target.value)}
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent'
                  },
                  '& .MuiSelect-select': { // Target the selected value text
                    fontFamily: 'inherit',
                  }
                }}
              >
                <MenuItem value="low" sx={{ fontFamily: 'inherit' }}>Low</MenuItem>
                <MenuItem value="medium" sx={{ fontFamily: 'inherit' }}>Medium</MenuItem>
                <MenuItem value="high" sx={{ fontFamily: 'inherit' }}>High</MenuItem>
              </Select>
            </FormControl>

            {/* Due Date picker - uses Inter font by inheriting from theme */}
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              InputLabelProps={{ shrink: true, sx: { fontFamily: 'inherit' } }} // Ensure label uses Inter
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'transparent'
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)'
                  }
                },
                '& .MuiInputBase-input': {
                  fontFamily: 'inherit', // Ensures Inter font
                }
              }}
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
            />

            {/* Tags selection - uses Inter font by inheriting from theme */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableTags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    icon={<Label fontSize="small" />}
                    color={newTaskTags.includes(tag) ? 'primary' : 'default'}
                    onClick={() => toggleTag(tag)}
                    size="small"
                    sx={{
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(255,255,255,0.1)',
                      color: darkMode ? 'white' : 'inherit',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.2)'
                      },
                      fontFamily: 'inherit' // Ensures Inter font
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>

          {tasks.length > 0 && (
            <Analytics tasks={tasks} darkMode={darkMode} />
          )}

          {filteredTasks.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card sx={{
                textAlign: 'center',
                p: 4,
                background: theme => theme.palette.glass.main,
                backdropFilter: theme => theme.palette.glass.blur,
                borderRadius: '16px',
                boxShadow: theme => theme.palette.glass.shadow,
                border: theme => theme.palette.glass.border
              }}>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/4076/4076478.png"
                  alt="No tasks"
                  style={{
                    width: 120,
                    opacity: 0.9,
                    marginBottom: 16,
                    filter: darkMode ? 'invert(0.8)' : 'none'
                  }}
                />
                <Typography variant="h6" sx={{ color: darkMode ? 'white' : 'text.primary' }} gutterBottom>
                  {searchTerm ? "No matching tasks found." : (editingTask ? "No tasks to edit!" : "Your workspace is empty")}
                </Typography>
                <Typography variant="body2" sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary', mb: 3 }}>
                  {searchTerm
                    ? "Try a different search term or add a new task."
                    : (editingTask
                      ? "Add some tasks first or clear the edit state."
                      : "Create your first task to get started!")}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Add />}
                  onClick={() => {
                    if (editingTask) setEditingTask(null);
                    document.getElementById('task-input').focus();
                  }}
                  sx={{
                    borderRadius: '12px',
                    borderWidth: '2px',
                    '&:hover': {
                      borderWidth: '2px'
                    }
                  }}
                >
                  {editingTask ? "Cancel Edit" : "Create Task"}
                </Button>
              </Card>
            </motion.div>
          )}

          <AnimatePresence> {/* Wrap with AnimatePresence for exit animations */}
            {!loading && filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }} // Exit animation
                transition={{ duration: 0.3 }}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, task)}
                onDragLeave={handleDragLeave}
                onDragEnd={handleDragEnd}
              >
                <Card sx={{
                  mb: 2,
                  background: theme => theme.palette.glass.main,
                  backdropFilter: theme => theme.palette.glass.blur,
                  borderRadius: '16px',
                  boxShadow: theme => theme.palette.glass.shadow,
                  border: theme => theme.palette.glass.border,
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out', // Smooth transition for hover
                  '&:hover': {
                    transform: 'translateY(-4px)', // Slight lift on hover
                    boxShadow: theme => darkMode ? '0 6px 30px rgba(0, 0, 0, 0.4)' : '0 6px 30px rgba(0, 0, 0, 0.2)', // Enhanced shadow on hover
                  },
                  borderLeft: `4px solid ${
                    darkMode
                      ? darkTheme.palette.priority[task.priority]
                      : lightTheme.palette.priority[task.priority]
                  }`
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={task.completed}
                        onChange={() => toggleComplete(task)}
                        color="primary"
                        disabled={loading}
                        sx={{
                          color: darkMode ? 'white' : 'inherit',
                          '&.Mui-checked': {
                            color: darkMode
                              ? darkTheme.palette.priority[task.priority]
                              : lightTheme.palette.priority[task.priority]
                          }
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            textDecoration: task.completed ? 'line-through' : 'none',
                            color: darkMode
                              ? task.completed ? 'rgba(255,255,255,0.5)' : 'white'
                              : task.completed ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {task.text}
                        </Typography>
                        {task.dueDate && (
                          <Typography variant="caption" sx={{
                            display: 'block',
                            color: darkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                          }}>
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </Typography>
                        )}
                        {task.tags?.length > 0 && (
                          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {task.tags.map(tag => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem',
                                  backdropFilter: 'blur(10px)',
                                  background: 'rgba(255,255,255,0.1)',
                                  color: darkMode ? 'white' : 'inherit'
                                }}
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                      <IconButton
                        onClick={() => startEdit(task)}
                        sx={{
                          color: darkMode ? 'white' : 'inherit',
                          background: 'rgba(255,255,255,0.1)',
                          transition: 'transform 0.2s ease-in-out, background 0.2s ease-in-out',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.2)',
                            transform: 'scale(1.1)', // Slight scale on hover
                          }
                        }}
                        disabled={loading}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => deleteTask(task.id)}
                        sx={{
                          color: darkMode ? 'white' : 'inherit',
                          background: 'rgba(255,255,255,0.1)',
                          transition: 'transform 0.2s ease-in-out, background 0.2s ease-in-out',
                          '&:hover': {
                            background: 'rgba(255,0,0,0.2)',
                            transform: 'scale(1.1)', // Slight scale on hover
                          }
                        }}
                        disabled={loading}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </Container>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;

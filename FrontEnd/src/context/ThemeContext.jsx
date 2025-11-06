import React, { createContext, useState, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline, alpha } from '@mui/material';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#6366f1' : '#818cf8',
      light: '#a5b4fc',
      dark: '#4f46e5',
      contrastText: '#ffffff',
    },
    secondary: {
      main: mode === 'light' ? '#14b8a6' : '#2dd4bf',
      light: '#5eead4',
      dark: '#0f766e',
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#06b6d4',
      light: '#22d3ee',
      dark: '#0891b2',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857',
    },
    background: {
      default: mode === 'light' ? '#fafafc' : '#0f0f23',
      paper: mode === 'light' ? '#ffffff' : '#1a1a2e',
      gradient: mode === 'light' 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    text: {
      primary: mode === 'light' ? '#1e293b' : '#f1f5f9',
      secondary: mode === 'light' ? '#64748b' : '#94a3b8',
    },
    divider: mode === 'light' ? '#e2e8f0' : '#334155',
    action: {
      hover: mode === 'light' ? alpha('#6366f1', 0.08) : alpha('#818cf8', 0.08),
      selected: mode === 'light' ? alpha('#6366f1', 0.12) : alpha('#818cf8', 0.12),
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3rem',
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: mode === 'light' ? [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.05)',
    '0px 8px 16px rgba(0,0,0,0.05)',
    '0px 12px 24px rgba(0,0,0,0.05)',
    '0px 16px 32px rgba(0,0,0,0.05)',
    '0px 20px 40px rgba(0,0,0,0.05)',
    '0px 24px 48px rgba(0,0,0,0.05)',
    '0px 32px 64px rgba(0,0,0,0.05)',
    '0px 40px 80px rgba(0,0,0,0.05)',
    '0px 48px 96px rgba(0,0,0,0.05)',
    '0px 56px 112px rgba(0,0,0,0.05)',
    '0px 64px 128px rgba(0,0,0,0.05)',
    '0px 72px 144px rgba(0,0,0,0.05)',
    '0px 80px 160px rgba(0,0,0,0.05)',
    '0px 88px 176px rgba(0,0,0,0.05)',
    '0px 96px 192px rgba(0,0,0,0.05)',
    '0px 104px 208px rgba(0,0,0,0.05)',
    '0px 112px 224px rgba(0,0,0,0.05)',
    '0px 120px 240px rgba(0,0,0,0.05)',
    '0px 128px 256px rgba(0,0,0,0.05)',
    '0px 136px 272px rgba(0,0,0,0.05)',
    '0px 144px 288px rgba(0,0,0,0.05)',
    '0px 152px 304px rgba(0,0,0,0.05)',
    '0px 160px 320px rgba(0,0,0,0.05)',
  ] : undefined,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 24px',
          fontWeight: 600,
          fontSize: '0.95rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: mode === 'light' 
              ? '0 10px 20px rgba(99, 102, 241, 0.2)'
              : '0 10px 20px rgba(129, 140, 248, 0.2)',
          },
        },
        contained: {
          background: mode === 'light' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          '&:hover': {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #5a67d8 0%, #6b4199 100%)'
              : 'linear-gradient(135deg, #7c8ff5 0%, #8a5bb2 100%)',
          },
        },
        outlined: {
          borderWidth: '2px',
          borderColor: mode === 'light' ? '#6366f1' : '#818cf8',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: mode === 'light' 
              ? alpha('#6366f1', 0.08)
              : alpha('#818cf8', 0.08),
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: mode === 'light' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
          backgroundImage: 'none',
          backgroundColor: mode === 'light' ? '#ffffff' : '#1a1a2e',
          color: mode === 'light' ? '#1e293b' : '#f1f5f9',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: mode === 'light'
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
          },
        },
        elevation0: {
          backgroundColor: 'transparent',
        },
        elevation1: {
          boxShadow: mode === 'light'
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: mode === 'light'
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
            : '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: mode === 'light'
              ? '0 25px 30px -10px rgba(99, 102, 241, 0.25)'
              : '0 25px 30px -10px rgba(129, 140, 248, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            backgroundColor: mode === 'light' 
              ? 'rgba(255, 255, 255, 0.9)'
              : 'rgba(26, 26, 46, 0.9)',
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0 0 0 4px rgba(99, 102, 241, 0.1)'
                : '0 0 0 4px rgba(129, 140, 248, 0.1)',
            },
            '&.Mui-focused': {
              boxShadow: mode === 'light'
                ? '0 0 0 4px rgba(99, 102, 241, 0.2)'
                : '0 0 0 4px rgba(129, 140, 248, 0.2)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          fontWeight: 600,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
        filled: {
          background: mode === 'light'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          backdropFilter: 'blur(20px)',
          backgroundColor: mode === 'light'
            ? 'rgba(255, 255, 255, 0.9)'
            : 'rgba(15, 15, 35, 0.9)',
          borderBottom: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          backdropFilter: 'blur(20px)',
          backgroundColor: mode === 'light'
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(26, 26, 46, 0.95)',
          boxShadow: mode === 'light'
            ? '4px 0 24px rgba(0, 0, 0, 0.1)'
            : '4px 0 24px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: '8px',
          fontSize: '0.875rem',
          padding: '10px 14px',
          backgroundColor: mode === 'light' ? '#1e293b' : '#f1f5f9',
          color: mode === 'light' ? '#f1f5f9' : '#1e293b',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          height: '8px',
          backgroundColor: mode === 'light' 
            ? 'rgba(99, 102, 241, 0.1)'
            : 'rgba(129, 140, 248, 0.1)',
        },
        bar: {
          borderRadius: '10px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundColor: mode === 'light' 
            ? 'rgba(99, 102, 241, 0.11)'
            : 'rgba(129, 140, 248, 0.11)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        dot: {
          boxShadow: mode === 'light'
            ? '0 0 0 2px #ffffff'
            : '0 0 0 2px #1a1a2e',
        },
      },
    },
  },
});

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    // Toggle dark class on html element for Tailwind
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleColorMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};


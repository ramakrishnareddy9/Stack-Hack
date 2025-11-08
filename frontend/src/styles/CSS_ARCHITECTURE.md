# CSS Architecture Documentation

## Overview
This document outlines the modernized CSS architecture for the NSS Portal, built with Material UI (MUI) and Tailwind CSS. The system provides a professional, responsive, and consistent design system without altering existing file structures or component names.

## Architecture Layers

### 1. **Base Layer** (`index.css`)
- Global CSS reset and base styles
- Tailwind CSS base, components, and utilities
- Core typography and color definitions
- Custom scrollbar and selection styles
- Print utilities

### 2. **Theme Layer** (`theme.js`)
- Material UI theme configuration
- Color palette definitions
- Typography scale
- Component default props
- Shadow system

### 3. **Component Overrides** (`mui-overrides.js`)
- Comprehensive Material UI component styling
- Consistent design patterns across all MUI components
- Gradient backgrounds and hover effects
- Custom animations and transitions

### 4. **Utility Classes** (`utilities.css`)
- Layout utilities (containers, grids, flexbox)
- Button variants and styles
- Form controls and inputs
- Card and modal styles
- Animation utilities
- Responsive helpers

### 5. **Component Styles** (`components.css`)
- Domain-specific component styles
- Dashboard cards and widgets
- Event and report cards
- Navigation and sidebar styles
- Chat and messaging components
- Certificate templates

## Usage Guidelines

### Using Tailwind Classes
```jsx
// Basic card with hover effect
<div className="card-hover">
  <h3 className="text-xl font-bold text-gray-900">Title</h3>
  <p className="text-gray-600">Content</p>
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>

// Button with gradient
<button className="btn-primary-gradient">
  Click Me
</button>
```

### Using Material UI Components
```jsx
import { Button, Card, TextField } from '@mui/material';

// Material UI components automatically use theme overrides
<Button variant="contained" color="primary">
  Styled Button
</Button>

<Card>
  {/* Card content with custom styling */}
</Card>

<TextField 
  label="Input Field"
  variant="outlined"
  // Inherits custom styling
/>
```

### Custom Component Classes

#### Dashboard Cards
```jsx
<div className="dashboard-card">
  <div className="dashboard-stat-value">1,234</div>
  <div className="dashboard-stat-label">Total Events</div>
</div>
```

#### Event Cards
```jsx
<div className="event-card">
  <img className="event-card-image" src={image} alt="Event" />
  <div className="event-card-badge">Active</div>
  <h3 className="event-card-title">Event Title</h3>
  <div className="event-card-date">
    <Icon /> March 15, 2024
  </div>
  <p className="event-card-description">Description...</p>
  <div className="event-card-footer">
    <div className="event-card-participants">
      {/* Participant avatars */}
    </div>
    <Button>View Details</Button>
  </div>
</div>
```

#### Forms
```jsx
<div className="form-section">
  <h2 className="form-section-title">User Information</h2>
  <div className="form-field-group">
    <div className="form-field">
      <label className="form-label form-label-required">Name</label>
      <input className="form-input" type="text" />
    </div>
    <div className="form-field">
      <label className="form-label">Email</label>
      <input className="form-input" type="email" />
    </div>
  </div>
</div>
```

#### Navigation
```jsx
<nav className="nav-header">
  <div className="nav-container">
    <div className="nav-brand">
      <div className="nav-logo">N</div>
      <span className="nav-title">NSS Portal</span>
    </div>
    <div className="nav-menu">
      <a className="nav-menu-item-active">Dashboard</a>
      <a className="nav-menu-item">Events</a>
    </div>
    <div className="nav-actions">
      <button className="nav-notification-btn">
        <Icon />
        <span className="nav-notification-badge"></span>
      </button>
    </div>
  </div>
</nav>
```

## Color System

### Primary Colors
- **Primary**: `#2563eb` - Main brand color
- **Secondary**: `#7c3aed` - Accent color
- **Success**: `#10b981` - Positive actions
- **Warning**: `#f59e0b` - Caution states
- **Error**: `#ef4444` - Error states
- **Info**: `#3b82f6` - Information

### Gray Scale
- `gray-50`: `#f8fafc` - Backgrounds
- `gray-100`: `#f1f5f9` - Light backgrounds
- `gray-200`: `#e2e8f0` - Borders
- `gray-300`: `#cbd5e1` - Disabled states
- `gray-400`: `#94a3b8` - Placeholder text
- `gray-500`: `#64748b` - Secondary text
- `gray-600`: `#475569` - Body text
- `gray-700`: `#334155` - Headings
- `gray-800`: `#1e293b` - Dark text
- `gray-900`: `#0f172a` - Darkest text

## Typography Scale

### Headings
- `heading-xl`: 4xl → 6xl responsive
- `heading-lg`: 3xl → 5xl responsive
- `heading-md`: 2xl → 4xl responsive
- `heading-sm`: xl → 3xl responsive

### Body Text
- `text-base`: Default body text
- `text-sm`: Small text
- `text-xs`: Extra small text

## Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 768px
- **Desktop**: > 768px
- **Large**: > 1024px
- **Extra Large**: > 1280px

### Responsive Classes
```jsx
// Hide on mobile
<div className="hide-mobile">Desktop only</div>

// Responsive padding
<div className="p-4 md:p-6 lg:p-8">Content</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Items */}
</div>
```

## Animation Classes

### Entrance Animations
- `.fade-in` - Fade in effect
- `.slide-in-right` - Slide from right
- `.slide-in-left` - Slide from left
- `.scale-in` - Scale up entrance

### Continuous Animations
- `.pulse-slow` - Slow pulse effect
- `.animate-float` - Floating effect
- `.animate-spin` - Rotation
- `.shimmer` - Loading shimmer

## Utility Patterns

### Glass Morphism
```jsx
<div className="glass-light">
  Light glass effect
</div>

<div className="glass-dark">
  Dark glass effect
</div>
```

### Gradients
```jsx
<div className="bg-gradient-primary">
  Primary gradient background
</div>

<h1 className="text-gradient-primary">
  Gradient text
</h1>
```

### Cards
```jsx
// Basic card
<div className="card">Content</div>

// Modern card with hover
<div className="card-modern">Content</div>

// Interactive card
<div className="card-interactive">Content</div>
```

### Buttons
```jsx
// Size variants
<button className="btn-sm">Small</button>
<button className="btn-md">Medium</button>
<button className="btn-lg">Large</button>

// Style variants
<button className="btn-primary-gradient">Primary</button>
<button className="btn-outline-primary">Outline</button>
<button className="btn-ghost">Ghost</button>
<button className="btn-glass">Glass</button>
```

## Best Practices

1. **Consistency**: Use predefined classes instead of inline styles
2. **Semantic Classes**: Use descriptive class names from the design system
3. **Responsive First**: Always consider mobile view when styling
4. **Accessibility**: Ensure proper contrast and focus states
5. **Performance**: Use utility classes to reduce CSS bundle size

## Component Integration

### With React Components
```jsx
import { useState } from 'react';
import { Button, Card, CardContent } from '@mui/material';

function MyComponent() {
  return (
    <div className="container-custom section-padding">
      <Card className="card-hover">
        <CardContent>
          <h2 className="heading-md mb-4">Title</h2>
          <p className="text-gray-600 mb-6">Description</p>
          <Button variant="contained" color="primary">
            Action
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### With Custom Styling
```jsx
// Combining MUI and Tailwind
<Box 
  className="bg-gradient-mesh rounded-xl p-6"
  sx={{ 
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)' 
  }}
>
  Content
</Box>
```

## Migration Guide

### Old Style → New Style
```jsx
// Before
<div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
  <button style={{ backgroundColor: 'blue', color: 'white' }}>
    Click
  </button>
</div>

// After
<div className="p-6 bg-gray-100">
  <button className="btn-primary-gradient">
    Click
  </button>
</div>
```

## Troubleshooting

### Common Issues

1. **Styles not applying**: Ensure CSS files are imported in correct order
2. **MUI overrides not working**: Check theme provider is wrapped around app
3. **Tailwind classes not working**: Verify PostCSS configuration
4. **Responsive issues**: Use proper breakpoint prefixes (sm:, md:, lg:)

## Future Enhancements

- [ ] Dark mode support
- [ ] RTL language support
- [ ] Additional animation presets
- [ ] Custom icon system
- [ ] Extended color palette
- [ ] Component library documentation site

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Material UI Documentation](https://mui.com/material-ui/)
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

## Support

For questions or issues with the CSS architecture, please refer to this documentation or contact the development team.

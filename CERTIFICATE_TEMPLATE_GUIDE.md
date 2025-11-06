# Certificate Template Creation Guide

## How to Create a Certificate Template

This guide will help you create an image certificate template that works with the NSS Portal's auto-fill feature.

## Requirements

- **Format**: PNG or JPG/JPEG image file
- **Size**: Maximum 10MB
- **Recommended Dimensions**: 
  - **Landscape**: 1920 x 1357 pixels (A4 at 300 DPI)
  - **Portrait**: 1357 x 1920 pixels (A4 at 300 DPI)
  - **High Resolution**: 300 DPI for print quality
- **Orientation**: Landscape works best for certificates

## Design Guidelines

### 1. **Leave Space for Dynamic Fields**

Your template should have **blank spaces** where the following information will be auto-filled:

- **Student Name**: Usually in the center, needs 3-4 inches of space
- **Event Name**: Below the main heading
- **Date**: Usually at the bottom

### 2. **Recommended Tools**

You can create certificate templates using:

- **Canva** (easiest, online)
  1. Search for "Certificate" templates
  2. Customize the design
  3. Leave blank spaces for Name, Event, Date
  4. Download as PNG (recommended) or JPG

- **Microsoft Word/PowerPoint**
  1. Create your certificate design
  2. Save/Export as PNG or JPG
  
- **Adobe Illustrator/Photoshop**
  1. Design your certificate
  2. Export as PNG (high quality, 300 DPI)

- **Google Docs/Slides**
  1. Create certificate layout
  2. Download as PNG or JPG

### 3. **Design Best Practices**

**Text Spacing:**
- Leave at least 200-300 pixels width for student names
- Font size 24-36pt works best for names
- Font size 18-24pt for event names
- Font size 14-18pt for dates

**Readability:**
- Use clear, readable fonts (Arial, Times New Roman, etc.)
- Ensure good contrast between text and background
- Avoid placing fields over complex backgrounds

**Layout:**
- Keep important information centered
- Leave margins of at least 0.5 inches on all sides
- Use landscape orientation for traditional certificates

### 4. **Sample Layout**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           CERTIFICATE OF PARTICIPATION              │
│                                                     │
│         This is to certify that                     │
│                                                     │
│              [STUDENT NAME]                         │  ← 250px wide space
│                                                     │
│    has successfully participated in                 │
│                                                     │
│              [EVENT NAME]                           │  ← 300px wide space
│                                                     │
│    organized by National Service Scheme             │
│                                                     │
│              Dated: [DATE]                          │  ← 150px wide space
│                                                     │
│                                                     │
│  _____________          _____________               │
│   Coordinator              Principal                │
└─────────────────────────────────────────────────────┘
```

## Creating a Template in Canva (Step-by-Step)

1. **Go to Canva** (https://www.canva.com)
2. **Search** for "Certificate" in templates
3. **Choose** a template you like
4. **Customize**:
   - Remove any placeholder names
   - Leave blank spaces where you want dynamic fields
   - Add your college logo/name
   - Add NSS branding if needed
5. **Download** as PNG (recommended for best quality)
   - Click Share → Download
   - Select PNG file type
   - Choose "Recommended" quality
6. **Upload** to NSS Portal

## Tips for Field Placement

### Student Name
- **Position**: Center of certificate, below the heading
- **Font Size**: 24-32pt
- **Color**: Usually black or dark blue
- **Example coordinates**: X: 200-300, Y: 300-400

### Event Name
- **Position**: Below student name
- **Font Size**: 18-24pt
- **Color**: Match your theme
- **Example coordinates**: X: 200-300, Y: 450-500

### Date
- **Position**: Bottom section
- **Font Size**: 14-18pt
- **Color**: Usually gray or black
- **Example coordinates**: X: 200-300, Y: 600-650

## After Creating Your Template

1. **Upload** the PNG/JPG to the Certificate Configuration page
2. **Click** on the image preview to place fields
3. **Test** using the "Test Preview" button
4. **Adjust** positions if needed
5. **Save** configuration
6. **Generate** certificates for participants

## Certificate Distribution

Once certificates are generated:
- **Students receive**:
  - Email with certificate as PNG attachment
  - In-app notification
  - Certificate appears in their dashboard
- **Students can**:
  - View certificates online
  - Download certificates as PNG images
  - Access all their certificates anytime from their dashboard

## Common Issues

### Problem: Text Overlaps Design Elements
**Solution**: Move the coordinate position or adjust font size

### Problem: Text is Too Large/Small
**Solution**: Adjust the font size in the field configuration

### Problem: Text Color Not Visible
**Solution**: Change the color to contrast with background

### Problem: Fields Not Aligned
**Solution**: Use the zoom feature for precise placement

## Sample Templates

You can find free certificate templates at:
- Canva (canva.com)
- Template.net
- Microsoft Office Templates
- FreePik (freepik.com)

## Coordinate System Reference

```
(0,0) ←─────────────────────────────────┐
│                                       │
│     (200, 300) ← Example Position     │
│                                       │
│                                       │
│                                       │
│                                       │
└───────────────────────────────────→ (595, 842)
```

- **Origin**: Top-left corner (0, 0)
- **X-axis**: Left to right
- **Y-axis**: Top to bottom
- **Recommended dimensions**: 1920px wide × 1357px tall (landscape A4 at 300 DPI)

## Need Help?

If you need assistance:
1. Use the "Test Preview" feature frequently
2. Start with larger font sizes and reduce if needed
3. Use the zoom controls for precise placement
4. Check the console for any error messages

---

## Dynamic Fields Explained

The system automatically fills these fields:

1. **Student Name**: 
   - Source: Student's registered name in the system
   - Example: "John Doe"

2. **Event Name**: 
   - Source: Event title from database
   - Example: "Blood Donation Drive 2024"

3. **Date Range**: 
   - Source: Event start date and end date
   - Format: "November 1, 2024 - November 5, 2024"
   - Automatically formatted for readability

**Last Updated**: November 2024

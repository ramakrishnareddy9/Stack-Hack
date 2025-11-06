# Condensed Claude Prompt: NSS Activity Portal

Design a MERN stack NSS Activity Management Portal with these core requirements:

## Essential Features
- **Two roles:** Admin (create events, approve participations) and Student (register, submit evidence, track hours)
- **75% Attendance Rule:** Block event registration if student attendance < 75%
- **AI Reports:** Use Claude to generate participation summaries from uploaded evidence
- **Auto-certificates:** Generate PDF certificates with jsPDF

## Tech Stack (Non-negotiable)
- **Frontend:** React + Material-UI + Tailwind CSS
- **Backend:** Node.js + Express.js + JWT auth
- **Database:** MongoDB + Mongoose
- **Storage:** Cloudinary (images/PDFs)
- **Email:** Nodemailer
- **PDF:** jsPDF

## Key Implementation Points
1. **Attendance Logic:**
   ```javascript
   // Must enforce this in backend
   if (student.attendancePercentage < 75) {
     throw new Error("Insufficient attendance for participation");
   }
   ```

2. **AI Integration:**
   - Process uploaded PDFs/images
   - Generate coherent participation reports
   - Summarize student contributions

3. **Database Schema:**
   - Student (with attendancePercentage field)
   - Event (with hoursAwarded)
   - Participation (linking Student ↔ Event)

## Deliverables
Provide:
1. Complete folder structure
2. API endpoint implementations
3. React component hierarchy
4. MongoDB schemas
5. Attendance verification middleware
6. AI report generation function
7. File upload handler
8. Email notification templates

Make it production-ready with proper error handling, security (bcrypt, JWT), and responsive UI.

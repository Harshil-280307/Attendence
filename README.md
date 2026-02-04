# AttendanceHub - Attendance & Team Management System

A lightweight, static web application for small teams to manage attendance, track work hours, and generate reports.

## Features

- **Team Management**: Add team members with custom roles and shift timings
- **Attendance Tracking**: Clock in/out with mandatory daily work reports
- **Daily Reports**: View attendance status, late arrivals, and overtime
- **Monthly Reports**: Comprehensive monthly attendance summaries
- **100% Static**: No backend required, uses browser localStorage
- **Mobile Responsive**: Works on all devices

## Quick Start

### Local Development

1. Simply open `index.html` in your web browser
2. No build process or server required

### Deploy to Netlify

1. **Drag and Drop Method**:
   - Go to [Netlify Drop](https://app.netlify.com/drop)
   - Drag the entire project folder
   - Your site is live!

2. **Git-based Deployment**:
   - Push this project to GitHub/GitLab
   - Connect your repository to Netlify
   - Deploy settings:
     - Build command: (leave empty)
     - Publish directory: `/`

3. **Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

## File Structure

```
attendance-system/
├── index.html          # Dashboard
├── team.html           # Team management
├── attendance.html     # Attendance marking
├── reports.html        # Reports page
├── css/
│   └── style.css      # All styles
└── js/
    ├── storage.js     # localStorage management
    ├── dashboard.js   # Dashboard logic
    ├── team.js        # Team management logic
    ├── attendance.js  # Attendance logic
    └── reports.js     # Reports logic
```

## Usage Guide

### 1. Add Team Members
- Go to **Team** page
- Fill in member details:
  - Name
  - Role
  - Shift start time
  - Shift end time
- Click "Add Member"

### 2. Mark Attendance
- Go to **Attendance** page
- Select team member from dropdown
- Click "Time In" when arriving
- Fill in daily work report
- Click "Time Out" when leaving

### 3. View Reports

**Daily Report**:
- Select a date
- Click "Generate Report"
- View attendance status, late arrivals, and work reports

**Monthly Report**:
- Select a month
- Click "Generate Report"
- View total present/absent days, late count, overtime count

## Data Storage

All data is stored in browser localStorage:
- Team members
- Attendance records
- Work reports

**Note**: Clearing browser data will delete all records. Export important data regularly.

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with localStorage support

## Technical Details

- **Pure HTML/CSS/JavaScript** - No frameworks
- **localStorage API** - Client-side data persistence
- **Responsive Design** - Mobile-first approach
- **No Dependencies** - Zero external libraries

## Features Explained

### Late Detection
A member is marked "Late" if they clock in after their designated shift start time.

### Overtime Detection
A member is marked for "Overtime" if they clock out after their designated shift end time.

### Attendance Rules
- One attendance record per member per day
- Time In must be recorded before Time Out
- Daily work report is mandatory before Time Out
- No double Time In on the same day

## Customization

### Colors
Edit `css/style.css` and modify the CSS variables:
```css
:root {
  --primary: #2563eb;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
}
```

### Shift Timings
Set individual shift timings for each team member in the Team Management page.

## Support

For issues or questions, please create an issue in the repository.

## License

Free to use for personal and commercial projects.

---

Built with ❤️ for small teams who need simple attendance tracking.

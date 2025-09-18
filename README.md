# Agent Management System

A comprehensive web application for managing agents and distributing tasks from CSV uploads. Built with Next.js, React, and local storage for data persistence.

## Features

### 🔐 Authentication System
- Admin login with JWT-like authentication
- Session management using local storage
- Demo credentials: `admin@example.com` / `admin123`

### 👥 Agent Management
- Add new agents with validation
- View all agents in a data table
- Delete agents with confirmation
- Form validation for email, phone, and password
- Real-time statistics and metrics

### 📊 CSV Upload & Distribution
- Upload CSV, XLSX, and XLS files
- Drag-and-drop file upload interface
- File format validation
- CSV parsing with error handling
- Automatic task distribution among agents
- Equal distribution with remainder handling

### 📈 Distribution Analytics
- Visual charts (bar and pie charts)
- Distribution balance analysis
- Export functionality for reports
- Detailed task tracking
- Real-time statistics

## Technical Requirements Met

✅ **Frontend**: Built with Next.js and React  
✅ **Data Storage**: Local storage instead of MongoDB  
✅ **Authentication**: JWT-like system with local storage  
✅ **Validation**: Comprehensive form and file validation  
✅ **Error Handling**: Proper error messages and edge cases  
✅ **Clean Code**: Well-documented and organized components  

## Getting Started

### Prerequisites
- Node.js 18+ 
- Modern web browser with JavaScript enabled

### Installation

1. **Download the project**
   - Click the three dots in the top right of the v0 interface
   - Select "Download ZIP" to get the project files
   - Extract the ZIP file to your desired location

2. **Install dependencies**
   \`\`\`bash
   cd agent-management-system
   npm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - Use demo credentials: `admin@example.com` / `admin123`

### Alternative Setup with shadcn CLI

If you have the shadcn CLI installed:

\`\`\`bash
npx shadcn@latest init
# Follow the prompts to set up the project
\`\`\`

## Usage Guide

### 1. Login
- Use the demo credentials or add your own admin users
- The system will redirect to the dashboard upon successful login

### 2. Add Agents
- Navigate to the "Agents" tab
- Click "Add Agent" to create new agents
- Fill in required fields: Name, Email, Mobile, Password
- View all agents in the data table

### 3. Upload CSV Files
- Go to the "Upload" tab
- Drag and drop or browse for CSV/XLSX/XLS files
- Required columns: `FirstName`, `Phone`, `Notes`
- The system will validate and parse the file
- Click "Distribute to Agents" to assign tasks

### 4. View Distribution
- Check the "Reports" tab for analytics
- View charts, statistics, and detailed reports
- Export distribution data as CSV
- Monitor distribution balance

## CSV File Format

Your CSV file should have these columns:

\`\`\`csv
FirstName,Phone,Notes
John,+1-555-0123,Follow up on inquiry
Jane,+1-555-0124,New customer onboarding
Mike,+1-555-0125,Technical support needed
\`\`\`

### Validation Rules
- **FirstName**: Required, text field
- **Phone**: Required, valid phone number format
- **Notes**: Optional, text field

## Data Storage

The application uses browser local storage for data persistence:

- **Users**: Admin login credentials
- **Agents**: Agent information and credentials  
- **List Items**: Distributed tasks and assignments

Data persists between browser sessions but is specific to each browser/device.

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx          # Main application entry
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── dashboard.tsx     # Main dashboard layout
│   ├── login-form.tsx    # Authentication form
│   ├── agent-management.tsx    # Agent CRUD operations
│   ├── csv-upload.tsx    # File upload and processing
│   └── distribution-view.tsx   # Analytics and reports
├── lib/
│   └── auth.ts          # Authentication and data services
└── README.md            # This file
\`\`\`

## Features in Detail

### Authentication System
- Secure login with form validation
- Session management
- Auto-logout functionality
- Demo user pre-configured

### Agent Management
- Create agents with full validation
- Email uniqueness checking
- Phone number format validation
- Password strength requirements
- Delete with confirmation

### CSV Processing
- Multiple file format support
- Real-time validation feedback
- Error reporting with row numbers
- Preview before distribution
- Automatic parsing and validation

### Distribution Algorithm
- Equal distribution among all agents
- Remainder items distributed sequentially
- Balance tracking and reporting
- Visual representation of distribution

### Analytics & Reporting
- Real-time statistics
- Interactive charts (bar and pie)
- Export functionality
- Distribution balance analysis
- Recent activity tracking

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### Common Issues

1. **Login not working**
   - Ensure you're using the correct demo credentials
   - Check browser console for errors
   - Clear local storage if needed

2. **CSV upload fails**
   - Verify file format (CSV, XLSX, XLS)
   - Check column names match exactly: FirstName, Phone, Notes
   - Ensure file is not corrupted

3. **Distribution not working**
   - Add at least one agent before distributing
   - Ensure CSV data is valid and processed
   - Check browser console for errors

4. **Data not persisting**
   - Ensure local storage is enabled in browser
   - Check available storage space
   - Avoid private/incognito mode for data persistence

### Clearing Data

To reset the application:
\`\`\`javascript
// Open browser console and run:
localStorage.clear()
// Then refresh the page
\`\`\`

## Development

### Adding New Features
1. Create new components in `/components`
2. Add services to `/lib/auth.ts`
3. Update dashboard navigation as needed
4. Follow existing patterns for consistency

### Styling
- Uses Tailwind CSS with custom design tokens
- Semantic color system for consistent theming
- Responsive design for mobile compatibility
- shadcn/ui components for consistent UI

## Demo Video

Create a demo video showing:
1. Login process
2. Adding agents
3. Uploading CSV file
4. Viewing distribution
5. Analytics and reports

Upload to Google Drive and share the link for evaluation.

## Support

For issues or questions:
1. Check this README for troubleshooting
2. Review browser console for error messages
3. Ensure all requirements are met
4. Contact support with specific error details

---

**Built with ❤️ using Next.js, React, and modern web technologies**

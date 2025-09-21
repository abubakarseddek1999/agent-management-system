# Agent Distribution Dashboard

A comprehensive full-stack MERN application for managing agents and distributing tasks through CSV uploads with real-time analytics and performance tracking.

![Agent Distribution Dashboard](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green?style=for-the-badge&logo=mongodb)

## 🚀 Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token management
- Role-based access control (Admin/User)
- Password encryption with bcryptjs
- Rate limiting and security headers
- Protected routes and middleware

### 👥 Agent Management
- Complete CRUD operations for agents
- Agent profile management (name, email, mobile)
- Task assignment tracking and analytics
- Active/inactive status management
- Bulk operations and CSV export

### 📊 CSV Upload & Processing
- Drag-and-drop CSV file uploads
- Intelligent automatic agent distribution
- Batch processing with real-time status tracking
- Comprehensive error handling and validation
- Upload history and batch management

### 📈 Analytics & Reporting
- Interactive data visualization with Recharts
- Real-time agent performance metrics
- Task distribution analytics
- Upload batch monitoring
- Status tracking (pending, contacted, completed)

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/light theme support
- Smooth animations and transitions
- Toast notifications for user feedback
- Professional dashboard interface

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with React 19
- **Styling**: Tailwind CSS v4 with custom animations
- **UI Components**: Radix UI primitives with shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Fonts**: Geist Sans & Mono
- **Analytics**: Vercel Analytics

### Backend
- **Runtime**: Node.js with Express 5.1.0
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Security**: Helmet, CORS, Rate limiting
- **File Processing**: Multer for uploads, CSV parser
- **Environment**: dotenv for configuration

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles with Tailwind v4
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx          # Main application entry point
├── backend/               # Express server
│   ├── middleware/        # Authentication middleware
│   ├── models/           # MongoDB schemas
│   │   ├── User.js       # User authentication model
│   │   ├── Agent.js      # Agent management model
│   │   ├── ListItem.js   # Task/lead model
│   │   └── UploadBatch.js # CSV upload tracking
│   ├── routes/           # API endpoints
│   │   ├── auth.js       # Authentication routes
│   │   ├── agents.js     # Agent management routes
│   │   └── csv.js        # CSV processing routes
│   ├── scripts/          # Utility scripts
│   │   └── seedAdmin.js  # Admin user seeding
│   └── server.js         # Main server configuration
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── homepage.tsx     # Landing page component
│   ├── dashboard-layout.tsx # Main dashboard layout
│   ├── agent-management.tsx # Agent CRUD interface
│   ├── csv-upload.tsx   # File upload component
│   └── distribution-view.tsx # Analytics dashboard
├── lib/                 # Utilities
│   ├── api-service.ts   # API client with error handling
│   └── utils.ts         # Helper functions
└── hooks/               # Custom React hooks
    └── use-toast.ts     # Toast notification hook
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd agent-distribution-dashboard
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Setup**
   Create a `.env` file in the root directory:
   \`\`\`env
   # Database
   MONGODB_URI=mongodb://localhost:27017/agent-dashboard
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   
   # Admin User (for initial setup)
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   
   # Frontend API URL
   NEXT_PUBLIC_API_URL=http://localhost:5000
   \`\`\`

4. **Database Setup**
   \`\`\`bash
   # Start MongoDB (if running locally)
   mongod
   
   # Seed admin user (run from project root)
   node backend/scripts/seedAdmin.js
   \`\`\`

5. **Start Development Servers**
   
   **Backend Server:**
   \`\`\`bash
   cd backend
   node server.js
   \`\`\`
   
   **Frontend Development:**
   \`\`\`bash
   npm run dev
   \`\`\`

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 📋 Usage Guide

### Initial Setup
1. Visit the homepage and click "Get Started"
2. Login with admin credentials (from .env file)
3. Navigate to Agent Management to add agents
4. Upload CSV files to distribute tasks

### Agent Management
- **Add Agent**: Click "Add Agent" and fill in details
- **Edit Agent**: Click edit icon on any agent row
- **Delete Agent**: Click delete icon (soft delete with task reassignment)
- **View Performance**: Check the analytics dashboard

### CSV Upload Process
1. Go to "CSV Upload" section
2. Drag and drop or select CSV file
3. Ensure CSV has columns: firstName, phone, notes
4. System automatically distributes to available agents
5. Monitor progress in real-time

### Analytics Dashboard
- View task distribution across agents
- Monitor upload batch status
- Track agent performance metrics
- Export data for reporting

## 🔧 API Documentation

### Authentication Endpoints
\`\`\`
POST /api/auth/login     # User login
POST /api/auth/register  # User registration
GET  /api/auth/me        # Get current user
\`\`\`

### Agent Management
\`\`\`
GET    /api/agents           # Get all agents
POST   /api/agents           # Create new agent
GET    /api/agents/:id       # Get specific agent
PUT    /api/agents/:id       # Update agent (full)
PATCH  /api/agents/:id       # Update agent (partial)
DELETE /api/agents/:id       # Soft delete agent
POST   /api/agents/:id/activate # Reactivate agent
\`\`\`

### CSV Processing
\`\`\`
POST /api/csv/upload         # Upload and process CSV
GET  /api/csv/batches        # Get upload history
GET  /api/csv/analytics      # Get distribution analytics
PUT  /api/csv/tasks/:id      # Update task status
\`\`\`

### System Health
\`\`\`
GET /api/health              # Health check endpoint
\`\`\`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for specific origins
- **Security Headers**: Helmet.js for security headers
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Comprehensive error middleware

## 🎨 UI Components

Built with modern, accessible components:
- **Forms**: React Hook Form with Zod validation
- **Tables**: Sortable, filterable data tables
- **Charts**: Interactive Recharts visualizations
- **Modals**: Radix UI dialog components
- **Notifications**: Toast system for user feedback
- **Animations**: Smooth CSS transitions and transforms

## 📱 Responsive Design

- Mobile-first approach with Tailwind CSS
- Responsive breakpoints for all screen sizes
- Touch-friendly interface elements
- Optimized performance on all devices

## 🚀 Deployment

### Production Build
\`\`\`bash
npm run build
npm start
\`\`\`

### Environment Variables for Production
Update your `.env` file with production values:
\`\`\`env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
FRONTEND_URL=https://your-domain.com
JWT_SECRET=your-production-jwt-secret
\`\`\`

### Recommended Hosting
- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, DigitalOcean
- **Database**: MongoDB Atlas, AWS DocumentDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API health endpoint: `/api/health`
- Review the console logs for debugging

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added analytics dashboard and enhanced UI
- **v1.2.0** - Improved CSV processing and error handling

---

Built with ❤️ using Next.js, React, Node.js, and MongoDB

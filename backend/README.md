# Agent Management System - Backend

A robust Node.js/Express backend API for managing agents and distribution lists with authentication, file uploads, and comprehensive analytics.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone and navigate to backend directory**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Setup environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Then edit `.env` with your actual values.

4. **Start MongoDB**
   - **Local MongoDB**: `mongod`
   - **MongoDB Atlas**: Use your connection string in `.env`

5. **Seed admin user**
   \`\`\`bash
   npm run seed
   \`\`\`

6. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

The server will start on `http://localhost:5000`

## 📋 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run seed` - Create admin user
- `npm test` - Run tests
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

\`\`\`env
MONGODB_URI=mongodb://localhost:27017/agent-management
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
PORT=5000
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
\`\`\`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Agents
- `GET /api/agents` - Get all agents
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### CSV Operations
- `POST /api/csv/upload` - Upload CSV file
- `GET /api/csv/batches` - Get upload batches
- `PUT /api/csv/tasks/:id/status` - Update task status

### Health Check
- `GET /api/health` - Server health status

## 🏗️ Project Structure

\`\`\`
backend/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── middleware/      # Custom middleware
├── scripts/         # Utility scripts
├── logs/           # Application logs
├── uploads/        # File uploads
└── server.js       # Main application file
\`\`\`

## 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify MONGODB_URI in .env

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill process: `lsof -ti:5000 | xargs kill -9`

3. **Admin User Creation Failed**
   - Check if user already exists
   - Verify ADMIN_EMAIL and ADMIN_PASSWORD in .env

### Logs
Check application logs: `npm run logs`

## 📦 Dependencies

### Production
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **multer** - File upload handling
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware

### Development
- **nodemon** - Auto-restart server
- **jest** - Testing framework
- **eslint** - Code linting
- **prettier** - Code formatting

# Agent Management System Backend

A comprehensive backend API for managing agents and distributing CSV data among them.

## Features

- **Authentication**: JWT-based authentication with admin user management
- **Agent Management**: Full CRUD operations for managing agents
- **CSV Processing**: Upload and distribute CSV/Excel files among agents
- **Data Distribution**: Automatic equal distribution of tasks among active agents
- **File Validation**: Support for CSV, XLSX, and XLS file formats
- **Statistics**: Comprehensive analytics and reporting

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **csv-parser** - CSV file processing
- **xlsx** - Excel file processing

## Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create a `.env` file based on `.env.example`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Update the environment variables in `.env`:
   \`\`\`env
   MONGODB_URI=mongodb://localhost:27017/agent-management
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=<http://localhost:3000>
   ADMIN_EMAIL=<admin@example.com>
   ADMIN_PASSWORD=admin123
   \`\`\`

5. Start MongoDB service

6. Run the application:
   \`\`\`bash

   # Development mode

   npm run dev

   # Production mode

   npm start
   \`\`\`

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new admin user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout
- `POST /api/auth/change-password` - Change password

### Agent Management

- `GET /api/agents` - Get all agents (with pagination and search)
- `GET /api/agents/:id` - Get single agent
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `GET /api/agents/stats/overview` - Get agents statistics

### CSV Processing

- `POST /api/csv/upload` - Upload and process CSV/Excel file
- `GET /api/csv/batches` - Get all upload batches
- `GET /api/csv/batches/:batchId` - Get specific batch details
- `GET /api/csv/agent/:agentId/tasks` - Get tasks assigned to agent
- `PUT /api/csv/task/:taskId/status` - Update task status
- `GET /api/csv/stats/overview` - Get CSV processing statistics

### Health Check

- `GET /api/health` - Server health check

## Data Models

### User

- Email (unique)
- Password (hashed)
- Role (admin/user)
- Active status
- Last login timestamp

### Agent

- Name
- Email (unique)
- Mobile number with country code
- Password (hashed)
- Active status
- Created by (User reference)

### CSV Data

- First name
- Phone number
- Notes
- Assigned to (Agent reference)F
- Upload batch ID
- Status (pending/in-progress/completed/cancelled)
- Uploaded by (User reference)

### Upload Batch

- Batch ID (unique)
- File name
- Total/processed/failed records count
- Status
- Distribution summary
- Errors array
- Uploaded by (User reference)

## File Upload Requirements

- **Supported formats**: CSV, XLSX, XLS
- **Maximum file size**: 10MB
- **Required columns**: FirstName, Phone, Notes
- **Phone format**: Must include country code (e.g., +1234567890)

## Distribution Logic

When a CSV file is uploaded:

1. File is validated and parsed
2. Data is distributed equally among active agents
3. If total items are not divisible by agent count, remaining items are distributed sequentially
4. Each agent receives approximately the same number of tasks

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- File type and size validation

## Error Handling

The API includes comprehensive error handling:

- Validation errors with detailed messages
- Authentication and authorization errors
- File upload errors
- Database operation errors
- General server errors with appropriate HTTP status codes

## Development

\`\`\`bash

# Install dependencies

npm install

# Run in development mode with auto-reload

npm run dev

# Run tests

npm test
\`\`\`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/agent-management` |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | JWT token expiration time | `24h` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `ADMIN_EMAIL` | Default admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | Default admin password | `admin123` |

## Default Admin Credentials

- **Email**: <admin@example.com>
- **Password**: admin123

*Note: Change these credentials in production!*

# ExamPulse - Frontend & Backend Integration

Welcome to ExamPulse! This is a weekly mock test platform with frontend and backend integration. Below are the setup and running instructions.

## Project Structure

```
exampulse/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server
│   │   ├── config/
│   │   │   └── database.js    # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js        # User model
│   │   │   ├── Quiz.js        # Quiz model
│   │   │   └── Result.js      # Result model
│   │   └── routes/
│   │       ├── index.js       # Main routes
│   │       ├── auth.js        # Authentication routes
│   │       ├── quizzes.js     # Quiz CRUD routes
│   │       └── results.js     # Results routes
│   ├── package.json
│   ├── .env.example           # Environment template
│   └── .env                   # Environment configuration
└── frontend/
    ├── index.html             # Login page
    ├── css/
    │   └── style.css          # Styles
    └── js/
        ├── app.js             # App state & API integration
        ├── layout.js          # Layout builder
        └── ui.js              # UI utilities
    └── pages/
        ├── student-dashboard.html
        ├── student-quiz.html
        ├── student-result.html
        ├── student-results.html
        ├── teacher-create-quiz.html
        ├── teacher-dashboard.html
        ├── teacher-quizzes.html
        └── teacher-results.html
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from template (if not already done)
copy .env.example .env

# Update .env with your MongoDB URI
# Default: MONGO_URI=mongodb://localhost:27017/exampulse
```

### 2. MongoDB Setup

If using local MongoDB:

```bash
# Start MongoDB server (Windows)
mongod

# Or use MongoDB Atlas connection string in .env
```

### 3. Run Backend Server

```bash
# From backend directory

# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Server will run on http://localhost:5000
```

### 4. Frontend Access

The backend automatically serves the frontend from the `frontend` directory. Once the backend is running:

- Open http://localhost:5000 in your browser
- Login page will load automatically

## Demo Accounts

Use these credentials to test the application:

**Student Accounts:**

- Username: `riya`, Password: `pass123`
- Username: `arjun`, Password: `pass123`

**Teacher Account:**

- Username: `admin`, Password: `admin123`

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Quizzes

- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `POST /api/quizzes` - Create new quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Results

- `GET /api/results` - Get all results
- `GET /api/results/user/:userId` - Get user's results
- `POST /api/results` - Submit quiz result
- `DELETE /api/results/:id` - Delete result

## Features

### Student Dashboard

- View active quiz
- Take quiz with timer
- Submit answers
- View personal quiz results with scores

### Teacher Dashboard

- Create new quizzes
- Edit existing quizzes
- Activate/deactivate quizzes
- View all student results
- Analyze performance

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Middleware**: CORS, body-parser

## Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check MONGO_URI in .env file
- Verify MongoDB credentials (if using Atlas)

### Port Already in Use

- Change PORT in .env file
- Or kill the process using port 5000

### Frontend Not Loading

- Ensure backend is running on correct port
- Check browser console for errors
- Clear browser cache

## Development

### Adding New Quiz Questions

1. Login as teacher
2. Navigate to "Create Quiz"
3. Add questions with options and correct answer
4. Set duration and activate quiz

### Viewing Results

1. Student: Go to "My Results"
2. Teacher: Go to "Results" to see all student results

## Future Enhancements

- User profile management
- Advanced analytics
- Question bank system
- Negative marking
- Question shuffling
- Random option ordering

## License

ExamPulse © 2026

# Backend Project Setup

This is an Express.js + MongoDB backend project serving frontend files from `C:\Users\DRSN\exampulse`.

## Project Configuration

- **Server**: Express.js
- **Database**: MongoDB
- **Frontend Path**: C:\Users\DRSN\exampulse
- **Default Port**: 5000

## Getting Started

1. Install dependencies: `npm install`
2. Create `.env` file based on `.env.example`
3. Run development server: `npm run dev`
4. API will be available at `http://localhost:5000`

## Project Structure

```
src/
├── config/
│   └── database.js       # MongoDB connection configuration
├── routes/
│   └── index.js          # API routes
└── server.js             # Main server file
```

## Available Endpoints

- `GET /api/health` - Health check endpoint
- `GET *` - Serves frontend files from C:\Users\DRSN\exampulse

## Environment Variables

Create a `.env` file with:

- `MONGO_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

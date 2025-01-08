# Full Stack Application Setup Guide

This guide will help you set up and run both the backend and frontend components of the application.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- MongoDB
  
## Backend Setup

### 1. Clone the Repository
```bash
https://github.com/Aadcode/Roxiler-Assignment.git
cd <Roxiler-Assignment>/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the backend directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/your-database

```

### 4. Database Setup
- Ensure your database server is running
- The application will automatically create required collections

### 5. Start the Backend Server
Development mode:
```bash
npm start
```

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd ../frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Frontend Application
Development mode:
```bash
npm run dev
```



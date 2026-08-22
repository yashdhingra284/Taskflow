# TaskFlow

TaskFlow is a full-stack task management application built to practice and demonstrate core software engineering concepts across the frontend, backend, database, authentication, and API layers.

## 🚀 Project Overview

TaskFlow allows users to manage their tasks through a simple Trello-lite style workflow.

The application includes:

- User registration and login
- JWT-based authentication
- User profile management
- Password update
- Account deletion
- Task creation, viewing, updating, and deletion
- Task categories
- Task priorities
- Due dates
- Task status management
- Search
- Filtering
- Sorting
- Pagination
- User-based authorization so users can only manage their own tasks

## 🏗️ Architecture

The project is divided into two main applications:

```text
TaskFlow
├── taskflow-backend
└── taskflow-frontend
```

### Frontend

The frontend is built with:

- React
- JavaScript
- React Router
- Tailwind CSS

It communicates with the backend through HTTP/REST API requests.

### Backend

The backend is built with:

- Python
- FastAPI
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- SQL queries using a PostgreSQL database connection

The backend is responsible for:

- API endpoints
- Authentication
- Authorization
- Password hashing and verification
- Database operations
- Task management
- User management

### Database

PostgreSQL is used as the relational database.

The main entities include:

- Users
- Tasks
- Categories
- Notifications

Relationships and foreign keys are used to maintain data integrity.

## 🔐 Authentication & Security

TaskFlow uses JWT access tokens for authentication.

The general authentication flow is:

```text
User Login
    ↓
FastAPI verifies credentials
    ↓
JWT access token generated
    ↓
Frontend stores the token
    ↓
Token sent with authenticated requests
    ↓
FastAPI verifies the token
    ↓
User identity is obtained
```

Passwords are never stored as plain text. Passwords are hashed using bcrypt before being stored in the database.

Authorization is also enforced so that an authenticated user cannot modify or delete another user's tasks.

## 📋 Task Management

Users can:

- Create tasks
- View their tasks
- Update tasks
- Delete tasks
- Change task status
- Assign priorities
- Set due dates
- Assign categories

The task listing functionality supports:

```text
Search
Filter
Sort
Pagination
```

## 🔑 User Account Features

Users can:

- Register an account
- Log in
- View their profile
- Change their password
- Delete their account
- Log out

When an account is deleted, the backend removes the user's associated data while preserving shared categories.

## ⚙️ Environment Variables

The backend uses environment variables for configuration.

A `.env.example` file is included as a template.

Create your own `.env` file and provide your local configuration values.

Example:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=taskflow
DATABASE_USER=postgres
DATABASE_PASSWORD=your_database_password

SECRET_KEY=your_jwt_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

> The actual `.env` file should never be committed to GitHub.

## 🛠️ Running the Project Locally

### Backend

Go to the backend directory:

```bash
cd taskflow-backend
```

Create/activate a Python virtual environment if needed, install the dependencies, configure `.env`, and start the FastAPI application.

Dependencies can be installed using:

```bash
pip install -r requirements.txt
```

Then start the FastAPI server using the command configured for the project.

### Frontend

Go to the frontend directory:

```bash
cd taskflow-frontend
```

Install the dependencies:

```bash
npm install
```

Then start the development server:

```bash
npm run dev
```

The frontend communicates with the locally running FastAPI backend.

## 📁 Project Structure

```text
TaskFlow/
│
├── taskflow-backend/
│   ├── app/
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   └── models.py
│   ├── .env.example
│   ├── .gitignore
│   └── requirements.txt
│
├── taskflow-frontend/
│   ├── src/
│   ├── package.json
│   ├── package-lock.json
│   └── .gitignore
│
└── .gitignore
```

## 🎯 Purpose of the Project

TaskFlow was built as a learning project to develop a strong foundation in full-stack software engineering.

The project focuses on understanding how the following pieces work together:

```text
React
  ↓
REST API / HTTP
  ↓
FastAPI
  ↓
Authentication & Authorization
  ↓
SQL
  ↓
PostgreSQL
```

## 🚀 Version

**V1.0**

The V1 release includes the core task management functionality, React frontend integration, FastAPI backend, PostgreSQL database, JWT authentication, and account management features.

## 👤 Author

Yash Dhingra

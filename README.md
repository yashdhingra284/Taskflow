# TaskFlow

TaskFlow is a full-stack task management application built to practice and demonstrate core software engineering concepts across the frontend, backend, database, authentication, API, notification, and deployment layers.

## 🚀 Project Overview

TaskFlow allows users to manage their tasks through a simple Trello-lite style workflow.

The current application includes:

- User registration and login
- JWT-based authentication
- User profile management
- Password update
- Account deletion
- Logout
- Task creation, viewing, updating, and deletion
- Task categories
- User-owned categories
- Category creation, renaming, and deletion
- Cascading deletion of tasks when a category is deleted
- Task priorities
- Due dates
- Task status management
- Search
- Filtering
- Sorting
- Pagination
- User-based authorization so users can only manage their own tasks and categories
- Automatic task notifications
- Scheduled notification processing
- Email notifications through SMTP
- Production PostgreSQL database using Neon
- Backend deployment using Render

## 🏗️ Architecture

The project is divided into two main applications backed by a PostgreSQL database:

```text
TaskFlow
│
├── taskflow-backend
│
└── taskflow-frontend
```

The overall request flow is:

```text
React Frontend
      ↓
HTTP / REST API
      ↓
FastAPI Backend
      ↓
Authentication / Authorization
      ↓
Raw SQL using psycopg
      ↓
PostgreSQL
      ↓
Neon
```

### Frontend

The frontend is built with:

- React
- JavaScript
- React Router
- Tailwind CSS
- Vite

It communicates with the backend through HTTP/REST API requests.

The frontend is responsible for:

- Rendering the user interface
- Handling navigation
- Managing authentication state
- Sending API requests
- Displaying tasks
- Displaying categories
- Handling forms
- Displaying validation errors
- Displaying loading states
- Displaying confirmation dialogs
- Displaying toast notifications

### Backend

The backend is built with:

- Python
- FastAPI
- PostgreSQL
- psycopg
- Pydantic
- JWT authentication
- bcrypt password hashing
- APScheduler
- SMTP email

The backend is responsible for:

- API endpoints
- Authentication
- Authorization
- Password hashing and verification
- Request validation
- Database operations
- Task management
- Category management
- User management
- Notification creation
- Notification scheduling
- Email delivery

TaskFlow uses raw SQL through `psycopg` instead of an ORM such as SQLAlchemy.

### Database

PostgreSQL is used as the relational database.

The main entities include:

- Users
- Tasks
- Categories
- Notifications

Relationships and foreign keys are used to maintain data integrity.

The main relationship structure is:

```text
Users
 │
 ├──────────────► Categories
 │                    │
 │                    └──────────────► Tasks
 │
 └──────────────────────────────────► Notifications
```

## 🔐 Authentication & Security

TaskFlow uses JWT access tokens for authentication.

The general authentication flow is:

```text
User Login / Registration
        ↓
FastAPI receives credentials
        ↓
Password is verified / hashed
        ↓
JWT access token generated
        ↓
Frontend receives token
        ↓
Token sent with authenticated requests
        ↓
FastAPI verifies the JWT
        ↓
user_id extracted from token
        ↓
Endpoint performs user-specific operation
```

Passwords are never stored as plain text.

Passwords are hashed using bcrypt before being stored in the database.

Authorization is also enforced so that an authenticated user cannot access or modify another user's tasks.

The authenticated user's `user_id` is obtained from the JWT and is used when performing user-specific database operations.

Category ownership is also checked so that users cannot create or use categories belonging to another user.

## 📋 Task Management

Users can:

- Create tasks
- View their tasks
- View individual tasks
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

### Task Status

The current task status values are:

```text
todo
in_progress
done
```

These are displayed in the UI as:

```text
To Do
In Progress
Done
```

### Task Priority

The current task priority values are:

```text
low
medium
high
```

These are displayed in the UI as:

```text
Low
Medium
High
```

### Task Categories

Every task is associated with a category.

The backend verifies that the selected category belongs to the authenticated user before creating the task.

This prevents a user from creating a task under another user's category.

## 🗂️ Category Management

Categories are user-owned.

Users can:

- Create categories
- View their categories
- Rename categories
- Delete categories

Category names are unique per user.

For example:

```text
User A → College
User B → College
```

is valid because the category belongs to a different user.

### Category Deletion

TaskFlow intentionally uses cascading deletion for categories.

When a category is deleted:

```text
Delete Category
      ↓
Category deleted
      ↓
All tasks belonging to that category are deleted
```

The database enforces this behavior using a foreign key with:

```sql
ON DELETE CASCADE
```

Because category deletion also deletes its tasks, the frontend displays a confirmation dialog before the deletion is performed.

## 🔔 Automatic Notifications

TaskFlow does not require users to manually create reminders.

Instead, the backend automatically creates notification records based on a task's due date.

The current notification types are:

```text
DUE_TOMORROW
DUE_SOON
DUE_NOW
OVERDUE
```

The intended notification flow is:

```text
Task Created
     ↓
Task has a due date
     ↓
Notification records generated
     │
     ├── 1 day before → DUE_TOMORROW
     │
     ├── 1 hour before → DUE_SOON
     │
     └── At deadline → DUE_NOW
```

If an incomplete task passes its due date without being completed, the scheduler can create an `OVERDUE` notification.

Notification records contain information such as:

- Notification ID
- User ID
- Task ID
- Notification type
- Message
- Scheduled time
- Sent time
- Read state
- Created time

## 📧 Email Notifications

TaskFlow contains a background scheduler responsible for processing pending notifications.

The scheduler uses APScheduler.

The general flow is:

```text
Task due date
      ↓
Notification stored in PostgreSQL
      ↓
APScheduler periodically checks notifications
      ↓
scheduled_at <= current time
      ↓
Notification selected
      ↓
Email generated
      ↓
SMTP server
      ↓
User's email
      ↓
sent_at updated
```

The backend marks a notification with `sent_at` after successful email delivery.

This prevents the same notification from being sent repeatedly.

Email configuration is provided through environment variables.

The scheduler remains part of the backend rather than being implemented as a frontend notification system.

### Deployment Consideration

The current scheduler architecture runs inside the backend process.

The initial Render Free deployment has restrictions that prevent the Gmail SMTP connection used by the local implementation from working normally.

Therefore, the email notification architecture is implemented in the backend, but production email delivery requires hosting that permits the required SMTP connection and keeps the scheduler process running.

## 🔑 User Account Features

Users can:

- Register an account
- Log in
- View their profile
- Change their password
- Delete their account
- Log out

User-specific data is associated with the authenticated user's ID.

Deleting an account also affects the user's associated records according to the foreign-key relationships defined in the database.

## 🗄️ Database Design

PostgreSQL is used as the main relational database.

The current application uses four main tables:

```text
users
categories
tasks
notifications
```

### Users

Stores information about registered users and their authentication-related data.

### Categories

Stores categories created by users.

Each category contains a reference to the user who owns it.

Category names are unique per user.

### Tasks

Stores task information such as:

- Task ID
- Title
- Description
- Priority
- Due date
- Status
- User ID
- Category ID
- Created timestamp
- Updated timestamp

### Notifications

Stores automatically generated task notifications.

Notifications reference both the user and the task.

The database uses foreign keys to maintain relationships between the tables.

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

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-google-app-password
SMTP_FROM=your-email@gmail.com
```

> The actual `.env` file should never be committed to GitHub.

Production environment variables are configured separately in the hosting platform.

## 🌐 API Endpoints

### Authentication

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/registeruser` | POST | Register a new user | No |
| `/loginuser` | POST | Authenticate a user and generate JWT | No |

### User

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/users/me` | GET | Retrieve the authenticated user's information | Yes |
| Password update endpoint | PUT | Update the user's password | Yes |
| Account deletion endpoint | DELETE | Delete the authenticated user's account | Yes |

### Tasks

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/createTask` | POST | Create a task | Yes |
| `/gettask` | GET | Retrieve tasks with filtering/sorting/pagination | Yes |
| `/tasks/{task_id}` | GET | Retrieve one task | Yes |
| `/update_task/{task_id}` | PUT | Update a task | Yes |
| Task deletion endpoint | DELETE | Delete a task | Yes |
| Search endpoint | GET | Search tasks | Yes |

### Categories

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/create_category` | POST | Create a category | Yes |
| `/get_category` | GET | Retrieve the user's categories | Yes |
| `/rename_category/{cat_id}` | PUT | Rename a category | Yes |
| `/delete_category/{cat_id}` | DELETE | Delete a category and its tasks | Yes |

The exact implementation and behavior of every endpoint are defined by the backend source code.

## 🛠️ Running the Project Locally

### Backend

Go to the backend directory:

```bash
cd taskflow-backend
```

Create/activate a Python virtual environment if needed.

Install the dependencies:

```bash
pip install -r requirements.txt
```

Configure `.env`.

Then start the FastAPI application using the project's configured Uvicorn command.

The FastAPI documentation can be accessed through:

```text
http://127.0.0.1:8000/docs
```

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
TASKFLOW-PROJECT/
│
├── taskflow-backend/
│   ├── app/
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── scheduler.py
│   │
│   ├── .env.example
│   ├── .gitignore
│   └── requirements.txt
│
├── taskflow-frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
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
Authentication
  ↓
Authorization
  ↓
Pydantic Validation
  ↓
Raw SQL
  ↓
psycopg
  ↓
PostgreSQL
  ↓
Neon
```

The project also introduces background processing and external communication:

```text
Task
  ↓
Notification
  ↓
APScheduler
  ↓
SMTP
  ↓
Email
```

The project deliberately uses raw SQL instead of an ORM so that the database layer, SQL queries, transactions, relationships, and constraints can be understood directly.

## 🚀 Project Evolution

TaskFlow started as a simpler task management application and was progressively expanded.

The project evolved through:

```text
Basic Task Management
        ↓
Authentication
        ↓
JWT Authorization
        ↓
Search / Filtering / Sorting / Pagination
        ↓
User Account Management
        ↓
Categories
        ↓
Category Ownership
        ↓
Database Constraints
        ↓
Cascading Category Deletion
        ↓
Automatic Notifications
        ↓
Email Scheduler
        ↓
Neon PostgreSQL
        ↓
Render Backend Deployment
```

Each stage introduced additional software engineering concepts instead of simply adding UI features.

## 🧠 Engineering Concepts Demonstrated

TaskFlow demonstrates practical understanding of:

- REST APIs
- HTTP methods
- Request/response lifecycle
- FastAPI
- Dependency injection
- JWT authentication
- Authorization
- Password hashing
- bcrypt
- Pydantic validation
- PostgreSQL
- Relational database design
- Primary keys
- Foreign keys
- Unique constraints
- Check constraints
- Cascading deletes
- SQL joins
- Parameterized SQL queries
- Transactions
- Commit and rollback
- Search
- Filtering
- Sorting
- Pagination
- React state management
- React Router
- React Context
- API integration
- Background scheduling
- SMTP
- Environment variables
- Git
- GitHub
- Production database deployment
- Backend deployment

## 📌 Important Design Decisions

### Raw SQL instead of an ORM

TaskFlow uses `psycopg` and SQL queries directly instead of SQLAlchemy.

This keeps database interaction explicit and provides direct exposure to SQL and PostgreSQL behavior.

### User-owned categories

Categories belong to individual users.

This allows different users to create categories with the same name while preventing them from accessing each other's categories.

### Cascading category deletion

Deleting a category intentionally deletes all tasks belonging to that category.

This behavior is enforced at the database level using:

```sql
ON DELETE CASCADE
```

### Backend-controlled notifications

Users do not manually create reminders.

The backend derives notifications from task due dates.

### Email delivery through the backend

The notification scheduler runs inside the backend and communicates with an SMTP server when a notification becomes due.

### Environment-based secrets

Database credentials, JWT secrets, and SMTP credentials are kept outside the source code and supplied through environment variables.

## 🚀 Version

**V2.0**

The V2 release includes the core task management functionality, React frontend integration, FastAPI backend, PostgreSQL database, JWT authentication, account management, user-owned categories, cascading category deletion, automatic notifications, scheduler infrastructure, email notification support, and production deployment setup.

## 👤 Author

Yash Dhingra

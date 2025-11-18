# Full Stack Doctor Appointment Booking System (NestJS + PostgreSQL + React)

This is a **Full Stack Doctor Appointment Booking System**, built using **NestJS**, **PostgreSQL**, **Prisma**, and **React**. The system is designed for production use, providing **role-based authentication** for **Patients**, **Doctors**, and **Admins**.

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: PassportJS + JWT
- **Payment**: Stripe
- **File Upload**: Cloudinary (with local storage fallback)

### Frontend
- **Framework**: React.js + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: Context API

### DevOps
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15

---

## Table of Contents

1. [Project Features](#project-features)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Project Structure](#project-structure)
5. [Running the Project](#running-the-project)
6. [API Documentation](#api-documentation)
7. [Default Credentials](#default-credentials)
8. [Technologies Used](#technologies-used)
9. [License](#license)

---

## Project Features

### **Role-Based Authentication**

1. **Patients**:
   - Register, log in, and book appointments with doctors
   - View and manage booked appointments through a personalized dashboard
   - Make payments via Stripe
   - Update profile information and upload profile pictures
   
2. **Doctors**:
   - Log in to view appointment schedules
   - Manage availability and time slots
   - Update profile information from a dedicated doctor dashboard
   - View appointment history and patient details
   
3. **Admins**:
   - Manage all appointments
   - Oversee doctor profiles and perform administrative tasks
   - View dashboard statistics and analytics
   - Manage users and system settings

### **Other Features**

- **Secure Authentication**: JWT-based authentication with role-based access control
- **Responsive UI**: Built with React.js and Tailwind CSS for an intuitive user experience
- **Dashboard Management**: Custom dashboards for each user role
- **Appointment Management**: Easy appointment booking with time slot validation
- **Profile Management**: Users can update their profiles and upload images
- **Payment Integration**: Stripe payment processing for appointments
- **Image Upload**: Cloudinary integration with local storage fallback
- **Real-time Availability**: Dynamic time slot generation based on bookings
- **Database Migrations**: Prisma migrations for schema management
- **Type Safety**: Full TypeScript support in backend

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js 18+](https://nodejs.org/) (for local development)
- [PostgreSQL 15+](https://www.postgresql.org/download/) (for local development without Docker)
- [Git](https://git-scm.com/)

---

## Quick Start

### Option 1: Docker (Recommended)

The fastest way to get started:

```bash
# Clone the repository
git clone https://github.com/pollabd/apointo.git
cd apointo

# Start all services (frontend, backend, PostgreSQL)
docker-compose up --build
```

That's it! The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **PostgreSQL**: localhost:5432

### Option 2: Local Development

#### Backend Setup

```bash
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration (DATABASE_URL, JWT_SECRET, etc.)

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with initial data
npx prisma db seed

# Start development server
npm run start:dev
```

Backend will run on http://localhost:5000

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on http://localhost:3000

---

## Project Structure

```
apointo/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── assets/          # Images, icons, static data
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Context API providers
│   │   ├── pages/           # Page components
│   │   └── services/        # API services (to be added)
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── server/                   # NestJS backend
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── seed.ts          # Database seeding
│   │   └── migrations/      # Migration files
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # Users module
│   │   ├── doctors/         # Doctors module
│   │   ├── appointments/    # Appointments module
│   │   ├── admin/           # Admin module
│   │   ├── payment/         # Payment module
│   │   ├── upload/          # File upload module
│   │   ├── prisma/          # Prisma service
│   │   ├── app.module.ts    # Root module
│   │   └── main.ts          # Application entry point
│   ├── uploads/             # Local file storage
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
└── docker-compose.yaml       # Docker orchestration
```

---

## Default Credentials

After seeding the database, you can log in with these credentials:

| Role    | Email                        | Password    |
|---------|------------------------------|-------------|
| Admin   | admin@apointo.com            | password123 |
| Doctor  | richard.james@apointo.com    | password123 |
| Patient | patient@test.com             | password123 |

**⚠️ Important**: Change these credentials in production!

---

## Running the Project

1. **Build and Start the Containers**:

   ```bash
   docker-compose up --build
   ```

   This command will:

   - Build and start the frontend, backend, and MongoDB containers.
   - Automatically link the services.

2. **Monitor Logs**:

   Check logs for all services in the terminal where the above command was run.

---

## Accessing the Application

- **Frontend (Patient, Doctor, Admin Portals)**:
  Open your browser and go to:

  ```
  http://localhost:3000
  ```

- **Backend API**:
  Access the backend API at:

  ```
  http://localhost:5000
  ```

- **MongoDB**:
  MongoDB will be available on:

  ```
  mongodb://localhost:27017
  ```

---

## Stopping the Project

To stop the running containers, use:

```bash
docker-compose down
```

---

## Removing Containers and Volumes

To stop containers and delete associated volumes (including MongoDB data), run:

```bash
docker-compose down -v
```

---

## Technologies Used

### **Frontend**:

- React.js
- Tailwind CSS (optional, if used)
- Nginx (for serving the React app in production)

### **Backend**:

- Node.js
- Express.js
- MongoDB

### **DevOps**:

- Docker
- Docker Compose

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

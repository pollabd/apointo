# Apointo Backend - NestJS + PostgreSQL + Prisma

Production-ready backend API for the Doctor Appointment Booking System.

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: PassportJS + JWT
- **Payment**: Stripe
- **File Upload**: Cloudinary (with local storage fallback)

## Features

- ✅ JWT-based authentication with role-based access control
- ✅ User management (Patients, Doctors, Admins)
- ✅ Doctor profiles and availability management
- ✅ Appointment booking system with time slot validation
- ✅ Stripe payment integration
- ✅ Image upload with Cloudinary + local fallback
- ✅ Admin dashboard APIs
- ✅ Comprehensive error handling
- ✅ Input validation with class-validator
- ✅ Database migrations with Prisma

## Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens (change in production!)
- `STRIPE_SECRET_KEY`: Your Stripe secret key (optional)
- `CLOUDINARY_*`: Cloudinary credentials (optional, will use local storage if not set)

### 3. Database Setup

Make sure PostgreSQL is running, then:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with initial data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:5000/api`

## Default Login Credentials

After seeding, you can use these credentials:

- **Admin**: `admin@apointo.com` / `password123`
- **Doctor**: `richard.james@apointo.com` / `password123`
- **Patient**: `patient@test.com` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users (Protected)
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/upload-image` - Upload profile image
- `GET /api/user/appointments` - Get user's appointments

### Doctors (Public)
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `GET /api/doctors/speciality/:speciality` - Filter by speciality
- `GET /api/doctors/:id/slots` - Get available time slots

### Doctors (Protected - Doctor Role)
- `PUT /api/doctors/profile` - Update doctor profile
- `GET /api/doctors/my/appointments` - Get doctor's appointments

### Appointments (Protected)
- `POST /api/appointments/book` - Book appointment (Patient)
- `GET /api/appointments/user` - Get user's appointments
- `PUT /api/appointments/:id/cancel` - Cancel appointment
- `PUT /api/appointments/:id/complete` - Mark as completed (Doctor)

### Admin (Protected - Admin Role)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/stats` - Dashboard statistics
- `PUT /api/admin/doctors/:id` - Update doctor
- `DELETE /api/admin/appointments/:id` - Delete appointment

### Payment (Protected)
- `POST /api/payment/create-intent` - Create Stripe payment intent
- `POST /api/payment/verify` - Verify payment
- `POST /api/payment/webhook` - Stripe webhook (public)

## Database Schema

### User
- Stores user information for all roles (Patient, Doctor, Admin)
- Includes authentication credentials
- Profile information (address, gender, DOB, image)

### Doctor
- Extended profile for doctors
- Speciality, degree, experience, fees
- Availability status and ratings

### Appointment
- Links patients with doctors
- Appointment date and time slot
- Status tracking (Pending, Confirmed, Completed, Cancelled)
- Payment information

## Scripts

```bash
# Development
npm run start:dev          # Start with hot-reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Database
npx prisma studio          # Open Prisma Studio (DB GUI)
npx prisma migrate dev     # Create new migration
npx prisma db seed         # Seed database
npx prisma generate        # Generate Prisma Client

# Testing
npm run test               # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Generate coverage report
```

## Docker Deployment

### Using Docker Compose (Recommended)

From the project root:

```bash
# Start all services (frontend, backend, PostgreSQL)
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Backend Only

```bash
cd server
docker build -t apointo-backend .
docker run -p 5000:5000 --env-file .env apointo-backend
```

## Project Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts            # Database seeding
│   └── migrations/        # Migration files
├── src/
│   ├── auth/              # Authentication module
│   ├── users/             # Users module
│   ├── doctors/           # Doctors module
│   ├── appointments/      # Appointments module
│   ├── admin/             # Admin module
│   ├── payment/           # Payment module
│   ├── upload/            # File upload module
│   ├── prisma/            # Prisma service
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry point
├── uploads/               # Local file storage
├── .env.example           # Environment template
├── Dockerfile             # Docker configuration
└── package.json           # Dependencies
```

## Image Upload

The system supports two storage options:

1. **Cloudinary** (Primary): Configure `CLOUDINARY_*` variables in `.env`
2. **Local Storage** (Fallback): Automatically used if Cloudinary is not configured

Images are stored in the `uploads/` directory when using local storage.

## Payment Integration

Stripe integration is ready but optional:

1. Add your `STRIPE_SECRET_KEY` to `.env`
2. Configure webhook endpoint for production
3. Payment flow:
   - Create payment intent: `POST /api/payment/create-intent`
   - Process payment on frontend with Stripe.js
   - Verify payment: `POST /api/payment/verify`

## Security

- Passwords are hashed with bcrypt
- JWT tokens for authentication
- Role-based access control (RBAC)
- Input validation on all endpoints
- CORS configured for frontend origins
- SQL injection protection via Prisma

## Troubleshooting

### Database Connection Error

Make sure PostgreSQL is running and credentials in `.env` are correct:

```bash
# Check PostgreSQL status
# On Windows with Docker:
docker ps | findstr postgres

# Test connection
npx prisma db push
```

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Migration Errors

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name fix_issue
```

### Port Already in Use

Change the `PORT` in `.env` or kill the process using port 5000:

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Update `JWT_SECRET` to a secure random string
3. Configure production database URL
4. Set up Cloudinary for production file storage
5. Configure Stripe webhook endpoint
6. Build and run:

```bash
npm run build
npm run start:prod
```

## License

MIT

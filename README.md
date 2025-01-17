# Full Stack Doctor Appointment Booking System (MERN Stack with Docker)

This is a **Full Stack Doctor Appointment Booking System**, built using the **MERN Stack** (MongoDB, Express.js, React, Node.js) and containerized with **Docker**. The system is designed for real-world scenarios, providing **role-based authentication** for **Patients**, **Doctors**, and **Admins**.

The system includes:

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Containerization**: Docker and Docker Compose

---

## Table of Contents

1. [Project Features](#project-features)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [Running the Project](#running-the-project)
6. [Accessing the Application](#accessing-the-application)
7. [Stopping the Project](#stopping-the-project)
8. [Removing Containers and Volumes](#removing-containers-and-volumes)
9. [Technologies Used](#technologies-used)
10. [License](#license)

---

## Project Features

### **Role-Based Authentication**

1. **Patients**:
   - Register, log in, and book appointments with doctors.
   - View and manage booked appointments through a personalized dashboard.
2. **Doctors**:
   - Log in to view appointment schedules and track earnings.
   - Update profile information from a dedicated doctor dashboard.
3. **Admins**:
   - Manage all appointments.
   - Oversee doctor profiles and perform administrative tasks.

### **Other Features**

- **Secure Authentication**: Role-based access control using JWT.
- **Responsive UI**: Built with React.js for an intuitive user experience.
- **Dashboard Management**: Custom dashboards for each user role.
- **Appointment Management**: Easy appointment booking and tracking.
- **Profile Management**: Doctors and Admins can update their profiles.
- **Earnings Tracking**: Doctors can view their revenue from appointments.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) (optional, for local development)
- [Git](https://git-scm.com/) (optional, for cloning the repository)

---

## Project Structure

```
appointment-booking-system/
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── src/
│   └── ... (other React files)
├── server/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── ... (other backend files)
└── docker-compose.yml
```

---

## Setup Instructions

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/pollabd/apointo.git
   cd apointo
   ```

2. **Verify Docker Installation**:

   Ensure Docker and Docker Compose are installed:

   ```bash
   docker --version
   docker-compose --version
   ```

3. **Configure Environment Variables**:

   - Create a `.env` file in the `server` folder if needed.
   - Example `.env` file:

     ```env
     MONGO_URI=mongodb://mongo:27017/appointment-system
     NODE_ENV=production
     ```

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

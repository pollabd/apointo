# MERN Stack Project with Docker

This is a MERN (MongoDB, Express.js, React, Node.js) stack project that is containerized using Docker. The project includes a frontend (React), a backend (Node.js with Express), and a MongoDB database.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Setup Instructions](#setup-instructions)
4. [Running the Project](#running-the-project)
5. [Accessing the Application](#accessing-the-application)
6. [Stopping the Project](#stopping-the-project)
7. [Removing Containers and Volumes](#removing-containers-and-volumes)
8. [Technologies Used](#technologies-used)
9. [License](#license)

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
mern-project/
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

1. **Clone the Repository** (if applicable):

   ```bash
   git clone https://github.com/pollabd/apointo.git
   cd apointo
   ```

2. **Ensure Docker and Docker Compose are Installed**:
   Verify Docker and Docker Compose are installed by running:

   ```bash
   docker --version
   docker-compose --version
   ```

3. **Environment Variables**:
   - If your backend requires environment variables (e.g., `MONGO_URI`), create a `.env` file in the `server` folder.
   - Example `.env` file:
     ```env
     MONGO_URI=mongodb://mongo:27017/mernapp
     NODE_ENV=production
     ```

---

## Running the Project

1. **Build and Start the Containers**:
   Run the following command in the root directory of the project:

   ```bash
   docker-compose up --build
   ```

   This will:

   - Build the frontend and backend Docker images.
   - Start the MongoDB container.
   - Run the frontend and backend services.

2. **Monitor Logs**:
   You can monitor the logs of all services in the terminal where you ran the above command.

---

## Accessing the Application

Once the containers are running, you can access the application as follows:

- **Frontend (React)**:
  Open your browser and navigate to:

  ```
  http://localhost:3000
  ```

- **Backend (API)**:
  The backend API will be available at:

  ```
  http://localhost:5000
  ```

- **MongoDB**:
  MongoDB will be running on:
  ```
  mongodb://localhost:27017
  ```

---

## Stopping the Project

To stop the running containers, press `Ctrl + C` in the terminal where the containers are running, or run:

```bash
docker-compose down
```

---

## Removing Containers and Volumes

To stop the containers and remove all associated volumes (including MongoDB data), run:

```bash
docker-compose down -v
```

---

## Technologies Used

- **Frontend**:

  - React
  - Tailwind CSS (optional, if used)
  - Nginx (for serving the React app in production)

- **Backend**:

  - Node.js
  - Express.js
  - MongoDB

- **DevOps**:
  - Docker
  - Docker Compose

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

# GeoMesh 🌍📍

GeoMesh is a real-time, hyperlocal skill and resource exchange platform. It allows users within a small geographic radius to post and discover ephemeral needs and offers, fostering immediate community interaction. This project is a full-stack application built with a modern, containerized architecture and deployed on the cloud.

[![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=for-the-badge&logo=svelte&logoColor=white)](https://kit.svelte.dev/) [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 🚀 Live Demo

You can access the live, deployed version of the application here:

**[https://geomesh-frontend-xxxx.onrender.com](https://geomesh-frontend-xxxx.onrender.com)** *(Replace with your actual Render URL)*

> **Note:** The database is seeded with test data from Kharagpur, India. To see posts, you may need to use your browser's developer tools (F12 -> More Tools -> Sensors) to override your location to **Latitude: `22.3149`** and **Longitude: `87.3105`**.

---

## ✨ Key Features

* **Real-time Geospatial Queries:** Utilizes a PostgreSQL database with the PostGIS extension to efficiently find and display posts within a specific radius of the user's location using `ST_DWithin`.
* **Live Updates with WebSockets:** New posts are broadcast to all connected clients in real-time without needing a page refresh.
* **Ephemeral Posts:** Posts are designed with a TTL (Time-to-Live) and the API only fetches non-expired posts, ensuring the feed is always relevant.
* **Containerized Architecture:** The entire application (backend & frontend) is containerized using Docker and managed locally with Docker Compose, ensuring consistency and portability.
* **Cloud Deployment:** Deployed on Render from a GitHub repository, demonstrating a modern GitOps workflow.

---

## 🛠️ Tech Stack

* **Frontend:** SvelteKit, TypeScript
* **Backend:** Node.js, Express.js, WebSockets (`ws` library)
* **Database:** PostgreSQL with PostGIS (hosted on Neon)
* **DevOps & Deployment:** Docker, Docker Compose, Render

---

## 📦 Local Setup & Installation

To run this project on your local machine, you'll need Git and Docker with Docker Compose installed.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/](https://github.com/)<YOUR_USERNAME>/geomesh-sde-project.git
    cd geomesh-sde-project
    ```

2.  **Set up backend environment variables:**
    Create a file named `.env` inside the `backend` directory (`backend/.env`). Add your Neon database connection string:
    ```
    DATABASE_URL="<YOUR_NEON_DATABASE_URL>"
    ```

3.  **Create `docker-compose.yml` file:**
    In the root of the project, create a `docker-compose.yml` file with the following content. This file defines how to run the multi-container application locally.

    ```yaml
    version: '3.8'
    services:
      backend:
        build:
          context: ./backend
          dockerfile: Dockerfile
        restart: always
        ports:
          - "3000:3000"
        env_file:
          - ./backend/.env

      frontend:
        build:
          context: ./frontend
          dockerfile: Dockerfile
        restart: always
        ports:
          - "5173:3000"
        environment:
          - PUBLIC_API_URL=http://localhost:3000
          - PUBLIC_WEBSOCKET_URL=ws://localhost:3000
        depends_on:
          - backend
    ```

4.  **Run the application:**
    Use Docker Compose to build and start the containers.
    ```bash
    docker-compose up --build
    ```
    The frontend will be available at `http://localhost:5173`.

---

## 📄 API Endpoints

* `POST /api/posts`: Creates a new post.
    * **Body (JSON):** `{ "content", "userId", "expiresInMinutes", "latitude", "longitude" }`
* `GET /api/posts`: Retrieves nearby, active posts.
    * **Query Params:** `?latitude=<lat>&longitude=<lon>&radius=<meters>`
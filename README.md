# SAAS Social Media App

## Running the Project with Docker

To run the entire stack (Frontend, Backend, and Redis) using Docker, make sure you have Docker and Docker Compose installed on your system.

### Option 1: Development Mode (Hot Reloading)

From the root directory of the project, run:

```bash
docker-compose up --build
```

This will build and start all the services. 

- **Frontend** will be accessible at: [http://localhost:5173](http://localhost:5173)
- **Backend API** will be accessible at: [http://localhost:5000](http://localhost:5000)
- **Redis Database** will be accessible at `localhost:6379`

### Environment Variables
Docker Compose automatically loads the `.env` files from both the `Backend` and `frontend` directories. Make sure your environment variables are set correctly in `Backend/.env` and `frontend/.env`.

To stop the services, press `Ctrl + C` in the terminal, or run:

```bash
docker-compose down
```

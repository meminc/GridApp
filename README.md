# Grid Monitoring & Simulation Tool

A web-based platform for real-time monitoring, visualization, and simulation of electrical grid networks.

## Features
- Visualize and edit grid topology
- Monitor real-time telemetry (voltages, alarms)
- Simulate power flow under various scenarios
- Manage users and role-based access

## Tech Stack
- **Frontend:** Next.js (React)
- **Backend:** Node.js
- **Graph DB:** Neo4j
- **Relational DB:** PostgreSQL (+ TimescaleDB)
- **Simulation Engine:** Custom (Node.js)
- **Queue:** Redis + BullMQ
- **Deployment:** Docker + Kubernetes

## Local Development

### Prerequisites
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Quick Start
```sh
git clone <repo-url>
cd project
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Neo4j Browser: http://localhost:7474 (user: neo4j, pass: test)
- Postgres: localhost:5432 (user: griduser, pass: gridpass)
- TimescaleDB: localhost:5433 (user: griduser, pass: gridpass)

## Contributing
See `CONTRIBUTING.md` for guidelines. 
# Grid Monitoring and Simulation Tool - Project Documentation

## 1. ✨ Project Overview

A web-based platform for real-time monitoring, visualization, and simulation of electrical grid networks. Designed for engineers and operators, the tool supports interactive topology visualization, live data updates, and simulation features (starting with power flow).

### Goals

- Visualize and edit grid topology
- Monitor real-time telemetry (voltages, alarms)
- Simulate power flow under various scenarios
- Manage users and role-based access
- Built on a scalable, modern stack

---

## 2. 🏗️ System Architecture

### 2.1 High-Level Architecture

```
[Frontend Web App] <---> [API Gateway] <---> [Backend Services]
        |                         |                 |
     [WebSocket]              [Auth]           [Simulation Engine]
        |                         |                 |
     [User]               [Relational DB]      [Job Queue]
                                |
                        [Graph DB (Topology)]
```

### 2.2 Technology Stack

- **Frontend:** Next.js, Chakra UI, React Hook Form, React Query
- **Backend:** Node.js
- **Graph DB:** Neo4j
- **Relational DB:** PostgreSQL (+ TimescaleDB)
- **Simulation Engine:** Custom (power flow, phase 1)
- **Queue:** Redis + BullMQ
- **Deployment:** Docker + Kubernetes
- **Monitoring:** Prometheus + Grafana + Loki
- **IaC:** Terraform or Pulumi for provisioning environments

---

## 3. 👥 User Roles & Workflows

### Roles

- **Operator**: Monitor only
- **Engineer**: Simulate and edit
- **Admin**: Manage users/system

### Workflows

- **Monitoring:** View live data, alarms, element status
- **Visualization:** Interact with network graph, view real-time overlays
- **Simulation:** Create/edit scenarios, run simulations, compare results
- **Management:** Administer users and roles, track changes

---

## 4. 🎨 UI/UX Structure

### Layout

- **Dashboard:** KPIs, alarms, recent activity
- **Network Viewer:** Topology + overlays (voltage levels, alarms)
- **Simulation Panel:** Inputs (select scenario, parameters), run control, results
- **Element Editor:** Sidebar with tabs (details, telemetry, logs)
- **Admin Panel:** User control, role assignment, activity log

### Interaction Examples

- Hover = live preview (tooltip with values)
- Click = inspect and edit details
- Drag = edit layout (manual schematic view)
- Right-click = context menu (add/remove element, connect)
- WebSocket = real-time updates (telemetry, topology changes)

---

## 5. 🗝 Network Drawing & Visualization

### Goals

- Interactive, zoomable schematic view
- Drag-and-drop editing
- Real-time telemetry overlays (voltage, power flow, alarms)
- Save/load custom layouts

### Tools

- **Cytoscape.js** (preferred)
- **Konva.js** (for schematic support)
- **D3.js** (if advanced visualization logic is required)

### Elements

- **Bus:** Circle icon
- **Line:** Edge between buses, colored by load
- **Load:** Triangle icon, color = priority/online status
- **Generator:** Star or custom icon, tooltip for output
- **Transformer:** Rectangle icon, label with tap ratio
- **Switches:** Square icon, green (closed) / red (open)

Icons from open-source libraries like `lucide-react`, `react-icons`, or SVG sets.

### Overlays & Layers

- Voltage levels (heatmap or node color scale)
- Alarms (flashing or highlighted nodes)
- Real-time power flow arrows with magnitude
- Layer toggles (Elements, Status, Labels)

---

## 6. 🔌 API Design

### Endpoints (sample)

- `GET /elements`, `POST /elements`, `PUT /elements/:id`, `DELETE /elements/:id`
- `GET /topology`, `POST /topology/update`, `GET /topology/subgraph/:id`
- `POST /simulation/run`, `GET /simulation/:id/status`, `GET /simulation/:id/results`
- `GET /monitoring/live`, `GET /monitoring/element/:id`, WebSocket `/monitoring/subscribe`
- `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`
- `GET /scenarios`, `POST /scenarios`, `PUT /scenarios/:id`, `GET /scenarios/:id`

---

## 7. ⚡ Simulation Engine (Phase 1)

### Goal

- AC or DC power flow simulation with fixed topology and parameters

### Workflow

1. Fetch topology from Graph DB
2. Get parameters from SQL (loads, gens, voltage levels)
3. Build input JSON (node/edge arrays)
4. Solve power flow (internal algorithm)
5. Save and return results (voltages, flows)

### Sample Output

```json
{
  "buses": {"bus1": {"voltage": 0.98}},
  "lines": {"line1": {"p": 100}}
}
```

### Future Extensions

- N-1 contingency analysis
- PV/PQ node switching
- Fault simulation (short circuit)
- Optimal Power Flow (OPF)
- Time-series dynamics and transient simulation

---

## 8. 📊 Database Schema (Hybrid)

### Relational (PostgreSQL)

- Tables:
  - `users`
  - `scenarios`
  - `simulation_jobs`
  - `simulation_results`
  - `element_metadata`
  - `alarms`
  - `telemetry` (TimescaleDB hypertable)

### Graph DB (Neo4j)

- Nodes: `Bus`, `Load`, `Generator`, `Transformer`, `Line`
- Relationships: `CONNECTED_TO`, `FEEDS`, `CONSUMES`, `TRANSFERS`

### Integration

- Shared UUIDs or internal IDs between databases
- Scenario references include graph snapshot IDs or exports
- Sync scripts ensure referential consistency

---

## 9. ⚙️ Simulation Engine Input Builder

- Collects full subgraph from Graph DB
- Fetches parameters per element from SQL
- Merges, transforms to engine-specific JSON
- Includes validation, fallback defaults, and completeness checks

---

## 10. 🔐 Security & Access Control

- JWT-based stateless authentication
- Role-Based Access Control (RBAC)
- HTTPS for all services (TLS 1.2+)
- Input validation and sanitization
- Audit logs for login, simulation, topology edits

---

## 11. ✅ Testing & Validation

### Types

- **Unit Tests:** APIs, graph query handlers, input builders
- **Integration Tests:** Full simulation workflow with dummy data
- **Simulation Tests:** Validate results against known test cases
- **UI Tests:** Interaction, component rendering, validation
- **Load Tests:** Simulate multiple concurrent users and jobs

---

## 12. 🚀 Deployment & Infrastructure

### Infrastructure Components

- **Frontend:** Dockerized Next.js app + NGINX
- **Backend:** Containerized Node.js app with Kubernetes deployment
- **Graph DB:** Neo4j (Cloud-managed or replicated cluster)
- **SQL DB:** PostgreSQL + TimescaleDB with replication and backups
- **CI/CD:** GitHub Actions / GitLab CI + Docker Hub / AWS ECR
- **Secrets:** Managed via Vault or cloud secrets manager
- **Monitoring:** Prometheus + Grafana + Loki + Alertmanager

### Deployment Flow

1. Code pushed → triggers CI
2. CI builds/test → publish Docker image
3. CD applies updates via Helm/Terraform
4. Kubernetes rollout (canary or blue-green)
5. Health checks + metrics dashboards

---

## 13. 📊 Future Roadmap

- Fault & contingency simulation
- Advanced scenario comparison tools
- Geographic map-based visualization
- SCADA/EMS integration (IEC 104, OPC UA)
- Multi-user collaboration and annotations
- Export to formats (CSV, CGMES, GeoJSON)


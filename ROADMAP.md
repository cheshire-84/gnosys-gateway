# V2.0.0 Feature Roadmap

The following features and architectural improvements are slated for the next major iteration of the Gnosys Gateway.

## 1. Active Service Pinging (Health Checks)
* **Current State:** Service cards display a static "OPERATIONAL" string.
* **V2 Goal:** The backend will actively ping the URLs of registered services every 60 seconds. The frontend will dynamically update the pulse indicator (Green = Online, Red = Offline) based on the actual HTTP response from the target server.

## 2. Docker Containerization
* **Current State:** Bare-metal deployment using PM2 and local MongoDB.
* **V2 Goal:** Transition the entire stack to `docker-compose`. This will spin up the Frontend, Backend, and MongoDB in isolated containers, making disaster recovery and migrations to new Proxmox nodes instant and seamless.

## 3. Dynamic Telemetry Targets
* **Current State:** Telemetry strictly reports the health of the host LXC running the Gateway.
* **V2 Goal:** Implement SSH-key-based or API-based polling to fetch CPU/Memory/Disk stats from *other* critical servers (e.g., the Proxmox hypervisor itself, Pegasus-CA, or external game servers).

## 4. Automated Database Backups
* **Current State:** MongoDB data sits natively on the drive.
* **V2 Goal:** Implement a daily cron job within the Node.js backend that executes `mongodump`, zips the asset registry and user accounts, and ships the backup to a remote NAS or secure lockbox.

## 5. Drag-and-Drop Dashboard Customization
* **Current State:** The grid layout is fixed.
* **V2 Goal:** Integrate a library like `react-beautiful-dnd` to allow authenticated admins to drag, drop, and permanently reorder the service cards to prioritize frequently used assets.
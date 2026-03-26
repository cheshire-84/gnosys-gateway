# Gnosys Labs Gateway // NOC Dashboard

The central Network Operations Center (NOC) dashboard for the Gnosys Labs infrastructure. The Gateway serves as a unified command center, providing a persistent asset registry, real-time system telemetry, and external data relays, all wrapped in a secure, zero-trust architecture.

## 🚀 Core Features
* **Asset Registry (CRUD):** A persistent, MongoDB-backed directory of all homelab services, applications, and hardware nodes. 
* **Access Control:** Public read-only dashboard. Modifying the infrastructure map requires JWT-authenticated Master/Admin credentials.
* **Live Telemetry:** Real-time hardware polling for CPU, Memory, Disk Space, and Uptime on the host Ubuntu server.
* **External Data Relays:** * Hacker News global tech feed (via hnrss.org) with in-memory caching to prevent API rate-limiting.
  * Local weather telemetry mapped to Plant City, FL.
  * Random Wikipedia discovery feed.
* **Reverse Proxy Integration:** All external API calls are proxied through the Node.js backend to protect the client's IP and prevent CORS violations.
* **Stoic Aesthetic:** Built with React 19 and Tailwind CSS v4, featuring a high-contrast, minimalist terminal UI.

## 🛠️ Tech Stack
* **Frontend:** React, Vite, TailwindCSS v4
* **Backend:** Node.js, Express.js, Mongoose, RSS-Parser
* **Database:** MongoDB
* **Infrastructure:** Ubuntu 24.04, NGINX Reverse Proxy, PM2 Daemon

## 📧 Author & Administration
**Cheshire**
Contact: cheshire.84@icloud.com
System Location: Plant City NOC
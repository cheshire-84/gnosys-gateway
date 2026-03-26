# Changelog

All notable changes to the Gnosys Gateway will be documented in this file.

## [1.0.0] - Production Release

### Added
* **MVC Backend Architecture:** Refactored the monolithic Express server into dedicated routes (`auth`, `services`, `system`), models, and configuration files.
* **JWT Access Control:** Implemented full authentication routes. Unauthenticated users can view the dashboard; only authorized administrators can add or purge services.
* **Admin Management Panel:** Added a dedicated Settings UI to provision new administrators or revoke access credentials.
* **In-Memory RSS Cache:** Built a 5-minute RAM cache for the Hacker News relay to prevent HTTP 429 (Too Many Requests) IP bans.
* **API Proxy Routes:** Shifted Wikipedia and Open-Meteo fetches from the React client to the Node.js backend to bypass CORS and improve security.
* **NGINX Production Configuration:** Deployed a strict reverse proxy config to handle React SPA routing (`/index.html` fallback) and transparent API tunneling (`/api/`).
* **Interactive Auth Modal:** Created a seamless pop-up terminal for Master Initialization and Root logins.
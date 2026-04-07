# Ubuntu Server Deployment Guide

This guide outlines the steps to deploy the Gnosys Gateway to a production Ubuntu LXC/VM using NGINX and PM2.

## Prerequisites
* Ubuntu 22.04 / 24.04
* Node.js (v18+) & npm
* MongoDB (running locally on port 27017)
* NGINX
* PM2 (`npm install -g pm2`)

## 1. Clone & Install Dependencies
```bash
git clone git@github.com:cheshire-84/gnosys-gateway.git
cd gnosys-gateway

# Install Backend dependencies
cd server
npm install

# Install Frontend dependencies
cd ../client
npm install
```

## 2. Environment Configuration
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gnosys_gateway
JWT_SECRET=generate_a_highly_secure_random_string_here
```

## 3. Build & Deploy Frontend
```bash
cd ~/gnosys-gateway/client
npm run build
sudo mkdir -p /var/www/gateway
sudo cp -r dist/* /var/www/gateway/
sudo chown -R www-data:www-data /var/www/gateway
```

## 4. Daemonize the Backend
```bash
cd ~/gnosys-gateway/server
pm2 start index.js --name gateway-api
pm2 save
pm2 startup
```

## 5. NGINX Reverse Proxy Configuration
Create a new NGINX configuration file: `sudo nano /etc/nginx/sites-available/gnosys-gateway`

```nginx
server {
    listen 80;
    server_name home.gnosys.labs;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name home.gnosys.labs;

    ssl_certificate     /path/to/certs/home_gnosys_labs.crt;
    ssl_certificate_key /path/to/certs/home_gnosys_labs.key;

    root /var/www/gateway;
    index index.html;

    # React SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Strict API Pass-Through
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

Enable the site and restart NGINX:
```bash
sudo ln -s /etc/nginx/sites-available/gnosys-gateway /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
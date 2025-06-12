
# Deploying Seera POS Application to an Ubuntu Server

This guide provides step-by-step instructions to deploy the Seera POS Next.js application to an Ubuntu server (e.g., Ubuntu 20.04, 22.04) using Node.js, PM2, and Nginx.

## Prerequisites

*   An Ubuntu Server (20.04 LTS or 22.04 LTS recommended).
*   `sudo` access on the server.
*   A domain name pointing to your server's IP address (optional, but recommended for production and SSL).
*   Firewall configured (e.g., UFW).

## 1. Server Setup

### a. Update System Packages
Connect to your server via SSH and update your package list:
```bash
sudo apt update
sudo apt upgrade -y
```

### b. Install Node.js and Yarn
We'll use NodeSource to install a recent version of Node.js (e.g., Node.js 20.x).
```bash
# Install curl if not already present
sudo apt install -y curl

# Add NodeSource repository for Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify Node.js and npm installation
node -v
npm -v

# Install Yarn globally
sudo npm install -g yarn

# Verify Yarn installation
yarn --version
```

### c. Install PM2 (Process Manager)
PM2 will keep your Next.js application running in the background and restart it if it crashes.
```bash
sudo yarn global add pm2

# Verify PM2 installation
pm2 --version
```

### d. Install Nginx (Reverse Proxy)
Nginx will act as a reverse proxy, forwarding requests to your Next.js application.
```bash
sudo apt install -y nginx

# Verify Nginx installation
nginx -v

# Allow Nginx through the firewall (if UFW is active)
sudo ufw allow 'Nginx Full'
sudo ufw enable # If not already enabled
sudo ufw status
```

## 2. Application Deployment

### a. Clone or Copy Your Application
Clone your repository or copy your application files to a directory on the server (e.g., `/var/www/seera-pos-app`).
```bash
# Example using git clone
sudo mkdir -p /var/www/
cd /var/www/
sudo git clone <your-repository-url> seera-pos-app
cd seera-pos-app
# If you copied files manually, ensure correct permissions.
# sudo chown -R $(whoami):$(whoami) /var/www/seera-pos-app # Or a dedicated user
```

### b. Install Dependencies
Navigate to your project directory and install dependencies.
```bash
cd /var/www/seera-pos-app
yarn install --frozen-lockfile
```

### c. Configure Environment Variables
Your application needs environment variables for configuration (API keys, Sheet ID, etc.). Create a `.env.production.local` file in your project root (`/var/www/seera-pos-app/.env.production.local`). **Never commit this file to version control.**

```bash
# Create and edit the environment file
sudo nano .env.production.local
```
Add your production environment variables to this file:
```env
NODE_ENV=production
PORT=3000 # The internal port Next.js will run on

# Your AI Provider API Key
AI_PROVIDER_API_KEY="your_actual_ai_provider_key"

# Your Google Sheet ID
GOOGLE_SHEET_ID="your_google_sheet_id"

# Content of your Google Service Account JSON key
# IMPORTANT: Paste the entire JSON content as a single line or use appropriate multi-line syntax for your shell/env loader if supported.
# For simplicity here, ensure it's a valid JSON string.
# Example: GOOGLE_SERVICE_ACCOUNT_CREDENTIALS='{"type": "service_account", "project_id": "...", ...}'
GOOGLE_SERVICE_ACCOUNT_CREDENTIALS='your_google_service_account_json_content_here'

# If using Google Application Credentials file path (alternative to above):
# GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-file.json"
# If you use this, ensure the file exists and is readable by the app user.
# The current API route for menu items expects GOOGLE_SERVICE_ACCOUNT_CREDENTIALS.
```
Ensure the file permissions are secure if it contains sensitive data:
```bash
sudo chmod 600 .env.production.local
# Optionally, ensure the user running the Next.js app owns it
# sudo chown your_app_user:your_app_user .env.production.local
```
Your `next.config.ts` uses `output: 'standalone'`, which is good for deployment as it bundles only necessary files.

### d. Build the Application
```bash
yarn build
```
This will create an optimized production build in the `.next` directory.

### e. Start Application with PM2
Use the `ecosystem.config.js` file (provided in your project root) to configure PM2.
If you don't have one, a simple way to start is:
```bash
# Ensure you are in the project root: /var/www/seera-pos-app
pm2 start yarn --name "seera-pos-app" --interpreter bash -- start
```
Or, using the `ecosystem.config.js`:
```bash
pm2 start ecosystem.config.js --env production
```
This will start your Next.js app. The `start` script in your `package.json` is `next start`, which will serve your application on the port specified by the `PORT` environment variable (or default to 3000).

### f. Configure PM2 to Start on Boot
Generate a startup script for PM2:
```bash
pm2 startup systemd
```
Follow the instructions output by this command (it will likely give you a command to run with `sudo`).
Then save the current PM2 process list:
```bash
pm2 save
```

To monitor your application:
```bash
pm2 list
pm2 monit
pm2 logs seera-pos-app
```

## 3. Nginx Configuration (Reverse Proxy)

Create an Nginx server block configuration file for your application.
```bash
sudo nano /etc/nginx/sites-available/seera-pos-app
```
Paste the following configuration, replacing `your_domain.com` with your actual domain name or server's IP address, and ensure the `proxy_pass` port matches the `PORT` your Next.js app is running on (e.g., 3000).

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name your_domain.com www.your_domain.com; # Replace with your domain or server IP

    # For larger file uploads (if needed)
    # client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:3000; # Port your Next.js app runs on
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Optional: Specific handling for Next.js static assets for better performance
    # This assumes your Next.js app serves static files from _next/static
    # location /_next/static {
    #     proxy_cache_valid 200 302 60m;
    #     proxy_cache_revalidate on;
    #     expires 1y;
    #     add_header Cache-Control "public";
    #     proxy_pass http://localhost:3000/_next/static;
    # }
}
```

Enable this server block by creating a symbolic link:
```bash
sudo ln -s /etc/nginx/sites-available/seera-pos-app /etc/nginx/sites-enabled/
```

Test your Nginx configuration:
```bash
sudo nginx -t
```
If the test is successful, reload Nginx to apply the changes:
```bash
sudo systemctl reload nginx
```

## 4. (Optional) Setup SSL with Let's Encrypt

If you have a domain name, it's highly recommended to secure your site with SSL.
Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```
Obtain and install an SSL certificate for your domain:
```bash
sudo certbot --nginx -d your_domain.com -d www.your_domain.com # Replace with your domain
```
Follow the prompts. Certbot will automatically update your Nginx configuration to use SSL and set up automatic renewal.

## 5. Access Your Application

You should now be able to access your Seera POS application by navigating to `http://your_domain.com` (or `https://your_domain.com` if you set up SSL). If you didn't use a domain, use `http://your_server_ip`.

## 6. Updating the Application

To update your application:
1.  Navigate to your project directory: `cd /var/www/seera-pos-app`
2.  Pull the latest changes from your repository: `sudo git pull` (or copy updated files)
3.  Install any new dependencies: `yarn install --frozen-lockfile`
4.  Re-build the application: `yarn build`
5.  Restart the application using PM2: `pm2 restart seera-pos-app`

PM2 will handle a zero-downtime reload if configured for it (e.g., in cluster mode, though the current setup is simpler).

This completes the guide for deploying your Seera POS application to an Ubuntu server!

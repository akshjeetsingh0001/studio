
module.exports = {
  apps: [
    {
      name: 'seera-pos-app', // Application name that will be shown in PM2
      script: 'yarn',         // Command to execute (yarn, npm, node, etc.)
      args: 'start',          // Arguments to pass to the script (e.g., 'start' for 'yarn start')
      interpreter: 'bash',    // Optional: if script is a shell command or needs specific interpreter
      // cwd: '/var/www/seera-pos-app', // Optional: set current working directory
      instances: 1,           // Number of instances to launch (use 'max' for CPU core count)
      autorestart: true,      // Restart an app if it crashes
      watch: false,           // Watch for file changes and restart (not recommended for production builds)
      max_memory_restart: '1G', // Restart app if it exceeds this memory
      env: {
        NODE_ENV: 'development', // Default environment
      },
      env_production: {         // Environment variables for 'pm2 start ecosystem.config.js --env production'
        NODE_ENV: 'production',
        PORT: 3000, // Ensure this matches the port Nginx proxies to and your .env.production.local
        // You can define other production-specific env vars here,
        // but it's often better to manage sensitive keys in a .env.production.local file
        // which is loaded by Next.js, or directly in the server's environment.
        // Example:
        // AI_PROVIDER_API_KEY: "your_production_ai_key_if_not_in_dotenv",
        // GOOGLE_SHEET_ID: "your_production_sheet_id_if_not_in_dotenv",
      },
      // Log file paths
      // output: './logs/out.log',
      // error: './logs/error.log',
      // log_date_format: 'YYYY-MM-DD HH:mm Z', // Date format for logs
    },
  ],

  // Optional: Deploy configuration (if using PM2's deployment features)
  // deploy: {
  //   production: {
  //     user: 'your_ssh_user',
  //     host: 'your_server_ip',
  //     ref: 'origin/main', // Git branch
  //     repo: 'your_git_repository_url',
  //     path: '/var/www/seera-pos-app-deploy', // Deployment path on server
  //     'post-deploy': 'yarn install && yarn build && pm2 reload ecosystem.config.js --env production',
  //   },
  // },
};

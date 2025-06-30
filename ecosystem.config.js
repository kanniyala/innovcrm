module.exports = {
  apps: [
    {
      name: 'innovcrm',
      script: 'npm',
      args: 'run start -- -p 4000', // Specify the port here
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000 // Make sure this matches the port in args
      }
    }
  ]
}

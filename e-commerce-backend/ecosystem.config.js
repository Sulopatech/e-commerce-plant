module.exports = {
    apps: [{
      name: 'ecom_plant_backend',
      script: 'npm',
      args: 'run start',
      instances: 1,
      autorestart: true,
      watch: true,
      exec_mode: "fork",
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }]
  };

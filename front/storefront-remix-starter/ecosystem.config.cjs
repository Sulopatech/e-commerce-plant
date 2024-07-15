module.exports = {
  apps: [{
    name: "ecom plant storefront",
    script: 'npm',
    args: 'run start',
    watch : true,
    autorestart: true,
    env: {
      NODE_ENV: "development",
      PORT: 5500,
      REMIX_DEV_ORIGIN: "http://localhost:5500"
    },
    instances: "1",
    exec_mode: "fork"
  }]
};

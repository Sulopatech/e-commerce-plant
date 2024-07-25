module.exports = {
  apps: [{
    name: "ecom_plant_storefront",
    script: 'npm',
    args: 'run start',
    watch : true,
    autorestart: true,
    env: {
      NODE_ENV: "production",
      PORT: 5600,
      REMIX_DEV_ORIGIN: "http://api-plant.sulopa.com",
      VENDURE_API_URL: "http://api-plant.sulopa.com/shop-api"
    },
    instances: "1",
    exec_mode: "fork"
  }]
};

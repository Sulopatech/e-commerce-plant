module.exports = {
    apps: [{
      name: "ecom plant storefront",
      script: "build/index.js",
      env: {
        NODE_ENV: "production",
        PORT: 5500
      },
      instances: "max",
      exec_mode: "cluster"
    }]
  };
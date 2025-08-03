module.exports = {
  apps: [
    {
        name: "mysticalstory API",
        script: "./app.js",
        env: {
            NODE_ENV: "production",
            PORT: 1001
        }
    }
  ]
};

module.exports = {
  apps: [
    {
      script: 'dist',
      watch: '.',
    },
  ],

  deploy: {
    production: {
      user: 'evurgaxq',
      host: '146.88.238.251',
      ref: 'origin/main',
      repo: 'git@github.com:tphilippini/nbapp_api.git',
      path: '/home/evurgaxq/nbapp_api',
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production && pm2 save',
    },
  },
};

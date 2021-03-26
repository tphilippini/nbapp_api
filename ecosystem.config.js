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
        'source /home/evurgaxq/nodevenv/nbapp_api/12/bin/activate && npm install && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',
    },
  },
};

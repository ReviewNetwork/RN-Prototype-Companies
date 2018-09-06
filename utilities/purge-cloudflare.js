require('dotenv').config();
const request = require('request');

request({
  url: `https://api.cloudflare.com/client/v4/zones/${process.env.ZONE}/purge_cache`,
  method: 'DELETE',
  headers: {
    'X-AUTH-EMAIL': process.env.EMAIL,
    'X-Auth-Key': process.env.TOKEN,
    'Content-Type': 'application/json',
  },
  body: {
    purge_everything: true,
  },
  json: true,
}, (err) => {
  if (err) {
    throw err;
  }

  console.log('CloudFlare cache purge successfull');
});

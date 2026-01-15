// netlify/functions/check-ssls.js
const https = require('https');

const hosts = [
  "www.goodx.healthcare",
  "goodx.co.za",
  "goodx.co.nz",
  "goodxnamibia.com",
  "goodx.co.bw",
  "goodx.co.uk",
  "goodx.us",
  "goodx.international",
  "goodxeye.com"
];

async function getCertExpiry(host) {
  return new Promise((resolve) => {
    const req = https.request({ host, port: 443, method: 'HEAD' }, (res) => {
      const cert = res.socket.getPeerCertificate();
      if (!cert || !cert.valid_to) {
        resolve({ host, validTo: "Error", daysLeft: null });
        return;
      }
      const expiry = new Date(cert.valid_to);
      const now = new Date();
      const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
      resolve({
        host,
        validTo: expiry.toISOString().split('T')[0], // YYYY-MM-DD
        daysLeft
      });
    });

    req.on('error', () => resolve({ host, validTo: "Error", daysLeft: null }));
    req.end();
  });
}

exports.handler = async (event, context) => {
  try {
    const results = await Promise.all(hosts.map(getCertExpiry));
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(results)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};

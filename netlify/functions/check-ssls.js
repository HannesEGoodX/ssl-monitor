

const sslChecker = require('ssl-checker');

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

exports.handler = async () => {
  const results = [];

  for (const host of hosts) {
    try {
      const data = await sslChecker(host, { method: 'GET' });  // Force GET for full handshake
      console.log(`Raw data for ${host}:`, data);  // Logs to Netlify function logs

      let expiryDate;
      if (data.valid_to && typeof data.valid_to === 'string') {
        expiryDate = new Date(data.valid_to);
      } else {
        expiryDate = new Date(data.validTo || data.expires || '');  // fallback fields
      }

      let daysLeft = null;
      if (!isNaN(expiryDate.getTime())) {
        daysLeft = Math.floor((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
      }

      results.push({
        host,
        validTo: expiryDate.toISOString ? expiryDate.toISOString().split('T')[0] : "Invalid date",
        daysLeft: daysLeft !== null ? (daysLeft >= 0 ? daysLeft : 'Expired') : null
      });
    } catch (err) {
      console.error(`Error for ${host}:`, err.message);
      results.push({
        host,
        validTo: `Error: ${err.message || 'Unknown'}`,
        daysLeft: null
      });
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results)
  };
};

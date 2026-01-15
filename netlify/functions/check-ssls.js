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

exports.handler = async (event, context) => {
  console.log('Function invoked at', new Date().toISOString());

  const results = [];

  for (const host of hosts) {
    try {
      const data = await sslChecker(host, { port: 443, method: 'GET' }); // GET helps ensure full handshake
      const expiry = new Date(data.valid_to);
      const now = new Date();
      const daysLeft = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));

      results.push({
        host,
        validTo: expiry.toISOString().split('T')[0],
        daysLeft: daysLeft >= 0 ? daysLeft : 'Expired'
      });

      console.log(`Success for ${host}: ${data.valid_to}`);
    } catch (err) {
      console.error(`Error for ${host}:`, err.message);
      results.push({
        host,
        validTo: "Error: " + (err.message || 'Unknown'),
        daysLeft: null
      });
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600"
    },
    body: JSON.stringify(results)
  };
};

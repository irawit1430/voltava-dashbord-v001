import https from 'https';

function test(headers) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'voltava-dashboard.onrender.com',
      path: '/assets/index-CeCK02_d.js',
      method: 'GET',
      headers: headers
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data
        });
      });
    });
    req.on('error', err => resolve({ error: err.message }));
    req.end();
  });
}

async function run() {
  const res = await test({
    'Origin': 'https://voltava-dashboard.onrender.com'
  });
  console.log('Status:', res.statusCode);
  console.log('Body:', res.body);
}

run();

const http = require('http');
const data = JSON.stringify({
  question: 'Teste de API',
  marketSnapshot: { cdi: 13.25, selic: 13.25, ipca: 3.81, ibov: 192201.16, ifix: 3890.63 }
});
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/ask-tutor',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};
const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', JSON.stringify(res.headers));
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('BODY:', body);
  });
});
req.on('error', (err) => {
  console.error('ERROR', err);
});
req.write(data);
req.end();

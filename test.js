// test.js
const express = require('express');
const app = express();
const PORT = 300;

app.get('/ping', (req, res) => {
  console.log('✅ Route worked!');
  res.send('PONG');
});

app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}/ping`);
});
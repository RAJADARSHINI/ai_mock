const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║  ✅ FRONTEND SERVER RUNNING                ║
  ║  🌐 http://localhost:${PORT}             ║
  ║  📂 Serving from: ${__dirname}    ║
  ║  📄 Login: http://localhost:${PORT}/login.html ║
  ║  📚 Dashboard: http://localhost:${PORT}/dashboard.html ║
  ╚════════════════════════════════════════════╝
  `);
});

const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');
require('dotenv').config();
const cors = require('cors');
const crypto = require('crypto');
const session = require('express-session');
const port = process.env.PORT || 3000;

const { checkNIM, login, getLoginHistory, logout, logoutTableHistoryUser, logoutAllDevices  } = require('./controllers/loginController');
const { generateQR, verifyQR } = require('./controllers/qrController');
const { authenticateToken, authenticateTokenWithSession } = require('./controllers/secure');


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
// app.use((req, res, next) => {
//   console.log('Incoming request:', req.method, req.url, req.body);
//   next();
// });
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true jika HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Define the path to the SSL certificate files (use absolute paths based on your system)
// const options = {
//     key: fs.readFileSync(path.join('C:', 'laragon', 'etc', 'ssl', 'laragon.key')),  // Private Key
//     cert: fs.readFileSync(path.join('C:', 'laragon', 'etc', 'ssl', 'laragon.crt')),  // Certificate
//     ca: fs.readFileSync(path.join('C:', 'laragon', 'etc', 'ssl', 'cacert.pem'))      // CA Certificate (optional)
// };



// const hashed = await bcrypt.hash(passwordBaru, 10);
// await db.promise().query('UPDATE mahasiswa SET password = ? WHERE id_mahasiswa = ?', [hashed, nim]);
// Serve static files from the '../public' folder


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'login.html'));
});

// Serve the test.csv file
// app.get('/test.csv', (req, res) => {
//     res.sendFile(path.join(__dirname, 'test.csv'));
// });

app.get('/testui', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'uiFix.html'));
});


/// Api ///
app.post('/checkNIM', checkNIM);
app.post('/login-egbhm', login);
app.get('/api/logs/:nim', getLoginHistory);
app.get('/generate-qr', authenticateTokenWithSession, generateQR );
app.post('/verify-qr', authenticateTokenWithSession, verifyQR);
app.post('/logout-egbhm', logout, authenticateTokenWithSession, (req, res) => {
  res.status(200).json({ message: 'User logged out' });
});
app.post('/logout-by-id', logoutTableHistoryUser, (req, res, next) => {
  res.status(200).json({ message: 'User on history has a logged out' });
});
app.get('/check-session', authenticateTokenWithSession, (req, res) => {
  res.status(200).json({ message: 'Session active' });
});
app.post('/logout-all-devices', authenticateTokenWithSession, logoutAllDevices);




// Start server normally (for local testing or Vercel)
app.listen(port, () => {
    console.log(`Server running on https://localhost:${port}`);
});

// Start the HTTPS server
// https.createServer(options, app, port).listen(port, () => {
// console.log(`Server running on https://localhost:${port}`);
// });


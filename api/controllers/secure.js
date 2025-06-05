const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('./databaseController');
const secretKey = process.env.JWT_SECRET || 'secret';
const crypto = require('crypto');

// Konfigurasi session


const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex') || 'supersecret';

// Middleware: Autentikasi biasa
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak tersedia' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid' });
    req.user = user;
    next();
  });
}

function verifyToken(req, res, next) {
  const bearer = req.headers['authorization'];
  if (!bearer || !bearer.startsWith('Bearer ')) return res.status(401).json({ message: 'Token tidak tersedia' });

  const token = bearer.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // ✅ konsisten


// mapping manual agar qrController dapat id dengan req.user.id
req.user = {
  id: decoded.id_mahasiswa,
  nama: decoded.nama
};

    
    // console.log('[DEBUG] Decoded token:', decoded);

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token tidak valid' });
  }
}

async function authenticateTokenWithSession(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  const tokenSignature = token?.split('.')[2];

  if (!token || !tokenSignature) {
    return res.status(401).json({ message: 'Token tidak tersedia' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // <- ini perlu
    req.user = { id: decoded.id }; // <- penting, agar tersedia di controller
// console.log('[DEBUG] Decoded token:', decoded);
    const tokenSignature = token.split('.')[2];
    const result = await db.query('SELECT is_active FROM user_logs WHERE id = $1 LIMIT 1', [tokenSignature]);
    
    
    if (result.rows.length === 0 || result.rows[0].is_active === false) {
      return res.status(401).json({ message: 'Sesi telah berakhir, silakan login kembali.' });
    }

    next();
  } catch (err) {
    console.error('Token error:', err);
    return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa.' });
  }
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  authenticateToken,
  authenticateTokenWithSession,
  verifyToken
};
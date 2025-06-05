const jwt = require('jsonwebtoken');
const db = require('./databaseController');
const { JWT_SECRET } = require('./secure');



async function generateQR(req, res) {
  const userId = req.user.id;
  
  if (!userId) return res.status(401).json({ message: 'User tidak dikenali.' });
console.log('[DEBUG] Decoded token:', userId);
  try {
    // Cek apakah ada QR yang belum digunakan dan masih aktif
      const existingResult = await db.query(`
      SELECT * FROM qr_session 
      WHERE user_id = $1 AND expired_at > NOW() AND used = false AND is_active = true
      LIMIT 1
    `, [userId]);

    const existingQR = existingResult.rows[0];

    // Jika ada QR aktif dan belum digunakan
if (existingQR) {
  return res.status(200).json({ 
    qr: existingQR.id_qr,
    status: 'existing',
    used: existingQR.used,
    is_active: existingQR.is_active
  });
}


    // Generate token QR baru
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // sekarang + 5 menit
    const payload = { user_id: userId, timestamp: Date.now() };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    // Simpan token ke database
    await db.query(
      `INSERT INTO qr_session (id_qr, user_id, expired_at, is_active, used)
       VALUES ($1, $2, $3, $4, $5)`,
      [token, userId, expiredAt, true, false]
    );

    return res.status(201).json({ qr: token, status: 'new' });
  } catch (err) {
    console.error('QR Generation Error:', err);
    return res.status(500).json({ message: 'Gagal membuat atau mengambil QR' });
  }
}


// Generate QR Token untuk satu sesi saja
// async function generateQR2(req, res) {
//   const user = req.user;

//   // Generate JWT token
//   const qrToken = jwt.sign(
//     { id: user.id, nama: user.nama, timestamp: Date.now() },
//     JWT_SECRET,
//     { expiresIn: '5m' } // berlaku 5 menit
//   );

//   const id_qr = qrToken.split('.')[2]; // gunakan signature sebagai id unik
//   const created_at = new Date();
//   const expired_at = new Date(created_at.getTime() + 5 * 60000); // 5 menit dari sekarang

//   try {
//     // Cek apakah sudah ada QR aktif untuk user ini
//     const existing = await db.query('SELECT * FROM qr_session WHERE user_id = $1 AND expired_at > NOW()', [user.id]);
//     if (existing.rows.length > 0) {
//       return res.status(400).json({ message: 'QR masih aktif, tunggu sampai kadaluarsa.' });
//     }

//     // Simpan ke database
//     await db.query(`
//       INSERT INTO qr_session (id_qr, user_id, created_at, expired_at)
//       VALUES ($1, $2, $3, $4)
//     `, [id_qr, user.id, created_at, expired_at]);

//     res.json({ token: qrToken });
//   } catch (error) {
//     console.error('Error generating QR:', error);
//     res.status(500).json({ message: 'Gagal menghasilkan QR.' });
//   }
// }

// Verifikasi QR dari token
const verifyQR = async (req, res) => {
  try {
    const token = req.body.qr;
    // const loginUserId = req.user.id; // dari token login
  


    if (!token) {
      return res.status(400).json({ message: 'Token QR tidak ditemukan dalam permintaan.' });
    }

  
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ message: 'QR tidak valid atau sudah kadaluarsa.' });
    }

    const userIdFromQR = decoded.user_id;
   if (!userIdFromQR) {
  return res.status(400).json({ message: 'Token QR tidak valid, user_id tidak ditemukan.' });
}

const result = await db.query(
  'SELECT * FROM qr_session WHERE id_qr = $1 AND user_id = $2',
  [token, userIdFromQR]
);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'QR tidak valid atau tidak ditemukan.' });
    }

    const qr = result.rows[0];
    const now = new Date();

    if (qr.expired_at && new Date(qr.expired_at) < now) {
      return res.status(400).json({ message: 'QR sudah kadaluarsa.' });
    }

    if (qr.used === true) {
      return res.status(400).json({ message: 'QR sudah pernah digunakan.' });
    }

    // Update status QR sebagai sudah digunakan
    await db.query(
      `UPDATE qr_session SET used = TRUE, is_active = FALSE WHERE id_qr = $1`,
      [token]
    );

    return res.status(200).json({ message: 'QR berhasil diverifikasi dan telah ditandai sebagai digunakan.', data: qr });

  } catch (err) {
    console.error("Verifikasi QR Error:", err);
    return res.status(500).json({ message: 'Gagal verifikasi QR' });
  }
};




module.exports = {
  generateQR,
  verifyQR
};

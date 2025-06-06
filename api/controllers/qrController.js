const jwt = require('jsonwebtoken');
const db = require('./databaseController');
const { JWT_SECRET } = require('./secure');



async function generateQR(req, res) {
  const userId = req.user.id;
  if (!userId) return res.status(401).json({ message: 'User tidak dikenali.' });

  try {
    // Ambil QR terakhir milik user
    const existingResult = await db.query(`
      SELECT *, created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' AS created_local,
                expired_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' AS expired_local
      FROM qr_session
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [userId]);

    const existingQR = existingResult.rows[0];

    // Cek QR masih aktif & belum digunakan
    if (existingQR) {
      const now = new Date();
      const expired = new Date(existingQR.expired_at);
      if (expired > now && existingQR.is_active) {
        return res.status(200).json({
          qr: existingQR.id_qr,
          status: 'existing',
          created_at: existingQR.created_local,
          expired_at: existingQR.expired_local,
          is_active: existingQR.is_active
        });
      }
    }

    // Generate QR baru
    const now = new Date();
    const expiredAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 menit dari sekarang
    const payload = { user_id: userId, timestamp: now.getTime() };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    // Insert QR baru
    const insertResult = await db.query(
      `INSERT INTO qr_session (id_qr, user_id, expired_at, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING id_qr, created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' AS created_local,
                 expired_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Jakarta' AS expired_local`,
      [token, userId, expiredAt, true]
    );

    const newQR = insertResult.rows[0];

    return res.status(201).json({
      qr: token,
      status: 'new',
      created_at: newQR.created_local,
      expired_at: newQR.expired_local
    });
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

   if (qr.is_active === false) {
  return res.status(400).json({ message: 'QR sudah tidak aktif / sudah digunakan.' });
}

    // Update status QR sebagai sudah digunakan
  await db.query(`
  UPDATE qr_session 
  SET is_active = FALSE 
  WHERE id_qr = $1
`, [token]);
    const userId = decoded.user_id;
      // Ambil data mahasiswa berdasarkan user_id
    const mahasiswaSearch = await db.query(`
      SELECT id_mahasiswa, nama, jurusan
      FROM mahasiswa
      WHERE id_mahasiswa = $1
    `, [userId]);
    
    await db.query(`
  INSERT INTO scan_logs (qr_id, scanner_id, scanned_at)
  VALUES ($1, $2, NOW())
`, [token, userId]); // req.user.id adalah yang scan

    const rows = mahasiswaSearch.rows; // ini array of rows
    
    const mahasiswa = rows[0]; // Ambil data pertama
if (!mahasiswa) {
  return res.status(404).json({ message: 'Mahasiswa tidak ditemukan' });
}
    return res.status(200).json({ 
    message: 'QR berhasil diverifikasi dan telah ditandai sebagai digunakan.', 
    data: qr,
         user_id: userIdFromQR,
      nama: mahasiswa.nama,
      jurusan: mahasiswa.jurusan
    });

  } catch (err) {
    console.error("Verifikasi QR Error:", err);
    return res.status(500).json({ message: 'Gagal verifikasi QR' });
  }
};




const getQRScannedBy = async (req, res) => {
  const idQR = req.body.id_qr;

  const result = await db.query(`
    SELECT m.id_mahasiswa, m.nama, m.jurusan 
    FROM scan_logs s
    JOIN mahasiswa m ON s.scanner_id = m.id_mahasiswa
    WHERE s.qr_id = $1
    ORDER BY s.scanned_at DESC
    LIMIT 1
  `, [idQR]);

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Belum ada yang scan' });
  }

  res.json({ user: result.rows[0] });
};



module.exports = {
  generateQR,
  verifyQR,
  getQRScannedBy
};

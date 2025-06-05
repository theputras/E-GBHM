const bcrypt = require('bcrypt');
const db = require('./databaseController');
const { JWT_SECRET } = require('./secure');
const jwt = require('jsonwebtoken');

async function checkNIM(req, res) {
  const { nim } = req.body;

  try {
    const result = await db.query('SELECT password FROM mahasiswa WHERE id_mahasiswa = $1', [nim]);
    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(404).json({ status: 'not_found', message: 'NIM tidak ditemukan' });
    }

    const { password } = rows[0];
    if (!password || password.trim() === '') {
      return res.status(200).json({ status: 'no_password', message: 'Password belum dibuat' });
    }

    return res.status(200).json({ status: 'has_password', message: 'NIM ditemukan dan password tersedia' });

  } catch (err) {
    console.error('Check NIM error:', err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
}

async function login(req, res) {
  const { nim, password } = req.body;

  try {
    const result = await db.query('SELECT * FROM mahasiswa WHERE id_mahasiswa = $1', [nim]);
    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'NIM tidak ditemukan' });
    }

    const mahasiswa = rows[0];

    if (!mahasiswa.password || mahasiswa.password.trim() === '') {
      return res.status(403).json({ status: 'no_password', message: 'Mahasiswa belum memiliki password' });
    }

    const match = await bcrypt.compare(password, mahasiswa.password);
    if (!match) {
      return res.status(401).json({ status: 'error', message: 'Password salah' });
    }

    const token = jwt.sign({
      id: mahasiswa.id_mahasiswa,
      nama: mahasiswa.nama,
      jurusan: mahasiswa.jurusan,
    }, JWT_SECRET, { expiresIn: '24h' });

    const ip = req.Address || req.ip || req.connection.remoteAddress;
    const device = req.get('User-Agent');
    req.session.mahasiswa = {
      id: mahasiswa.id_mahasiswa,
      name: mahasiswa.nama,
      jurusan: mahasiswa.jurusan
    };
    const session_id = req.sessionID;
    const signature = token.split('.')[2];

    await db.query(`
      INSERT INTO user_logs (id, session_id, user_id, ip_address, device_info)
      VALUES ($1, $2, $3, $4, $5)
    `, [signature, session_id, mahasiswa.id_mahasiswa, ip, device]);

    console.log(`[DEBUG] Token berhasil dibuat untuk ${nim}: ${token}`);

    return res.status(200).json({
      status: 'success',
      token,
      mahasiswa: {
        id: mahasiswa.id_mahasiswa,
        nama: mahasiswa.nama,
        jurusan: mahasiswa.jurusan
      }
    });

  } catch (err) {
    console.error('Login mahasiswa error:', err);
    return res.status(500).json({ status: 'error', message: 'Kesalahan server' });
  }
}


//Mengambil data histori login

async function getLoginHistory(req, res) {
  const { nim } = req.params;

  try {
    const result = await db.query(`
      SELECT id, login_time, logout_time, ip_address, device_info, is_active
      FROM user_logs
      WHERE user_id = $1
      ORDER BY login_time DESC
    `, [nim]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Gagal mengambil riwayat login:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
}

// Logout function
async function logout(req, res, next) {
  const fulltoken = req.headers['authorization']?.split(' ')[1];
const signature = fulltoken?.split('.')[2];

if (!signature) return res.status(401).json({ message: 'Token tidak tersedia' });
console.log('STEP 1: Token parsed');
try {
  jwt.verify(fulltoken, JWT_SECRET); // Verifikasi token lengkap
  
  console.log('STEP 2: JWT verified');
  await db.query(`UPDATE user_logs SET is_active = FALSE, logout_time = NOW() WHERE id = $1`,
    [signature],
    (err) => {
      if (err) return res.status(500).json({ message: 'Gagal logout.' });
      return res.json({ message: 'Logout berhasil.' });
    }
  );
  console.log('STEP 3: DB query done');
   next();
} catch (err) {
  return res.status(403).json({ message: 'Token tidak valid' });
}

}



// Logout user by ID from history

async function logoutTableHistoryUser(req, res, next) {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID log tidak tersedia' });
  }

  try {
    const result = await db.query(`
      UPDATE user_logs
      SET is_active = FALSE, logout_time = NOW()
      WHERE id = $1 AND is_active = TRUE
    `, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Sesi tidak ditemukan atau sudah logout.' });
    }

    return res.json({ message: 'Logout berhasil.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ message: 'Gagal logout.' });
  }
}


// Logout all devices for the user

async function logoutAllDevices(req, res) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token tidak tersedia' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const result = await db.query(`
      UPDATE user_logs
      SET is_active = FALSE, logout_time = NOW()
      WHERE user_id = $1 AND is_active = TRUE
    `, [userId]);

    return res.json({ message: `Berhasil logout dari ${result.rowCount} perangkat aktif.` });
  } catch (err) {
    console.error('Logout all devices error:', err);
    return res.status(403).json({ message: 'Token tidak valid' });
  }
}


module.exports = {
  checkNIM,
  login,
  getLoginHistory,
  logout,
  logoutTableHistoryUser,
  logoutAllDevices 
};

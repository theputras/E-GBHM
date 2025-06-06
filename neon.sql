
CREATE TABLE mahasiswa (
    id_mahasiswa VARCHAR(15) PRIMARY KEY,  -- id_mahasiswa = nim
    nama VARCHAR(100) NOT NULL,
    jurusan VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE mahasiswa
ADD COLUMN password VARCHAR(255) NOT NULL AFTER jurusan;

DROP TABLE mahasiswa;

CREATE TABLE user_log (
    id_log SERIAL PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL REFERENCES mahasiswa(id_mahasiswa),
    activity VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tabel user_logs (utama yang dipakai aplikasi)
CREATE TABLE user_logs (
    id VARCHAR(255) PRIMARY KEY,       -- simpan signature JWT di sini
    session_id VARCHAR(128) NOT NULL,  -- dari express-session
    user_id VARCHAR(15) NOT NULL REFERENCES mahasiswa(id_mahasiswa),
    ip_address VARCHAR(45),
    device_info TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    token TEXT  -- opsional, jika mau simpan token lengkap
);


CREATE TABLE qr_session (
    id_qr TEXT PRIMARY KEY,                    -- isi JWT, unik per sesi
    user_id VARCHAR(15) REFERENCES mahasiswa(id_mahasiswa) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at TIMESTAMP NOT NULL,             -- waktu berakhir validitas QR
    is_active BOOLEAN DEFAULT TRUE,
    used BOOLEAN DEFAULT FALSE,-- apakah token ini masih bisa dipakai
);

CREATE TABLE scan_logs (
  id SERIAL PRIMARY KEY,
  qr_id TEXT,
  scanner_id TEXT,
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE qr_session
ADD COLUMN used BOOLEAN DEFAULT FALSE;

user_logs
ALTER TABLE user_logs ADD COLUMN token TEXT;
ALTER TABLE user_logs ADD COLUMN session_id VARCHAR(128) NOT NULL;



SELECT login_time FROM user_logs 
       WHERE user_id = 23410100003 
       ORDER BY login_time DESC;
CREATE TABLE mahasiswa (
    id_mahasiswa VARCHAR(15) PRIMARY KEY,  -- id_mahasiswa = nim
    nama VARCHAR(100) NOT NULL,
    jurusan VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
ALTER TABLE mahasiswa
ADD COLUMN password VARCHAR(255) NOT NULL AFTER jurusan;

DROP TABLE mahasiswa;

CREATE TABLE user_log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,  -- user_id merujuk ke id_mahasiswa (NIM)
    activity VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES mahasiswa(id_mahasiswa)
);

CREATE TABLE user_logs (
    id VARCHAR(255) PRIMARY KEY,       -- simpan JWT di sini
    session_id VARCHAR(128) NOT NULL,  -- dari express-session
    user_id VARCHAR(15) NOT NULL,
    ip_address VARCHAR(45),
    device_info TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES mahasiswa(id_mahasiswa)
);
user_logs
ALTER TABLE user_logs ADD COLUMN token TEXT;
ALTER TABLE user_logs ADD COLUMN session_id VARCHAR(128) NOT NULL;



SELECT login_time FROM user_logs 
       WHERE user_id = 23410100003 
       ORDER BY login_time DESC;
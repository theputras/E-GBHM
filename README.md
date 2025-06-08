# E-GBHM

Sistem verifikasi QR berbasis Node.js + PostgreSQL dengan fitur autentikasi, pemindaian QR, pelacakan log, dan tampilan real-time.

---

## 🧩 Apa Itu GBHM (Games, Bonding, and Healing Moment)?
GBHM adalah salah satu rangkaian kegiatan non-formal dalam ospek (orientasi mahasiswa) yang dirancang untuk menciptakan suasana akrab, menyenangkan, dan suportif antara mahasiswa baru, panitia, dan kakak tingkat. Dalam GBHM, peserta diajak untuk bermain bersama, melakukan aktivitas yang membangun kerja sama, saling mengenal lebih dalam, dan berbagi cerita secara emosional.

- Tujuan utama GBHM bukan hanya untuk bersenang-senang, tetapi juga untuk:

- Menghilangkan ketegangan setelah aktivitas ospek yang padat.

- Membangun koneksi emosional antar peserta dan panitia.

- Menumbuhkan rasa percaya dan empati dalam kelompok.

- Menjadikan ospek lebih bermakna dan berkesan.

---

## 🚀 Fitur Utama

- Login berbasis JWT
- Generate dan verifikasi QR code
- Pencatatan pemindaian ke dalam tabel `scan_logs`
- Pembaruan otomatis QR di halaman scan
- Otentikasi dan sesi multi-device
- Konfigurasi HTTPS lokal
- Deploy mudah ke Vercel (production & development)

---

## 🛠 Instalasi

1. Clone repo ini:
   ```bash
   git clone https://github.com/username/E-GBHM.git
   cd E-GBHM


2. Install semua module:

   ```bash
   npm install
   ```

3. Buat file `.env` dan isikan:

   ```bash
   JWT_SECRET=your_jwt_secret
   PGHOST=your_db_host
   PGUSER=your_db_user
   PGPASSWORD=your_db_password
   PGDATABASE=your_db_name
   PGPORT=5432
   ```



## 🔐 Menjalankan HTTPS secara lokal

Untuk keperluan testing lokal menggunakan `https`, kamu bisa:

### Opsi 1: Generate SSL Manual dengan OpenSSL

* Download OpenSSL (Windows):
  [https://sourceforge.net/projects/openssl/](https://sourceforge.net/projects/openssl/)

* Jalankan perintah:

  ```bash
  openssl genrsa -out key.pem
  openssl req -new -key key.pem -out csr.pem
  openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out cert.pem
  ```

* Letakkan `key.pem` dan `cert.pem` di root folder proyek.

### Opsi 2: Gunakan Laragon (Windows)

* Aktifkan fitur SSL di `laragon`
* Pastikan port HTTPS adalah 443 atau 3001 (ubah di index.js bila perlu)

---

### ⚙️ Konfigurasi `index.js` untuk HTTPS lokal:

```js
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3000, () => {
  console.log('Server HTTPS running on port 3000');
});
```

> ⚠️ *Jika ingin deploy ke Vercel, **comment kode HTTPS** di atas dengan `Ctrl + /`.*

---

## ☁️ Deploy ke Vercel

### 1. Login ke Vercel via CLI

```bash
vercel login
```

### 2. Deploy ke Production

```bash
vercel --prod
```

### 3. Deploy ke Development

```bash
vercel
```
## 📦 Dependencies

| Module          | Fungsi Utama                            |
| --------------- | --------------------------------------- |
| `express`       | Web framework backend utama             |
| `pg`            | Koneksi dan query ke PostgreSQL         |
| `jsonwebtoken`  | Pembuatan & validasi JWT token          |
| `dotenv`        | Mengatur konfigurasi environment (.env) |
| `cors`          | Izin akses lintas domain (CORS policy)  |
| `helmet`        | Proteksi header HTTP                    |
| `morgan`        | Logging HTTP request di console         |
| `cookie-parser` | Baca cookie dari browser                |
| `sweetalert2`   | Alert yang sudah jadi                   |
| `qrcode`        | Membuat QR code berbasis data teks      |
| `fs`, `https`   | Setup server HTTPS lokal                |


---

## 🧾 Struktur Direktori Penting

```
├── index.js               # Entry point Express
├── secure.js              # Middleware otentikasi
├── loginController.js     # Login & logout device
├── qrController.js        # Logika QR code
├── databaseController.js  # Koneksi ke PostgreSQL
├── public/                # File HTML, JS, CSS frontend
├── .env                   # File environment (diabaikan git)
```

---
### 🛡️ Keamanan

- Token QR hanya berlaku 1x dan memiliki masa berlaku (expired_at).

- QR ditandai used = true dan is_active = false setelah berhasil diverifikasi.

- Hanya akun yang sedang login yang bisa memverifikasi QR (via bearer token).

---

## 📦 Database

Gunakan PostgreSQL. dengan Struktur utama:

### Tabel `mahasiswa`

* `id_mahasiswa` (VARCHAR) – PRIMARY KEY
* `nama`, `jurusan`

### Tabel `qr_session`

* `id_qr` (TEXT) – PRIMARY KEY
* `user_id` (FK ke mahasiswa)
* `created_at`, `expired_at`
* `is_active` (BOOLEAN)

### Tabel `scan_logs`

* `id` SERIAL PRIMARY KEY
* `qr_id`, `scanner_id`, `scanned_at`

---

## 📝 Catatan Tambahan

* QR akan otomatis refresh di halaman scanner setiap 3 detik jika masih aktif.
* Jika QR sudah pernah digunakan atau expired, sistem akan generate ulang secara otomatis.
* Fungsi `logoutAllDevices` dapat diuji lewat Postman dengan endpoint:

  ```
  POST /logout-all-devices
  Authorization: Bearer <your_token>
  ```

---

## 👨‍💻 Kontributor

Made with ❤️ by tim E-GBHM THE PUTRAS.
Pull request dan laporan bug sangat diterima. Silakan fork dan submit ide atau perbaikanmu!


---

Kalau ada bagian tambahan seperti demo link, kontak developer, atau dokumentasi API yang ingin ditambahkan, tinggal bilang aja!
```
Link Demo
https://e-gbhm.theputras.my.id/login

Testing Account
user: 205090100087
pass: 665544
```


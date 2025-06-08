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

## 📚 Daftar Isi

- [🧩 Apa Itu GBHM?](#-apa-itu-gbhm-games-bonding-and-healing-moment)
- [🚀 Fitur Utama](#-fitur-utama)
- [🛠 Instalasi](#-instalasi)
- [🔐 Menjalankan HTTPS secara lokal](#-menjalankan-https-secara-lokal)
- [☁️ Deploy ke Vercel](#️-deploy-ke-vercel)
- [📦 Dependencies](#-dependencies)
- [🧾 Struktur Direktori Penting](#-struktur-direktori-penting)
- [🛡️ Keamanan](#️-keamanan)
- [🧭 Navigasi Aplikasi](#-navigasi-aplikasi)
- [📱 Fitur Frontend](#-fitur-frontend)
- [⚙️ Struktur Database Utama](#️-struktur-database-utama)
- [📫 Testing Menggunakan Postman](#-testing-menggunakan-postman)
- [📝 Catatan Tambahan](#-catatan-tambahan)
- [🧪 Testing UI](#-testing-ui)
- [👨‍💻 Kontributor](#-kontributor)
- [🌐 Link Demo](#link-demo)
- [🔑 Testing Account](#testing-account)

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

> ⚠️ *Jika ingin deploy ke Vercel, **comment kode HTTPS & OPTIONS** di atas dengan `Ctrl + /`.*


dah
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

## 🧭 Navigasi Aplikasi

Aplikasi terdiri dari dua antarmuka utama:

* **Login Page (`/login`)**

  * Validasi NIM
  * Cek apakah password sudah dibuat
  * Form login dengan toggle password
  * Deteksi browser (hanya Chrome, Firefox, Safari yang didukung)

* **Dashboard Page (`/`)**

  * Tampilkan salam pengguna
  * Navigasi bawah: Home, Scan QR, Show QR, Profile
  * Mode mobile responsif
  * Deteksi ukuran layar dan orientasi
  * Mode loading dan transisi antar halaman

---

## 📱 Fitur Frontend

| Fitur                    | Deskripsi                                                              |
| ------------------------ | ---------------------------------------------------------------------- |
| 🔐 Autentikasi Token     | Token login disimpan di `localStorage`, digunakan untuk semua endpoint |
| 📸 Pemindaian QR Code    | Menggunakan kamera belakang untuk scan QR dengan `jsQR`                |
| 📄 Menampilkan QR        | Menampilkan QR user aktif selama belum expired                         |
| 👤 Profil                | Menampilkan data pengguna dan histori login                            |
| 📜 Riwayat Login         | Ditandai session aktif (current), ditampilkan dalam table              |
| ❌ Logout Semua Perangkat | Logout semua sesi aktif kecuali yang sekarang                          |
| 🌐 Validasi Browser      | Akses dibatasi hanya ke Chrome, Firefox, atau Safari (untuk keamanan dan stabilitas aplikasi)  |

---

## ⚙️ Struktur Database Utama

Gunakan PostgreSQL dengan tabel berikut:

### `mahasiswa`

| Kolom         | Tipe    | Keterangan           |
| ------------- | ------- | -------------------- |
| id\_mahasiswa | VARCHAR | Primary key          |
| nama          | TEXT    | Nama lengkap         |
| jurusan       | TEXT    | Jurusan mahasiswa    |
| password      | TEXT    | Password terenkripsi |

### `user_logs`

| Kolom        | Tipe      | Keterangan                 |
| ------------ | --------- | -------------------------- |
| id           | TEXT      | Token signature (ID unik)  |
| session\_id  | TEXT      | Session ID dari Express    |
| user\_id     | VARCHAR   | Foreign key ke `mahasiswa` |
| login\_time  | TIMESTAMP | Waktu login                |
| logout\_time | TIMESTAMP | Waktu logout               |
| is\_active   | BOOLEAN   | Status aktif/tidak         |

### `qr_session`

| Kolom       | Tipe      | Keterangan                  |
| ----------- | --------- | --------------------------- |
| id\_qr      | TEXT      | QR token (JWT)              |
| user\_id    | VARCHAR   | Foreign key ke `mahasiswa`  |
| expired\_at | TIMESTAMP | Batas waktu valid QR        |
| is\_active  | BOOLEAN   | QR aktif atau sudah dipakai |

### `scan_logs`

| Kolom       | Tipe      | Keterangan                  |
| ----------- | --------- | --------------------------- |
| id          | SERIAL    | Auto increment              |
| qr\_id      | TEXT      | Foreign key ke `qr_session` |
| scanner\_id | VARCHAR   | ID mahasiswa yang scan QR   |
| scanned\_at | TIMESTAMP | Waktu pemindaian            |


> 💡 Untuk melihat struktur database dan query lengkap, silakan cek file [neon.sql](https://github.com/theputras/E-GBHM/blob/main/neon.sql)

---


## 📫 Testing Menggunakan Postman

Untuk menguji API tanpa frontend, kamu bisa gunakan **Postman**:

---

### 1. ✅ Validasi NIM

**Endpoint:**
`POST /checkNIM`
**Body (JSON):**

```json
{
  "nim": "12345678901"
}
```

---

### 2. 🔐 Login Mahasiswa

**Endpoint:**
`POST /login-egbhm`
**Body (JSON):**

```json
{
  "nim": "12345678901",
  "password": "passwordmu"
}
```

**Response Sukses:**

```json
{
  "status": "success",
  "tokenlogin": "eyJhbGci...etc",
  "session_id": "xxx",
  "mahasiswa": {
    "id": "12345678901",
    "nama": "Nama Mahasiswa",
    "jurusan": "Informatika"
  }
}
```

Simpan nilai `tokenlogin` untuk digunakan pada request berikutnya.

---

### 3. 📥 Generate QR

**Endpoint:**
`GET /generate-qr`
**Header:**

```
Authorization: Bearer <tokenlogin>
```

---

### 4. 📤 Verifikasi QR

**Endpoint:**
`POST /verify-qr`
**Body (JSON):**

```json
{
  "qr": "<token QR yang digenerate>"
}
```

---

### 5. 📜 Riwayat Login

**Endpoint:**
`GET /api/logs/:nim`
**Header:**

```
Authorization: Bearer <tokenlogin>
```

Contoh:
`GET /api/logs/12345678901`

---

### 6. 🔓 Logout Sesi Sekarang

**Endpoint:**
`POST /logout-egbhm`
**Header:**

```
Authorization: Bearer <tokenlogin>
```

---

### 7. 🔒 Logout dari Semua Perangkat

**Endpoint:**
`POST /logout-all-devices`
**Header:**

```
Authorization: Bearer <tokenlogin>
```

---

### 8. 🌐 Validasi Browser

**Endpoint:**
`GET /check-browser`

> Digunakan untuk mengecek apakah browser klien didukung.

---

## 📝 Catatan Tambahan

* QR akan otomatis refresh di halaman scanner setiap 3 detik jika masih aktif.
* Jika QR sudah pernah digunakan atau expired, sistem akan generate ulang secara otomatis.
* Fungsi `logoutAllDevices` dapat diuji lewat Postman dengan endpoint:

  ```
  POST /logout-all-devices
  Authorization: Bearer <your_token>
  ```
  
* Gunakan `.env` untuk menjaga keamanan token & database
* Jangan upload `node_modules/` atau `.env` ke GitHub
* Fitur kamera membutuhkan HTTPS dan izin browser

---

## 🧪 Testing UI

Untuk pengujian frontend, buka halaman:

```
http://localhost:3000/testui
```

Di sini kamu bisa akses komponen visual seperti QR generator, scanner overlay, dan komponen navigasi.

---

## 👨‍💻 Kontributor

Made with ❤️ by tim E-GBHM THE PUTRAS.
Pull request dan laporan bug sangat diterima. Silakan fork dan submit ide atau perbaikanmu!


---

Kalau ada bagian tambahan seperti demo link, kontak developer, atau dokumentasi API yang ingin ditambahkan, tinggal bilang aja!

## Link Demo
```
https://e-gbhm.theputras.my.id
```

Atau bisa klik link berikut:
[https://e-gbhm.theputras.my.id](https://e-gbhm.theputras.my.id)


## Testing Account
Username
```
205090100087
```
---

Password
```
665544
```


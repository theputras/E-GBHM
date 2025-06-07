const token = localStorage.getItem('token');
const greetingEl = document.getElementById("greeting");
const scanContent = document.getElementById('scan-content');
let lastActivePage = 'home'; // default 
// Bottom navigation and scan content
const homeBtn = document.getElementById('homeBtn');
const scanBtn = document.getElementById('scanBtn');
const bottomNav = document.getElementById('bottom-nav');
const scanNav = document.getElementById('scan-nav');
const scanQr = document.getElementById('scanQr');
const showQr = document.getElementById('showQr');
const dashboardContent = document.getElementById('dashboard-content');
const showQrContent = document.getElementById('showQrContent');
const scanQrContent = document.getElementById('scanQrContent');
const backBtn = document.getElementById('backBtn');
const backBtnScan = document.getElementById('backBtnScan');
    const profileBtn = document.getElementById('profileBtn');
const profileContent = document.getElementById('profile-content');
const logoutAllDeviceBtn = document.getElementById('logoutAllDeviceBtn'); // Tambahkan elemen logoutAllDeviceBtn
const yesVerifyID = document.getElementById('yesVerifyID');
const noVerifyID = document.getElementById('noVerifyID');
const scannedData = document.getElementById('scannedData');

const logoutBtn = document.getElementById('logoutBtn');
const scannerOverlay = document.getElementById('scanner-overlay');

 // Select all navigation items
const items = document.querySelectorAll(".nav-item");
const itemsQR = document.querySelectorAll(".nav-item-QR");
document.addEventListener('DOMContentLoaded', function() {

    // window.addEventListener('resize', checkScreenSize); // Call checkScreenSize on page load
    // generateQRCodesFromCSV();
  window.addEventListener('resize', checkScreenSize);
  
  const mediaQuery = window.matchMedia("(max-width: 1024px)");
  mediaQuery.addEventListener("change", () => {
    console.log("[DEBUG] Media query triggered!");
    checkScreenSize();
  });

  checkScreenSize(); // Panggil saat load awal

  
    
    
    
    // Jika token tidak ditemukan, langsung redirect ke login
  if (!token) {
    window.location.href = '/login';
    return;
  }
  
  if (token) {
    startSilentRefresh();
  }
  
  
  

    
    


    
      // Automatically stop the camera when switching away from Scan Content
    window.addEventListener('beforeunload', function () {
        stopCamera();  // Stop the camera when the page is reloaded or navigated away from
    });

    // Stop the camera when leaving Scan Content (on Home or Dashboard view)
    window.addEventListener('popstate', function () {
        stopCamera();  // Stop the camera when navigating back
    });

    

    

homeBtn.addEventListener('click', function () {
  handleNavigation(dashboardContent, [scanContent, scanNav, profileContent], stopCamera);
  setActiveNavHomeItem(homeBtn);
  lastActivePage = 'home'; // Update last active page
  // showSection("dashboard-content");
 scanContent.classList.add('hidden');
  document.getElementById("titleScan").textContent = "";
});





// Event listener untuk tombol Scan (mulai scan QR)
scanBtn.addEventListener('click', function () {
  handleNavigation(scanContent, [dashboardContent, bottomNav, profileContent, showQrContent], startScanner);
  // showSection("scan-content");
 
lastActivePage = 'scan';
  document.getElementById("titleScan").textContent = "Scan QR Code";
});

scanQr.addEventListener('click', function () {
  handleNavigation(scanContent, [dashboardContent, bottomNav, profileContent, showQrContent], startScanner);
//  showSection("scanQrContent");
lastActivePage = 'scan';

  document.getElementById("titleScan").textContent = "Scan QR Code";
});

showQr.addEventListener('click', function () {
  handleNavigation(showQrContent, [dashboardContent, bottomNav, profileContent, scanQrContent], stopScanner);
//  showSection("showQrContent");
lastActivePage = 'scan';

  document.getElementById("titleShow").textContent = "Show QR Code";
});



backBtn.addEventListener('click', function () {
    // Menampilkan dashboard, sembunyikan halaman lainnya
    handleNavigation(dashboardContent, [scanContent, scanNav, profileContent], backScanner);
    document.getElementById("titleScan").textContent = ""; // Reset title
});
backBtnScan.addEventListener('click', function () {
    // Menampilkan dashboard, sembunyikan halaman lainnya
    handleNavigation(dashboardContent, [scanContent, scanNav, profileContent], backScanner);
    document.getElementById("titleScan").textContent = ""; // Reset title
});

    // Initially set the active state to Home button when on Dashboard
    setActiveNavHomeItem(homeBtn);
    // showQrContent.classList.add('hidden');
    profileContent.classList.add('hidden');
    scanContent.classList.add('hidden');
    // setActiveNavScanItem(scanQr);
    grettingMessage();
    


  // Cari angka 11 digit di token → ini adalah NIM


logoutBtn.addEventListener('click', function () {
  fetch('/logout-egbhm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    // Hapus token & redirect
    localStorage.removeItem('token');
     // Refresh halaman lalu redirect
     setTimeout(() => {
        location.reload(); // opsional, bisa dikomentari jika ingin efek langsung redirect
      window.location.href = '/login';
    }, 500); // kasih delay 500ms biar efek refresh terasa
  })
  .catch(err => {
    console.error('Logout error:', err);
    // Tetap hapus token dan redirect meskipun gagal update log
    localStorage.removeItem('token');
        location.reload();
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  });
});




profileBtn.addEventListener('click', function () {
    // Menampilkan dashboard, sembunyikan halaman lainnya
    handleNavigation(profileContent, [dashboardContent, , scanContent, scanNav, profileContent], backScanner);
      updateProfileDetailsFromToken();
    updateLoginHistory();
    // showSection("profile-content");
    lastActivePage = 'profile';
    setActiveNavHomeItem(profileBtn);
    document.getElementById("titleScan").textContent = ""; // Reset title
});


logoutAllDeviceBtn.addEventListener('click', function () {
  if (!confirm('Yakin ingin logout dari semua perangkat?')) return;

  fetch('/logout-all-devices', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    localStorage.removeItem('token');
    setTimeout(() => {
      window.location.href = '/login';
    }, 800);
  })
  .catch(err => {
    console.error('Logout all error:', err);
    alert('Gagal logout dari semua perangkat.');
  });
});


// end of DOMContentLoaded
});

// fungsi //


// Function to start the camera
const video = document.getElementById('video');
    let videoStream;
async function startCamera() {
  try {
        const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } } // minta kamera belakang2
    });
    const video = document.getElementById('video'); // pastikan elemen ini ada
    video.srcObject = stream;
    await video.play(); // tunggu kamera benar-benar nyala
    hasCameraPermission = true;
    console.log('Camera started successfully');
  } catch (err) {
    hasCameraPermission = false;
    alert('Gagal mengakses kamera: ' + err.message);
    console.error('Camera access error:', err);
  }
}



    // Function to stop the camera
    function stopCamera() {
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop()); // Stop all media tracks
            console.log('Camera stopped');
        }
    }

    // QR Code Scanning logic (using jsQR library)
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

// Function to scan QR Code from video stream
function scanQRCode() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Calculate overlay dimensions relative to video dimensions
        const overlayRect = scannerOverlay.getBoundingClientRect();
        const videoRect = video.getBoundingClientRect();

        // Calculate scaling and positioning factors
        const scaleX = canvas.width / videoRect.width;
        const scaleY = canvas.height / videoRect.height;

        // Compute overlay coordinates in video pixel space
        const overlayStartX = Math.round((overlayRect.left - videoRect.left) * scaleX);
        const overlayStartY = Math.round((overlayRect.top - videoRect.top) * scaleY);
        const overlayWidth = Math.round(overlayRect.width * scaleX);
        const overlayHeight = Math.round(overlayRect.height * scaleY);

        // Extract image data only within the overlay region
        const overlayImageData = context.getImageData(
            overlayStartX, 
            overlayStartY, 
            overlayWidth, 
            overlayHeight
        );

        const code = jsQR(overlayImageData.data, overlayWidth, overlayHeight, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            // Optional: Validate that the QR code is fully within the overlay
            const qrCodeRect = {
                left: code.location.topLeftCorner.x,
                right: code.location.topRightCorner.x,
                top: code.location.topLeftCorner.y,
                bottom: code.location.bottomLeftCorner.y
            };

            const isFullyWithinOverlay = 
                qrCodeRect.left >= 0 && 
                qrCodeRect.right <= overlayWidth && 
                qrCodeRect.top >= 0 && 
                qrCodeRect.bottom <= overlayHeight;
let qrHandled = false;
            if (isFullyWithinOverlay) {
            qrHandled = true;
                // alert("QR Code detected: " + code.data);
                handleQRCodeData(code.data)
  .then(() => {
    stopCamera();
  })
  .catch(err => {
    console.error('QR processing error:', err);
    qrHandled = false; // reset supaya bisa scan ulang
  });

                // startScanner();
                // stopCamera(); // Optional: Stop camera after successful scan
            }
        }
    }
    requestAnimationFrame(scanQRCode); // Continue scanning
}


// Handle scanned QR code data
    async function handleQRCodeData(data) {
    
    try {
    
        const response = await fetch("/verify-qr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ qr: data })
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        alert("QR tidak valid");
          // Tambahan: jika QR tidak valid atau sudah digunakan → generate QR baru
    
  
        return;
      }
  
      // QR Valid dan Data Ditemukan
      alert("QR sudah di-scan dan valid");
  
      // Sembunyikan scan-content, tampilkan verify-id-content
      document.getElementById("scan-content").classList.add("hidden");
      document.getElementById("verify-id-content").classList.remove("hidden");
  scannedData.innerText = "Scan berhasil";

      // Tampilkan data profil dari result
  document.getElementById("verifyIDName").innerText = result.nama;
  document.getElementById("verifyIDDetails").innerHTML = `
    <p><strong>NIM:</strong> ${result.user_id}</p>
    <p><strong>Jurusan:</strong> ${result.jurusan}</p>`;
  noVerifyID.addEventListener("click", () => {
  handleNavigation(scanContent, [dashboardContent, bottomNav, profileContent, showQrContent], startScanner);
});

  
    } catch (error) {
      console.error("Gagal verifikasi QR:", error);
      alert("Terjadi kesalahan saat memverifikasi QR.");
    }
  }

// Function to go back to dashboard
function backScanner() {
lastActivePage = 'home';
stopCamera();
  setActiveNavHomeItem(homeBtn);
        
        bottomNav.classList.remove('hidden'); // Show the bottom navigation
  
}

// Show QR Code Button Click to Go Back to Dashboard
let hasCameraPermission = false;
async function startScanner() {
  scanQrContent.classList.remove('hidden');
  showQrContent.classList.add('hidden');
  scanNav.classList.remove('hidden');
  scannerOverlay.classList.remove('hidden');
  setActiveNavScanItem(scanQr);
  backBtnScan.classList.add('hidden');
  backBtn.classList.remove('hidden');

  if (!hasCameraPermission) {
    hasCameraPermission = true;
    await startCamera(); // Tunggu kamera nyala
  }

  await scanQRCode(); // Baru mulai scan setelah kamera siap
}

// Function to stop the scanner
async function stopScanner() {
        scanContent.classList.remove('hidden');
        scanNav.classList.remove('hidden');
        scannerOverlay.classList.add('hidden'); // Show the scanner overlay
        setActiveNavScanItem(showQr);
        backBtnScan.classList.remove('hidden'); // Show the back button in scan mode
        backBtn.classList.add('hidden'); // Hide the back button in home mode
        // updateNavVisibility();
        // Show the bottom navigation and hide the scan navigation
        scanQrContent.classList.add('hidden');
        showQrContent.classList.remove('hidden');
        
        // Stop the camera when going back to Home
        stopCamera();
        setActiveNavScanItem(showQr);
        startSilentRefresh(); 
        generateAndDisplayQRCode();
}

 // Function to manage the active state based on the current content
    function setActiveNavHomeItem(activeBtn) {
        // Reset all items
        items.forEach(item => {
            item.classList.remove("bg-primary-100", "text-secondary-60");
            item.classList.add("text-base-0"); // Reset to inactive state
        });

        // Set the active class for the clicked item
        activeBtn.classList.add("bg-primary-100", "text-secondary-60");
    } 
    
    function setActiveNavScanItem(activeScanBtn) {
        // // Reset all items
        itemsQR.forEach(item => {
            item.classList.remove("bg-primary-100", "text-secondary-60");
            item.classList.add("text-base-0"); // Reset to inactive state
        });

        // Set the active class for the clicked item 
        activeScanBtn.classList.add("bg-primary-100", "text-secondary-60");
    }

// function showSection(id) {
//   document.querySelectorAll("main").forEach(main => {
//     if (main.id === id) {
//       main.classList.remove("hidden");
//       main.style.display = "flex";
//     } else {
//       main.classList.add("hidden");
//       main.style.display = "none";
//     }
//   });
//   window.scrollTo(0, 0);
// }


// fungsi silent refresh untuk menjaga sesi tetap aktif
function startSilentRefresh() {
if (lastActivePage === 'scan') {
  const refreshInterval = setInterval(() => {
    const scanContentVisible = !scanContent.classList.contains('hidden');
    if (scanContentVisible && lastActivePage === 'scan') {
      console.log('[AUTO] Refreshing QR...');
      generateAndDisplayQRCode(true);
    } else {
      // console.log('[AUTO] Halaman scan tidak aktif, hentikan auto-refresh');
      clearInterval(refreshInterval);
    }
  }, 3000); // setiap 3 detik
}

  setInterval(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('/check-session', {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      });

      const result = await response.json();
      console.log('Refresh result:', result.message);

      // Cek apakah session masih aktif
      if (result.message === 'Sesi telah berakhir, silakan login kembali.') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

    } catch (err) {
      console.error('Silent refresh failed:', err);
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }, 5000); // Setiap 5 detik
}

// function updateNavVisibility() {
//     if (!scanContent.classList.contains('hidden')) {
//         bottomNav.classList.add('hidden');
//         backBtnScan.classList.remove('hidden'); // Show the back button in scan mode
//         backBtn.classList.remove('hidden'); // Hide the back button in home mode
//         scanNav.classList.remove('hidden');
//     } else {
//         bottomNav.classList.remove('hidden');
//         backBtnScan.classList.add('hidden'); // Show the back button in scan mode
//         backBtn.classList.add('hidden'); // Hide the back button in home mode
//         scanNav.classList.add('hidden');
//     }
// }


// Fungsi untuk mengganti tampilan halaman
function switchPage(showPage, hidePages = []) {
    // Sembunyikan halaman-halaman lain
    hidePages.forEach(page => page.classList.add('hidden'));

    // Tampilkan halaman yang dipilih
    showPage.classList.remove('hidden');
}

// Fungsi untuk menyembunyikan semua konten halaman
function hideAllPages(pages) {
  pages.forEach(page => page.classList.add('hidden'));
}

// Fungsi untuk menampilkan halaman tertentu
function showPage(page) {
  page.classList.remove('hidden');
}

// Fungsi untuk menavigasi antara halaman
function handleNavigation(pageToShow, pagesToHide = [], action = null) {
  // Sembunyikan halaman yang lain
  hideAllPages(pagesToHide);
  
  // Tampilkan halaman yang dipilih
  showPage(pageToShow);

  // Lakukan action (seperti start/stop camera) jika diperlukan
  if (action) action();
}

// function handleNavigation(showElement, hideElements, callback) {
//   hideElements.forEach(el => el.classList.add('hidden'));
//   showElement.classList.remove('hidden');
//   if (typeof callback === 'function') {
//     // Bisa tambahkan delay kecil biar UI ready dulu
//     setTimeout(callback, 50); 
//   }
// }

// Fungsi untuk menampilkan pesan selamat datang
function grettingMessage() {
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  const nim = payload.id;
  const nama = payload.nama;
  const jurusan2 = payload.jurusan;
//   console.log(`NIM: ${nim}, Nama: ${nama}`);

// Ambil kode tahun dan kode prodi dari NIM
    const kodeTahun = nim.substring(0, 2);        // "23"
  const kodeProdi = nim.substring(2, 7);         // "41010"
  const nomorUnik = nim.substring(7, 11);        // "0003"
  const prodiMap = {
    "41010": "S1 Sistem Informasi",
    "41020": "S1 Teknik Komputer",
    "42010": "S1 DKV",
    "43010": "S1 Manajemen",
    "43020": "S1 Akuntansi",
    "39010": "D3 Sistem Informasi",
    "51016": "D4 Produksi Film dan Televisi",
    "42020": "S1 Desain Produk",
    "50901": "S1 AI",
  };
  
  const now = new Date();
  const hour = now.getHours();
  let waktu = "pagi";
  
  if (hour >= 12 && hour < 15) waktu = "siang";
  else if (hour >= 15 && hour < 18) waktu = "sore";
  else if (hour >= 18) waktu = "malam";
  
  const jurusan = jurusan2 ?? prodiMap[kodeProdi] ?? "Program Studi Tidak Dikenal";
  
  greetingEl.textContent = `Selamat ${waktu} ${nama}, mahasiswa angkatan 20${kodeTahun} dari ${jurusan}. Semangat untuk menamatkan E-GBHM kamu.`;
//     console.log("NIM Ditemukan:", nim);
  // console.log("Tahun:", kodeTahun, "Prodi:", kodeProdi, "No Unik:", nomorUnik, "Jurusan:", jurusan2);
  // console.log(payload);
} else  {
greetingEl.textContent = `User tidak ada`;
}
}


// Fungsi memunculkan detail profil dari token
function updateProfileDetailsFromToken() {

  if (!token) return;

  const payload = JSON.parse(atob(token.split('.')[1]));
  const nama = payload.nama;
  const nim = payload.id;
  const jurusan2 = payload.jurusan;
  
  // Ambil kode tahun dan kode prodi dari NIM
  const kodeTahun = nim.substring(0, 2);
  const kodeProdi = nim.substring(2, 7);
  const prodiMap = {
    "41010": "S1 Sistem Informasi",
    "41020": "S1 Teknik Komputer",
    "42010": "S1 DKV",
    "43010": "S1 Manajemen",
    "43020": "S1 Akuntansi",
    "39010": "D3 Sistem Informasi",
    "51016": "D4 Produksi Film dan Televisi",
    "42020": "S1 Desain Produk"
  };

  const jurusan = jurusan2 ?? prodiMap[kodeProdi] ?? "Program Studi Tidak Dikenal";
document.getElementById('profileName').textContent = nama;
  const profileDetails = document.getElementById('profileDetails');
  if (profileDetails) {
    profileDetails.innerHTML = `
      <p>NIM: ${nim}</p>
      <p>Jurusan: ${jurusan}</p>
    `;
  }
}

// Log History
function updateLoginHistory() {

  if (!token) return;
const payload = JSON.parse(atob(token.split('.')[1]));
  const nim = payload.id;

  const rowsPerPage = 10;
  let currentPage = 1;
  let loginData = [];

function renderTable() {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const paginatedData = loginData.slice(start, end);

  const tbody = document.getElementById('loginHistoryBody');
  tbody.innerHTML = ''; // clear sebelumnya

   paginatedData.forEach((log, index) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-gray-200 dark:border-gray-700';

        // Kolom: No
        tr.innerHTML += `<td class="px-4 py-2 text-center">${start + index + 1}</td>`;
        // Kolom: Login Time
        tr.innerHTML += `<td class="px-4 py-2 text-center">${new Date(log.login_time).toLocaleString('id-ID')}</td>`;
        // Kolom: Logout Time
        tr.innerHTML += `<td class="px-4 py-2 text-center">${log.logout_time ? new Date(log.logout_time).toLocaleString('id-ID') : '-'}</td>`;
        // Kolom: IP Address
        tr.innerHTML += `<td class="px-4 py-2 text-center">${log.ip_address || '-'}</td>`;
        // Kolom: Device Info
        tr.innerHTML += `<td class="px-4 py-2 text-center">${log.device_info || '-'}</td>`;
        // Kolom: Status + Logout button
const tdStatus = document.createElement('td');
tdStatus.className = 'px-4 py-2 text-center';

const spanStatus = document.createElement('span');
spanStatus.className = log.is_active ? 'text-green-600 font-semibold' : 'text-gray-500';
spanStatus.textContent = log.is_active ? 'Aktif' : 'Selesai';

tdStatus.appendChild(spanStatus);

// Tambahkan tombol logout jika aktif
if (log.is_active) {
  const br = document.createElement('br');
  const btn = document.createElement('button');
  btn.textContent = 'Logout';
  btn.className = 'mt-2 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm';
  btn.onclick = () => logoutById(log.id);

  tdStatus.appendChild(br);     // buat turun ke bawah
  tdStatus.appendChild(btn);    // masukkan button di bawah span
}

tr.appendChild(tdStatus);
tbody.appendChild(tr);

        // console.log('log object:', log);

    });
    
        document.getElementById('pageInfo').textContent = `Halaman ${currentPage}/${Math.ceil(loginData.length / rowsPerPage)}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = end >= loginData.length;
}
async function logoutById(logId) {
console.log("Logout ID: ", logId);
  try {
    const res = await fetch('/logout-by-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id: logId }) // kirim ID sesi yang ingin di-logout
    });

    const result = await res.json();
    if (res.ok) {
      alert('Logout berhasil untuk sesi tersebut.');
      fetchLoginHistory(); // pastikan fungsi ini memuat ulang tabel
    } else {
      alert(result.message || 'Logout gagal.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    alert('Terjadi kesalahan saat logout.');
  }
}



  document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTable();
    }
  });

  document.getElementById('nextPage').addEventListener('click', () => {
    if ((currentPage * rowsPerPage) < loginData.length) {
      currentPage++;
      renderTable();
    }
  });

  fetch(`/api/logs/${nim}`)
    .then(res => res.json())
    .then(logs => {
      loginData = logs;
      renderTable();
    })
    .catch(err => {
      console.error('Gagal memuat login history:', err);
      document.getElementById('loginHistoryBody').innerHTML = `
        <tr>
          <td colspan="2" class="px-4 py-2 text-red-500">Gagal memuat data login.</td>
        </tr>
      `;
    });
}


// Function to fetch and update login history
async function fetchLoginHistory() {
updateLoginHistory();
}

 // Function to load and parse the CSV file
    // function loadCSVData(callback) {
    //     Papa.parse("/test.csv", {
    //     download: true,
    //     header: true,
    //     complete: function(results) {
    //         callback(results.data);  // Pass parsed data to the callback
    //     },
    //     error: function(error) {
    //         console.error("CSV Error:", error);
    //     }
    // });
    // }

// function generateQRCodesFromCSV() {
//     loadCSVData((data) => {
//         const container = document.getElementById("qrCodeContainer");
//         container.innerHTML = ''; // clear previous QR codes

//         // Check if data exists and has at least one row
//         if (data && data.length > 0) {
//             // Use only the first row
//             const firstRow = data[0];
//             const text = Object.values(firstRow).join(", "); // combine all values from first row

//             const canvas = document.createElement('canvas');
//             QRCode.toCanvas(canvas, text, { width: 300 }, function (error) {
//                 if (error) console.error(error);
//             });

//             const wrapper = document.createElement('div');
//             wrapper.className = "flex flex-col items-center";
//             wrapper.appendChild(canvas);

//             container.appendChild(wrapper);
//         }
//     });
// }


// Function to generate and display QR Code
async function generateAndDisplayQRCode(forceNew = false) {
//  console.log('[DEBUG] generateAndDisplayQRCode() dipanggil, forceNew:', forceNew);
  
  // console.log('[DEBUG] Token JWT:', token);

  if (!token) {
    alert('Anda belum login.');
    return;
  }

  try {
    const response = await fetch('/generate-qr', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
// console.log('[DEBUG] Status response:', response.status);
    if (!response.ok) {
      const errorRes = await response.json();
      // console.error('[DEBUG] Error response JSON:', errorRes);
      throw new Error(errorRes.message || 'Gagal generate QR');
    }

    const responseData = await response.json(); // ambil data response JSON
    // console.log('[DEBUG] is_active:', responseData.qr);
        // Jika QR lama dan sudah tidak aktif/terpakai, minta QR baru
if (responseData.status === 'existing') {
  // console.log('[DEBUG] QR status = existing');
  // console.log('[DEBUG] used:', responseData.used);
  // console.log('[DEBUG] is_active:', responseData.is_active);
  // console.log('[DEBUG] is_active:', responseData.qr);

  if (!forceNew && (!responseData.is_active || responseData.used)) {
    // console.log('[DEBUG] Kondisi QR lama tidak valid → regenerate...');
    return generateAndDisplayQRCode(true);
  }

  if (forceNew && (!responseData.is_active || responseData.used)) {
    console.warn('[ABORT] Loop pembuatan QR dihentikan: QR baru tetap tidak valid.');
    alert('Gagal mendapatkan QR baru yang valid. Silakan refresh halaman.');
    return;
  }
}

    
    
    // console.log('[DEBUG] Response Data:', responseData);
    const qrCodeData = responseData.qr; // pastikan server mengembalikan properti ini
    // console.log('[DEBUG] QR Code Data:', qrCodeData);

  const canvas = document.createElement('canvas');
QRCode.toCanvas(canvas, qrCodeData, { width: 300 }, function (error) {
  if (error) console.error(error);

  const qrContainer = document.getElementById('qrCodeContainer');
qrContainer.innerHTML = ''; // selalu bersihkan QR lama
  // [FIX] Tambahkan pengecekan untuk forceNew agar canvas benar-benar di-refresh
  if (forceNew) {
    // console.log('[DEBUG] ForceNew aktif: QR lama diganti');
    qrContainer.innerHTML = ''; // hapus QR lama
  }

  qrContainer.appendChild(canvas); // tambahkan QR baru
});

  } catch (err) {
    console.error('Error:', err);
    alert(err.message);
  }
}



// Function untuk mengecek ukuran layar dan menyesuaikan tampilan
function checkScreenSize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  // console.log("[DEBUG] Window Width:", width);
  // console.log("[DEBUG] Window Height:", height);
  // console.log("[DEBUG] Last Active Page:", lastActivePage);
  if (width >= 1024) {
    document.getElementById("mobile-warning").classList.remove("hidden");
    document.getElementById("dashboard-content").classList.add("hidden");
    document.getElementById("scan-content").classList.add("hidden");
    document.getElementById("profile-content").classList.add("hidden");
    document.getElementById("bottom-nav").classList.add("hidden");
    document.getElementById("scan-nav").classList.add("hidden");
  } else {
    document.getElementById("mobile-warning").classList.add("hidden");

    // Pastikan semuanya disiapkan dulu
    dashboardContent.classList.add("hidden");
    scanContent.classList.add("hidden");
    profileContent.classList.add("hidden");

    // Tampilkan halaman sesuai lastActivePage
    if (lastActivePage === 'home') {
      handleNavigation(dashboardContent, [scanContent, profileContent]);
      document.getElementById("bottom-nav").classList.remove("hidden");
      document.getElementById("scan-nav").classList.add("hidden");

    } else if (lastActivePage === 'scan') {
      handleNavigation(scanContent, [dashboardContent, profileContent]);
      document.getElementById("bottom-nav").classList.add("hidden");
      document.getElementById("scan-nav").classList.remove("hidden");

    } else if (lastActivePage === 'profile') {
      handleNavigation(profileContent, [dashboardContent, scanContent]);
      document.getElementById("bottom-nav").classList.remove("hidden");
      document.getElementById("scan-nav").classList.add("hidden");
    }
  }
}




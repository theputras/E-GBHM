
const tokenlogin = localStorage.getItem('tokenlogin');
const nimForm = document.getElementById("nimForm");
const passwordForm = document.getElementById("passwordForm");
const makePasswordBtn = document.getElementById("makePasswordBtn");
const nimInput = document.getElementById("nim");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const checkNim = document.getElementById("checkNim");
const togglePassword = document.getElementById("togglePassword");
const formLogin = document.getElementById("formLogin");

// Browser detection
const browsercheck = document.getElementById('browser-check');
const browserCheckText = browsercheck.querySelector('p');
  const userAgent = navigator.userAgent;
const isChrome = userAgent.includes("Chrome") && !userAgent.includes("Edg") && !userAgent.includes("OPR");
const isFirefox = userAgent.includes("Firefox");
const isSafari = userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("Chromium");
document.addEventListener("DOMContentLoaded", () => {


  // Check browser support
if (!(isChrome || isFirefox || isSafari)) {
  fetch("/check-browser")
    .then(response => response.json())
    .then(data => {
      browsercheck.classList.remove('hidden');
      browserCheckText.textContent = data.error;
          formLogin.classList.add("hidden");
    logout();
    })
    .catch(err => {
      browsercheck.classList.remove('hidden');
          formLogin.classList.add("hidden");
   logout();
      browserCheckText.textContent = `Terjadi kesalahan: ${err.message}`;
    });
}
  






// startSilentRefresh();
  if (tokenlogin) {
    startSilentRefresh();
  }
  
  nimForm.addEventListener("submit", async (e) => {
    const defaultCheckNimText = checkNim.textContent;
    // ✅ Sembunyikan tombol submit dan disable input NIM
    nimInput.disabled = true;
    checkNim.classList.remove("bg-primary-100");
    checkNim.classList.add("bg-primary-40");
    checkNim.textContent = "Nim sedang di cek, silakan tunggu...";
    e.preventDefault();
    const nim = nimInput.value.trim();
    if (!nim) return alert("Masukkan NIM.");

    try {
    console.log("Mengecek NIM:", nim);
      const response = await fetch("/checkNIM", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim }),
      });

      const data = await response.json();

      if (data.status === "not_found") {
        alert("NIM tidak ditemukan.");
        nimInput.disabled = false;
    checkNim.classList.add("bg-primary-100");
    checkNim.classList.remove("bg-primary-40");
checkNim.textContent = defaultCheckNimText;

        return;
      }

    
    
    setTimeout(() => {
      document.querySelector('#nimForm button[type="submit"]').classList.add("hidden");
    
      if (data.status === "not_found") {
        alert("NIM tidak ditemukan.");
        return;
      }
      
      if (data.status === "no_password") {
        passwordForm.classList.add("hidden");
        makePasswordBtn.classList.remove("hidden");
      } else if (data.status === "has_password") {
        makePasswordBtn.classList.add("hidden");
        passwordForm.classList.remove("hidden");
      }
    }, 2000); // kasih delay 2000ms

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengecek NIM.");
    }
  });

  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.textContent = type === "password" ? "Show" : "Hide";
  });




  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
const nim = document.getElementById("nim").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/login-egbhm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim, password }),
    });

    const data = await response.json();

    if (data.status === "success") {
      loginBtn.disabled = true;
      loginBtn.classList.remove("bg-primary-100");
      loginBtn.classList.add("bg-primary-40");
      loginBtn.textContent = "Berhasil login, silakan tunggu...";
      passwordInput.type = "password";
togglePassword.textContent = "Show";

          setTimeout(() => {
            
            localStorage.setItem("tokenlogin", data.tokenlogin); // Simpan token ke localStorage
            localStorage.setItem("session_id", data.session_id); // Simpan token ke localStorage
            window.location.href = "/"; // ✅ redirect ke halaman utama
    }, 2000); // kasih delay 2000ms
      // alert("wes login cok");
    } else {
      alert(data.message || "Gagal login");
    }
  } catch (err) {
    console.error(err);
    alert("Kesalahan saat login");
  }
  });
  
  // end of DOMContentLoaded
});

// fungsi

function logout() {

 fetch('/logout-egbhm', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenlogin}`
    }
  })
  .then(res => res.json())
  .then(data => {
    // Hapus token & redirect
    localStorage.removeItem('tokenlogin');
     
  })
  .catch(err => {
    console.error('Logout error:', err);
    // Tetap hapus token dan redirect meskipun gagal update log
    localStorage.removeItem('tokenlogin');

  });
}


async function startSilentRefresh() {
console.log('Starting silent refresh...');
  if (tokenlogin) {
    try {
      const response = await fetch('/check-session', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenlogin}`
        }
      });
      const result = await response.json();
      console.log('Refresh result:', result.message);
      if (response.ok) {
        // Jika session masih aktif, redirect ke halaman utama
         if (window.location.pathname === "/login") {
          window.location.replace("/"); // replace() agar tidak bisa back
        }
        return;
      } else {
        // Token ada tapi tidak valid atau sudah expired
        logout();
      }
    } catch (err) {
      console.error('Error checking session:', err);
      logout();
    }
  }
  

}
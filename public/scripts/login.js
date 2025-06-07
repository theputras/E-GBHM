
const token = localStorage.getItem('token');
const nimForm = document.getElementById("nimForm");
const passwordForm = document.getElementById("passwordForm");
const makePasswordBtn = document.getElementById("makePasswordBtn");
const nimInput = document.getElementById("nim");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const checkNim = document.getElementById("checkNim");
const togglePassword = document.getElementById("togglePassword");
document.addEventListener("DOMContentLoaded", () => {

// startSilentRefresh();
  if (token) {
    startSilentRefresh();
  }
  
  nimForm.addEventListener("submit", async (e) => {
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
      const type = passwordInput.type === "password";
    passwordInput.type = type;
    togglePassword.textContent = type === "Hide";
          setTimeout(() => {
            
            localStorage.setItem("token", data.token); // Simpan token ke localStorage
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


async function startSilentRefresh() {
console.log('Starting silent refresh...');
  if (token) {
    try {
      const response = await fetch('/check-session', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      console.log('Refresh result:', result.message);
      if (response.ok) {
        // Jika session masih aktif, redirect ke halaman utama
        window.location.href = '/';
        return;
      } else {
        // Token ada tapi tidak valid atau sudah expired
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Error checking session:', err);
      localStorage.removeItem('token');
    }
  }
  

}


document.addEventListener("DOMContentLoaded", () => {
  const nimForm = document.getElementById("nimForm");
  const passwordForm = document.getElementById("passwordForm");
  const makePasswordBtn = document.getElementById("makePasswordBtn");
  const nimInput = document.getElementById("nim");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const togglePassword = document.getElementById("togglePassword");

  nimForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nim = nimInput.value.trim();
    if (!nim) return alert("Masukkan NIM.");

    try {
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

    // ✅ Sembunyikan tombol submit dan disable input NIM
document.querySelector('#nimForm button[type="submit"]').classList.add("hidden");
nimInput.disabled = true;

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
});

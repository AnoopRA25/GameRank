// register.js (works with your UI register.html)

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const messageBox = document.getElementById("message");
  const registerBtn = document.getElementById("registerBtn");

  // ✅ Toggle password show/hide
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      togglePassword.textContent = isHidden ? "🙈" : "👁️";
    });
  }

  // ✅ Form submit event
  if (form) {
    form.addEventListener("submit", async () => {
      const username = document.getElementById("username")?.value?.trim();
      const password = document.getElementById("password")?.value?.trim();

      // basic validation
      if (!username || username.length < 3) {
        showMessage("❌ Username must be at least 3 characters", false);
        return;
      }
      if (!password || password.length < 2) {
        showMessage("❌ Password must be at least 2 characters", false);
        return;
      }

      // button loading
      registerBtn.classList.add("loading");
      registerBtn.disabled = true;

      try {
        // ✅ call register API (same as app.js register() logic)
        const res = await fetch(`${API}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
          showMessage("✅ Account created! Redirecting to login...", true);

          setTimeout(() => {
            window.location.href = "login.html";
          }, 1000);
        } else {
          showMessage("❌ " + (data.message || "Registration failed"), false);
        }
      } catch (err) {
        showMessage("❌ Server error. Is backend running?", false);
      } finally {
        registerBtn.classList.remove("loading");
        registerBtn.disabled = false;
      }
    });
  }

  function showMessage(msg, success) {
    if (!messageBox) return;
    messageBox.textContent = msg;
    messageBox.className = success ? "message success" : "message";

    // small shake animation for error
    if (!success) {
      const card = document.querySelector(".auth-card");
      card?.classList.add("shake");
      setTimeout(() => card?.classList.remove("shake"), 350);
    }
  }
});

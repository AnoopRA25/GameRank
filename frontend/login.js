document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const toggle = document.getElementById("togglePassword");
  const btn = document.getElementById("loginBtn");
  const msg = document.getElementById("message");

  function setMessage(text, type = "error") {
    msg.textContent = text;
    msg.classList.remove("success");
    if (type === "success") msg.classList.add("success");
  }

  function clearMessage() {
    msg.textContent = "";
    msg.classList.remove("success");
  }

  // Toggle password
  if (toggle) {
    toggle.addEventListener("click", () => {
      const t = password.getAttribute("type") === "password" ? "text" : "password";
      password.setAttribute("type", t);
      toggle.textContent = t === "password" ? "👁️" : "🙈";
    });
  }

  function validate() {
    clearMessage();

    if (!username.value || username.value.trim().length < 3) {
      setMessage("Username must be at least 3 characters");
      username.classList.add("shake");
      setTimeout(() => username.classList.remove("shake"), 350);
      return false;
    }

    // ✅ important: allow small passwords like 12 / 1234
    if (!password.value || password.value.length < 2) {
      setMessage("Password must be at least 2 characters");
      password.classList.add("shake");
      setTimeout(() => password.classList.remove("shake"), 350);
      return false;
    }

    return true;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!validate()) return;

    btn.classList.add("loading");
    btn.disabled = true;

    try {
      // ✅ use API from app.js
      if (typeof API === "undefined") {
        setMessage("API not found. Make sure app.js is loaded before login.js");
        return;
      }

      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.value.trim(),
          password: password.value
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage("❌ " + (data.message || "Login failed"));
        return;
      }

      // ✅ save user + redirect
      localStorage.setItem("user", JSON.stringify(data.user));

      setMessage("✅ Login success! Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 600);

    } catch (err) {
      console.error(err);
      setMessage("❌ Network error. Is backend running?");
    } finally {
      btn.disabled = false;
      btn.classList.remove("loading");
    }
  });
});

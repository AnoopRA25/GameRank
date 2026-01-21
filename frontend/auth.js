function requireLogin() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    alert("Please login first!");
    window.location.href = "login.html";
    return null;
  }
  return user;
}

function requireAdmin() {
  const user = requireLogin();
  if (!user) return null;

  if (user.role !== "admin") {
    alert("❌ Access denied! Admins only.");
    window.location.href = "index.html";
    return null;
  }
  return user;
}

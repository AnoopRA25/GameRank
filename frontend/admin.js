// admin.js - admin panel handler

document.addEventListener("DOMContentLoaded", () => {

  // ✅ Load admin games when page loads
  if (typeof loadAdmin === "function") {
    loadAdmin();
  }

});

// ✅ Override loadAdmin with UI version (uses app.js API)
async function loadAdmin() {
  const res = await fetch(`${API}/games`);
  const games = await res.json();

  const box = document.getElementById("adminGames");
  if (!box) return;

  box.innerHTML = games.map(adminCard).join("");
}

function adminCard(g) {
  return `
    <div class="card">
      <img class="poster" src="${g.image}" alt="${g.name}">
      <h3>${g.name}</h3>
      <p>⭐ Rating: ${g.rating}</p>
      <p>🔥 Popularity: ${g.popularity}%</p>
      <p>📥 Downloads: ${g.downloads}M</p>
      <p>🎮 Category: ${g.category}</p>
      ${g.trending ? `<div class="badge">🔥 Trending</div>` : ""}

      <div style="display:flex;gap:8px;margin-top:10px;">
        <button class="btn" onclick="editGame(${g.id})">Edit</button>
        <button class="btn" onclick="deleteGame(${g.id})">Delete</button>
      </div>
    </div>
  `;
}

async function addGame() {
  const name = document.getElementById("gname").value.trim();
  const category = document.getElementById("gcategory").value.trim();
  const rating = Number(document.getElementById("grating").value);
  const downloads = Number(document.getElementById("gdownloads").value);
  const popularity = Number(document.getElementById("gpopularity").value);
  const trending = document.getElementById("gtrending").value === "true";

  if (!name || !category) {
    alert("❌ Please enter Game Name and Category");
    return;
  }

  const res = await fetch(`${API}/admin/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, category, rating, downloads, popularity, trending })
  });

  const data = await res.json();
  alert(data.message);
  loadAdmin();
}

async function editGame(id) {
  const rating = prompt("Enter new rating:");
  const popularity = prompt("Enter new popularity:");
  const downloads = prompt("Enter new downloads:");
  const trending = prompt("Trending? true/false:");

  const res = await fetch(`${API}/admin/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rating: Number(rating),
      popularity: Number(popularity),
      downloads: Number(downloads),
      trending: String(trending).toLowerCase() === "true"
    })
  });

  const data = await res.json();
  alert(data.message);
  loadAdmin();
}

async function deleteGame(id) {
  if (!confirm("Are you sure you want to delete this game?")) return;

  const res = await fetch(`${API}/admin/games/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();
  alert(data.message);
  loadAdmin();
}

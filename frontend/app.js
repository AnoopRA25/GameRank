const API = "http://localhost:5000/api";

let allGamesData = [];
let currentPage = 1;
const limit = 10;

// ================= AUTH =================
async function register() {
  const username = document.getElementById("username")?.value || "";
  const password = document.getElementById("password")?.value || "";

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  alert(data.message);
  if (res.ok) window.location.href = "login.html";
}

async function login() {
  const username = document.getElementById("username")?.value || "";
  const password = document.getElementById("password")?.value || "";

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  alert(data.message);

  if (res.ok) {
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "index.html";
  }
}

function logout() {
  localStorage.removeItem("user");
}

// ================= UTIL =================
function calcScore(g) {
  return (g.rating * 20) + g.popularity + (g.downloads / 10);
}

// ================= HOME =================
async function loadHome() {
  // Trending
  const trendingBox = document.getElementById("trending");
  if (trendingBox) {
    const tRes = await fetch(`${API}/games/trending`);
    const trending = await tRes.json();
    trendingBox.innerHTML = trending.map(gameCard).join("");
  }

  // Ranked
  const rankedBox = document.getElementById("ranked");
  if (rankedBox) {
    const rRes = await fetch(`${API}/games/ranked`);
    const ranked = await rRes.json();
    rankedBox.innerHTML = ranked.slice(0, 10).map((g, idx) => rankCard(g, idx)).join("");
  }

  // Category dropdown init (need all games once)
  const gRes = await fetch(`${API}/games`);
  allGamesData = await gRes.json();

  loadCategoryOptions(allGamesData);

  // First paged load
  currentPage = 1;
  await loadPagedGames();
}

function loadCategoryOptions(games) {
  const dropdown = document.getElementById("categoryFilter");
  if (!dropdown) return;

  const categories = [...new Set(games.map(g => g.category))].sort();

  dropdown.innerHTML =
    `<option value="all">All Categories</option>` +
    categories.map(c => `<option value="${c}">${c}</option>`).join("");
}

// ================= PAGED LIST =================
async function loadPagedGames() {
  const search = (document.getElementById("searchInput")?.value || "").trim();
  const category = document.getElementById("categoryFilter")?.value || "all";
  const trending = document.getElementById("trendingFilter")?.value || "all";
  const sortBy = document.getElementById("sortBy")?.value || "score";

  const url =
    `${API}/games/paged?page=${currentPage}&limit=${limit}` +
    `&search=${encodeURIComponent(search)}` +
    `&category=${encodeURIComponent(category)}` +
    `&trending=${encodeURIComponent(trending)}` +
    `&sortBy=${encodeURIComponent(sortBy)}`;

  const res = await fetch(url);
  const data = await res.json();

  document.getElementById("allGames").innerHTML = data.games.map(gameCard).join("");

  const pageInfo = document.getElementById("pageInfo");
  if (pageInfo) pageInfo.innerText = `Page ${data.page} / ${data.totalPages}`;

  // quick stats
  if (document.getElementById("totalGames")) {
    document.getElementById("totalGames").innerText = data.total;
    document.getElementById("rankedCount").innerText = 10;
  }
}

function nextPage() {
  currentPage++;
  loadPagedGames();
}

function prevPage() {
  if (currentPage > 1) currentPage--;
  loadPagedGames();
}

function applyFilters() {
  currentPage = 1;
  loadPagedGames();
}

function clearFilters() {
  const search = document.getElementById("searchInput");
  const cat = document.getElementById("categoryFilter");
  const trend = document.getElementById("trendingFilter");
  const sort = document.getElementById("sortBy");

  if (search) search.value = "";
  if (cat) cat.value = "all";
  if (trend) trend.value = "all";
  if (sort) sort.value = "score";

  applyFilters();
}

// ================= UI CARDS =================
function gameCard(g) {
  return `
    <div class="card">
      <img class="poster" src="${g.image}" alt="${g.name}">
      <div class="game-title">${g.name}</div>
      <p>⭐ Rating: ${g.rating}</p>
      <p>📥 Downloads: ${g.downloads}M</p>
      <p>🔥 Popularity: ${g.popularity}%</p>
      <p>🎮 Category: ${g.category}</p>
      ${g.trending ? `<div class="badge">🔥 Trending</div>` : ""}
      <br><br>
      <button class="btn" onclick="openGame(${g.id})">View Details</button>
    </div>
  `;
}

function rankCard(g, idx) {
  return `
    <div class="card">
      <img class="poster" src="${g.image}" alt="${g.name}">
      <h3>#${idx + 1} ${g.name}</h3>
      <p>🏆 Score: ${g.score.toFixed(1)}</p>
      <button class="btn" onclick="openGame(${g.id})">View Details</button>
    </div>
  `;
}

function openGame(id) {
  window.location.href = `game.html?id=${id}`;
}

// ================= GAME DETAILS =================
async function loadGameDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const res = await fetch(`${API}/games/${id}`);
  const g = await res.json();

  const score = calcScore(g);

  const lbRes = await fetch(`${API}/leaderboard/game/${id}`);
  const leaderboard = await lbRes.json();

  document.getElementById("gameDetails").innerHTML = `
    <div class="card">
      <img class="banner" src="${g.banner}" alt="${g.name}">
      <h1>${g.name}</h1>
      <p>🎮 Category: ${g.category}</p>
      <p>⭐ Rating: ${g.rating}</p>
      <p>📥 Downloads: ${g.downloads}M</p>
      <p>🔥 Popularity: ${g.popularity}%</p>
      <p>🏆 Ranking Score: ${score.toFixed(1)}</p>
      ${g.trending ? `<div class="badge">🔥 Trending</div>` : ""}
      <hr>
      <h3>🏅 Top Players (This Game)</h3>
      <ul>
        ${leaderboard.map((x, i) => `<li>#${i + 1} ${x.username} - ${x.points} pts</li>`).join("") || "<li>No scores yet</li>"}
      </ul>
      <hr>
      <h3>🎯 Add Your Score</h3>
      <input id="scorePoints" class="input" type="number" placeholder="Enter points (ex: 1200)">
      <button class="btn" onclick="submitScore(${g.id})">Submit Score</button>
      <br><br>
      <button class="btn" onclick="goBack()">⬅ Back</button>
    </div>
  `;
}

async function submitScore(gameId) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const username = user.username || "Guest";

  const points = document.getElementById("scorePoints").value;

  const res = await fetch(`${API}/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, gameId, points })
  });

  const data = await res.json();
  alert(data.message);
  loadGameDetails();
}

function goBack() {
  window.history.back();
}

// ================= COMPARE =================
async function loadComparePage() {
  const res = await fetch(`${API}/games`);
  const games = await res.json();

  const g1 = document.getElementById("game1");
  const g2 = document.getElementById("game2");

  g1.innerHTML = games.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
  g2.innerHTML = games.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
}

async function compareGames() {
  const g1 = document.getElementById("game1").value;
  const g2 = document.getElementById("game2").value;

  const res = await fetch(`${API}/compare?g1=${g1}&g2=${g2}`);
  const data = await res.json();

  document.getElementById("compareResult").innerHTML =
    `${compareCard(data.game1)}${compareCard(data.game2)}`;
}

function compareCard(g) {
  const score = calcScore(g);
  return `
    <div class="card">
      <img class="poster" src="${g.image}" alt="${g.name}">
      <h2>${g.name}</h2>
      <p>⭐ Rating: ${g.rating}</p>
      <p>🔥 Popularity: ${g.popularity}%</p>
      <p>📥 Downloads: ${g.downloads}M</p>
      <p>🏆 Score: ${score.toFixed(1)}</p>
      <button class="btn" onclick="openGame(${g.id})">View Details</button>
    </div>
  `;
}

// ================= LEADERBOARD PAGE =================
async function loadLeaderboard() {
  const res = await fetch(`${API}/leaderboard`);
  const data = await res.json();

  const el = document.getElementById("leaderboardList");
  el.innerHTML = data.map((u, i) => `
    <div class="card">
      <h3>#${i + 1} ${u.username}</h3>
      <p>🏆 Total Points: ${u.totalPoints}</p>
    </div>
  `).join("") || "<div class='card'>No scores yet</div>";
}

// ================= ADMIN =================
async function loadAdmin() {
  const res = await fetch(`${API}/games`);
  const games = await res.json();

  document.getElementById("adminGames").innerHTML = games.map(adminCard).join("");
}

function adminCard(g) {
  return `
    <div class="card">
      <img class="poster" src="${g.image}" alt="${g.name}">
      <h3>${g.name}</h3>
      <p>Rating: ${g.rating} | Popularity: ${g.popularity} | Downloads: ${g.downloads}M</p>
      <button class="btn" onclick="editGame(${g.id})">Edit</button>
      <button class="btn" onclick="deleteGame(${g.id})">Delete</button>
    </div>
  `;
}

async function addGame() {
  const game = {
    name: document.getElementById("gname").value,
    rating: Number(document.getElementById("grating").value),
    downloads: Number(document.getElementById("gdownloads").value),
    popularity: Number(document.getElementById("gpopularity").value),
    category: document.getElementById("gcategory").value,
    trending: document.getElementById("gtrending").value === "true"
  };

  const res = await fetch(`${API}/admin/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(game)
  });

  alert((await res.json()).message);
  loadAdmin();
}

async function editGame(id) {
  const rating = prompt("Enter new rating:");
  const popularity = prompt("Enter new popularity:");
  const downloads = prompt("Enter new downloads:");

  const res = await fetch(`${API}/admin/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rating: Number(rating),
      popularity: Number(popularity),
      downloads: Number(downloads)
    })
  });

  alert((await res.json()).message);
  loadAdmin();
}

async function deleteGame(id) {
  const res = await fetch(`${API}/admin/games/${id}`, { method: "DELETE" });
  alert((await res.json()).message);
  loadAdmin();
}

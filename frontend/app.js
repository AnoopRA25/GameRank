const API = "http://localhost:5000/api";

// =============== AUTH ==================
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

// =============== HOME PAGE ==================
let allGamesData = [];

async function loadHome() {
  const trendingBox = document.getElementById("trending");
  const rankedBox = document.getElementById("ranked");

  // Trending
  if (trendingBox) {
    const tRes = await fetch(`${API}/games/trending`);
    const trending = await tRes.json();
    trendingBox.innerHTML = trending.map(gameCard).join("");
  }

  // Ranked
  if (rankedBox) {
    const rRes = await fetch(`${API}/games/ranked`);
    const ranked = await rRes.json();
    rankedBox.innerHTML = ranked.map((g, idx) => rankCard(g, idx)).join("");
  }

  // All Games
  const gRes = await fetch(`${API}/games`);
  allGamesData = await gRes.json();

  console.debug('[loadHome] total games loaded:', allGamesData.length);

  loadCategoryOptions(allGamesData);

  // default show all games
  const allGamesEl = document.getElementById("allGames");
  if (allGamesEl) allGamesEl.innerHTML = allGamesData.map(gameCard).join("");

  // live search (guard in case element missing)
  const searchEl = document.getElementById("searchInput");
  if (searchEl) searchEl.addEventListener("input", applyFilters);
}

function loadCategoryOptions(games) {
  const categories = [...new Set(games.map(g => g.category))].sort();
  const dropdown = document.getElementById("categoryFilter");
  if (!dropdown) return;

  dropdown.innerHTML = `<option value="all">All Categories</option>` +
    categories.map(c => `<option value="${c}">${c}</option>`).join("");
}

// Filter + Search + Sort
function applyFilters() {
  // read inputs with guards
  const searchInput = document.getElementById("searchInput");
  const catEl = document.getElementById("categoryFilter");
  const trendEl = document.getElementById("trendingFilter");
  const sortEl = document.getElementById("sortBy");

  const search = (searchInput && searchInput.value || "").trim().toLowerCase();
  const category = (catEl && (catEl.value || "all")) || "all";
  const trending = (trendEl && (trendEl.value || "all")) || "all";
  const sortBy = (sortEl && (sortEl.value || "score")) || "score";

  console.debug('[applyFilters] search:', search, 'category:', category, 'trending:', trending, 'sortBy:', sortBy);

  let filtered = [...allGamesData];

  // more flexible search: match name OR category
  if (search !== "") {
    filtered = filtered.filter(g => {
      const name = (g.name || "").toLowerCase();
      const cat = (g.category || "").toLowerCase();
      return name.includes(search) || cat.includes(search);
    });
  }

  // category (case-insensitive, trimmed)
  if (category && category !== "all") {
    const wanted = category.trim().toLowerCase();
    filtered = filtered.filter(g => ((g.category || "").toLowerCase() === wanted));
  }

  // trending: accept boolean true/false, string 'true'/'false', numeric 1/0
  if (trending && trending !== "all") {
    filtered = filtered.filter(g => {
      const val = g.trending;
      const s = String(val).toLowerCase();
      return s === String(trending).toLowerCase();
    });
  }

  // score calc
  filtered = filtered.map(g => ({
    ...g,
    score: (g.rating * 20) + g.popularity + (g.downloads / 10)
  }));

  // sort (handle missing keys defensively)
  filtered.sort((a, b) => {
    if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
    const av = (a[sortBy] == null) ? -Infinity : a[sortBy];
    const bv = (b[sortBy] == null) ? -Infinity : b[sortBy];
    return bv - av;
  });

  const allGamesEl = document.getElementById("allGames");
  if (!allGamesEl) return;

  if (!filtered.length) {
    console.debug('[applyFilters] no results after filtering');
    allGamesEl.innerHTML = `<div class="card"><p class="muted">No games found that match your filters.</p></div>`;
  } else {
    allGamesEl.innerHTML = filtered.map(gameCard).join("");
  }
}

// =============== GAME CARDS ==================
function gameCard(g) {
  return `
    <div class="card">
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
  const score = (g.rating * 20) + g.popularity + (g.downloads / 10);
  return `
    <div class="card">
      <h3>#${idx + 1} ${g.name}</h3>
      <p>⭐ Rating: ${g.rating}</p>
      <p>📥 Downloads: ${g.downloads}M</p>
      <p>🔥 Popularity: ${g.popularity}%</p>
      <p>🏆 Score: ${score.toFixed(1)}</p>
      <button class="btn" onclick="openGame(${g.id})">View Details</button>
    </div>
  `;
}

function openGame(id) {
  window.location.href = `game.html?id=${id}`;
}

// =============== GAME DETAILS ==================
async function loadGameDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const res = await fetch(`${API}/games/${id}`);
  const g = await res.json();

  const score = (g.rating * 20) + g.popularity + (g.downloads / 10);

  const el = document.getElementById("gameDetails");
  if (!el) return;

  el.innerHTML = `
    <div class="card">
      <h1>${g.name}</h1>
      <p>🎮 Category: ${g.category}</p>
      <p>⭐ Rating: ${g.rating}</p>
      <p>📥 Downloads: ${g.downloads}M</p>
      <p>🔥 Popularity: ${g.popularity}%</p>
      <p>🏆 Ranking Score: ${score.toFixed(1)}</p>
      ${g.trending ? `<div class="badge">🔥 Trending</div>` : ""}
      <br><br>
      <button class="btn" onclick="goBack()">⬅ Back</button>
    </div>
  `;
}

function goBack() {
  window.history.back();
}

// =============== COMPARE PAGE ==================
async function loadComparePage() {
  const res = await fetch(`${API}/games`);
  const games = await res.json();

  const g1 = document.getElementById("game1");
  const g2 = document.getElementById("game2");

  if (g1) g1.innerHTML = games.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
  if (g2) g2.innerHTML = games.map(g => `<option value="${g.id}">${g.name}</option>`).join("");
}

async function compareGames() {
  const g1 = document.getElementById("game1").value;
  const g2 = document.getElementById("game2").value;

  const res = await fetch(`${API}/compare?g1=${g1}&g2=${g2}`);
  const data = await res.json();

  const { game1, game2 } = data;

  const el = document.getElementById("compareResult");
  if (!el) return;

  el.innerHTML = `${compareCard(game1)}${compareCard(game2)}`;
}

function compareCard(g) {
  const score = (g.rating * 20) + g.popularity + (g.downloads / 10);
  return `
    <div class="card">
      <h2>${g.name}</h2>
      <p>⭐ Rating: ${g.rating}</p>
      <p>🔥 Popularity: ${g.popularity}%</p>
      <p>📥 Downloads: ${g.downloads}M</p>
      <p>🎮 Category: ${g.category}</p>
      <p>🏆 Score: ${score.toFixed(1)}</p>
      <button class="btn" onclick="openGame(${g.id})">View Details</button>
    </div>
  `;
}

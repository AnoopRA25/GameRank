import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// ✅ Always read db.json from backend folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

const calcScore = (g) => (g.rating * 20) + g.popularity + (g.downloads / 10);

// ✅ Auto add images if missing
function ensureImages(game) {
  const safeName = encodeURIComponent(game.name);
  if (!game.image) game.image = `https://via.placeholder.com/400x240?text=${safeName}`;
  if (!game.banner) game.banner = `https://via.placeholder.com/1400x320?text=${safeName}`;
  return game;
}

// ✅ Initialize missing scores array
function ensureScores(db) {
  if (!db.scores) db.scores = [];
  return db;
}

// ---------------- AUTH ----------------
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  const db = ensureScores(readDB());

  if (db.users.find((u) => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  db.users.push({ id: Date.now(), username, password });
  writeDB(db);

  res.json({ message: "Registered successfully" });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const db = ensureScores(readDB());

  const user = db.users.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

 res.json({
  message: "Login success",
  user: {
    id: user.id,
    username: user.username,
    role: user.role || "user"
  }
});

});

// ---------------- GAMES ----------------
app.get("/api/games", (req, res) => {
  const db = ensureScores(readDB());
  res.json(db.games.map(ensureImages));
});

app.get("/api/games/trending", (req, res) => {
  const db = ensureScores(readDB());
  res.json(db.games.filter((g) => g.trending).map(ensureImages));
});

app.get("/api/games/ranked", (req, res) => {
  const db = ensureScores(readDB());
  const ranked = db.games
    .map((g) => ({ ...ensureImages(g), score: calcScore(g) }))
    .sort((a, b) => b.score - a.score);

  res.json(ranked);
});

// ✅ Pagination + search + filters + sorting
app.get("/api/games/paged", (req, res) => {
  const db = ensureScores(readDB());

  let {
    page = 1,
    limit = 10,
    search = "",
    category = "all",
    trending = "all",
    sortBy = "score"
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  let games = db.games.map((g) => ({ ...ensureImages(g), score: calcScore(g) }));

  if (search.trim() !== "") {
    const s = search.toLowerCase();
    games = games.filter((g) => g.name.toLowerCase().includes(s));
  }

  if (category !== "all") {
    games = games.filter((g) => g.category === category);
  }

  if (trending !== "all") {
    const isTrend = trending === "true";
    games = games.filter((g) => g.trending === isTrend);
  }

  if (sortBy === "name") {
    games.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    games.sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
  }

  const total = games.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const paged = games.slice(start, start + limit);

  res.json({ games: paged, total, page, limit, totalPages });
});

// ✅ Game detail (KEEP LAST)
app.get("/api/games/:id", (req, res) => {
  const db = ensureScores(readDB());
  const game = db.games.find((g) => g.id == req.params.id);
  if (!game) return res.status(404).json({ message: "Game not found" });

  res.json(ensureImages(game));
});

// ---------------- COMPARE ----------------
app.get("/api/compare", (req, res) => {
  const { g1, g2 } = req.query;
  const db = ensureScores(readDB());

  const game1 = db.games.find((g) => g.id == g1);
  const game2 = db.games.find((g) => g.id == g2);

  if (!game1 || !game2) return res.status(404).json({ message: "Games not found" });

  res.json({ game1: ensureImages(game1), game2: ensureImages(game2) });
});

// ---------------- ADMIN ----------------
// ✅ Add game
app.post("/api/admin/games", (req, res) => {
  const db = ensureScores(readDB());
  const newGame = ensureImages({ ...req.body, id: Date.now() });

  db.games.push(newGame);
  writeDB(db);

  res.json({ message: "Game added", game: newGame });
});

// ✅ Update game
app.put("/api/admin/games/:id", (req, res) => {
  const db = ensureScores(readDB());
  const id = req.params.id;

  const idx = db.games.findIndex((g) => g.id == id);
  if (idx === -1) return res.status(404).json({ message: "Game not found" });

  db.games[idx] = ensureImages({ ...db.games[idx], ...req.body });
  writeDB(db);

  res.json({ message: "Game updated", game: db.games[idx] });
});

// ✅ Delete game
app.delete("/api/admin/games/:id", (req, res) => {
  const db = ensureScores(readDB());
  const id = req.params.id;

  db.games = db.games.filter((g) => g.id != id);
  writeDB(db);

  res.json({ message: "Game deleted" });
});

// ---------------- LEADERBOARD ----------------
// ✅ Add score
app.post("/api/score", (req, res) => {
  const { username, gameId, points } = req.body;

  const db = ensureScores(readDB());
  db.scores.push({
    id: Date.now(),
    username,
    gameId: Number(gameId),
    points: Number(points)
  });

  writeDB(db);
  res.json({ message: "Score saved" });
});

// ✅ Global leaderboard
app.get("/api/leaderboard", (req, res) => {
  const db = ensureScores(readDB());

  const map = {};
  db.scores.forEach((s) => {
    map[s.username] = (map[s.username] || 0) + s.points;
  });

  const leaderboard = Object.entries(map)
    .map(([username, totalPoints]) => ({ username, totalPoints }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  res.json(leaderboard);
});

// ✅ Game leaderboard
app.get("/api/leaderboard/game/:id", (req, res) => {
  const db = ensureScores(readDB());
  const gid = Number(req.params.id);

  const leaderboard = db.scores
    .filter((s) => s.gameId === gid)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  res.json(leaderboard);
});

app.listen(PORT, () => {
  console.log(`✅ Backend running: http://localhost:${PORT}`);
  console.log("✅ Using DB file:", DB_FILE);
});

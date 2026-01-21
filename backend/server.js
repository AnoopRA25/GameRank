import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// ✅ Always read db.json from backend folder itself (Fixes wrong db issue)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "db.json");

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// ✅ Register
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  const exists = db.users.find((u) => u.username === username);
  if (exists) return res.status(400).json({ message: "User already exists" });

  const newUser = { id: Date.now(), username, password };
  db.users.push(newUser);
  writeDB(db);

  res.json({ message: "Registered successfully" });
});

// ✅ Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  const user = db.users.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ message: "Login success", user: { id: user.id, username: user.username } });
});

// ✅ Get all games
app.get("/api/games", (req, res) => {
  const db = readDB();
  res.json(db.games);
});

// ✅ Trending games ✅ MUST BE BEFORE :id
app.get("/api/games/trending", (req, res) => {
  const db = readDB();
  res.json(db.games.filter((g) => g.trending));
});

// ✅ Ranked games ✅ MUST BE BEFORE :id
app.get("/api/games/ranked", (req, res) => {
  const db = readDB();

  const ranked = db.games
    .map((g) => ({
      ...g,
      score: (g.rating * 20) + g.popularity + (g.downloads / 10)
    }))
    .sort((a, b) => b.score - a.score);

  res.json(ranked);
});

// ✅ Get single game detail ✅ KEEP THIS LAST
app.get("/api/games/:id", (req, res) => {
  const db = readDB();
  const game = db.games.find((g) => g.id == req.params.id);

  if (!game) return res.status(404).json({ message: "Game not found" });
  res.json(game);
});


// ✅ Compare
app.get("/api/compare", (req, res) => {
  const { g1, g2 } = req.query;
  const db = readDB();

  const game1 = db.games.find((g) => g.id == g1);
  const game2 = db.games.find((g) => g.id == g2);

  if (!game1 || !game2) return res.status(404).json({ message: "Games not found" });

  res.json({ game1, game2 });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running: http://localhost:${PORT}`);
  console.log("✅ Using DB file:", DB_FILE);
});

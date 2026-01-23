# 🎮 GameRank - Trending Games + Ranking + Compare (Full Stack)

GameRank is a simple full-stack web project built using **HTML, CSS, JavaScript (Frontend)** and **Node.js + Express (Backend)**.

It allows users to:
- Login / Register
- View Trending games
- View Ranked games (score based ranking)
- Search games
- Filter games by Category + Trending
- Sort games by score, rating, downloads, popularity
- Compare 2 games
- View details of a selected game

---

## 🚀 Features

✅ Authentication (Login/Register)  
✅ Trending Games section  
✅ Ranking System (Auto score-based)  
✅ Search + Filters + Sorting  
✅ Compare Games page  
✅ Game Detail Page  

---

## 🧩 Project Folder Structure

GameRank/
│
├── backend/
│ ├── server.js
│ ├── db.json
│ ├── package.json
│ └── node_modules/
│
├── frontend/
│ ├── index.html
│ ├── login.html
│ ├── register.html
│ ├── compare.html
│ ├── game.html
│ ├── styles.css
│ └── app.js
│
└── README.md


---

## ⚙️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)

### Backend
- Node.js
- Express.js
- CORS
- JSON file as database (`db.json`)

---

## ✅ How to Run the Project Locally

### 1️⃣ Start Backend (API Server)

Open CMD/Terminal:

```bash
cd backend
npm install
node server.js


Backend runs at:
👉 http://localhost:5000

Test API:
👉 http://localhost:5000/api/games

2️⃣ Run Frontend

✅ Recommended: Use VS Code Live Server

Open folder in VS Code

Install extension: Live Server

Right click frontend/login.html

Click Open with Live Server

Frontend URL example:
👉 http://127.0.0.1:5500/frontend/login.html

🔑 Default Login Credentials

Use this login (from db.json):

Username: adavirao

Password: 1234

Or create a new user from register page.

📌 Pages

/frontend/login.html → Login page

/frontend/register.html → Register page

/frontend/index.html → Home (Trending + Games list + Ranking)

/frontend/compare.html → Compare two games

/frontend/game.html?id=1 → Game details page

🏆 Ranking System

Games are ranked using a simple score:

score = (rating * 20) + popularity + (downloads / 10)


Higher score = higher ranking.

📷 Screenshots (Optional)

(Add your screenshots here after running project)

📌 Author

Created by Anoop R A

📜 License

This project is for educational purposes.


---

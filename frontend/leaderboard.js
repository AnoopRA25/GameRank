// leaderboard.js - global leaderboard loader

document.addEventListener("DOMContentLoaded", () => {
  loadLeaderboard();
});

async function loadLeaderboard() {
  const res = await fetch(`${API}/leaderboard`);
  const data = await res.json();

  const box = document.getElementById("leaderboardList");
  if (!box) return;

  if (!data.length) {
    box.innerHTML = `<div class="card">No scores yet. Play a game and add score!</div>`;
    return;
  }

  box.innerHTML = data.map((u, idx) => `
    <div class="card">
      <h3>#${idx + 1} ${u.username}</h3>
      <p>🏆 Total Points: ${u.totalPoints}</p>
    </div>
  `).join("");
}

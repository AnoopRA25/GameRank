// Small UI enhancements for index page: clear filters, animate cards, and quick stats
document.addEventListener('DOMContentLoaded', () => {

  // ✅ Clear filters button
  window.clearFilters = function () {
    const search = document.getElementById('searchInput');
    const cat = document.getElementById('categoryFilter');
    const trending = document.getElementById('trendingFilter');
    const sortBy = document.getElementById('sortBy');

    if (search) search.value = '';
    if (cat) cat.value = 'all';
    if (trending) trending.value = 'all';
    if (sortBy) sortBy.value = 'score';

    // call applyFilters only if available
    if (typeof applyFilters === "function") applyFilters();
  };

  // Wait for game cards to populate (loadHome loads them async)
  let attempts = 0;
  const maxAttempts = 40; // 4 seconds
  const iv = setInterval(() => {
    attempts++;

    const grids = document.querySelectorAll('.grid');

    if (grids.length && Array.from(grids).some(g => g.children.length > 0)) {
      animateCards();
      updateQuickStats();
      clearInterval(iv);
    }

    if (attempts >= maxAttempts) clearInterval(iv);
  }, 100);

  function animateCards() {
    const cards = document.querySelectorAll('.grid .card');

    cards.forEach((c, i) => {
      c.style.opacity = 0;
      c.style.transform = 'translateY(8px) scale(.995)';

      setTimeout(() => {
        c.classList.add('pop');
        c.style.opacity = '';
        c.style.transform = '';
      }, 60 * i);
    });
  }

  function updateQuickStats() {
    const all = document.getElementById('allGames');
    const tr = document.getElementById('trending');
    const rnk = document.getElementById('ranked');

    const totalGamesEl = document.getElementById('totalGames');
    const trendingCountEl = document.getElementById('trendingCount');
    const rankedCountEl = document.getElementById('rankedCount');

    if (totalGamesEl) totalGamesEl.textContent = all ? all.children.length : 0;
    if (trendingCountEl) trendingCountEl.textContent = tr ? tr.children.length : 0;
    if (rankedCountEl) rankedCountEl.textContent = rnk ? rnk.children.length : 0;
  }
});

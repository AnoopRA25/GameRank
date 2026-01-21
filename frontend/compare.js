document.addEventListener('DOMContentLoaded', () => {
  const compareBtn = document.getElementById('compareBtn');
  const msg = document.getElementById('compareMessage');
  const resultEl = document.getElementById('compareResult');

  function setMessage(text, type = 'error'){
    msg.textContent = text;
    msg.classList.toggle('success', type === 'success');
  }

  compareBtn.addEventListener('click', async () => {
    setMessage('');
    const g1 = document.getElementById('game1').value;
    const g2 = document.getElementById('game2').value;

    if(!g1 || !g2){
      setMessage('Please select two games to compare.');
      return;
    }
    if(g1 === g2){
      setMessage('Pick two different games.');
      return;
    }

    compareBtn.classList.add('loading');
    compareBtn.disabled = true;

    try{
      // call existing compareGames() from app.js which fills #compareResult
      if(typeof compareGames === 'function'){
        await compareGames();

        // small delay to allow DOM update
        setTimeout(()=>{
          highlightWinner();
        }, 120);
      } else {
        setMessage('Compare handler not found', 'error');
      }
    }catch(err){
      console.error(err);
      setMessage('Network error while comparing.');
    }finally{
      compareBtn.disabled = false;
      compareBtn.classList.remove('loading');
    }
  });

  function parseScore(cardEl){
    if(!cardEl) return -Infinity;
    const txt = cardEl.textContent || '';
    // Look for "Score:" and parse the number after it
    const m = txt.match(/Score:\s*([0-9]+(?:\.[0-9]+)?)/i);
    if(m) return parseFloat(m[1]);
    // fallback: try to find "Ranking Score"
    const m2 = txt.match(/Ranking Score:\s*([0-9]+(?:\.[0-9]+)?)/i);
    if(m2) return parseFloat(m2[1]);
    return -Infinity;
  }

  function highlightWinner(){
    const cards = Array.from(resultEl.querySelectorAll('.card'));
    if(cards.length < 2) return;
    const scores = cards.map(c => parseScore(c));
    // reset classes
    cards.forEach(c => { c.classList.remove('winner','loser'); });

    const [a,b] = scores;
    if(a === b){
      cards.forEach(c => c.classList.add('tie'));
      setMessage('It\'s a tie!', 'success');
      return;
    }

    const winnerIdx = a > b ? 0 : 1;
    cards[winnerIdx].classList.add('winner');
    cards[1 - winnerIdx].classList.add('loser');
    setMessage('Comparison complete', 'success');
  }
});

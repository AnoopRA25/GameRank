document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const toggle = document.getElementById('togglePassword');
  const btn = document.getElementById('loginBtn');
  const msg = document.getElementById('message');

  function setMessage(text, type = 'error'){
    msg.textContent = text;
    msg.classList.remove('success');
    if(type === 'success') msg.classList.add('success');
  }

  function clearMessage(){ msg.textContent = ''; msg.classList.remove('success'); }

  toggle.addEventListener('click', () => {
    const t = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', t);
    toggle.textContent = t === 'password' ? '👁️' : '🙈';
  });

  function validate(){
    clearMessage();
    if(!username.value || username.value.trim().length < 3){
      setMessage('Username must be at least 3 characters');
      username.classList.add('shake');
      setTimeout(()=>username.classList.remove('shake'),350);
      return false;
    }
    if(!password.value || password.value.length < 6){
      setMessage('Password must be at least 6 characters');
      password.classList.add('shake');
      setTimeout(()=>password.classList.remove('shake'),350);
      return false;
    }
    return true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if(!validate()) return;

    // UI: show loading
    btn.classList.add('loading');
    btn.disabled = true;

    try{
      // call existing global login() from app.js which performs the fetch and redirect
      if(typeof login === 'function'){
        await login(); // login() shows server message and redirects on success
        // If it didn't redirect, show success message
        setMessage('Signed in (response returned).', 'success');
      } else {
        setMessage('Login handler not found', 'error');
      }
    }catch(err){
      console.error(err);
      setMessage('Network error. Please try again.');
    }finally{
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  });
});

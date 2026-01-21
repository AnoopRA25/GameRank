document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const username = document.getElementById('username');
  const password = document.getElementById('password');
  const toggle = document.getElementById('togglePassword');
  const btn = document.getElementById('registerBtn');
  const msg = document.getElementById('message');

  function setMessage(text, type = 'error'){
    msg.textContent = text;
    msg.classList.toggle('success', type === 'success');
  }

  toggle && toggle.addEventListener('click', () => {
    const t = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', t);
    toggle.textContent = t === 'password' ? '👁️' : '🙈';
  });

  function validate(){
    setMessage('');
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

    btn.classList.add('loading');
    btn.disabled = true;

    try{
      if(typeof register === 'function'){
        await register();
        setMessage('Account created (server response shown).', 'success');
      } else {
        setMessage('Register handler not found');
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

/* Trang đăng nhập: đổi giao diện, đổi ngôn ngữ, kiểm tra dữ liệu, gửi đăng nhập. */
(() => {
  // ===== Cấu hình =====
  const NEXT_URL = 'index.html';        // trang chuyển tới sau khi đăng nhập thành công
  const THEME_KEY = 'theme';            // đổi cho khớp khóa mà js/components/theme.js đang dùng
  const LANG_KEY = 'lang';              // đổi cho khớp khóa mà js/components/lang-toggle.js đang dùng

  const T = {
    vi: {
      title: 'Đăng nhập', sub: 'Chào mừng bạn trở lại S Class', email: 'Tên đăng nhập', pass: 'Mật khẩu',
      emailPh: '', passPh: 'Nhập mật khẩu', remember: 'Ghi nhớ đăng nhập', forgot: 'Quên mật khẩu?',
      submit: 'Đăng nhập', busy: 'Đang đăng nhập...', show: 'Hiện mật khẩu', hide: 'Ẩn mật khẩu',
      theme: 'Đổi giao diện sáng hoặc tối', lang: 'Ngôn ngữ / Language',
      errEmail: 'Vui lòng nhập email hợp lệ.', errPass: 'Vui lòng nhập mật khẩu.',
      errFail: 'Email hoặc mật khẩu không đúng.', errServer: 'Chưa kết nối máy chủ đăng nhập.',
      page: 'Đăng nhập · S Class'
    },
    en: {
      title: 'Log in', sub: 'Welcome back to S Class', email: 'Username', pass: 'Password',
      emailPh: '', passPh: 'Enter your password', remember: 'Remember me', forgot: 'Forgot password?',
      submit: 'Log in', busy: 'Logging in...', show: 'Show password', hide: 'Hide password',
      theme: 'Switch light or dark theme', lang: 'Language',
      errEmail: 'Please enter a valid email.', errPass: 'Please enter your password.',
      errFail: 'Incorrect email or password.', errServer: 'The login server is not connected yet.',
      page: 'Log in · S Class'
    }
  };

  const $ = id => document.getElementById(id);
  const store = {
    get: k => { try { return localStorage.getItem(k) } catch (e) { return null } },
    set: (k, v) => { try { localStorage.setItem(k, v) } catch (e) {} }
  };
  let lang = store.get(LANG_KEY) === 'en' ? 'en' : 'vi';
  const t = k => T[lang][k];

  // ===== Ngôn ngữ =====
  function applyLang() {
    document.documentElement.lang = lang;
    document.title = t('page');
    document.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n) });
    document.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = t(e.dataset.i18nPh) });
    document.querySelectorAll('[data-aria]').forEach(e => {
      const k = e.dataset.aria;
      e.setAttribute('aria-label', k === 'show' ? t($('pass').type === 'password' ? 'show' : 'hide') : t(k));
    });
    document.querySelectorAll('#langTg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    if (!$('submit').disabled) $('submit').textContent = t('submit');
  }
  document.querySelectorAll('#langTg button').forEach(b => b.onclick = () => {
    lang = b.dataset.lang; store.set(LANG_KEY, lang); $('err').textContent = ''; applyLang();
  });

  // ===== Giao diện sáng / tối =====
  function setTheme(v) {
    document.documentElement.dataset.theme = v;
    $('tg').setAttribute('aria-pressed', v === 'dark');
  }
  const saved = store.get(THEME_KEY);
  setTheme(saved === 'dark' || saved === 'light' ? saved : (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
  $('tg').onclick = () => {
    const v = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(v); store.set(THEME_KEY, v);
  };

  // ===== Hiện / ẩn mật khẩu =====
  $('eye').onclick = () => {
    const show = $('pass').type === 'password';
    $('pass').type = show ? 'text' : 'password';
    $('eyeOn').hidden = show; $('eyeOff').hidden = !show;
    $('eye').setAttribute('aria-pressed', show);
    $('eye').setAttribute('aria-label', t(show ? 'hide' : 'show'));
  };

  // ===== Đăng nhập =====
  // TODO: nối với máy chủ thật. Hàm này phải ném lỗi (throw) nếu đăng nhập thất bại.
  // Ví dụ:
  //   const r = await fetch('/api/login', {method:'POST', headers:{'Content-Type':'application/json'},
  //     body: JSON.stringify({email, password, remember})});
  //   if (!r.ok) throw new Error('invalid');
  async function authenticate(email, password, remember) {
    throw new Error('not-implemented');
  }

  function fail(msg, field) {
    $('err').textContent = msg;
    ['email', 'pass'].forEach(id => $(id).removeAttribute('aria-invalid'));
    if (field) { $(field).setAttribute('aria-invalid', 'true'); $(field).focus() }
  }

  $('form').addEventListener('submit', async e => {
    e.preventDefault();
    const email = $('email').value.trim(), pass = $('pass').value;
    if (!email) return fail(t('errEmail'), 'email');
    if (!pass) return fail(t('errPass'), 'pass');
    fail('');
    $('submit').disabled = true; $('submit').textContent = t('busy');
    try {
      await authenticate(email, pass, $('remember').checked);
      location.href = NEXT_URL;
    } catch (err) {
      fail(t(err.message === 'not-implemented' ? 'errServer' : 'errFail'));
    } finally {
      $('submit').disabled = false; $('submit').textContent = t('submit');
    }
  });

  applyLang();
})();

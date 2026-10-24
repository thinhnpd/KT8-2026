/* Trang đăng nhập: đổi giao diện, đổi ngôn ngữ, kiểm tra dữ liệu, gửi đăng nhập. */
(() => {
  // ===== Cấu hình =====
  const NEXT_URL = '../index.html';        // trang chuyển tới sau khi đăng nhập thành công
  const THEME_KEY = 'theme';            // đổi cho khớp khóa mà js/components/theme.js đang dùng
  const LANG_KEY = 'sclass.lang';       // khóa của js/i18n/engine.js: đổi ngôn ngữ ở đây cũng áp dụng cho trang chủ
  

  const T = {
    vi: {
      title: 'Đăng nhập', sub: 'Chào mừng bạn trở lại S Class', email: 'Tên đăng nhập', pass: 'Mật khẩu',
      emailPh: '', passPh: 'Nhập mật khẩu', remember: 'Ghi nhớ đăng nhập', forgot: 'Quên mật khẩu?',
      submit: 'Đăng nhập', busy: 'Đang đăng nhập...', show: 'Hiện mật khẩu', hide: 'Ẩn mật khẩu',
      theme: 'Đổi giao diện sáng hoặc tối', lang: 'Ngôn ngữ / Language',
      errEmail: 'Vui lòng nhập tên đăng nhập.', errPass: 'Vui lòng nhập mật khẩu.',
      errFail: 'Tên đăng nhập hoặc mật khẩu không đúng.', errServer: 'Không kết nối được máy chủ. Vui lòng thử lại.', errSetup: 'Hệ thống chưa được cấu hình đúng (thiếu api.js hoặc supabase-config.js). Nhấn F12 để xem chi tiết.', errUnconfirmed: 'Tài khoản chưa được xác nhận. Hãy tắt "Confirm email" trong Supabase rồi đăng ký lại.',
      noacct: 'Chưa có tài khoản?', signup: 'Đăng ký quản trị lớp',
      page: 'Đăng nhập · S Class'
    },
    en: {
      title: 'Log in', sub: 'Welcome back to S Class', email: 'Username', pass: 'Password',
      emailPh: '', passPh: 'Enter your password', remember: 'Remember me', forgot: 'Forgot password?',
      submit: 'Log in', busy: 'Logging in...', show: 'Show password', hide: 'Hide password',
      theme: 'Switch light or dark theme', lang: 'Language',
      errEmail: 'Please enter your username.', errPass: 'Please enter your password.',
      errFail: 'Incorrect username or password.', errServer: 'Cannot reach the server. Please try again.', errSetup: 'The system is not configured correctly (api.js or supabase-config.js is missing). Press F12 for details.', errUnconfirmed: 'This account is not confirmed. Turn off "Confirm email" in Supabase and sign up again.',
      noacct: 'No account yet?', signup: 'Class admin sign-up',
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
  // Đăng nhập qua Supabase (js/data/api.js). Ném lỗi 'invalid' nếu sai tên/mật khẩu, 'network' nếu không kết nối được.
  async function authenticate(username, password, remember) {
    API.setRemember(remember);
    await API.signIn(username, password);
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
      console.error('[login]', err);
      const broken = typeof API === 'undefined' || (typeof SB_ERROR !== 'undefined' && SB_ERROR);
      fail(t(broken ? 'errSetup' : err.message === 'invalid' ? 'errFail' : err.message === 'unconfirmed' ? 'errUnconfirmed' : 'errServer'));
    } finally {
      $('submit').disabled = false; $('submit').textContent = t('submit');
    }
  });
  // Đã đăng nhập sẵn thì vào thẳng trang chủ
  if (typeof API !== 'undefined') API.session().then(s => { if (s) location.replace(NEXT_URL); }).catch(() => {});
  applyLang();
})();

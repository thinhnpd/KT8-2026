/* Trang đăng ký quản trị lớp: kiểm tra dữ liệu, kiểm tra mã lớp, tạo tài khoản. */
(() => {
  // ===== Cấu hình =====
  const NEXT_URL = '../index.html';     // trang chuyển tới sau khi đăng ký xong
  const AUTH_KEY = 'sclass_auth';       // phải trùng với login.js và index.html
  const THEME_KEY = 'theme';            // đổi cho khớp khóa của js/components/theme.js
  const LANG_KEY = 'sclass.lang';       // khóa của js/i18n/engine.js (đổi ngôn ngữ ở đây cũng áp dụng cho trang chủ)

  const T = {
    vi: {
      page: 'Đăng ký quản trị lớp · S Class', title: 'Đăng ký', sub: 'Dành cho quản trị viên lớp',
      user: 'Tên đăng nhập', pass: 'Mật khẩu', pass2: 'Xác nhận mật khẩu', passPh: 'Ít nhất 8 ký tự',
      sec: 'Xác nhận quản trị lớp: nhập tên lớp và mã lớp do nhà trường cung cấp.',
      cls: 'Tên lớp', clsPh: 'Ví dụ: 10A5', code: 'Mã lớp', submit: 'Tạo tài khoản', have: 'Đã có tài khoản?', login: 'Đăng nhập',
      show: 'Hiện mật khẩu', hide: 'Ẩn mật khẩu', theme: 'Đổi giao diện sáng hoặc tối', lang: 'Ngôn ngữ / Language',
      busy: 'Đang tạo tài khoản...', ok: 'Tạo tài khoản thành công. Đang chuyển vào trang chủ...',
      eUser: 'Tên đăng nhập gồm 3–30 ký tự: chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.',
      eTaken: 'Tên đăng nhập đã được sử dụng.', ePass: 'Mật khẩu cần ít nhất 8 ký tự.',
      eMatch: 'Mật khẩu xác nhận không khớp.', eCls: 'Vui lòng nhập tên lớp.', eCode: 'Vui lòng nhập mã lớp.',
      eBad: 'Mã lớp không đúng hoặc không khớp với tên lớp.', eSave: 'Không thể lưu tài khoản trên trình duyệt này.'
    },
    en: {
      page: 'Class admin sign-up · S Class', title: 'Sign up', sub: 'For class administrators only',
      user: 'Username', pass: 'Password', pass2: 'Confirm password', passPh: 'At least 8 characters',
      sec: 'Class admin verification: enter the class name and the class code provided by the school.',
      cls: 'Class name', clsPh: 'Example: 10A5', code: 'Class code', submit: 'Create account', have: 'Already have an account?', login: 'Log in',
      show: 'Show password', hide: 'Hide password', theme: 'Switch light or dark theme', lang: 'Language',
      busy: 'Creating account...', ok: 'Account created. Taking you to the homepage...',
      eUser: 'Username must be 3–30 characters: letters, digits, dots, underscores or hyphens.',
      eTaken: 'This username is already taken.', ePass: 'Password must be at least 8 characters.',
      eMatch: 'The passwords do not match.', eCls: 'Please enter the class name.', eCode: 'Please enter the class code.',
      eBad: 'The class code is incorrect or does not match the class name.', eSave: 'Could not save the account in this browser.'
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
      e.setAttribute('aria-label', k === 'show' ? t($(e.dataset.eye).type === 'password' ? 'show' : 'hide') : t(k));
    });
    document.querySelectorAll('#langTg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    if (!$('submit').disabled) $('submit').textContent = t('submit');
  }
  document.querySelectorAll('#langTg button').forEach(b => b.onclick = () => {
    lang = b.dataset.lang; store.set(LANG_KEY, lang); $('err').textContent = ''; $('err').classList.remove('lg-ok'); applyLang();
  });

  // ===== Giao diện sáng / tối =====
  function setTheme(v) { document.documentElement.dataset.theme = v; $('tg').setAttribute('aria-pressed', v === 'dark'); }
  const saved = store.get(THEME_KEY);
  setTheme(saved === 'dark' || saved === 'light' ? saved : (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'));
  $('tg').onclick = () => { const v = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; setTheme(v); store.set(THEME_KEY, v); };

  // ===== Hiện / ẩn mật khẩu (hai ô) =====
  document.querySelectorAll('[data-eye]').forEach(btn => btn.onclick = () => {
    const inp = $(btn.dataset.eye), show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    btn.querySelector('.eOn').hidden = show; btn.querySelector('.eOff').hidden = !show;
    btn.setAttribute('aria-pressed', show); btn.setAttribute('aria-label', t(show ? 'hide' : 'show'));
  });

  // ===== Đăng ký =====
  function fail(key, field) {
    const e = $('err'); e.classList.remove('lg-ok'); e.textContent = key ? t(key) : '';
    ['user', 'pass', 'pass2', 'cls', 'code'].forEach(id => $(id).removeAttribute('aria-invalid'));
    if (field) { $(field).setAttribute('aria-invalid', 'true'); $(field).focus(); }
    return false;
  }

  $('form').addEventListener('submit', async e => {
    e.preventDefault();
    const user = $('user').value.trim(), pass = $('pass').value, pass2 = $('pass2').value,
          cls = $('cls').value.trim(), code = $('code').value.trim();
    if (!/^[\w.\-]{3,30}$/.test(user)) return fail('eUser', 'user');
    if (AuthStore.isTaken(user)) return fail('eTaken', 'user');
    if (pass.length < 8) return fail('ePass', 'pass');
    if (pass2 !== pass) return fail('eMatch', 'pass2');
    if (!cls) return fail('eCls', 'cls');
    if (!code) return fail('eCode', 'code');
    if (!AuthStore.checkClass(cls, code)) return fail('eBad', 'code');
    fail('');
    $('submit').disabled = true; $('submit').textContent = t('busy');
    try {
      await AuthStore.add(user, pass, cls);
      try { sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user: user, cls: cls, t: Date.now() })); } catch (x) {}
      $('err').classList.add('lg-ok'); $('err').textContent = t('ok');
      setTimeout(() => { location.href = NEXT_URL; }, 900);
    } catch (err) {
      fail('eSave');
      $('submit').disabled = false; $('submit').textContent = t('submit');
    }
  });

  applyLang();
})();

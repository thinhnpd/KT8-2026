/* Trang đăng ký quản trị lớp: kiểm tra dữ liệu, kiểm tra mã lớp, tạo tài khoản. */
(() => {
  // ===== Cấu hình =====
  const NEXT_URL = '../index.html';     // trang chuyển tới sau khi đăng ký xong
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
      eBad: 'Mã lớp không đúng hoặc không khớp với tên lớp.', eSave: 'Không thể tạo tài khoản. Vui lòng kiểm tra kết nối và thử lại.',
      eSetup: 'Hệ thống chưa được cấu hình đúng (thiếu api.js hoặc supabase-config.js). Nhấn F12 để xem chi tiết.',
      eNetwork: 'Không kết nối được tới Supabase. Kiểm tra URL trong supabase-config.js và kết nối mạng.',
      eKey: 'Khóa API không hợp lệ. Kiểm tra khóa trong supabase-config.js (dùng khóa anon/publishable, không dùng secret).',
      eSchema: 'Cơ sở dữ liệu chưa được tạo. Hãy chạy schema.sql trong Supabase (SQL Editor) rồi thử lại.',
      eDisabled: 'Supabase đang tắt việc tạo tài khoản mới. Bật lại trong Authentication > Sign In / Providers.',
      eRate: 'Supabase đang giới hạn việc gửi email xác nhận. Hãy tắt "Confirm email" (Authentication > Providers > Email) rồi thử lại sau ít phút.',
      eEmail: 'Supabase từ chối địa chỉ email giả. Đổi emailDomain trong supabase-config.js sang tên miền của bạn.',
      eSession: 'Tài khoản đã được tạo nhưng chưa đăng nhập được. Hãy tắt "Confirm email" trong Supabase (Authentication > Providers > Email), xóa tài khoản thử trong Authentication > Users rồi đăng ký lại.'
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
      eBad: 'The class code is incorrect or does not match the class name.', eSave: 'Could not create the account. Check your connection and try again.',
      eSetup: 'The system is not configured correctly (api.js or supabase-config.js is missing). Press F12 for details.',
      eNetwork: 'Cannot reach Supabase. Check the URL in supabase-config.js and your connection.',
      eKey: 'Invalid API key. Check the key in supabase-config.js (use the anon/publishable key, not the secret one).',
      eSchema: 'The database has not been created. Run schema.sql in Supabase (SQL Editor) and try again.',
      eDisabled: 'Supabase has new sign-ups turned off. Turn them on under Authentication > Sign In / Providers.',
      eRate: 'Supabase is limiting confirmation emails. Turn off "Confirm email" (Authentication > Providers > Email) and try again in a few minutes.',
      eEmail: 'Supabase rejected the placeholder email. Change emailDomain in supabase-config.js to a domain you own.',
      eSession: 'The account was created but could not be signed in. Turn off "Confirm email" in Supabase (Authentication > Providers > Email), delete the test user under Authentication > Users, then sign up again.'
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
    if (pass.length < 8) return fail('ePass', 'pass');
    if (pass2 !== pass) return fail('eMatch', 'pass2');
    if (!cls) return fail('eCls', 'cls');
    if (!code) return fail('eCode', 'code');
    fail('');
    $('submit').disabled = true; $('submit').textContent = t('busy');
    try {
      API.setRemember(true);
      // Kiểm tra mã lớp, tạo tài khoản và gắn vào lớp đều diễn ra ở máy chủ (js/data/api.js + db/schema.sql)
      await API.signUpAdmin({ username: user, password: pass, fullName: '', className: cls, code: code });
      $('err').classList.add('lg-ok'); $('err').textContent = t('ok');
      setTimeout(() => { location.href = NEXT_URL; }, 900);
    } catch (err) {
      console.error('[signup]', err);
      const broken = typeof API === 'undefined' || (typeof SB_ERROR !== 'undefined' && SB_ERROR);
      const MAP = { bad_class_code: 'eBad', taken: 'eTaken', network: 'eNetwork', bad_key: 'eKey', no_schema: 'eSchema',
        signup_disabled: 'eDisabled', rate_limit: 'eRate', bad_email: 'eEmail', no_session: 'eSession' };
      const k = broken ? 'eSetup' : (MAP[err.message] || 'eSave');
      fail(k, k === 'eBad' ? 'code' : k === 'eTaken' ? 'user' : null);
      if (k === 'eSave') $('err').textContent += ' [' + String(err.detail || err.message || err).slice(0, 160) + ']';   // lý do kỹ thuật, để dễ tìm lỗi
      $('submit').disabled = false; $('submit').textContent = t('submit');
    }
  });

  applyLang();
})();

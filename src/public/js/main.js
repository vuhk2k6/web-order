const authState = {
  currentUser: null
};

const handleScrollToReservation = () => {
  const reservationSection = document.getElementById('reservation');

  if (!reservationSection) {
    return;
  }

  reservationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const formatCurrencyVnd = (value) => {
  if (!value) {
    return '';
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return value;
  }

  return `${numberValue.toLocaleString('vi-VN')} đ`;
};

const createMenuCard = (item) => {
  const card = document.createElement('article');
  card.className =
    'group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm transition hover:border-amber-400/60 hover:bg-slate-900/90 focus-within:border-amber-400 focus-within:bg-slate-900/90';
  card.tabIndex = 0;
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', item.name);

  const imageWrapper = document.createElement('div');
  imageWrapper.className =
    'mb-3 flex h-32 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_top,_#fbbf24,_#020617_60%)]';

  const title = document.createElement('h3');
  title.className = 'text-sm font-semibold text-slate-50';
  title.textContent = item.name;

  const price = document.createElement('p');
  price.className = 'mt-1 text-sm font-semibold text-amber-400';
  price.textContent = formatCurrencyVnd(item.price);

  const description = document.createElement('p');
  description.className = 'mt-2 text-xs text-slate-300';
  description.textContent = item.description || 'Món ăn đặc biệt của nhà hàng.';

  card.appendChild(imageWrapper);
  card.appendChild(title);
  card.appendChild(price);
  card.appendChild(description);

  return card;
};

const renderMenuList = (menuItems) => {
  const menuList = document.getElementById('menu-list');
  const menuEmpty = document.getElementById('menu-empty');

  if (!menuList || !menuEmpty) {
    return;
  }

  menuList.innerHTML = '';

  if (!menuItems || menuItems.length === 0) {
    menuEmpty.classList.remove('hidden');
    return;
  }

  menuEmpty.classList.add('hidden');

  menuItems.forEach((item) => {
    const card = createMenuCard(item);
    menuList.appendChild(card);
  });
};

const fetchMenu = async () => {
  try {
    const response = await fetch('/api/menu');

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('Không thể tải thực đơn');
      return;
    }

    const data = await response.json();
    renderMenuList(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Lỗi khi tải thực đơn', error);
  }
};

const handleSubmitReservation = (event) => {
  event.preventDefault();

  const nameInput = document.getElementById('name');
  const phoneInput = document.getElementById('phone');
  const guestsInput = document.getElementById('guests');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const messageElement = document.getElementById('reservation-message');

  if (
    !nameInput ||
    !phoneInput ||
    !guestsInput ||
    !dateInput ||
    !timeInput ||
    !messageElement
  ) {
    return;
  }

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const guests = guestsInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;

  if (!name || !phone || !guests || !date || !time) {
    messageElement.textContent = 'Vui lòng điền đầy đủ thông tin đặt bàn.';
    messageElement.className = 'text-xs text-rose-400';
    return;
  }

  messageElement.textContent =
    'Cảm ơn bạn! Chúng tôi đã ghi nhận yêu cầu và sẽ liên hệ xác nhận trong thời gian sớm nhất.';
  messageElement.className = 'text-xs text-emerald-400';

  window.setTimeout(() => {
    const form = document.getElementById('reservation-form');
    if (form) {
      form.reset();
    }
  }, 500);
};

const initializeFooterYear = () => {
  const yearElement = document.getElementById('footer-year');

  if (!yearElement) {
    return;
  }

  yearElement.textContent = new Date().getFullYear().toString();
};

const setAuthLoadingState = (button, isLoading) => {
  if (!button) {
    return;
  }

  if (isLoading) {
    button.disabled = true;
    button.textContent = 'Đang xử lý...';
  } else {
    button.disabled = false;
  }
};

const updateAuthUi = (user) => {
  authState.currentUser = user;
  const authOpenButton = document.getElementById('auth-open-button');

  if (!authOpenButton) {
    return;
  }

  if (user) {
    const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';
    authOpenButton.innerHTML = '';
    const avatarSpan = document.createElement('span');
    avatarSpan.className = 'auth-avatar-circle';
    avatarSpan.textContent = initial;
    authOpenButton.appendChild(avatarSpan);
    authOpenButton.setAttribute('aria-label', 'Xem trang cá nhân của bạn');
  } else {
    authOpenButton.textContent = 'Đăng nhập';
    authOpenButton.setAttribute(
      'aria-label',
      'Đăng nhập hoặc đăng ký tài khoản'
    );
  }
};

const openAuthModal = () => {
  const overlay = document.getElementById('auth-modal-overlay');

  if (!overlay) {
    return;
  }

  overlay.style.display = 'flex';
};

const closeAuthModal = () => {
  const overlay = document.getElementById('auth-modal-overlay');

  if (!overlay) {
    return;
  }

  overlay.style.display = 'none';
};

const switchAuthTab = (mode) => {
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  const loginForm = document.getElementById('auth-form-login');
  const registerForm = document.getElementById('auth-form-register');

  if (!loginTab || !registerTab || !loginForm || !registerForm) {
    return;
  }

  const isLogin = mode === 'login';

  loginTab.classList.toggle('active', isLogin);
  registerTab.classList.toggle('active', !isLogin);
  loginTab.setAttribute('aria-selected', isLogin ? 'true' : 'false');
  registerTab.setAttribute('aria-selected', !isLogin ? 'true' : 'false');

  loginForm.style.display = isLogin ? 'grid' : 'none';
  registerForm.style.display = !isLogin ? 'grid' : 'none';
};

const fetchCurrentUser = async () => {
  try {
    const response = await fetch('/auth/me', {
      credentials: 'same-origin'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.user || null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Lỗi khi kiểm tra trạng thái đăng nhập', error);
    return null;
  }
};

const handleAuthLoginSubmit = async (event) => {
  event.preventDefault();

  const phoneInput = document.getElementById('auth-login-phone');
  const passwordInput = document.getElementById('auth-login-password');
  const messageElement = document.getElementById('auth-message');
  const submitButton = document.getElementById('auth-login-submit');

  if (!phoneInput || !passwordInput || !messageElement || !submitButton) {
    return;
  }

  const phone = phoneInput.value.trim();
  const password = passwordInput.value.trim();

  if (!phone || !password) {
    messageElement.textContent = 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
    return;
  }

  setAuthLoadingState(submitButton, true);
  messageElement.style.display = 'none';

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ phone, password })
    });

    const data = await response.json();

    if (!response.ok) {
      messageElement.textContent = data.message || 'Đăng nhập thất bại.';
      messageElement.className = 'auth-error';
      messageElement.style.display = 'block';
      return;
    }

    messageElement.textContent = 'Đăng nhập thành công.';
    messageElement.className = 'auth-success';
    messageElement.style.display = 'block';

    updateAuthUi(data.user);

    window.setTimeout(() => {
      closeAuthModal();
    }, 600);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Lỗi khi đăng nhập', error);
    messageElement.textContent = 'Đăng nhập thất bại. Vui lòng thử lại sau.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
  } finally {
    setAuthLoadingState(submitButton, false);
    submitButton.textContent = 'Đăng nhập';
  }
};

const handleAuthRegisterSubmit = async (event) => {
  event.preventDefault();

  const nameInput = document.getElementById('auth-register-name');
  const phoneInput = document.getElementById('auth-register-phone');
  const emailInput = document.getElementById('auth-register-email');
  const passwordInput = document.getElementById('auth-register-password');
  const messageElement = document.getElementById('auth-message');
  const submitButton = document.getElementById('auth-register-submit');

  if (
    !nameInput ||
    !phoneInput ||
    !emailInput ||
    !passwordInput ||
    !messageElement ||
    !submitButton
  ) {
    return;
  }

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!name || !phone || !password) {
    messageElement.textContent =
      'Họ tên, số điện thoại và mật khẩu là bắt buộc.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
    return;
  }

  setAuthLoadingState(submitButton, true);
  messageElement.style.display = 'none';

  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ name, phone, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      messageElement.textContent =
        data.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.';
      messageElement.className = 'auth-error';
      messageElement.style.display = 'block';
      return;
    }

    messageElement.textContent =
      'Đăng ký thành công. Bạn đã được đăng nhập tự động.';
    messageElement.className = 'auth-success';
    messageElement.style.display = 'block';

    updateAuthUi(data.user);

    window.setTimeout(() => {
      closeAuthModal();
    }, 800);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Lỗi khi đăng ký', error);
    messageElement.textContent =
      'Không thể đăng ký tài khoản. Vui lòng thử lại sau.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
  } finally {
    setAuthLoadingState(submitButton, false);
    submitButton.textContent = 'Đăng ký';
  }
};

const initializeHomePage = () => {
  const ctaReservationButton = document.getElementById('cta-reservation');
  const reservationForm = document.getElementById('reservation-form');
  const authOpenButton = document.getElementById('auth-open-button');
  const authCloseButton = document.getElementById('auth-close-button');
  const authOverlay = document.getElementById('auth-modal-overlay');
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  const loginForm = document.getElementById('auth-form-login');
  const registerForm = document.getElementById('auth-form-register');

  if (ctaReservationButton) {
    ctaReservationButton.addEventListener('click', handleScrollToReservation);
    ctaReservationButton.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        handleScrollToReservation();
      }
    });
  }

  if (reservationForm) {
    reservationForm.addEventListener('submit', handleSubmitReservation);
  }

  if (authOpenButton) {
    authOpenButton.addEventListener('click', () => {
      if (authState.currentUser) {
        window.location.href = '/profile';
      } else {
        switchAuthTab('login');
        openAuthModal();
      }
    });
  }

  if (authCloseButton) {
    authCloseButton.addEventListener('click', closeAuthModal);
  }

  if (authOverlay) {
    authOverlay.addEventListener('click', (event) => {
      if (event.target === authOverlay) {
        closeAuthModal();
      }
    });
  }

  if (loginTab && registerTab && loginForm && registerForm) {
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    registerTab.addEventListener('click', () => switchAuthTab('register'));
  }

  const loginSubmitButton = document.getElementById('auth-login-submit');
  const registerSubmitButton = document.getElementById('auth-register-submit');

  if (loginForm && loginSubmitButton) {
    loginForm.addEventListener('submit', handleAuthLoginSubmit);
  }

  if (registerForm && registerSubmitButton) {
    registerForm.addEventListener('submit', handleAuthRegisterSubmit);
  }

  fetchCurrentUser().then((user) => {
    updateAuthUi(user);
  });

  initializeFooterYear();
  fetchMenu();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHomePage);
} else {
  initializeHomePage();
}



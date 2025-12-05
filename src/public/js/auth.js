/* eslint-disable no-console */
const authState = {
  currentUser: null
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
    console.error('Lỗi khi kiểm tra trạng thái đăng nhập', error);
    return null;
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
  overlay.setAttribute('aria-hidden', 'false');
};

const closeAuthModal = () => {
  const overlay = document.getElementById('auth-modal-overlay');

  if (!overlay) {
    return;
  }

  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
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
      window.location.reload();
    }, 600);
  } catch (error) {
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
      window.location.reload();
    }, 800);
  } catch (error) {
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

const initializeAuthModal = () => {
  const authOpenButton = document.getElementById('auth-open-button');
  const authCloseButton = document.getElementById('auth-close-button');
  const authOverlay = document.getElementById('auth-modal-overlay');
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  const loginForm = document.getElementById('auth-form-login');
  const registerForm = document.getElementById('auth-form-register');

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
};

const initializeAuth = async () => {
  const user = await fetchCurrentUser();
  updateAuthUi(user);
  initializeAuthModal();
};

if (typeof window !== 'undefined') {
  window.authState = authState;
  window.fetchCurrentUser = fetchCurrentUser;
  window.updateAuthUi = updateAuthUi;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.switchAuthTab = switchAuthTab;
  window.initializeAuth = initializeAuth;
  window.initializeAuthModal = initializeAuthModal;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
  } else {
    initializeAuth();
  }
}


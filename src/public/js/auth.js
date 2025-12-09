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
    const userPayload =
      data?.user ||
      data?.customer ||
      data?.member ||
      data?.data ||
      null;

    if (!userPayload) {
      return null;
    }

    // Chuẩn hóa tên hiển thị: ưu tiên name, fullname, firstname + lastname, sau đó phone/email
    const {
      name,
      fullname,
      fullName,
      firstname,
      firstName,
      lastname,
      lastName,
      phone,
      email
    } = userPayload;

    const displayName =
      name ||
      fullname ||
      fullName ||
      [firstname || firstName, lastname || lastName].filter(Boolean).join(' ').trim() ||
      phone ||
      email ||
      '';

    return { ...userPayload, name: displayName };
  } catch (error) {
    // eslint-disable-next-line no-console
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
    const nameSource =
      user.name ||
      user.fullname ||
      user.fullName ||
      [user.firstname || user.firstName, user.lastname || user.lastName].filter(Boolean).join(' ').trim() ||
      user.phone ||
      user.email ||
      '';

    const initial = nameSource ? nameSource.trim().charAt(0).toUpperCase() : 'U';

    authOpenButton.innerHTML = '';
    const avatarSpan = document.createElement('span');
    avatarSpan.className = 'auth-avatar-circle';
    avatarSpan.textContent = initial;
    authOpenButton.appendChild(avatarSpan);
    authOpenButton.setAttribute('aria-label', 'Xem trang cá nhân của bạn');
  } else {
    authOpenButton.innerHTML = `
      <span class="btn-login-text">Đăng nhập</span>
      <span class="btn-login-separator">/</span>
      <span class="btn-login-text">Đăng ký</span>
    `;
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

const setAuthLoadingState = (button, isLoading, originalText) => {
  if (!button) {
    return;
  }

  if (isLoading) {
    button.disabled = true;
    button.textContent = 'Đang xử lý...';
    button.style.opacity = '0.7';
    button.style.cursor = 'not-allowed';
  } else {
    button.disabled = false;
    button.textContent = originalText || button.textContent;
    button.style.opacity = '1';
    button.style.cursor = 'pointer';
  }
};

const validatePhone = (phone) => {
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
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

  // Clear previous errors
  phoneInput.classList.remove('form-input-error');
  passwordInput.classList.remove('form-input-error');
  messageElement.style.display = 'none';

  // Validation
  if (!phone || !password) {
    messageElement.textContent = 'Vui lòng nhập đầy đủ số điện thoại và mật khẩu.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
    if (!phone) phoneInput.classList.add('form-input-error');
    if (!password) passwordInput.classList.add('form-input-error');
    return;
  }

  if (!validatePhone(phone)) {
    messageElement.textContent = 'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0901234567).';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
    phoneInput.classList.add('form-input-error');
    phoneInput.focus();
    return;
  }

  setAuthLoadingState(submitButton, true, 'Đăng nhập');

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
      messageElement.textContent = data.message || 'Số điện thoại hoặc mật khẩu không đúng.';
      messageElement.className = 'auth-error';
      messageElement.style.display = 'block';
      phoneInput.classList.add('form-input-error');
      passwordInput.classList.add('form-input-error');
      passwordInput.value = '';
      passwordInput.focus();
      return;
    }

    messageElement.textContent = 'Đăng nhập thành công!';
    messageElement.className = 'auth-success';
    messageElement.style.display = 'block';

    updateAuthUi(data.user);

    // Reset form
    phoneInput.value = '';
    passwordInput.value = '';

    // Check if we're on checkout page
    const isCheckoutPage = window.location.pathname.includes('/checkout');
    
    window.setTimeout(async () => {
      closeAuthModal();
      
      if (isCheckoutPage && typeof window.updateCheckoutAfterLogin === 'function') {
        // Update checkout state without reloading
        try {
          await window.updateCheckoutAfterLogin();
          console.log('[Auth] Checkout state updated after login');
        } catch (error) {
          console.error('[Auth] Error updating checkout state:', error);
          // Fallback to reload if update fails
          window.location.reload();
        }
      } else {
        // Reload page for other pages
        window.location.reload();
      }
    }, 800);
  } catch (error) {
    console.error('Lỗi khi đăng nhập', error);
    messageElement.textContent = 'Đăng nhập thất bại. Vui lòng kiểm tra kết nối và thử lại.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
  } finally {
    setAuthLoadingState(submitButton, false, 'Đăng nhập');
  }
};

const handleAuthRegisterSubmit = async (event) => {
  event.preventDefault();

  const phoneInput = document.getElementById('auth-register-phone');
  const lastnameInput = document.getElementById('auth-register-lastname');
  const firstnameInput = document.getElementById('auth-register-firstname');
  const emailInput = document.getElementById('auth-register-email');
  const passwordInput = document.getElementById('auth-register-password');
  const confirmPasswordInput = document.getElementById('auth-register-confirm-password');
  const messageElement = document.getElementById('auth-message');
  const submitButton = document.getElementById('auth-register-submit');

  if (
    !phoneInput ||
    !lastnameInput ||
    !firstnameInput ||
    !emailInput ||
    !passwordInput ||
    !confirmPasswordInput ||
    !messageElement ||
    !submitButton
  ) {
    return;
  }

  const phone = phoneInput.value.trim();
  const lastname = lastnameInput.value.trim();
  const firstname = firstnameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  const name = `${lastname} ${firstname}`.trim();

  // Clear previous errors
  phoneInput.classList.remove('form-input-error');
  lastnameInput.classList.remove('form-input-error');
  firstnameInput.classList.remove('form-input-error');
  emailInput.classList.remove('form-input-error');
  passwordInput.classList.remove('form-input-error');
  confirmPasswordInput.classList.remove('form-input-error');
  messageElement.style.display = 'none';

  // Validation
  if (!phone || !lastname || !firstname || !password || !confirmPassword) {
    messageElement.textContent = 'Vui lòng điền đầy đủ thông tin bắt buộc.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
    if (!phone) phoneInput.classList.add('form-input-error');
    if (!lastname) lastnameInput.classList.add('form-input-error');
    if (!firstname) firstnameInput.classList.add('form-input-error');
    if (!password) passwordInput.classList.add('form-input-error');
    if (!confirmPassword) confirmPasswordInput.classList.add('form-input-error');
    return;
  }

  if (lastname.length < 1 || firstname.length < 1) {
    messageElement.textContent = 'Họ và tên phải có ít nhất 1 ký tự.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
    if (lastname.length < 1) lastnameInput.classList.add('form-input-error');
    if (firstname.length < 1) firstnameInput.classList.add('form-input-error');
    return;
  }

  if (password !== confirmPassword) {
    messageElement.textContent = 'Mật khẩu xác nhận không khớp.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
    passwordInput.classList.add('form-input-error');
    confirmPasswordInput.classList.add('form-input-error');
    confirmPasswordInput.focus();
    return;
  }

  if (!validatePhone(phone)) {
    messageElement.textContent = 'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0901234567).';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
    phoneInput.classList.add('form-input-error');
    phoneInput.focus();
    return;
  }

  if (email && !validateEmail(email)) {
    messageElement.textContent = 'Email không hợp lệ. Vui lòng nhập đúng định dạng email.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
    emailInput.classList.add('form-input-error');
    emailInput.focus();
    return;
  }

  if (!validatePassword(password)) {
    messageElement.textContent = 'Mật khẩu phải có ít nhất 6 ký tự.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
    passwordInput.classList.add('form-input-error');
    passwordInput.focus();
    return;
  }

  setAuthLoadingState(submitButton, true, 'Đăng ký');

  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ name, phone, email: email || undefined, password })
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = data.message || 'Không thể đăng ký tài khoản. Vui lòng thử lại.';
      
      // Handle specific error cases
      if (data.message && data.message.includes('đã tồn tại')) {
        phoneInput.classList.add('form-input-error');
        phoneInput.focus();
      }
      
      messageElement.textContent = errorMessage;
      messageElement.className = 'auth-error';
      messageElement.style.display = 'block';
      return;
    }

    messageElement.textContent = 'Đăng ký thành công! Bạn đã được đăng nhập tự động.';
    messageElement.className = 'auth-success';
    messageElement.style.display = 'block';

    updateAuthUi(data.user);

    // Reset form
    phoneInput.value = '';
    lastnameInput.value = '';
    firstnameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    confirmPasswordInput.value = '';

    // Check if we're on checkout page
    const isCheckoutPage = window.location.pathname.includes('/checkout');
    
    window.setTimeout(async () => {
      closeAuthModal();
      
      if (isCheckoutPage && typeof window.updateCheckoutAfterLogin === 'function') {
        // Update checkout state without reloading
        try {
          await window.updateCheckoutAfterLogin();
          console.log('[Auth] Checkout state updated after register');
        } catch (error) {
          console.error('[Auth] Error updating checkout state:', error);
          // Fallback to reload if update fails
          window.location.reload();
        }
      } else {
        // Reload page for other pages
        window.location.reload();
      }
    }, 1000);
  } catch (error) {
    console.error('Lỗi khi đăng ký', error);
    messageElement.textContent = 'Không thể đăng ký tài khoản. Vui lòng kiểm tra kết nối và thử lại.';
    messageElement.className = 'auth-error';
    messageElement.style.display = 'block';
  } finally {
    setAuthLoadingState(submitButton, false, 'Đăng ký');
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
    // Remove all existing event listeners by replacing the button
    const newAuthButton = authOpenButton.cloneNode(true);
    if (authOpenButton.parentNode) {
      authOpenButton.parentNode.replaceChild(newAuthButton, authOpenButton);
    }
    
    // Add click handler
    const handleAuthClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Auth] Button clicked');
      
      if (authState.currentUser) {
        window.location.href = '/profile';
      } else {
        console.log('[Auth] Opening modal with login tab');
        switchAuthTab('login');
        openAuthModal();
      }
    };
    
    newAuthButton.addEventListener('click', handleAuthClick);
    newAuthButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleAuthClick(e);
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

  // Forgot password handlers
  const forgotPasswordLink = document.getElementById('auth-forgot-password-link');
  const forgotPasswordModal = document.getElementById('forgot-password-modal-overlay');
  const forgotPasswordCloseButton = document.getElementById('forgot-password-close-button');
  const forgotPasswordBackLink = document.getElementById('forgot-password-back-link');
  const forgotPasswordForm = document.getElementById('forgot-password-form');

  const openForgotPasswordModal = () => {
    if (forgotPasswordModal) {
      forgotPasswordModal.style.display = 'flex';
      forgotPasswordModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeForgotPasswordModal = () => {
    if (forgotPasswordModal) {
      forgotPasswordModal.style.display = 'none';
      forgotPasswordModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  };

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeAuthModal();
      openForgotPasswordModal();
    });
  }

  if (forgotPasswordCloseButton) {
    forgotPasswordCloseButton.addEventListener('click', closeForgotPasswordModal);
  }

  if (forgotPasswordBackLink) {
    forgotPasswordBackLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeForgotPasswordModal();
      openAuthModal();
    });
  }

  if (forgotPasswordModal) {
    forgotPasswordModal.addEventListener('click', (event) => {
      if (event.target === forgotPasswordModal) {
        closeForgotPasswordModal();
      }
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      const phoneOrEmailInput = document.getElementById('forgot-password-phone');
      const messageElement = document.getElementById('forgot-password-message');
      const submitButton = document.getElementById('forgot-password-submit');

      if (!phoneOrEmailInput || !messageElement || !submitButton) {
        return;
      }

      const phoneOrEmail = phoneOrEmailInput.value.trim();

      // Clear previous errors
      phoneOrEmailInput.classList.remove('form-input-error');
      messageElement.style.display = 'none';

      // Validation
      if (!phoneOrEmail) {
        messageElement.textContent = 'Vui lòng nhập số điện thoại hoặc email.';
        messageElement.className = 'auth-error';
        messageElement.style.display = 'block';
        phoneOrEmailInput.classList.add('form-input-error');
        phoneOrEmailInput.focus();
        return;
      }

      // Set loading state
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Đang gửi...';
      submitButton.style.opacity = '0.7';
      submitButton.style.cursor = 'not-allowed';

      try {
        const response = await fetch('/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'same-origin',
          body: JSON.stringify({ phoneOrEmail })
        });

        const data = await response.json();

        if (!response.ok) {
          let errorMessage = data.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.';
          messageElement.textContent = errorMessage;
          messageElement.className = 'auth-error';
          messageElement.style.display = 'block';
          phoneOrEmailInput.classList.add('form-input-error');
        } else {
          messageElement.textContent = 'Mã xác nhận đã được gửi. Vui lòng kiểm tra số điện thoại hoặc email của bạn.';
          messageElement.className = 'auth-success';
          messageElement.style.display = 'block';
          phoneOrEmailInput.value = '';
        }
      } catch (error) {
        console.error('Forgot password error:', error);
        messageElement.textContent = 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
        messageElement.className = 'auth-error';
        messageElement.style.display = 'block';
      } finally {
        // Reset loading state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        submitButton.style.opacity = '1';
        submitButton.style.cursor = 'pointer';
      }
    });
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
  window.handleAuthLoginSubmit = handleAuthLoginSubmit;
  window.handleAuthRegisterSubmit = handleAuthRegisterSubmit;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
  } else {
    initializeAuth();
  }
}


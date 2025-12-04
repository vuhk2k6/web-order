/* eslint-disable no-console */
const renderSharedHeader = (options = {}) => {
  const {
    logoSubtext = '',
    activeNavLink = '',
    showAuthButton = true,
    authButtonText = 'Đăng nhập',
    authButtonId = 'auth-open-button',
    onAuthClick = null
  } = options;

  const headerHTML = `
    <header class="navbar">
      <div class="container navbar-inner">
        <div class="navbar-left">
          <div class="logo-mark" tabindex="0" aria-label="Logo nhà hàng">
            G
          </div>
          <div class="flex flex-col">
            <span class="logo-text-main">Carot</span>
            <span class="logo-text-sub">${logoSubtext}</span>
          </div>
        </div>
        <nav class="navbar-center" aria-label="Thanh điều hướng chính">
          <a href="/" class="navbar-link ${activeNavLink === 'home' ? 'active' : ''}" tabindex="0">Trang chủ</a>
          <a href="/menu" class="navbar-link ${activeNavLink === 'menu' ? 'active' : ''}" tabindex="0">Thực đơn</a>
          <a href="/#reservation" class="navbar-link ${activeNavLink === 'reservation' ? 'active' : ''}" tabindex="0">Đặt bàn</a>
          <a href="/#promotions" class="navbar-link ${activeNavLink === 'promotions' ? 'active' : ''}" tabindex="0">Tin tức &amp; khuyến mãi</a>
        </nav>
        <div class="navbar-right">
          <button type="button" class="btn-cart" tabindex="0" aria-label="Mở giỏ hàng">
            <span class="btn-cart-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.75 4.5h2.25l2.25 12h9l1.5-8.25H7.5" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
                <circle cx="10" cy="19" r="1" stroke-width="1.5" />
                <circle cx="17" cy="19" r="1" stroke-width="1.5" />
              </svg>
            </span>
            <span id="cart-count" class="btn-cart-badge">0</span>
          </button>
          ${showAuthButton ? `
            <button id="${authButtonId}" type="button" class="btn-login" tabindex="0"
              aria-label="${authButtonText === 'Đăng nhập' ? 'Đăng nhập hoặc đăng ký tài khoản' : 'Đăng xuất khỏi tài khoản'}">
              ${authButtonText}
            </button>
          ` : ''}
        </div>
      </div>
    </header>

    <div id="cart-dropdown" class="cart-dropdown" aria-hidden="true">
      <div class="cart-dropdown-panel">
        <div class="cart-dropdown-header">
          <p class="cart-dropdown-title">Giỏ hàng của bạn</p>
          <button type="button" id="cart-close-button" class="btn-text" aria-label="Đóng giỏ hàng">Đóng</button>
        </div>
        <div id="cart-items" class="cart-items"></div>
        <p id="cart-empty" class="cart-empty">
          Giỏ hàng của bạn đang trống. Hãy thêm món từ thực đơn để bắt đầu.
        </p>
        <div class="cart-footer">
          <div class="cart-total">
            <span>Tổng cộng</span>
            <strong id="cart-total">0 đ</strong>
          </div>
          <button type="button" id="cart-checkout-button" class="btn-primary cart-checkout-button" disabled>
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  `;

  const container = document.getElementById('shared-header');
  const body = document.body;
  
  if (!body) {
    return;
  }

  if (container) {
    container.innerHTML = headerHTML;
  } else {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = headerHTML;
    
    const headerContainer = document.createElement('div');
    headerContainer.id = 'shared-header';
    
    while (tempDiv.firstChild) {
      headerContainer.appendChild(tempDiv.firstChild);
    }
    
    body.insertBefore(headerContainer, body.firstChild);
  }

  if (onAuthClick && typeof onAuthClick === 'function') {
    const authBtn = document.getElementById(authButtonId);
    if (authBtn) {
      authBtn.addEventListener('click', onAuthClick);
    }
  }

  // Setup cart and auth after a small delay to ensure DOM is ready
  window.setTimeout(() => {
  // Setup cart and auth after a small delay to ensure DOM is ready
  window.setTimeout(() => {
    initializeSharedHeader();
    
    if (typeof window.initializeAuthModal === 'function') {
      window.initializeAuthModal();
    }
  }, 50);
  }, 50);
  
  if (typeof window.fetchCurrentUser === 'function' && typeof window.updateAuthUi === 'function') {
    window.fetchCurrentUser().then((user) => {
      if (user) {
        const authButton = document.getElementById(authButtonId);
        if (authButton) {
          if (authButtonId === 'auth-open-button') {
            const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';
            authButton.innerHTML = '';
            const avatarSpan = document.createElement('span');
            avatarSpan.className = 'auth-avatar-circle';
            avatarSpan.textContent = initial;
            authButton.appendChild(avatarSpan);
            authButton.setAttribute('aria-label', 'Xem trang cá nhân của bạn');
          } else if (authButtonId === 'profile-logout-button') {
            authButton.textContent = 'Đăng xuất';
            authButton.setAttribute('aria-label', 'Đăng xuất khỏi tài khoản');
          }
        }
      }
    });
  }
};

const initializeSharedHeader = () => {
  if (typeof window.appCart !== 'undefined' && window.appCart) {
    window.appCart.updateBadge();
    window.appCart.renderDropdown();
    window.appCart.setupListeners();
  } else {
    window.setTimeout(() => {
      if (typeof window.appCart !== 'undefined' && window.appCart) {
        window.appCart.updateBadge();
        window.appCart.renderDropdown();
        window.appCart.setupListeners();
      }
    }, 100);
  }
};

if (typeof window !== 'undefined') {
  window.renderSharedHeader = renderSharedHeader;
  window.initializeSharedHeader = initializeSharedHeader;
  
  const autoRenderIfNeeded = () => {
    const container = document.getElementById('shared-header');
    if (container && container.children.length === 0 && document.body) {
      const path = window.location.pathname;
      let options = {};
      
      if (path === '/menu') {
        options = {
          logoSubtext: 'Thực đơn nhà hàng',
          activeNavLink: 'menu',
          showAuthButton: true,
          authButtonText: 'Đăng nhập',
          authButtonId: 'auth-open-button'
        };
      } else if (path === '/profile') {
        options = {
          logoSubtext: 'Tài khoản khách hàng',
          activeNavLink: '',
          showAuthButton: true,
          authButtonText: 'Đăng xuất',
          authButtonId: 'profile-logout-button',
          onAuthClick: () => {
            if (typeof window.handleProfileLogout === 'function') {
              window.handleProfileLogout();
            } else {
              fetch('/auth/logout', { method: 'POST', credentials: 'same-origin' })
                .then(() => window.location.href = '/');
            }
          }
        };
      } else {
        options = {
          logoSubtext: '',
          activeNavLink: 'home',
          showAuthButton: true,
          authButtonText: 'Đăng nhập',
          authButtonId: 'auth-open-button'
        };
      }
      
      renderSharedHeader(options);
      
      if (typeof window.initializeAuth === 'function') {
        window.initializeAuth();
      }
    }
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoRenderIfNeeded);
  } else {
    autoRenderIfNeeded();
  }
  
  window.addEventListener('load', autoRenderIfNeeded);
}


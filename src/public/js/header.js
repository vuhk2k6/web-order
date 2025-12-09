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
          <a href="/" class="logo-mark-link" tabindex="0" aria-label="Về trang chủ">
            <img src="/img/logo.png" alt="Logo nhà hàng CAFRROTSFUD" class="logo-mark" />
          </a>
        </div>
        <nav class="navbar-center" aria-label="Thanh điều hướng chính">
          <a href="/" class="navbar-link ${activeNavLink === 'home' ? 'active' : ''}" tabindex="0">Trang chủ</a>
          <a href="/menu" class="navbar-link ${activeNavLink === 'menu' ? 'active' : ''}" tabindex="0">Thực đơn</a>
          <a href="/reservation" class="navbar-link ${activeNavLink === 'reservation' ? 'active' : ''}" tabindex="0">Đặt bàn</a>
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
              aria-label="${authButtonText === 'Đăng nhập' || authButtonText.includes('Đăng nhập') ? 'Đăng nhập hoặc đăng ký tài khoản' : 'Đăng xuất khỏi tài khoản'}">
              ${authButtonText === 'Đăng nhập' || authButtonText.includes('Đăng nhập') ? `
                <span class="btn-login-text">Đăng nhập</span>
                <span class="btn-login-separator">/</span>
                <span class="btn-login-text">Đăng ký</span>
              ` : authButtonText}
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
          <div class="cart-footer-actions">
            <button type="button" id="cart-checkout-button" class="btn-primary cart-checkout-button" disabled>
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const container = document.getElementById('shared-header');
  const body = document.body;
  
  if (!body) {
    return;
  }

  // Check if header already exists to avoid re-rendering
  const existingHeader = container?.querySelector('.navbar');
  if (existingHeader && container.children.length > 0) {
    // Header already exists, just update cart badge and sync
    if (typeof window.appCart !== 'undefined' && window.appCart) {
      if (typeof window.appCart.reload === 'function') {
        window.appCart.reload();
      } else {
        window.appCart.updateBadge();
      }
    }
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

  // Đồng bộ nút đăng nhập ngay sau khi render header
  if (typeof window.fetchCurrentUser === 'function' && typeof window.updateAuthUi === 'function') {
    window.fetchCurrentUser()
      .then((user) => {
        if (user) {
          window.updateAuthUi(user);
        } else {
          window.updateAuthUi(null);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('[Header] Lỗi khi kiểm tra đăng nhập:', error);
      });
  }

  if (onAuthClick && typeof onAuthClick === 'function') {
    const authBtn = document.getElementById(authButtonId);
    if (authBtn) {
      authBtn.addEventListener('click', onAuthClick);
    }
  }

  // Setup cart and auth after a small delay to ensure DOM is ready
  // Use requestAnimationFrame for smoother rendering
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        initializeSharedHeader();
      }, 0);
    });
  } else {
    window.setTimeout(() => {
      initializeSharedHeader();
    }, 50);
  }
};

const initializeSharedHeader = () => {
  // Ensure cart is initialized from localStorage
  if (typeof window.appCart === 'undefined' || !window.appCart) {
    // Wait for main.js to initialize cart
    window.setTimeout(() => {
      if (typeof window.appCart !== 'undefined' && window.appCart) {
        // Reload cart to ensure sync
        if (typeof window.appCart.reload === 'function') {
          window.appCart.reload();
        } else {
          window.appCart.updateBadge();
          window.appCart.renderDropdown();
        }
        window.appCart.setupListeners();
      } else {
        // If still not available, try again
        window.setTimeout(initializeSharedHeader, 100);
      }
    }, 100);
    return;
  }
  
  // Cart is available, initialize it
  // Reload cart to ensure sync with latest localStorage
  if (typeof window.appCart.reload === 'function') {
    window.appCart.reload();
  } else {
    window.appCart.updateBadge();
    window.appCart.renderDropdown();
  }
  window.appCart.setupListeners();
  
  // Setup auth modal if available (use initializeAuthModal if available, otherwise setup manually)
  if (typeof window.initializeAuthModal === 'function') {
    // Wait a bit to ensure auth.js is fully loaded
    window.setTimeout(() => {
      window.initializeAuthModal();
    }, 100);
  } else if (typeof window.openAuthModal === 'function' && typeof window.closeAuthModal === 'function') {
    const authOpenButton = document.getElementById('auth-open-button');
    const authCloseButton = document.getElementById('auth-close-button');
    const authOverlay = document.getElementById('auth-modal-overlay');
    const loginTab = document.getElementById('auth-tab-login');
    const registerTab = document.getElementById('auth-tab-register');
    const loginForm = document.getElementById('auth-form-login');
    const registerForm = document.getElementById('auth-form-register');
    
    if (authOpenButton) {
      // Remove existing listeners by replacing button
      const newAuthButton = authOpenButton.cloneNode(true);
      if (authOpenButton.parentNode) {
        authOpenButton.parentNode.replaceChild(newAuthButton, authOpenButton);
      }
      
      const handleAuthClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Auth] Button clicked (header.js)');
        
        if (window.authState && window.authState.currentUser) {
          window.location.href = '/profile';
        } else {
          if (typeof window.switchAuthTab === 'function') {
            window.switchAuthTab('login');
          }
          if (typeof window.openAuthModal === 'function') {
            window.openAuthModal();
          } else {
            console.error('[Auth] openAuthModal is not available');
          }
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
      authCloseButton.addEventListener('click', window.closeAuthModal);
    }
    
    if (authOverlay) {
      authOverlay.addEventListener('click', (event) => {
        if (event.target === authOverlay) {
          window.closeAuthModal();
        }
      });
    }
    
    if (loginTab) {
      loginTab.addEventListener('click', () => {
        if (typeof window.switchAuthTab === 'function') {
          window.switchAuthTab('login');
        }
      });
    }
    
    if (registerTab) {
      registerTab.addEventListener('click', () => {
        if (typeof window.switchAuthTab === 'function') {
          window.switchAuthTab('register');
        }
      });
    }
    
    if (loginForm && typeof window.handleAuthLoginSubmit === 'function') {
      loginForm.addEventListener('submit', window.handleAuthLoginSubmit);
    }
    
    if (registerForm && typeof window.handleAuthRegisterSubmit === 'function') {
      registerForm.addEventListener('submit', window.handleAuthRegisterSubmit);
    }
  }
  
  // Fetch and update auth UI
  if (typeof window.fetchCurrentUser === 'function' && typeof window.updateAuthUi === 'function') {
    window.fetchCurrentUser().then((user) => {
      window.updateAuthUi(user);
    });
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
      } else if (path === '/reservation') {
        options = {
          logoSubtext: 'Đặt bàn trực tuyến',
          activeNavLink: 'reservation',
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


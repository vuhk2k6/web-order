/* eslint-disable no-console */
const cartState = {
  items: []
};

const loadCartItems = () => {
  try {
    const stored = localStorage.getItem('cartItems');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Lỗi khi tải giỏ hàng từ localStorage:', error);
    return [];
  }
};

const saveCartItems = (items) => {
  try {
    localStorage.setItem('cartItems', JSON.stringify(items));
  } catch (error) {
    console.error('Lỗi khi lưu giỏ hàng vào localStorage:', error);
  }
};

const updateCartBadge = () => {
  const badge = document.getElementById('cart-count');
  if (!badge) {
    return;
  }

  const totalQuantity = cartState.items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  badge.textContent = totalQuantity > 0 ? String(totalQuantity) : '0';
  badge.style.display = totalQuantity > 0 ? 'flex' : 'none';
};

const renderCartDropdown = () => {
  const itemsContainer = document.getElementById('cart-items');
  const emptyMessage = document.getElementById('cart-empty');
  const totalElement = document.getElementById('cart-total');
  const checkoutButton = document.getElementById('cart-checkout-button');

  if (!itemsContainer || !emptyMessage || !totalElement || !checkoutButton) {
    return;
  }

  if (cartState.items.length === 0) {
    itemsContainer.innerHTML = '';
    emptyMessage.style.display = 'block';
    checkoutButton.disabled = true;
    totalElement.textContent = '0 đ';
    return;
  }

  emptyMessage.style.display = 'none';
  checkoutButton.disabled = false;

  itemsContainer.innerHTML = cartState.items
    .map(
      (item) => {
        const itemId = item.id || '';
        const itemName = item.name || 'Món ăn';
        const itemPrice = item.price || 0;
        const itemQuantity = item.quantity || 1;
        const itemImage = item.image || '';
        const itemTotal = itemPrice * itemQuantity;
        
        return `
        <div class="cart-item" data-item-id="${itemId}">
          ${itemImage ? `
            <img src="${itemImage}" alt="${itemName}" class="cart-item-image" />
          ` : `
            <div class="cart-item-image cart-item-image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          `}
          <div class="cart-item-content">
            <p class="cart-item-name">${itemName}</p>
            <p class="cart-item-price-unit">${itemPrice.toLocaleString('vi-VN')} đ</p>
            <div class="cart-item-quantity">
              <button type="button" class="cart-quantity-btn cart-quantity-decrease" data-item-id="${itemId}" aria-label="Giảm số lượng">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <input type="number" class="cart-quantity-input" value="${itemQuantity}" min="1" data-item-id="${itemId}" aria-label="Số lượng" />
              <button type="button" class="cart-quantity-btn cart-quantity-increase" data-item-id="${itemId}" aria-label="Tăng số lượng">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="cart-item-right">
            <p class="cart-item-price">${itemTotal.toLocaleString('vi-VN')} đ</p>
            <button type="button" class="cart-item-remove" data-item-id="${itemId}" aria-label="Xóa sản phẩm">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      `;
      }
    )
    .join('');

  // Attach event listeners for quantity controls
  attachCartItemListeners();

  const total = cartState.items.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  totalElement.textContent = `${total.toLocaleString('vi-VN')} đ`;
};

const updateCartDropdownPosition = () => {
  const dropdown = document.getElementById('cart-dropdown');
  const cartButton = document.querySelector('.btn-cart');
  
  if (!dropdown || !cartButton) {
    return;
  }
  
  // Calculate horizontal position to align with cart button
  const cartButtonRect = cartButton.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  
  // Calculate right position: distance from right edge of viewport to right edge of cart button
  const rightPosition = viewportWidth - cartButtonRect.right;
  
  // Align dropdown right edge with cart button right edge
  dropdown.style.right = `${rightPosition}px`;
};

const openCartDropdown = () => {
  const dropdown = document.getElementById('cart-dropdown');
  if (!dropdown) {
    return;
  }
  
  // Update position before opening
  updateCartDropdownPosition();
  
  dropdown.classList.add('open');
  dropdown.setAttribute('aria-hidden', 'false');
};

const closeCartDropdown = () => {
  const dropdown = document.getElementById('cart-dropdown');
  if (!dropdown) {
    return;
  }
  dropdown.classList.remove('open');
  dropdown.setAttribute('aria-hidden', 'true');
};

const toggleCartDropdown = () => {
  const dropdown = document.getElementById('cart-dropdown');
  if (!dropdown) {
    return;
  }
  const isOpen = dropdown.classList.contains('open');
  if (isOpen) {
    closeCartDropdown();
  } else {
    openCartDropdown();
  }
};

const addItemToCart = (payload) => {
  if (!payload || !payload.id) {
    return;
  }

  const existingIndex = cartState.items.findIndex(
    (i) => i.id === String(payload.id)
  );

  if (existingIndex >= 0) {
    cartState.items[existingIndex].quantity += payload.quantity || 1;
  } else {
    cartState.items.push({
      id: String(payload.id),
      name: payload.name || 'Món ăn',
      price: Number(payload.price) || 0,
      image: payload.image || '',
      quantity: payload.quantity && payload.quantity > 0 ? payload.quantity : 1
    });
  }

  saveCartItems(cartState.items);
  updateCartBadge();
  renderCartDropdown();
};

const updateCartItemQuantity = (itemId, newQuantity) => {
  const quantity = Math.max(1, Math.floor(Number(newQuantity)) || 1);
  const itemIndex = cartState.items.findIndex((i) => i.id === String(itemId));
  
  if (itemIndex >= 0) {
    cartState.items[itemIndex].quantity = quantity;
    saveCartItems(cartState.items);
    updateCartBadge();
    renderCartDropdown();
  }
};

const removeCartItem = (itemId) => {
  const itemIndex = cartState.items.findIndex((i) => i.id === String(itemId));
  
  if (itemIndex >= 0) {
    cartState.items.splice(itemIndex, 1);
    saveCartItems(cartState.items);
    updateCartBadge();
    renderCartDropdown();
  }
};

const attachCartItemListeners = () => {
  // Quantity decrease buttons
  document.querySelectorAll('.cart-quantity-decrease').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.getAttribute('data-item-id');
      const item = cartState.items.find((i) => i.id === String(itemId));
      if (item && item.quantity > 1) {
        updateCartItemQuantity(itemId, item.quantity - 1);
      }
    });
  });

  // Quantity increase buttons
  document.querySelectorAll('.cart-quantity-increase').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.getAttribute('data-item-id');
      const item = cartState.items.find((i) => i.id === String(itemId));
      if (item) {
        updateCartItemQuantity(itemId, item.quantity + 1);
      }
    });
  });

  // Quantity input fields
  document.querySelectorAll('.cart-quantity-input').forEach((input) => {
    input.addEventListener('change', (e) => {
      e.stopPropagation();
      const itemId = input.getAttribute('data-item-id');
      const newQuantity = input.value;
      updateCartItemQuantity(itemId, newQuantity);
    });

    input.addEventListener('blur', (e) => {
      e.stopPropagation();
      const itemId = input.getAttribute('data-item-id');
      const item = cartState.items.find((i) => i.id === String(itemId));
      if (item && input.value !== String(item.quantity)) {
        input.value = item.quantity;
      }
    });
  });

  // Remove buttons
  document.querySelectorAll('.cart-item-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.getAttribute('data-item-id');
      removeCartItem(itemId);
    });
  });
};

const handleCheckout = () => {
  if (cartState.items.length === 0) {
    return;
  }
  
  // Close dropdown before redirecting
  closeCartDropdown();
  
  // Redirect to checkout page
  window.location.href = '/checkout';
};

const setupCartListeners = () => {
  const cartButton = document.querySelector('.btn-cart');
  const cartCloseButton = document.getElementById('cart-close-button');
  const checkoutButton = document.getElementById('cart-checkout-button');

  if (cartButton) {
    const handleCartClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleCartDropdown();
    };
    
    // Remove old listeners by cloning
    const newCartButton = cartButton.cloneNode(true);
    cartButton.parentNode.replaceChild(newCartButton, cartButton);
    
    // Attach new listener
    newCartButton.addEventListener('click', handleCartClick);
  }

  if (cartCloseButton) {
    const handleClose = (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeCartDropdown();
    };
    cartCloseButton.removeEventListener('click', handleClose);
    cartCloseButton.addEventListener('click', handleClose);
  }

  if (checkoutButton) {
    const handleCheckoutClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCheckout();
    };
    checkoutButton.removeEventListener('click', handleCheckoutClick);
    checkoutButton.addEventListener('click', handleCheckoutClick);
  }
  
  // Close dropdown when clicking outside
  const existingClickHandler = window.cartOutsideClickHandler;
  if (existingClickHandler) {
    document.removeEventListener('click', existingClickHandler);
  }
  
  window.cartOutsideClickHandler = (e) => {
    const currentDropdown = document.getElementById('cart-dropdown');
    const currentCartButton = document.querySelector('.btn-cart');
    
    if (currentDropdown && currentCartButton && !currentDropdown.contains(e.target) && !currentCartButton.contains(e.target)) {
      closeCartDropdown();
    }
  };
  
  document.addEventListener('click', window.cartOutsideClickHandler);
  
  // Update dropdown position on window resize when dropdown is open
  const existingResizeHandler = window.cartResizeHandler;
  if (existingResizeHandler) {
    window.removeEventListener('resize', existingResizeHandler);
  }
  
  window.cartResizeHandler = () => {
    const dropdown = document.getElementById('cart-dropdown');
    if (dropdown && dropdown.classList.contains('open')) {
      updateCartDropdownPosition();
    }
  };
  
  window.addEventListener('resize', window.cartResizeHandler);
};

if (typeof window !== 'undefined') {
  cartState.items = loadCartItems();
  
  window.appCart = {
    addItem: addItemToCart,
    updateBadge: updateCartBadge,
    renderDropdown: renderCartDropdown,
    setupListeners: setupCartListeners,
    getItems: () => [...cartState.items],
    open: openCartDropdown,
    updatePosition: updateCartDropdownPosition
  };
}

const createMenuCard = (item) => {
  const card = document.createElement('article');
  card.className =
    'group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm transition hover:border-amber-400/60 hover:bg-slate-900/90 focus-within:border-amber-400 focus-within:bg-slate-900/90';
  card.tabIndex = 0;
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', item.name);

  const imageWrapper = document.createElement('div');
  imageWrapper.className =
    'relative mb-3 aspect-video w-full overflow-hidden rounded-xl bg-slate-800';

  if (item.image) {
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.name || 'Món ăn';
    image.className = 'h-full w-full object-cover transition-transform group-hover:scale-105';
    image.loading = 'lazy';
    imageWrapper.appendChild(image);
  } else {
    const placeholder = document.createElement('div');
    placeholder.className =
      'flex h-full w-full items-center justify-center text-slate-500';
    placeholder.textContent = 'Chưa có ảnh';
    imageWrapper.appendChild(placeholder);
  }

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'flex flex-1 flex-col';

  const title = document.createElement('h3');
  title.className = 'mb-2 text-lg font-semibold text-white';
  title.textContent = item.name || 'Món ăn';

  const description = document.createElement('p');
  description.className = 'mb-3 flex-1 text-sm text-slate-400';
  description.textContent = item.description || 'Món ăn ngon miệng';

  const footer = document.createElement('div');
  footer.className = 'flex items-center justify-between';

  const price = document.createElement('span');
  price.className = 'text-lg font-bold text-amber-400';
  price.textContent = `${(item.price || 0).toLocaleString('vi-VN')} đ`;

  const addButton = document.createElement('button');
  addButton.className =
    'rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900';
  addButton.textContent = 'Thêm vào giỏ';
  addButton.setAttribute('aria-label', `Thêm ${item.name || 'món ăn'} vào giỏ hàng`);

  addButton.addEventListener('click', (e) => {
    e.stopPropagation();
    addItemToCart({
      id: item._id || item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
  });

  footer.appendChild(price);
  footer.appendChild(addButton);

  contentWrapper.appendChild(title);
  contentWrapper.appendChild(description);
  contentWrapper.appendChild(footer);

  card.appendChild(imageWrapper);
  card.appendChild(contentWrapper);

  return card;
};

const fetchMenu = async () => {
  try {
    const response = await fetch('/api/menu');
    if (!response.ok) {
      throw new Error('Không thể tải thực đơn');
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Lỗi khi tải thực đơn:', error);
    return [];
  }
};

const renderMenu = (items) => {
  const container = document.getElementById('menu-list');
  const emptyMessage = document.getElementById('menu-empty');

  if (!container) {
    return;
  }

  if (!items || items.length === 0) {
    if (emptyMessage) {
      emptyMessage.style.display = 'block';
    }
    container.innerHTML = '';
    return;
  }

  if (emptyMessage) {
    emptyMessage.style.display = 'none';
  }

  container.innerHTML = '';
  items.forEach((item) => {
    const card = createMenuCard(item);
    container.appendChild(card);
  });
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

const authState = {
  currentUser: null
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

const handleScrollToReservation = () => {
  const reservationSection = document.getElementById('reservation');
  if (reservationSection) {
    reservationSection.scrollIntoView({ behavior: 'smooth' });
  }
};

const handleSubmitReservation = async (event) => {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  
  const messageElement = document.getElementById('reservation-message');
  const submitButton = form.querySelector('button[type="submit"]');
  
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Đang gửi...';
  }
  
  if (messageElement) {
    messageElement.textContent = '';
    messageElement.style.display = 'none';
  }
  
  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      if (messageElement) {
        messageElement.textContent = result.message || 'Không thể gửi yêu cầu đặt bàn. Vui lòng thử lại.';
        messageElement.className = 'reservation-message reservation-error';
        messageElement.style.display = 'block';
      }
      return;
    }
    
    if (messageElement) {
      messageElement.textContent = 'Đã gửi yêu cầu đặt bàn thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.';
      messageElement.className = 'reservation-message reservation-success';
      messageElement.style.display = 'block';
    }
    
    form.reset();
  } catch (error) {
    console.error('Lỗi khi gửi yêu cầu đặt bàn:', error);
    if (messageElement) {
      messageElement.textContent = 'Không thể gửi yêu cầu đặt bàn. Vui lòng thử lại sau.';
      messageElement.className = 'reservation-message reservation-error';
      messageElement.style.display = 'block';
    }
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Gửi yêu cầu đặt bàn';
    }
  }
};

const initializeFooterYear = () => {
  const footerYear = document.getElementById('footer-year');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
};

const initializeHomePage = async () => {
  const items = await fetchMenu();
  renderMenu(items);
  updateCartBadge();
  renderCartDropdown();
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
};

const shouldInitializeHomePage = () => {
  const path = window.location.pathname;
  return path === '/' || path === '/index.html';
};

// Expose global objects for other scripts
if (typeof window !== 'undefined') {
  window.appCart = {
    addItem: addItemToCart,
    updateBadge: updateCartBadge,
    renderDropdown: renderCartDropdown,
    setupListeners: setupCartListeners,
    getItems: () => [...cartState.items],
    open: openCartDropdown,
    updatePosition: updateCartDropdownPosition
  };
}

if (shouldInitializeHomePage()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHomePage);
  } else {
    initializeHomePage();
  }
}

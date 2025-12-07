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

  if (totalQuantity > 0) {
    badge.textContent = totalQuantity > 99 ? '99+' : String(totalQuantity);
    badge.style.display = 'flex';
  } else {
    badge.textContent = '0';
    badge.style.display = 'none';
  }
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
  
  // On mobile, use fixed positioning
  if (window.innerWidth <= 640) {
    dropdown.style.right = '16px';
    dropdown.style.left = 'auto';
    return;
  }
  
  // Calculate horizontal position to align with cart button
  const cartButtonRect = cartButton.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  
  // Calculate right position: distance from right edge of viewport to right edge of cart button
  const rightPosition = viewportWidth - cartButtonRect.right;
  
  // Align dropdown right edge with cart button right edge, with minimum spacing
  dropdown.style.right = `${Math.max(16, rightPosition)}px`;
  dropdown.style.left = 'auto';
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
    console.warn('Không thể thêm món vào giỏ hàng: thiếu thông tin');
    return false;
  }

  // Validate required fields
  const itemId = String(payload.id);
  const itemName = payload.name || 'Món ăn';
  const itemPrice = Number(payload.price) || 0;
  const itemImage = payload.image || '';
  const quantityToAdd = payload.quantity && payload.quantity > 0 ? Number(payload.quantity) : 1;

  if (!itemId || itemPrice <= 0) {
    console.warn('Không thể thêm món vào giỏ hàng: dữ liệu không hợp lệ', payload);
    return false;
  }

  // Find existing item
  const existingIndex = cartState.items.findIndex(
    (i) => i.id === itemId
  );

  if (existingIndex >= 0) {
    // Item already exists, increase quantity
    cartState.items[existingIndex].quantity += quantityToAdd;
  } else {
    // New item, add to cart
    cartState.items.push({
      id: itemId,
      name: itemName,
      price: itemPrice,
      image: itemImage,
      quantity: quantityToAdd
    });
  }

  // Save to localStorage
  saveCartItems(cartState.items);
  
  // Update UI
  updateCartBadge();
  renderCartDropdown();
  
  // Show visual feedback
  showAddToCartFeedback(itemName);
  
  // Auto-open cart dropdown when adding item (only on desktop, not mobile)
  const dropdown = document.getElementById('cart-dropdown');
  if (dropdown && !dropdown.classList.contains('open') && window.innerWidth > 640) {
    openCartDropdown();
  }
  
  return true;
};

const showAddToCartFeedback = (itemName) => {
  // Create or update feedback element
  let feedbackEl = document.getElementById('cart-feedback');
  
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.id = 'cart-feedback';
    feedbackEl.className = 'cart-feedback';
    document.body.appendChild(feedbackEl);
  }
  
  feedbackEl.textContent = `Đã thêm "${itemName}" vào giỏ hàng`;
  feedbackEl.classList.add('show');
  
  // Remove after animation
  window.setTimeout(() => {
    feedbackEl.classList.remove('show');
  }, 2000);
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

// Initialize cart immediately when script loads
if (typeof window !== 'undefined') {
  // Initialize cart state from localStorage
  cartState.items = loadCartItems();
  
  // Expose cart API globally immediately
  window.appCart = {
    addItem: addItemToCart,
    updateBadge: updateCartBadge,
    renderDropdown: renderCartDropdown,
    setupListeners: setupCartListeners,
    getItems: () => [...cartState.items],
    open: openCartDropdown,
    close: closeCartDropdown,
    updatePosition: updateCartDropdownPosition,
    removeItem: removeCartItem,
    updateQuantity: updateCartItemQuantity
  };
  
  // Update badge immediately on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      updateCartBadge();
    });
  } else {
    updateCartBadge();
  }
}

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

// Expose formatCurrencyVnd globally for other scripts
if (typeof window !== 'undefined') {
  window.formatCurrencyVnd = formatCurrencyVnd;
}

const createMenuCard = (item) => {
  const card = document.createElement('article');
  card.className = 'menu-card';
  card.setAttribute('data-category', item.category || 'all');

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'menu-card-image-wrapper';

  if (item.image) {
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.name || 'Ảnh món ăn';
    image.loading = 'lazy';
    imageWrapper.appendChild(image);
  }

  const cardContent = document.createElement('div');
  cardContent.className = 'menu-card-content';

  const titleRow = document.createElement('div');
  titleRow.className = 'menu-card-title-row';

  const title = document.createElement('h3');
  title.className = 'menu-card-title';
  title.textContent = item.name || 'Món ăn';

  const priceContainer = document.createElement('div');
  const price = document.createElement('span');
  price.className = 'menu-card-price';
  price.textContent = formatCurrencyVnd(item.price);
  priceContainer.appendChild(price);

  if (item.originalPrice && item.originalPrice > item.price) {
    const oldPrice = document.createElement('span');
    oldPrice.className = 'menu-card-price-old';
    oldPrice.textContent = formatCurrencyVnd(item.originalPrice);
    priceContainer.appendChild(oldPrice);
  }

  titleRow.appendChild(title);
  titleRow.appendChild(priceContainer);

  const description = document.createElement('p');
  description.className = 'menu-card-description';
  description.textContent = item.description || 'Món ăn đặc biệt của nhà hàng.';

  const actions = document.createElement('div');
  actions.className = 'menu-card-actions';

  const viewButton = document.createElement('button');
  viewButton.type = 'button';
  viewButton.className = 'menu-view-button';
  viewButton.textContent = 'Xem chi tiết';
  viewButton.setAttribute('aria-label', `Xem chi tiết ${item.name || 'món ăn'}`);
  
  viewButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    // Open detail modal
    if (window.openMenuDetailModal) {
      window.openMenuDetailModal(item);
    } else {
      console.warn('openMenuDetailModal không khả dụng');
    }
  });

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'menu-add-button';
  addButton.textContent = 'Thêm giỏ hàng';
  addButton.setAttribute('aria-label', `Thêm ${item.name || 'món ăn'} vào giỏ hàng`);

  addButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (addButton.disabled) {
      return;
    }

    let cartReady = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!cartReady && attempts < maxAttempts) {
      if (window.appCart && typeof window.appCart.addItem === 'function') {
        cartReady = true;
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 50));
        attempts++;
      }
    }

    if (!cartReady) {
      console.error('Cart không khả dụng sau', maxAttempts, 'lần thử');
      return;
    }

    const originalText = addButton.textContent;
    addButton.disabled = true;
    addButton.textContent = 'Đang thêm...';

    try {
      const success = window.appCart.addItem({
        id: item._id || item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1
      });

      if (success) {
        addButton.textContent = 'Đã thêm ✓';
        window.setTimeout(() => {
          addButton.disabled = false;
          addButton.textContent = originalText;
        }, 1000);
      } else {
        addButton.textContent = 'Lỗi';
        window.setTimeout(() => {
          addButton.disabled = false;
          addButton.textContent = originalText;
        }, 1500);
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      addButton.disabled = false;
      addButton.textContent = originalText;
    }
  });

  actions.appendChild(viewButton);
  actions.appendChild(addButton);

  cardContent.appendChild(titleRow);
  cardContent.appendChild(description);
  cardContent.appendChild(actions);

  card.appendChild(imageWrapper);
  card.appendChild(cardContent);

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

// Utility functions for homepage
const handleScrollToReservation = () => {
  const reservationSection = document.getElementById('reservation');

  if (!reservationSection) {
    return;
  }

    reservationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    messageElement.className = 'reservation-message error';
    messageElement.style.display = 'block';
    return;
  }

  messageElement.textContent =
    'Cảm ơn bạn! Chúng tôi đã ghi nhận yêu cầu và sẽ liên hệ xác nhận trong thời gian sớm nhất.';
    messageElement.className = 'reservation-message success';
    messageElement.style.display = 'block';

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

// Auth functions are in auth.js - use window.authState, window.updateAuthUi, etc.

// Gallery state and functions
const galleryState = {
  currentIndex: 0,
  mediaItems: [
    { type: 'video', src: '/img/vidkgian2.mp4' },
    { type: 'video', src: '/img/vidkgian1.mp4' },
    { type: 'image', src: '/img/kgian1.png' },
    { type: 'image', src: '/img/kgian2.png' },
    { type: 'image', src: '/img/kgian3.png' }
  ]
};

const openGalleryModal = (index = 0) => {
  const overlay = document.getElementById('gallery-modal-overlay');
  if (!overlay) {
    console.warn('Gallery modal overlay not found');
    return;
  }

  // Ensure index is valid
  const validIndex = Math.max(0, Math.min(index, galleryState.mediaItems.length - 1));
  galleryState.currentIndex = validIndex;
  
  // Show overlay
  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
  
  // Render content
  renderGalleryMedia();
  renderGalleryThumbnails();
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  
  console.log('Gallery modal opened at index:', validIndex);
};

const closeGalleryModal = () => {
  const overlay = document.getElementById('gallery-modal-overlay');
  if (!overlay) {
    return;
  }

  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  
  // Stop any playing videos
  const video = overlay.querySelector('video');
  if (video) {
    video.pause();
    video.currentTime = 0;
  }
};

const renderGalleryMedia = () => {
  const mediaContainer = document.getElementById('gallery-media');
  if (!mediaContainer) {
    return;
  }

  const currentItem = galleryState.mediaItems[galleryState.currentIndex];
  if (!currentItem) {
    return;
  }

  mediaContainer.innerHTML = '';

  if (currentItem.type === 'video') {
    const video = document.createElement('video');
    video.src = currentItem.src;
    video.controls = true;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.className = 'gallery-video';
    video.onerror = () => {
      console.error('[Gallery] Failed to load video:', currentItem.src);
    };
    mediaContainer.appendChild(video);
    console.log('[Gallery] Video element created:', currentItem.src);
  } else {
    const img = document.createElement('img');
    img.src = currentItem.src;
    img.alt = 'Không gian nhà hàng';
    img.className = 'gallery-image';
    img.onerror = () => {
      console.error('[Gallery] Failed to load image:', currentItem.src);
    };
    mediaContainer.appendChild(img);
    console.log('[Gallery] Image element created:', currentItem.src);
  }
};

const renderGalleryThumbnails = () => {
  const thumbnailsContainer = document.getElementById('gallery-thumbnails');
  if (!thumbnailsContainer) {
    return;
  }

  thumbnailsContainer.innerHTML = '';

  galleryState.mediaItems.forEach((item, index) => {
    const thumbnail = document.createElement('div');
    thumbnail.className = `gallery-thumbnail ${index === galleryState.currentIndex ? 'active' : ''}`;
    thumbnail.setAttribute('role', 'tab');
    thumbnail.setAttribute('aria-selected', index === galleryState.currentIndex ? 'true' : 'false');
    thumbnail.setAttribute('tabindex', '0');
    thumbnail.addEventListener('click', () => {
      galleryState.currentIndex = index;
      renderGalleryMedia();
      renderGalleryThumbnails();
    });
    thumbnail.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        galleryState.currentIndex = index;
        renderGalleryMedia();
        renderGalleryThumbnails();
      }
    });

    if (item.type === 'video') {
      const video = document.createElement('video');
      video.src = item.src;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      thumbnail.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = `Không gian nhà hàng ${index + 1}`;
      thumbnail.appendChild(img);
    }

    thumbnailsContainer.appendChild(thumbnail);
  });
};

const navigateGallery = (direction) => {
  if (direction === 'prev') {
    galleryState.currentIndex = galleryState.currentIndex > 0
      ? galleryState.currentIndex - 1
      : galleryState.mediaItems.length - 1;
  } else {
    galleryState.currentIndex = galleryState.currentIndex < galleryState.mediaItems.length - 1
      ? galleryState.currentIndex + 1
      : 0;
  }

  renderGalleryMedia();
  renderGalleryThumbnails();
};

// Initialize menu detail modal for homepage
const initializeHomePageMenuDetailModal = () => {
  const closeButton = document.getElementById('menu-detail-close-button');
  const overlay = document.getElementById('menu-detail-modal-overlay');

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      if (window.closeMenuDetailModal) {
        window.closeMenuDetailModal();
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        if (window.closeMenuDetailModal) {
          window.closeMenuDetailModal();
        }
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay && overlay.style.display === 'flex') {
      if (window.closeMenuDetailModal) {
        window.closeMenuDetailModal();
      }
    }
  });
};

const initializeHomePage = () => {
  const heroVideo = document.getElementById('hero-video');
  const ctaReservationButton = document.getElementById('cta-reservation');
  const reservationForm = document.getElementById('reservation-form');
  const authOpenButton = document.getElementById('auth-open-button');
  const authCloseButton = document.getElementById('auth-close-button');
  const authOverlay = document.getElementById('auth-modal-overlay');
  const loginTab = document.getElementById('auth-tab-login');
  const registerTab = document.getElementById('auth-tab-register');
  const loginForm = document.getElementById('auth-form-login');
  const registerForm = document.getElementById('auth-form-register');
  const galleryOverlay = document.getElementById('gallery-modal-overlay');
  const galleryCloseButton = document.getElementById('gallery-close-button');
  const galleryPrevButton = document.getElementById('gallery-prev');
  const galleryNextButton = document.getElementById('gallery-next');

  // Initialize menu
  fetchMenu().then((items) => {
  renderMenu(items);
  });

  // Initialize cart
  cartState.items = loadCartItems();
  updateCartBadge();
  renderCartDropdown();
  setupCartListeners();
  
  // Update cart badge on page load
  if (window.appCart) {
    window.appCart.updateBadge();
  }

  // Gallery modal handlers
  if (heroVideo) {
    // Find index of vidkgian1 in gallery (index 1)
    const vidkgian1Index = galleryState.mediaItems.findIndex(item => item.src === '/img/vidkgian1.mp4');
    const startIndex = vidkgian1Index >= 0 ? vidkgian1Index : 1;
    
    console.log('[Gallery] Setting up video click handler, startIndex:', startIndex);
    
    // Add click handler to video
    const handleVideoClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('[Gallery] Video clicked, opening modal at index:', startIndex);
      openGalleryModal(startIndex);
    };
    
    heroVideo.addEventListener('click', handleVideoClick);
    heroVideo.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openGalleryModal(startIndex);
      }
    });
    
    // Also add click handler to parent container
    const heroCardImage = heroVideo.closest('.hero-card-image');
    if (heroCardImage) {
      heroCardImage.addEventListener('click', handleVideoClick);
      console.log('[Gallery] Added click handler to hero-card-image');
    }
    
    // Make video clickable
    heroVideo.style.cursor = 'pointer';
    heroVideo.setAttribute('role', 'button');
    heroVideo.setAttribute('aria-label', 'Xem gallery không gian nhà hàng');
  } else {
    console.warn('[Gallery] Hero video element not found');
  }

  if (galleryCloseButton) {
    galleryCloseButton.addEventListener('click', closeGalleryModal);
  }

  if (galleryOverlay) {
    galleryOverlay.addEventListener('click', (event) => {
      if (event.target === galleryOverlay) {
        closeGalleryModal();
      }
    });
  }

  if (galleryPrevButton) {
    galleryPrevButton.addEventListener('click', () => navigateGallery('prev'));
  }

  if (galleryNextButton) {
    galleryNextButton.addEventListener('click', () => navigateGallery('next'));
  }

  document.addEventListener('keydown', (event) => {
    if (galleryOverlay && galleryOverlay.getAttribute('aria-hidden') === 'false') {
      if (event.key === 'Escape') {
        closeGalleryModal();
      } else if (event.key === 'ArrowLeft') {
        navigateGallery('prev');
      } else if (event.key === 'ArrowRight') {
        navigateGallery('next');
      }
    }
  });

  // Reservation handlers
  if (ctaReservationButton) {
    ctaReservationButton.addEventListener('click', handleScrollToReservation);
    ctaReservationButton.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleScrollToReservation();
      }
    });
  }

  if (reservationForm) {
    reservationForm.addEventListener('submit', handleSubmitReservation);
  }

  // Auth handlers will be set up by initializeAuthModal
  // Don't set up here to avoid conflicts

  if (authCloseButton) {
    authCloseButton.addEventListener('click', () => {
      if (typeof window.closeAuthModal === 'function') {
        window.closeAuthModal();
      }
    });
  }

  if (authOverlay) {
    authOverlay.addEventListener('click', (event) => {
      if (event.target === authOverlay) {
        if (typeof window.closeAuthModal === 'function') {
          window.closeAuthModal();
        }
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

  // Membership register card - open auth modal with register tab
  const membershipRegisterCard = document.getElementById('membership-register-card');
  if (membershipRegisterCard) {
    const handleMembershipCardClick = (e) => {
      // Don't trigger if clicking the button inside
      if (e.target.closest('.promo-cta')) {
        return;
      }
      e.preventDefault();
      if (typeof window.switchAuthTab === 'function' && typeof window.openAuthModal === 'function') {
        window.switchAuthTab('register');
        window.openAuthModal();
      }
    };

    membershipRegisterCard.addEventListener('click', handleMembershipCardClick);
    membershipRegisterCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleMembershipCardClick(e);
      }
    });

    // Button inside card
    const registerButton = membershipRegisterCard.querySelector('.promo-cta');
    if (registerButton) {
      registerButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.switchAuthTab === 'function' && typeof window.openAuthModal === 'function') {
          window.switchAuthTab('register');
          window.openAuthModal();
        }
      });
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      if (typeof window.handleAuthLoginSubmit === 'function') {
        window.handleAuthLoginSubmit(event);
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      if (typeof window.handleAuthRegisterSubmit === 'function') {
        window.handleAuthRegisterSubmit(event);
      }
    });
  }

  // Initialize footer year
  initializeFooterYear();

  // Fetch current user - use function from auth.js
  if (typeof window.fetchCurrentUser === 'function' && typeof window.updateAuthUi === 'function') {
    window.fetchCurrentUser().then((user) => {
    window.updateAuthUi(user);
    });
  }

  // Ensure auth modal is initialized on homepage
  // Wait for auth.js to be fully loaded
  let retryCount = 0;
  const maxRetries = 10;
  
  const initAuth = () => {
    if (typeof window.initializeAuthModal === 'function') {
      console.log('[Auth] Initializing auth modal');
      window.initializeAuthModal();
    } else if (retryCount < maxRetries) {
      retryCount++;
      window.setTimeout(initAuth, 100);
    } else {
      console.error('[Auth] Failed to initialize after', maxRetries, 'attempts');
      // Fallback: setup manually if functions are available
      if (typeof window.openAuthModal === 'function' && typeof window.switchAuthTab === 'function') {
        const btn = document.getElementById('auth-open-button');
        if (btn) {
          btn.addEventListener('click', () => {
            window.switchAuthTab('login');
            window.openAuthModal();
          });
        }
      }
    }
  };
  
  // Start initialization after a short delay
  window.setTimeout(initAuth, 150);
};

const shouldInitializeHomePage = () => {
  const path = window.location.pathname;
  return path === '/' || path === '/index.html';
};

  // Cart is already initialized at the top of the file
  // Auth functions are exposed by auth.js

if (shouldInitializeHomePage()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeHomePageMenuDetailModal();
      initializeHomePage();
    });
  } else {
    initializeHomePageMenuDetailModal();
    initializeHomePage();
  }
}

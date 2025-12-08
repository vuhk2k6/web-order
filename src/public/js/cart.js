/* eslint-disable no-console */
const formatCurrency = (value) => `${(value || 0).toLocaleString('vi-VN')} đ`;

const cartStorageKey = 'cartItems';

// Sync with main.js cart if available
const syncWithMainCart = () => {
  if (typeof window.appCart !== 'undefined' && window.appCart) {
    if (typeof window.appCart.reload === 'function') {
      window.appCart.reload();
    }
  }
};

// Listen for storage events to sync cart across tabs
if (typeof window !== 'undefined') {
  // Storage event (only fires in other tabs)
  window.addEventListener('storage', (e) => {
    if (e.key === 'cartItems') {
      // Reload cart from localStorage
      const items = loadCart();
      renderCartPage(items);
    }
  });
  
  // Custom event for same-tab synchronization
  window.addEventListener('cartUpdated', (e) => {
    if (e.detail && e.detail.items) {
      renderCartPage(e.detail.items);
    }
  });
}

const loadCart = () => {
  try {
    const stored = localStorage.getItem(cartStorageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          ...item,
          size: item.size || 'Vừa (M)',
          note: item.note || ''
        }))
      : [];
  } catch (error) {
    console.error('Không thể đọc giỏ hàng từ localStorage:', error);
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(items));
  } catch (error) {
    console.error('Không thể lưu giỏ hàng vào localStorage:', error);
  }
};

const renderCartPage = (items) => {
  const list = document.getElementById('cart-list');
  const emptyState = document.getElementById('cart-empty-state');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('cart-checkout');

  if (!list || !emptyState || !subtotalEl || !totalEl || !checkoutBtn) {
    return;
  }

  if (!items.length) {
    list.innerHTML = '';
    emptyState.style.display = 'grid';
    checkoutBtn.disabled = true;
    subtotalEl.textContent = '0 đ';
    totalEl.textContent = '0 đ';
    return;
  }

  emptyState.style.display = 'none';
  checkoutBtn.disabled = false;

  list.innerHTML = items
    .map((item) => {
      const id = item.id || '';
      const name = item.name || 'Sản phẩm';
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      const image = item.image || '';
      const size = item.size || 'Vừa (M)';
      const note = item.note || '';
      const lineTotal = price * quantity;

      return `
        <div class="cart-item-row" data-item-id="${id}" data-item-size="${size}">
          <div class="cart-item-left">
            ${image ? `<img src="${image}" alt="${name}" class="cart-item-image" />`
        : '<div class="cart-item-image cart-item-placeholder"></div>'}
            <div class="cart-item-info">
              <h3>${name}</h3>
              <p class="cart-item-size">${size}</p>
              <p class="cart-item-price">${formatCurrency(price)}</p>
              <div class="cart-item-note-wrapper">
                <input 
                  type="text" 
                  class="cart-item-note-input" 
                  placeholder="Thêm ghi chú cho món này..." 
                  value="${note}"
                  data-item-id="${id}"
                  data-item-size="${size}"
                />
              </div>
              <button class="cart-item-remove" type="button">Xóa</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button class="qty-btn" data-action="decrease" aria-label="Giảm số lượng">-</button>
              <input 
                type="number" 
                class="qty-input" 
                value="${quantity}" 
                min="1" 
                data-item-id="${id}"
                data-item-size="${size}"
                aria-label="Số lượng"
              />
              <button class="qty-btn" data-action="increase" aria-label="Tăng số lượng">+</button>
            </div>
            <div class="cart-item-total">${formatCurrency(lineTotal)}</div>
          </div>
        </div>
      `;
    })
    .join('');

  const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  subtotalEl.textContent = formatCurrency(subtotal);
  totalEl.textContent = formatCurrency(subtotal);
};

const updateQuantity = (items, itemId, delta, itemSize = null) => {
  const size = itemSize || 'Vừa (M)';
  const updated = items
    .map((item) => {
      // Match by both id and size
      if (item.id !== itemId || (item.size || 'Vừa (M)') !== size) return item;
      const nextQty = Math.max(1, (item.quantity || 1) + delta);
      return { ...item, quantity: nextQty };
    })
    .filter((item) => item.quantity > 0);

  saveCart(updated);
  return updated;
};

const setQuantity = (items, itemId, newQuantity, itemSize = null) => {
  const size = itemSize || 'Vừa (M)';
  const quantity = Math.max(1, Math.floor(Number(newQuantity)) || 1);
  const updated = items
    .map((item) => {
      // Match by both id and size
      if (item.id !== itemId || (item.size || 'Vừa (M)') !== size) return item;
      return { ...item, quantity };
    });

  saveCart(updated);
  return updated;
};

const updateNote = (items, itemId, note, itemSize = null) => {
  const size = itemSize || 'Vừa (M)';
  const updated = items
    .map((item) => {
      // Match by both id and size
      if (item.id !== itemId || (item.size || 'Vừa (M)') !== size) return item;
      return { ...item, note: note || '' };
    });

  saveCart(updated);
  return updated;
};

const removeItem = (items, itemId, itemSize = null) => {
  const size = itemSize || 'Vừa (M)';
  // Remove item matching both id and size
  const updated = items.filter(
    (item) => item.id !== itemId || (item.size || 'Vừa (M)') !== size
  );
  saveCart(updated);
  return updated;
};

const setupCartPage = () => {
  let cartItems = loadCart();
  renderCartPage(cartItems);

  const list = document.getElementById('cart-list');
  const checkoutBtn = document.getElementById('cart-checkout');
  const continueBtns = document.querySelectorAll('#cart-continue, .cart-continue-link');

  if (list) {
    // Handle click events
    list.addEventListener('click', (event) => {
      const row = event.target.closest('.cart-item-row');
      if (!row) return;
      const itemId = row.getAttribute('data-item-id');
      if (!itemId) return;
      const itemSize = row.getAttribute('data-item-size') || 'Vừa (M)';

      if (event.target.classList.contains('qty-btn')) {
        const delta = event.target.getAttribute('data-action') === 'increase' ? 1 : -1;
        cartItems = updateQuantity(cartItems, itemId, delta, itemSize);
        renderCartPage(cartItems);
        // Sync with main cart
        syncWithMainCart();
        return;
      }

      if (event.target.classList.contains('cart-item-remove')) {
        cartItems = removeItem(cartItems, itemId, itemSize);
        renderCartPage(cartItems);
        // Sync with main cart
        syncWithMainCart();
      }
    });

    // Handle quantity input changes
    list.addEventListener('change', (event) => {
      if (event.target.classList.contains('qty-input')) {
        const row = event.target.closest('.cart-item-row');
        if (!row) return;
        const itemId = row.getAttribute('data-item-id');
        const itemSize = row.getAttribute('data-item-size') || 'Vừa (M)';
        const newQuantity = event.target.value;
        cartItems = setQuantity(cartItems, itemId, newQuantity, itemSize);
        renderCartPage(cartItems);
        // Sync with main cart
        syncWithMainCart();
      }
    });

    // Handle note input changes (with debounce)
    let noteTimeout = null;
    list.addEventListener('input', (event) => {
      if (event.target.classList.contains('cart-item-note-input')) {
        const row = event.target.closest('.cart-item-row');
        if (!row) return;
        const itemId = row.getAttribute('data-item-id');
        const itemSize = row.getAttribute('data-item-size') || 'Vừa (M)';
        const note = event.target.value.trim();

        // Debounce to avoid too many saves
        if (noteTimeout) {
          clearTimeout(noteTimeout);
        }
        noteTimeout = setTimeout(() => {
          cartItems = updateNote(cartItems, itemId, note, itemSize);
          // Sync with main cart
          syncWithMainCart();
        }, 500);
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (!cartItems.length) return;
      window.location.href = '/checkout';
    });
  }

  if (continueBtns.length) {
    continueBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/menu';
      });
    });
  }
  
  // Sync cart on visibility change
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      cartItems = loadCart();
      renderCartPage(cartItems);
      syncWithMainCart();
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCartPage);
} else {
  setupCartPage();
}


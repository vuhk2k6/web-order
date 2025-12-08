/* eslint-disable no-console */
const formatCurrency = (value) => `${(value || 0).toLocaleString('vi-VN')} đ`;

const cartStorageKey = 'cartItems';

const loadCart = () => {
  try {
    const stored = localStorage.getItem(cartStorageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed)
      ? parsed.map((item) => ({
          ...item,
          size: item.size || 'Vừa (M)'
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
      const lineTotal = price * quantity;

      return `
        <div class="cart-item-row" data-item-id="${id}">
          <div class="cart-item-left">
            ${image ? `<img src="${image}" alt="${name}" class="cart-item-image" />`
        : '<div class="cart-item-image cart-item-placeholder"></div>'}
            <div class="cart-item-info">
              <h3>${name}</h3>
              <p class="cart-item-size">${size}</p>
              <p class="cart-item-price">${formatCurrency(price)}</p>
              <button class="cart-item-remove" type="button">Xóa</button>
            </div>
          </div>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button class="qty-btn" data-action="decrease" aria-label="Giảm số lượng">-</button>
              <span class="qty-value">${quantity}</span>
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

const updateQuantity = (items, itemId, delta) => {
  const updated = items
    .map((item) => {
      if (item.id !== itemId) return item;
      const nextQty = Math.max(1, (item.quantity || 1) + delta);
      return { ...item, quantity: nextQty };
    })
    .filter((item) => item.quantity > 0);

  saveCart(updated);
  return updated;
};

const removeItem = (items, itemId) => {
  const updated = items.filter((item) => item.id !== itemId);
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
    list.addEventListener('click', (event) => {
      const row = event.target.closest('.cart-item-row');
      if (!row) return;
      const itemId = row.getAttribute('data-item-id');
      if (!itemId) return;

      if (event.target.classList.contains('qty-btn')) {
        const delta = event.target.getAttribute('data-action') === 'increase' ? 1 : -1;
        cartItems = updateQuantity(cartItems, itemId, delta);
        renderCartPage(cartItems);
        return;
      }

      if (event.target.classList.contains('cart-item-remove')) {
        cartItems = removeItem(cartItems, itemId);
        renderCartPage(cartItems);
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
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupCartPage);
} else {
  setupCartPage();
}


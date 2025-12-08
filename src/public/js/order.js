/* eslint-disable no-console */

// Get orderId from URL
const getOrderIdFromUrl = () => {
  const pathParts = window.location.pathname.split('/');
  const orderIdIndex = pathParts.indexOf('orders');
  if (orderIdIndex !== -1 && pathParts[orderIdIndex + 1]) {
    // Extract orderId - handle cases where MoMo might append extra data
    let orderId = pathParts[orderIdIndex + 1];
    // If there's a comma, take only the part before it (our MongoDB ObjectId)
    // MongoDB ObjectIds are 24 characters, so anything after a comma is likely MoMo data
    if (orderId.includes(',')) {
      orderId = orderId.split(',')[0];
    }
    // Validate it looks like a MongoDB ObjectId (24 hex characters)
    if (/^[a-f\d]{24}$/i.test(orderId)) {
      return orderId;
    }
  }
  return null;
};

// Format currency
const formatCurrency = (amount) => {
  return `${(amount || 0).toLocaleString('vi-VN')} đ`;
};

// Fetch order details
const fetchOrderDetails = async (orderId) => {
  try {
    // Ensure orderId is clean and URL encoded
    const cleanOrderId = encodeURIComponent(orderId);
    const response = await fetch(`/api/orders/${cleanOrderId}`, {
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Không thể tải đơn hàng' }));
      throw new Error(errorData.message || 'Không thể tải đơn hàng');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
    throw error;
  }
};

// Render order items
const renderOrderItems = (items) => {
  const container = document.getElementById('order-items-list');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = '<p>Không có món ăn nào trong đơn hàng này.</p>';
    return;
  }

  container.innerHTML = items
    .map((item) => {
      return `
        <div class="order-item">
          ${item.image ? `
            <img src="${item.image}" alt="${item.name}" class="order-item-image" />
          ` : `
            <div class="order-item-image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          `}
          <div class="order-item-content">
            <h3 class="order-item-name">${item.name || 'Món ăn'}</h3>
            ${item.size ? `<p class="order-item-meta">Size: ${item.size}</p>` : ''}
            <p class="order-item-meta">Số lượng: ${item.quantity} × ${formatCurrency(item.price)}</p>
            ${item.note ? `<p class="order-item-note">Ghi chú: ${item.note}</p>` : ''}
          </div>
          <div class="order-item-total">
            ${formatCurrency(item.total)}
          </div>
        </div>
      `;
    })
    .join('');
};

// Calculate subtotal from items
const calculateSubtotal = (items) => {
  return items.reduce((sum, item) => sum + (item.total || 0), 0);
};

// Render order details
const renderOrderDetails = (data) => {
  const { order, items, payment, deliveryAddress, dineIn } = data;

  // Show content, hide loading
  const loadingEl = document.getElementById('order-loading');
  const contentEl = document.getElementById('order-content');
  const errorEl = document.getElementById('order-error');

  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';

  // Check for payment success message in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('payment') === 'success') {
    const successMsg = document.getElementById('payment-success-message');
    if (successMsg) successMsg.style.display = 'block';
  }

  // Order header
  const orderIdEl = document.getElementById('order-id');
  if (orderIdEl) orderIdEl.textContent = order.id || '—';

  const orderStatusEl = document.getElementById('order-status');
  if (orderStatusEl) {
    orderStatusEl.textContent = order.status || '—';
    orderStatusEl.className = `order-status status-${order.statusCode?.toLowerCase().replace(/_/g, '-') || ''}`;
  }

  const orderDateEl = document.getElementById('order-date');
  if (orderDateEl) orderDateEl.textContent = order.createdAt || '—';

  // Order type
  const orderTypeEl = document.getElementById('order-type');
  if (orderTypeEl) orderTypeEl.textContent = order.orderType || '—';

  // Customer info
  if (order.customer) {
    const customerInfoEl = document.getElementById('customer-info');
    const customerNameEl = document.getElementById('customer-name');
    if (customerInfoEl) customerInfoEl.style.display = 'flex';
    if (customerNameEl) customerNameEl.textContent = order.customer.name || '—';
  }

  // Delivery address
  if (deliveryAddress && order.orderType === 'Giao hàng') {
    const deliveryInfoEl = document.getElementById('delivery-info');
    const deliveryAddressEl = document.getElementById('delivery-address');
    if (deliveryInfoEl) deliveryInfoEl.style.display = 'flex';
    if (deliveryAddressEl) {
      const addressParts = [
        deliveryAddress.address,
        deliveryAddress.ward,
        deliveryAddress.district
      ].filter(Boolean);
      deliveryAddressEl.innerHTML = addressParts.join(', ') || '—';
      if (deliveryAddress.note) {
        deliveryAddressEl.innerHTML += `<br><small>${deliveryAddress.note}</small>`;
      }
    }
  }

  // Dine-in info
  if (dineIn && order.orderType === 'Tại chỗ') {
    const dineinInfoEl = document.getElementById('dinein-info');
    const tableNumberEl = document.getElementById('table-number');
    if (dineinInfoEl) dineinInfoEl.style.display = 'flex';
    if (tableNumberEl) tableNumberEl.textContent = dineIn.tableName || '—';
  }

  // Order items
  renderOrderItems(items);

  // Payment info
  if (payment) {
    const paymentSectionEl = document.getElementById('payment-section');
    const paymentMethodEl = document.getElementById('payment-method');
    const transactionCodeEl = document.getElementById('transaction-code');
    const paymentDateEl = document.getElementById('payment-date');

    if (paymentSectionEl) paymentSectionEl.style.display = 'block';
    if (paymentMethodEl) paymentMethodEl.textContent = payment.method || '—';
    if (transactionCodeEl) transactionCodeEl.textContent = payment.transactionCode || '—';
    if (paymentDateEl) paymentDateEl.textContent = payment.paidAt || '—';
  }

  // Order summary
  const subtotal = calculateSubtotal(items);
  const deliveryFee = order.deliveryFee || 0;
  const promoDiscount = 0; // Could be calculated if needed
  const total = order.totalAmount || subtotal + deliveryFee - promoDiscount;

  const subtotalEl = document.getElementById('subtotal-amount');
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);

  if (deliveryFee > 0) {
    const deliveryFeeRowEl = document.getElementById('delivery-fee-row');
    const deliveryFeeAmountEl = document.getElementById('delivery-fee-amount');
    if (deliveryFeeRowEl) deliveryFeeRowEl.style.display = 'flex';
    if (deliveryFeeAmountEl) deliveryFeeAmountEl.textContent = formatCurrency(deliveryFee);
  }

  if (order.promotion) {
    const promoRowEl = document.getElementById('promo-row');
    const promoDiscountEl = document.getElementById('promo-discount');
    if (promoRowEl) promoRowEl.style.display = 'flex';
    // Calculate discount if needed
    // For now, just show promotion name
    if (promoDiscountEl) promoDiscountEl.textContent = order.promotion.name || '—';
  }

  const totalEl = document.getElementById('total-amount');
  if (totalEl) totalEl.textContent = formatCurrency(total);
};

// Show error
const showError = (message) => {
  const loadingEl = document.getElementById('order-loading');
  const contentEl = document.getElementById('order-content');
  const errorEl = document.getElementById('order-error');
  const errorMessageEl = document.getElementById('error-message');

  if (loadingEl) loadingEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'block';
  if (errorMessageEl) errorMessageEl.textContent = message || 'Không thể tải thông tin đơn hàng.';
};

// Initialize order page
const initializeOrderPage = async () => {
  const orderId = getOrderIdFromUrl();

  if (!orderId) {
    showError('Không tìm thấy mã đơn hàng trong URL.');
    return;
  }

  try {
    const orderData = await fetchOrderDetails(orderId);
    renderOrderDetails(orderData);
  } catch (error) {
    console.error('Lỗi khi khởi tạo trang đơn hàng:', error);
    showError(error.message || 'Không thể tải thông tin đơn hàng.');
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeOrderPage);
} else {
  initializeOrderPage();
}


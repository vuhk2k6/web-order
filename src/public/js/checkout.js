/* eslint-disable no-console */
const checkoutState = {
  currentStep: 1,
  orderType: null,
  deliveryAddress: null,
  tableNumber: null,
  pointsUsed: 0,
  promoCode: null,
  promoDiscount: 0,
  deliveryFee: 0,
  paymentMethod: 'COD',
  onlineMethod: null,
  cartItems: [],
  user: null,
  memberInfo: null
};

// Load cart items from localStorage
const loadCheckoutCart = () => {
  try {
    const stored = localStorage.getItem('cartItems');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Lỗi khi tải giỏ hàng:', error);
    return [];
  }
};

// Fetch current user
const fetchCheckoutUser = async () => {
  try {
    const response = await fetch('/auth/me', {
      credentials: 'same-origin'
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    
    // Handle different response formats
    const userPayload =
      data?.user ||
      data?.customer ||
      data?.member ||
      data?.data ||
      null;

    if (!userPayload) {
      return null;
    }

    // Return user with normalized format
    return userPayload;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    return null;
  }
};

// Fetch member info
const fetchMemberInfo = async (userId) => {
  try {
    if (!userId) {
      return null;
    }
    const response = await fetch(`/api/member/${userId}`, {
      credentials: 'same-origin'
    });
    if (!response.ok) {
      // 404 is OK - user might not be a member yet
      if (response.status === 404) {
        return null;
      }
      return null;
    }
    const data = await response.json();
    return data.member || null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin thành viên:', error);
    return null;
  }
};

// Render cart items
const renderCheckoutCart = () => {
  const container = document.getElementById('checkout-cart-items');
  const emptyMessage = document.getElementById('checkout-cart-empty');
  const subtotalElement = document.getElementById('checkout-subtotal');

  if (!container || !emptyMessage || !subtotalElement) {
    return;
  }

  if (checkoutState.cartItems.length === 0) {
    container.innerHTML = '';
    emptyMessage.style.display = 'block';
    subtotalElement.textContent = '0 đ';
    return;
  }

  emptyMessage.style.display = 'none';

  container.innerHTML = checkoutState.cartItems
    .map((item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      return `
        <div class="checkout-cart-item">
          ${item.image ? `
            <img src="${item.image}" alt="${item.name || 'Món ăn'}" class="checkout-cart-item-image" />
          ` : `
            <div class="checkout-cart-item-image-placeholder">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          `}
          <div class="checkout-cart-item-content">
            <p class="checkout-cart-item-name">${item.name || 'Món ăn'}</p>
            ${item.size ? `<p class="checkout-cart-item-size">${item.size}</p>` : ''}
            <p class="checkout-cart-item-price">${(item.price || 0).toLocaleString('vi-VN')} đ × ${item.quantity || 1}</p>
            ${item.note ? `<p class="checkout-cart-item-note">Ghi chú: ${item.note}</p>` : ''}
          </div>
          <div class="checkout-cart-item-total">${itemTotal.toLocaleString('vi-VN')} đ</div>
        </div>
      `;
    })
    .join('');

  const subtotal = checkoutState.cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );
  subtotalElement.textContent = `${subtotal.toLocaleString('vi-VN')} đ`;
};

// Calculate totals
const calculateTotals = () => {
  const subtotal = checkoutState.cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  const pointsDiscount = checkoutState.pointsUsed || 0;
  const promoDiscount = checkoutState.promoDiscount || 0;
  const deliveryFee = checkoutState.deliveryFee || 0;

  const total = Math.max(0, subtotal - pointsDiscount - promoDiscount + deliveryFee);

  return {
    subtotal,
    pointsDiscount,
    promoDiscount,
    deliveryFee,
    total
  };
};

// Update order summary
const updateOrderSummary = () => {
  const totals = calculateTotals();

  const subtotalEl = document.getElementById('checkout-summary-subtotal');
  const pointsEl = document.getElementById('checkout-summary-points');
  const pointsRow = document.getElementById('checkout-summary-points-row');
  const promoEl = document.getElementById('checkout-summary-promo');
  const promoRow = document.getElementById('checkout-summary-promo-row');
  const deliveryEl = document.getElementById('checkout-summary-delivery');
  const deliveryRow = document.getElementById('checkout-summary-delivery-row');
  const totalEl = document.getElementById('checkout-summary-total');

  if (subtotalEl) subtotalEl.textContent = `${totals.subtotal.toLocaleString('vi-VN')} đ`;
  if (totalEl) totalEl.textContent = `${totals.total.toLocaleString('vi-VN')} đ`;

  if (totals.pointsDiscount > 0) {
    if (pointsEl) pointsEl.textContent = `-${totals.pointsDiscount.toLocaleString('vi-VN')} đ`;
    if (pointsRow) pointsRow.style.display = 'flex';
  } else {
    if (pointsRow) pointsRow.style.display = 'none';
  }

  if (totals.promoDiscount > 0) {
    if (promoEl) promoEl.textContent = `-${totals.promoDiscount.toLocaleString('vi-VN')} đ`;
    if (promoRow) promoRow.style.display = 'flex';
  } else {
    if (promoRow) promoRow.style.display = 'none';
  }

  if (totals.deliveryFee > 0) {
    if (deliveryEl) deliveryEl.textContent = `${totals.deliveryFee.toLocaleString('vi-VN')} đ`;
    if (deliveryRow) deliveryRow.style.display = 'flex';
  } else {
    if (deliveryRow) deliveryRow.style.display = 'none';
  }
};

// Show step
const showStep = (stepNumber) => {
  // Validate step number
  if (stepNumber < 1 || stepNumber > 5) {
    return;
  }

  for (let i = 1; i <= 5; i++) {
    const step = document.getElementById(`step-${i}`);
    if (step) {
      step.style.display = i === stepNumber ? 'block' : 'none';
    }
  }

  checkoutState.currentStep = stepNumber;

  const prevBtn = document.getElementById('checkout-prev-btn');
  const nextBtn = document.getElementById('checkout-next-btn');

  // Show/hide previous button
  if (prevBtn) {
    if (stepNumber > 1) {
      prevBtn.style.display = 'block';
    } else {
      prevBtn.style.display = 'none';
    }
  }

  // Show/hide next button
  if (nextBtn) {
    if (stepNumber === 5) {
      nextBtn.style.display = 'none';
    } else {
      nextBtn.style.display = 'block';
      nextBtn.textContent = stepNumber === 4 ? 'Xác nhận' : 'Tiếp theo';
    }
  }

  // Update summary when showing step 5
  if (stepNumber === 5) {
    updateOrderSummary();
  }
};

// Handle order type change
const handleOrderTypeChange = () => {
  const orderTypes = document.querySelectorAll('input[name="order-type"]');
  const deliverySection = document.getElementById('checkout-delivery-section');
  const dineinSection = document.getElementById('checkout-dinein-section');

  orderTypes.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      checkoutState.orderType = e.target.value;

      if (e.target.value === 'DELIVERY') {
        if (deliverySection) deliverySection.style.display = 'block';
        if (dineinSection) dineinSection.style.display = 'none';
        // Calculate delivery fee (simplified - can be enhanced)
        checkoutState.deliveryFee = 20000;
        const feeEl = document.getElementById('checkout-delivery-fee-amount');
        if (feeEl) feeEl.textContent = '20,000 đ';
        const feeSection = document.getElementById('checkout-delivery-fee');
        if (feeSection) feeSection.style.display = 'flex';
      } else if (e.target.value === 'DINE_IN') {
        if (deliverySection) deliverySection.style.display = 'none';
        if (dineinSection) dineinSection.style.display = 'block';
        checkoutState.deliveryFee = 0;
        const feeSection = document.getElementById('checkout-delivery-fee');
        if (feeSection) feeSection.style.display = 'none';
      } else {
        if (deliverySection) deliverySection.style.display = 'none';
        if (dineinSection) dineinSection.style.display = 'none';
        checkoutState.deliveryFee = 0;
        const feeSection = document.getElementById('checkout-delivery-fee');
        if (feeSection) feeSection.style.display = 'none';
      }
    });
  });
};

// Handle points input
const handlePointsInput = () => {
  const pointsInput = document.getElementById('checkout-points-used');
  const availablePointsEl = document.getElementById('checkout-available-points');
  const maxPointsEl = document.getElementById('checkout-max-points');

  if (!pointsInput) return;

  pointsInput.addEventListener('input', (e) => {
    const requestedPoints = parseInt(e.target.value) || 0;
    const totals = calculateTotals();
      const maxPoints = Math.min(
        checkoutState.memberInfo?.points || 0,
        totals.subtotal
      );

    if (requestedPoints > maxPoints) {
      e.target.value = maxPoints;
      checkoutState.pointsUsed = maxPoints;
    } else {
      checkoutState.pointsUsed = requestedPoints;
    }

    updateOrderSummary();
  });
};

// Handle promo code
const handlePromoCode = async () => {
  const promoInput = document.getElementById('checkout-promo-code');
  const applyBtn = document.getElementById('checkout-apply-promo-btn');
  const removeBtn = document.getElementById('checkout-remove-promo-btn');
  const promoMessage = document.getElementById('checkout-promo-message');
  const promoApplied = document.getElementById('checkout-promo-applied');
  const promoName = document.getElementById('checkout-promo-name');
  const promoDiscount = document.getElementById('checkout-promo-discount');

  if (!applyBtn) return;

  applyBtn.addEventListener('click', async () => {
    const code = promoInput?.value.trim();
    if (!code) {
      if (promoMessage) {
        promoMessage.textContent = 'Vui lòng nhập mã khuyến mãi';
        promoMessage.className = 'checkout-message error';
        promoMessage.style.display = 'block';
      }
      return;
    }

    try {
      const totals = calculateTotals();
      const response = await fetch(`/api/promotions/validate/${code}?subtotal=${totals.subtotal}`, {
        credentials: 'same-origin'
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        if (promoMessage) {
          promoMessage.textContent = data.message || 'Mã khuyến mãi không hợp lệ';
          promoMessage.className = 'checkout-message error';
          promoMessage.style.display = 'block';
        }
        return;
      }

      checkoutState.promoCode = code;
      checkoutState.promoDiscount = data.discount || 0;

      if (promoMessage) {
        promoMessage.textContent = 'Áp dụng mã khuyến mãi thành công';
        promoMessage.className = 'checkout-message success';
        promoMessage.style.display = 'block';
      }

      if (promoApplied) promoApplied.style.display = 'flex';
      if (promoName) promoName.textContent = data.name || code;
      if (promoDiscount) promoDiscount.textContent = `-${checkoutState.promoDiscount.toLocaleString('vi-VN')} đ`;

      updateOrderSummary();
    } catch (error) {
      console.error('Lỗi khi kiểm tra mã khuyến mãi:', error);
      if (promoMessage) {
        promoMessage.textContent = 'Không thể kiểm tra mã khuyến mãi. Vui lòng thử lại.';
        promoMessage.className = 'checkout-message error';
        promoMessage.style.display = 'block';
      }
    }
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      checkoutState.promoCode = null;
      checkoutState.promoDiscount = 0;
      if (promoInput) promoInput.value = '';
      if (promoMessage) promoMessage.style.display = 'none';
      if (promoApplied) promoApplied.style.display = 'none';
      updateOrderSummary();
    });
  }
};

// Handle payment method
const handlePaymentMethod = () => {
  const paymentMethods = document.querySelectorAll('input[name="payment-method"]');

  paymentMethods.forEach((radio) => {
    radio.addEventListener('change', (e) => {
      checkoutState.paymentMethod = e.target.value;
      // MOMO is now a direct payment method, no need for sub-options
      if (e.target.value === 'MOMO') {
        checkoutState.onlineMethod = 'MOMO';
      } else {
        checkoutState.onlineMethod = null;
      }
    });
  });
};

// Create MoMo payment request
const createMoMoPayment = async (orderId, pointsUsed) => {
  try {
    const response = await fetch('/api/payments/momo/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ orderId, pointsUsed: pointsUsed || 0 })
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error response - data might not have success field
      const errorMsg = data.message || data.error || 'Không thể tạo yêu cầu thanh toán MoMo';
      throw new Error(errorMsg);
    }

    if (!data.success) {
      throw new Error(data.message || data.error || 'Không thể tạo yêu cầu thanh toán MoMo');
    }

    // Redirect to MoMo payment page
    if (data.payUrl) {
      window.location.href = data.payUrl;
    } else {
      throw new Error('Không nhận được link thanh toán từ MoMo');
    }
  } catch (error) {
    console.error('Lỗi khi tạo thanh toán MoMo:', error);
    throw error;
  }
};

// Submit order
const submitOrder = async () => {
  const submitBtn = document.getElementById('checkout-submit-btn');
  if (!submitBtn) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Đang xử lý...';

  const totals = calculateTotals();

  const orderData = {
    orderType: checkoutState.orderType,
    items: checkoutState.cartItems,
    subtotal: totals.subtotal,
    pointsUsed: totals.pointsDiscount,
    promoCode: checkoutState.promoCode,
    promoDiscount: totals.promoDiscount,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    paymentMethod: checkoutState.paymentMethod,
    onlineMethod: checkoutState.onlineMethod,
    deliveryAddress: checkoutState.deliveryAddress,
    tableNumber: checkoutState.tableNumber
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(orderData)
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Hoàn tất đơn hàng';
      return;
    }

    // Check if payment is required (MoMo)
    if (checkoutState.paymentMethod === 'MOMO') {
      // Clear cart before redirecting to payment
      localStorage.removeItem('cartItems');
      if (window.appCart) {
        window.appCart.updateBadge();
      }
      
      // Create MoMo payment and redirect
      submitBtn.textContent = 'Đang chuyển đến trang thanh toán...';
      await createMoMoPayment(data.orderId, totals.pointsDiscount);
      return;
    }

    // Clear cart for other payment methods
    localStorage.removeItem('cartItems');
    if (window.appCart) {
      window.appCart.updateBadge();
    }

    // Redirect to order confirmation
    window.location.href = `/orders/${data.orderId}`;
  } catch (error) {
    console.error('Lỗi khi tạo đơn hàng:', error);
    alert(error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Hoàn tất đơn hàng';
  }
};

// Navigation handlers
let navigationSetup = false;
const setupNavigation = () => {
  // Prevent duplicate event listeners
  if (navigationSetup) {
    return;
  }
  navigationSetup = true;

  const nextBtn = document.getElementById('checkout-next-btn');
  const prevBtn = document.getElementById('checkout-prev-btn');
  const submitBtn = document.getElementById('checkout-submit-btn');

  if (nextBtn) {
    // Remove existing listener if any
    const newNextBtn = nextBtn.cloneNode(true);
    nextBtn.parentNode?.replaceChild(newNextBtn, nextBtn);
    
    newNextBtn.addEventListener('click', () => {
      // Validate current step
      if (checkoutState.currentStep === 1) {
        if (!checkoutState.orderType) {
          alert('Vui lòng chọn loại đơn hàng');
          return;
        }
      }

      if (checkoutState.currentStep === 2) {
        // Check if user wants to use points but is not logged in
        const pointsInput = document.getElementById('checkout-points-used');
        const pointsUsed = pointsInput ? parseInt(pointsInput.value) || 0 : 0;
        
        if (pointsUsed > 0 && !checkoutState.user) {
          alert('Vui lòng đăng nhập để sử dụng điểm tích lũy');
          if (typeof window.openAuthModal === 'function') {
            window.openAuthModal();
          }
          return;
        }

        if (checkoutState.orderType === 'DELIVERY') {
          // Check if using saved address or new address
          const selectedAddress = document.querySelector('.checkout-saved-address.selected');
          if (selectedAddress) {
            // Using saved address - requires login
            if (!checkoutState.user) {
              alert('Vui lòng đăng nhập để sử dụng địa chỉ đã lưu');
              if (typeof window.openAuthModal === 'function') {
                window.openAuthModal();
              }
              return;
            }
            const addressId = selectedAddress.getAttribute('data-address-id');
            checkoutState.deliveryAddress = { savedAddressId: addressId };
          } else {
            // Using new address
            const street = document.getElementById('checkout-address-street')?.value.trim();
            const ward = document.getElementById('checkout-address-ward')?.value.trim();
            const district = document.getElementById('checkout-address-district')?.value.trim();
            const city = document.getElementById('checkout-address-city')?.value.trim();
            const phone = document.getElementById('checkout-address-phone')?.value.trim();
            
            if (!street || !ward || !district || !city) {
              alert('Vui lòng nhập đầy đủ địa chỉ giao hàng');
              return;
            }
            
            checkoutState.deliveryAddress = {
              street,
              ward,
              district,
              city,
              phone
            };
          }
        }
        if (checkoutState.orderType === 'DINE_IN') {
          const tableInput = document.getElementById('checkout-table-number');
          if (tableInput && !tableInput.value.trim()) {
            alert('Vui lòng nhập số bàn');
            return;
          }
          checkoutState.tableNumber = tableInput?.value.trim() || null;
        }
      }

      if (checkoutState.currentStep === 4) {
        if (!checkoutState.paymentMethod) {
          alert('Vui lòng chọn phương thức thanh toán');
          return;
        }
      }

      showStep(checkoutState.currentStep + 1);
    });
  }

  if (prevBtn) {
    // Remove existing listener if any
    const newPrevBtn = prevBtn.cloneNode(true);
    prevBtn.parentNode?.replaceChild(newPrevBtn, prevBtn);
    
    newPrevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const previousStep = checkoutState.currentStep - 1;
      if (previousStep >= 1) {
        showStep(previousStep);
      }
    });
  }

  if (submitBtn) {
    // Remove existing listener if any
    const newSubmitBtn = submitBtn.cloneNode(true);
    submitBtn.parentNode?.replaceChild(newSubmitBtn, submitBtn);
    
    newSubmitBtn.addEventListener('click', submitOrder);
  }
};

// Load saved addresses
const loadSavedAddresses = async () => {
  try {
    const response = await fetch('/api/delivery-addresses', {
      credentials: 'same-origin'
    });
    if (response.ok) {
      const data = await response.json();
      const container = document.getElementById('checkout-saved-addresses');
      if (container && data.addresses && data.addresses.length > 0) {
        container.innerHTML = data.addresses.map((addr, index) => `
          <div class="checkout-saved-address" data-address-id="${addr._id}" ${index === 0 ? 'data-selected="true"' : ''}>
            <p><strong>${addr.address}</strong></p>
            ${addr.ward ? `<p>${addr.ward}, ${addr.district || ''}</p>` : ''}
          </div>
        `).join('');

        // Attach click handlers
        container.querySelectorAll('.checkout-saved-address').forEach((el) => {
          el.addEventListener('click', () => {
            container.querySelectorAll('.checkout-saved-address').forEach((a) => {
              a.classList.remove('selected');
            });
            el.classList.add('selected');
            checkoutState.deliveryAddress = { savedAddressId: el.getAttribute('data-address-id') };
          });
        });

        // Select first address by default
        const firstAddress = container.querySelector('.checkout-saved-address[data-selected="true"]');
        if (firstAddress) {
          firstAddress.classList.add('selected');
          checkoutState.deliveryAddress = { savedAddressId: firstAddress.getAttribute('data-address-id') };
        }
      }
    }
  } catch (error) {
    console.error('Lỗi khi tải địa chỉ đã lưu:', error);
  }
};

// Handle add new address button
const handleAddAddressButton = () => {
  const addBtn = document.getElementById('checkout-add-address-btn');
  const form = document.getElementById('checkout-new-address-form');
  
  if (addBtn && form) {
    addBtn.addEventListener('click', () => {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    });
  }
};

// Update checkout state after login
const updateCheckoutAfterLogin = async () => {
  try {
    // Reload user info using the same method as auth.js
    if (typeof window.fetchCurrentUser === 'function') {
      checkoutState.user = await window.fetchCurrentUser();
    } else {
      checkoutState.user = await fetchCheckoutUser();
    }

    // Load member info if user is logged in
    if (checkoutState.user) {
      const userId = checkoutState.user._id || checkoutState.user.id;
      
      if (userId && checkoutState.user.accountType === 'THANH_VIEN') {
        checkoutState.memberInfo = await fetchMemberInfo(userId);

        // Show points section
        const pointsSection = document.getElementById('checkout-points-section');
        if (pointsSection && checkoutState.memberInfo) {
          pointsSection.style.display = 'block';
          const availablePointsEl = document.getElementById('checkout-available-points');
          const maxPointsEl = document.getElementById('checkout-max-points');
          if (availablePointsEl) {
            availablePointsEl.textContent = checkoutState.memberInfo.points || 0;
          }
          if (maxPointsEl) {
            const totals = calculateTotals();
            maxPointsEl.textContent = Math.min(
              checkoutState.memberInfo.points || 0,
              totals.subtotal
            );
          }
        }
      } else {
        // Hide points section if user is not a member
        const pointsSection = document.getElementById('checkout-points-section');
        if (pointsSection) {
          pointsSection.style.display = 'none';
        }
      }
    }

    // Load saved addresses if delivery is selected
    if (checkoutState.orderType === 'DELIVERY') {
      await loadSavedAddresses();
    }

    // Update order summary
    updateOrderSummary();
    
    console.log('[Checkout] State updated after login:', {
      user: checkoutState.user ? 'Logged in' : 'Not logged in',
      memberInfo: checkoutState.memberInfo ? 'Has member info' : 'No member info'
    });
  } catch (error) {
    console.error('[Checkout] Error updating state after login:', error);
  }
};

// Initialize checkout page
const initializeCheckout = async () => {
  // Load cart items
  checkoutState.cartItems = loadCheckoutCart();

  if (checkoutState.cartItems.length === 0) {
    alert('Giỏ hàng của bạn đang trống. Chuyển đến trang thực đơn...');
    window.location.href = '/menu';
    return;
  }

  // Load user info
  checkoutState.user = await fetchCheckoutUser();

  // Load member info if user is logged in
  if (checkoutState.user) {
    const userId = checkoutState.user._id || checkoutState.user.id;
    if (userId && checkoutState.user.accountType === 'THANH_VIEN') {
      checkoutState.memberInfo = await fetchMemberInfo(userId);

      // Show points section
      const pointsSection = document.getElementById('checkout-points-section');
      if (pointsSection && checkoutState.memberInfo) {
        pointsSection.style.display = 'block';
        const availablePointsEl = document.getElementById('checkout-available-points');
        const maxPointsEl = document.getElementById('checkout-max-points');
        if (availablePointsEl) {
          availablePointsEl.textContent = checkoutState.memberInfo.points || 0;
        }
        if (maxPointsEl) {
          const totals = calculateTotals();
          maxPointsEl.textContent = Math.min(
            checkoutState.memberInfo.points || 0,
            totals.subtotal
          );
        }
      }
    }
  }

  // Render cart
  renderCheckoutCart();

  // Setup handlers
  handleOrderTypeChange();
  handlePointsInput();
  handlePromoCode();
  handlePaymentMethod();
  handleAddAddressButton();
  setupNavigation();

  // Show first step
  showStep(1);
};

// Export function for auth.js to use
if (typeof window !== 'undefined') {
  window.updateCheckoutAfterLogin = updateCheckoutAfterLogin;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCheckout);
} else {
  initializeCheckout();
}


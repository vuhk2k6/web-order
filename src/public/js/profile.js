/* eslint-disable no-console */
const getProfileElement = (id) => document.getElementById(id);

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (value) => {
  return `${(value || 0).toLocaleString('vi-VN')} đ`;
};

const setProfileAvatar = (user) => {
  const avatarElement = getProfileElement('profile-avatar');

  if (!avatarElement || !user) {
    return;
  }

  const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';
  avatarElement.textContent = initial;
};

const renderProfileHeader = (user, points = 0) => {
  const nameElement = getProfileElement('profile-name');
  const accountTypeElement = getProfileElement('profile-account-type');
  const createdAtElement = getProfileElement('profile-created-at');
  const nameDetailElement = getProfileElement('profile-name-detail');
  const phoneElement = getProfileElement('profile-phone');
  const emailElement = getProfileElement('profile-email');
  const headerPointsSection = getProfileElement('profile-header-points');
  const headerPointsValue = getProfileElement('profile-header-points-value');

  if (!user) {
    if (nameElement) nameElement.textContent = 'Khách hàng';
    if (accountTypeElement) accountTypeElement.textContent = 'Tài khoản khách';
    if (nameDetailElement) nameDetailElement.textContent = '—';
    if (phoneElement) phoneElement.textContent = '—';
    if (emailElement) emailElement.textContent = '—';
    if (headerPointsSection) headerPointsSection.style.display = 'none';
    return;
  }

  if (nameElement) nameElement.textContent = user.name || 'Khách hàng';
  if (nameDetailElement) nameDetailElement.textContent = user.name || '—';
  if (phoneElement) phoneElement.textContent = user.phone || '—';
  if (emailElement) emailElement.textContent = user.email || '—';
  
  if (accountTypeElement) {
    accountTypeElement.textContent =
      user.accountType === 'THANH_VIEN'
        ? 'Thành viên tích điểm'
        : 'Tài khoản khách';
  }
  
  if (createdAtElement) {
    createdAtElement.textContent = formatDate(user.createdAt);
  }

  // Show points badge if user is a member
  if (headerPointsSection) {
    if (user.accountType === 'THANH_VIEN' && points !== undefined) {
      headerPointsSection.style.display = 'block';
      if (headerPointsValue) {
        headerPointsValue.textContent = (points || 0).toLocaleString('vi-VN');
      }
    } else {
      headerPointsSection.style.display = 'none';
    }
  }

  setProfileAvatar(user);
};

const renderStats = (stats) => {
  const statsSection = getProfileElement('profile-stats-section');
  if (!statsSection || !stats) return;

  const totalOrdersEl = getProfileElement('stat-total-orders');
  const totalSpentEl = getProfileElement('stat-total-spent');
  const pointsEl = getProfileElement('stat-points');
  const completedOrdersEl = getProfileElement('stat-completed-orders');

  if (totalOrdersEl) totalOrdersEl.textContent = stats.totalOrders || 0;
  if (totalSpentEl) totalSpentEl.textContent = formatCurrency(stats.totalSpent || 0);
  if (pointsEl) pointsEl.textContent = (stats.points || 0).toLocaleString('vi-VN');
  if (completedOrdersEl) completedOrdersEl.textContent = stats.completedOrders || 0;

  statsSection.style.display = 'grid';
};

const renderRecentOrders = (orders) => {
  const ordersSection = getProfileElement('profile-orders-section');
  const ordersList = getProfileElement('profile-orders-list');
  const ordersEmpty = getProfileElement('profile-orders-empty');

  if (!ordersSection) {
    console.warn('[Profile] Không tìm thấy element profile-orders-section');
    return;
  }

  // Always show section, even if empty
  ordersSection.style.display = 'block';

  if (!orders || orders.length === 0) {
    if (ordersList) ordersList.innerHTML = '';
    if (ordersEmpty) ordersEmpty.style.display = 'block';
    return;
  }

  if (ordersEmpty) ordersEmpty.style.display = 'none';
  if (ordersList) {
    ordersList.innerHTML = orders.map((order) => {
      const statusMap = {
        'CHO_XAC_NHAN': 'Chờ xác nhận',
        'CHO_THANH_TOAN': 'Chờ thanh toán',
        'DA_XAC_NHAN': 'Đã xác nhận',
        'DANG_CHUAN_BI': 'Đang chuẩn bị',
        'DANG_GIAO': 'Đang giao',
        'HOAN_THANH': 'Hoàn thành',
        'DA_HUY': 'Đã hủy',
        'THANH_TOAN_THAT_BAI': 'Thanh toán thất bại'
      };

      const orderTypeMap = {
        'TAI_CHO': 'Tại chỗ',
        'ONLINE': 'Giao hàng',
        'MANG_VE': 'Mang về'
      };

      const statusClass = order.status === 'HOAN_THANH' ? 'status-completed' : 
                         order.status === 'DA_HUY' ? 'status-cancelled' : 'status-pending';

      return `
        <div class="profile-order-item" onclick="window.location.href='/orders/${order.id}'">
          <div class="profile-order-info">
            <p class="profile-order-id">#${order.id.substring(order.id.length - 6)}</p>
            <p class="profile-order-date">${order.createdAt || ''}</p>
            <p class="profile-order-type">${orderTypeMap[order.orderType] || order.orderType}</p>
          </div>
          <div class="profile-order-right">
            <span class="profile-order-status ${statusClass}">${statusMap[order.status] || order.status}</span>
            <span class="profile-order-amount">${formatCurrency(order.totalAmount)}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  ordersSection.style.display = 'block';
};

const renderSavedAddresses = (addresses) => {
  const addressesSection = getProfileElement('profile-addresses-section');
  const addressesList = getProfileElement('profile-addresses-list');
  const addressesEmpty = getProfileElement('profile-addresses-empty');

  if (!addressesSection) {
    console.warn('[Profile] Không tìm thấy element profile-addresses-section');
    return;
  }

  // Always show section if there are any orders (even if no addresses yet)
  addressesSection.style.display = 'block';

  if (!addresses || addresses.length === 0) {
    if (addressesList) addressesList.innerHTML = '';
    if (addressesEmpty) addressesEmpty.style.display = 'block';
    return;
  }

  if (addressesEmpty) addressesEmpty.style.display = 'none';
  if (addressesList) {
    addressesList.innerHTML = addresses.slice(0, 5).map((addr) => {
      const fullAddress = [addr.address, addr.ward, addr.district].filter(Boolean).join(', ');
      return `
        <div class="profile-address-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div class="profile-address-content">
            <p class="profile-address-text">${fullAddress || '—'}</p>
            ${addr.note ? `<p class="profile-address-note">${addr.note}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  addressesSection.style.display = 'block';
};

const renderPointsTransactions = (member, transactions) => {
  const pointsSection = getProfileElement('profile-points-section');
  const pointsBalanceEl = getProfileElement('profile-points-balance');
  const transactionsList = getProfileElement('profile-transactions-list');
  const transactionsEmpty = getProfileElement('profile-transactions-empty');

  if (!pointsSection) {
    console.warn('[Profile] Không tìm thấy element profile-points-section');
    return;
  }

  // Only show points section if user is a member
  if (!member) {
    pointsSection.style.display = 'none';
    return;
  }

  // Show section
  pointsSection.style.display = 'block';

  // Set points balance
  if (pointsBalanceEl) {
    pointsBalanceEl.textContent = (member.points || 0).toLocaleString('vi-VN');
  }

  // Render transactions
  if (!transactions || transactions.length === 0) {
    if (transactionsList) transactionsList.innerHTML = '';
    if (transactionsEmpty) {
      transactionsEmpty.style.display = 'block';
      transactionsEmpty.textContent = 'Chưa có giao dịch điểm nào.';
    }
  } else {
    if (transactionsEmpty) transactionsEmpty.style.display = 'none';
    if (transactionsList) {
      transactionsList.innerHTML = transactions.map((tx) => {
        // Determine if transaction is positive (earned) or negative (used)
        const isPositive = tx.type === 'EARNED' || (tx.points && tx.points > 0);
        return `
          <div class="profile-transaction-item">
            <div class="profile-transaction-icon ${isPositive ? 'positive' : 'negative'}">
              ${isPositive ? '+' : '−'}
            </div>
            <div class="profile-transaction-info">
              <p class="profile-transaction-note">${tx.note || 'Giao dịch điểm'}</p>
              <p class="profile-transaction-date">${tx.createdAt || ''}</p>
            </div>
            <div class="profile-transaction-points ${isPositive ? 'positive' : 'negative'}">
              ${isPositive ? '+' : ''}${Math.abs(tx.points || 0)}
            </div>
          </div>
        `;
      }).join('');
    }
  }
};

const fetchProfileUser = async () => {
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
    console.error('Lỗi khi tải thông tin tài khoản', error);
    return null;
  }
};

const fetchProfileData = async () => {
  try {
    console.log('[Profile] Đang fetch /api/profile...');
    const response = await fetch('/api/profile', {
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Profile] Không thể tải thông tin profile:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[Profile] Nhận được dữ liệu từ database:', {
      customer: data.customer,
      hasStats: !!data.stats,
      hasOrders: !!data.recentOrders,
      hasTransactions: !!data.pointTransactions,
      hasAddresses: !!data.savedAddresses,
      hasMember: !!data.member,
      stats: data.stats,
      ordersCount: data.recentOrders?.length || 0,
      transactionsCount: data.pointTransactions?.length || 0,
      addressesCount: data.savedAddresses?.length || 0
    });
    return data;
  } catch (error) {
    console.error('[Profile] Lỗi khi tải thông tin profile:', error);
    return null;
  }
};

const handleProfileLogout = async () => {
  try {
    const response = await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      return;
    }

    window.location.href = '/';
  } catch (error) {
    console.error('Lỗi khi đăng xuất', error);
  }
};

const initializeProfilePage = async () => {
  // Fetch profile data from API (includes customer info)
  const profileData = await fetchProfileData();

  if (!profileData || !profileData.customer) {
    console.warn('[Profile] Không có dữ liệu profile, redirect về trang chủ');
    window.location.href = '/';
    return;
  }

  const customer = profileData.customer;
  const memberPoints = profileData.member?.points || profileData.stats?.points || 0;

  // Render basic user info from profile data (with points)
  renderProfileHeader({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    accountType: customer.accountType || 'KHACH',
    createdAt: customer.createdAt
  }, memberPoints);

  // Render header
  if (typeof window.renderSharedHeader === 'function') {
    window.renderSharedHeader({
      logoSubtext: 'Tài khoản khách hàng',
      activeNavLink: '',
      showAuthButton: true,
      authButtonText: customer.name ? customer.name.trim().charAt(0).toUpperCase() : 'Đăng xuất',
      authButtonId: 'profile-logout-button',
      onAuthClick: handleProfileLogout
    });
  }

  // Always render stats (even if 0)
  if (profileData.stats) {
    renderStats(profileData.stats);
  } else {
    renderStats({
      totalOrders: 0,
      totalSpent: 0,
      completedOrders: 0,
      points: 0
    });
  }

  // Render orders (show section even if empty)
  renderRecentOrders(profileData.recentOrders || []);

  // Render addresses (show section even if empty)
  renderSavedAddresses(profileData.savedAddresses || []);
};

if (typeof window !== 'undefined') {
  window.handleProfileLogout = handleProfileLogout;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProfilePage);
} else {
  initializeProfilePage();
}

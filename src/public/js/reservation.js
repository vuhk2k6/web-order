/* eslint-disable no-console */

const getReservationElement = (id) => document.getElementById(id);

let selectedTableIds = [];
let tablesData = [];

const fetchTables = async () => {
  try {
    const response = await fetch('/api/tables');
    if (!response.ok) {
      throw new Error('Không thể lấy danh sách bàn');
    }
    const tables = await response.json();
    tablesData = tables;
    return tables;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bàn:', error);
    return [];
  }
};

const renderTableMap = (tables) => {
  const container = getReservationElement('table-map-container');
  if (!container) return;

  if (!tables || tables.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1;">Chưa có bàn nào trong hệ thống.</p>';
    return;
  }

  container.innerHTML = tables.map(table => {
    // Use displayStatus from API (same as admin)
    const displayStatus = table.displayStatus || table.status;
    const isAvailable = displayStatus === 'TRONG';
    const isSelected = selectedTableIds.includes(table.id);
    let className = 'table-item';
    let statusText = '';
    
    if (isSelected) {
      className += ' selected';
      statusText = 'Đã chọn';
    } else if (displayStatus === 'RESERVED') {
      className += ' reserved';
      statusText = 'Đã đặt';
    } else if (displayStatus === 'DANG_DUNG') {
      className += ' occupied';
      statusText = 'Đang dùng';
    } else if (displayStatus === 'DANG_DON') {
      className += ' occupied';
      statusText = 'Đang dọn';
    } else if (isAvailable) {
      className += ' available';
      statusText = 'Trống';
    } else {
      className += ' occupied';
      statusText = 'Đã đặt';
    }

    return `
      <div 
        class="${className}" 
        data-table-id="${table.id}"
        data-table-status="${table.status}"
        data-display-status="${displayStatus}"
        ${isAvailable ? 'onclick="handleTableClick(\'' + table.id + '\')"' : 'style="cursor: not-allowed;"'}
      >
        <div class="table-item-name">${table.name}</div>
        <div class="table-item-seats">${table.seats} chỗ</div>
        ${table.location ? `<div class="table-item-location">${table.location}</div>` : ''}
        <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">${statusText}</div>
      </div>
    `;
  }).join('');
};

const handleTableClick = (tableId) => {
  const table = tablesData.find(t => t.id === tableId);
  if (!table) return;
  
  // Only allow selecting tables with displayStatus === 'TRONG'
  const displayStatus = table.displayStatus || table.status;
  if (displayStatus !== 'TRONG') {
    alert('Bàn này đã được đặt hoặc đang sử dụng. Vui lòng chọn bàn khác.');
    return;
  }

  const index = selectedTableIds.indexOf(tableId);
  if (index > -1) {
    selectedTableIds.splice(index, 1);
  } else {
    selectedTableIds.push(tableId);
  }

  updateSelectedTablesInfo();
  renderTableMap(tablesData);
};

const updateSelectedTablesInfo = () => {
  const infoElement = getReservationElement('selected-tables-info');
  const listElement = getReservationElement('selected-tables-list');
  const tableIdsInput = getReservationElement('reservation-table-ids');

  if (selectedTableIds.length > 0) {
    if (infoElement) infoElement.style.display = 'block';
    if (listElement) {
      const selectedTableNames = selectedTableIds.map(id => {
        const table = tablesData.find(t => t.id === id);
        return table ? table.name : id;
      });
      listElement.textContent = selectedTableNames.join(', ');
    }
    if (tableIdsInput) {
      tableIdsInput.value = JSON.stringify(selectedTableIds);
    }
  } else {
    if (infoElement) infoElement.style.display = 'none';
    if (tableIdsInput) tableIdsInput.value = '';
  }
};

window.handleTableClick = handleTableClick;

const handleSubmitReservation = async (event) => {
  event.preventDefault();

  const nameInput = getReservationElement('reservation-name');
  const phoneInput = getReservationElement('reservation-phone');
  const guestsInput = getReservationElement('reservation-guests');
  const dateInput = getReservationElement('reservation-date');
  const timeInput = getReservationElement('reservation-time');
  const noteInput = getReservationElement('reservation-note');
  const messageElement = getReservationElement('reservation-message');
  const submitButton = event.target.querySelector('button[type="submit"]');
  const tableIdsInput = getReservationElement('reservation-table-ids');
  
  if (
    !nameInput ||
    !phoneInput ||
    !guestsInput ||
    !dateInput ||
    !timeInput ||
    !messageElement ||
    !submitButton
  ) {
    return;
  }

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();
  const guests = guestsInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;
  const note = noteInput ? noteInput.value.trim() : '';

  // Validation
  if (!name || !phone || !guests || !date || !time) {
    messageElement.textContent = 'Vui lòng điền đầy đủ thông tin đặt bàn.';
    messageElement.className = 'reservation-message error';
    messageElement.style.display = 'block';
    return;
  }

  // Disable submit button
  submitButton.disabled = true;
  const originalText = submitButton.textContent;
  submitButton.textContent = 'Đang xử lý...';

  try {
    // Combine date and time
    const reservedAt = new Date(`${date}T${time}`);
    
    // Get selected table IDs
    let tableIds = [];
    if (tableIdsInput && tableIdsInput.value) {
      try {
        tableIds = JSON.parse(tableIdsInput.value);
      } catch (e) {
        console.warn('Không thể parse tableIds:', e);
      }
    }
    
    // Prepare reservation data
    const reservationData = {
      guestName: name,
      guestPhone: phone,
      guestCount: parseInt(guests, 10),
      reservedAt: reservedAt.toISOString(),
      note: note || undefined,
      tableIds: tableIds
    };

    // Send reservation request
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reservationData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể gửi yêu cầu đặt bàn');
    }

    // Success
    messageElement.textContent =
      'Cảm ơn bạn! Chúng tôi đã ghi nhận yêu cầu và sẽ liên hệ xác nhận trong thời gian sớm nhất.';
    messageElement.className = 'reservation-message success';
    messageElement.style.display = 'block';

    // Reset form and selected tables
    window.setTimeout(() => {
      const form = getReservationElement('reservation-form');
      if (form) {
        form.reset();
        messageElement.style.display = 'none';
      }
      selectedTableIds = [];
      updateSelectedTablesInfo();
      fetchTables().then(tables => renderTableMap(tables));
    }, 3000);

  } catch (error) {
    console.error('Lỗi khi đặt bàn:', error);
    messageElement.textContent = error.message || 'Có lỗi xảy ra. Vui lòng thử lại sau.';
    messageElement.className = 'reservation-message error';
    messageElement.style.display = 'block';
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
};

const initializeReservationPage = async () => {
  // Check if header is already rendered
  const container = document.getElementById('shared-header');
  const headerExists = container && container.children.length > 0;
  
  // Only render header if not already rendered
  if (!headerExists && typeof window.renderSharedHeader === 'function') {
    let authButtonText = 'Đăng nhập';
    
    if (typeof window.fetchCurrentUser === 'function') {
      const user = await window.fetchCurrentUser();
      if (user) {
        const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';
        authButtonText = initial;
      }
    }
    
    window.renderSharedHeader({
      logoSubtext: 'Đặt bàn trực tuyến',
      activeNavLink: 'reservation',
      showAuthButton: true,
      authButtonText: authButtonText,
      authButtonId: 'auth-open-button',
      onAuthClick: () => {
        if (window.authState && window.authState.currentUser) {
          window.location.href = '/profile';
        } else {
          if (typeof window.switchAuthTab === 'function' && typeof window.openAuthModal === 'function') {
            window.switchAuthTab('login');
            window.openAuthModal();
          } else {
            window.location.href = '/';
          }
        }
      }
    });
    
    // Wait for header to be initialized
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  
  // Đồng bộ trạng thái đăng nhập cho nút header (kể cả khi header đã tồn tại)
  if (typeof window.fetchCurrentUser === 'function' && typeof window.updateAuthUi === 'function') {
    try {
      const user = await window.fetchCurrentUser();
      window.updateAuthUi(user);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[reservation.js] Lỗi khi đồng bộ trạng thái đăng nhập:', error);
    }
  }

  // Set minimum date to today
  const dateInput = getReservationElement('reservation-date');
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${year}-${month}-${day}`;
  }

  // Load and render tables
  const tables = await fetchTables();
  renderTableMap(tables);

  // Initialize form
  const form = getReservationElement('reservation-form');
  if (form) {
    form.addEventListener('submit', handleSubmitReservation);
  }

  // Initialize footer year
  if (typeof window.initializeFooterYear === 'function') {
    window.initializeFooterYear();
  }
};

// Prevent multiple initializations
let reservationPageInitialized = false;

const startReservationPage = () => {
  if (reservationPageInitialized) {
    return;
  }
  reservationPageInitialized = true;

  initializeReservationPage();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startReservationPage);
} else {
  startReservationPage();
}


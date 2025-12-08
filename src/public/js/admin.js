const state = {
  menuItems: [],
  orders: [],
  customers: [],
  editingItemId: null
};

const getElement = (id) => document.getElementById(id);

const normalizeMenuItem = (item) => {
  if (!item) {
    return null;
  }

  const normalizedId =
    typeof item.id === 'string'
      ? item.id
      : item._id
        ? item._id.toString()
        : '';

  return {
    ...item,
    id: normalizedId
  };
};

const openMenuModal = () => {
  const overlay = getElement('menu-modal-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
  }
};

const closeMenuModal = () => {
  const overlay = getElement('menu-modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
};

const categoryLabels = {
  combo: 'Combo',
  main: 'Khai vị',
  appetizer: 'Món chính',
  vegetarian: 'Món chay',
  drink: 'Đồ uống',
  dessert: 'Tráng miệng'
};

const renderAdminMenuList = () => {
  const tableBody = getElement('admin-menu-body');
  const emptyMessage = getElement('admin-menu-empty');

  if (!tableBody || !emptyMessage) {
    return;
  }

  tableBody.innerHTML = '';

  if (!state.menuItems || state.menuItems.length === 0) {
    emptyMessage.style.display = 'block';
    return;
  }

  emptyMessage.style.display = 'none';

  state.menuItems.forEach((item) => {
    const itemId = (item.id || item._id || '').toString();
    const row = document.createElement('tr');
    row.className = 'hover:bg-slate-900/80';

    const imageCell = document.createElement('td');
    imageCell.className = 'px-3 py-2 text-xs';
    if (item.image) {
      const thumb = document.createElement('img');
      thumb.src = item.image;
      thumb.alt = item.name || 'Ảnh món ăn';
      thumb.style.maxWidth = '48px';
      thumb.style.maxHeight = '48px';
      thumb.style.borderRadius = '6px';
      thumb.style.border = '1px solid #1f2937';
      imageCell.appendChild(thumb);
    } else {
      imageCell.textContent = '—';
    }

    const nameCell = document.createElement('td');
    nameCell.className = 'px-3 py-2 text-xs font-semibold text-slate-100';
    nameCell.textContent = item.name;

    const categoryCell = document.createElement('td');
    categoryCell.className = 'px-3 py-2 text-xs text-slate-300';
    categoryCell.textContent = categoryLabels[item.category] || '—';

    const priceCell = document.createElement('td');
    priceCell.className = 'px-3 py-2 text-xs text-amber-400';
    const priceValue = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    priceCell.textContent = `${priceValue.toLocaleString('vi-VN')} đ`;

    const descriptionCell = document.createElement('td');
    descriptionCell.className = 'px-3 py-2 text-xs text-slate-300';
    descriptionCell.textContent = item.description || '';

    const actionCell = document.createElement('td');
    actionCell.className = 'px-3 py-2 text-right text-xs';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Sửa';
    editButton.className =
      'mr-2 rounded-full border border-slate-700 px-3 py-1 text-[11px] font-medium text-slate-100 hover:border-amber-400 hover:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-slate-950';
    editButton.addEventListener('click', () => handleEditItem(itemId));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Xóa';
    deleteButton.className =
      'rounded-full border border-rose-500/40 px-3 py-1 text-[11px] font-medium text-rose-300 hover:border-rose-400 hover:text-rose-200 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-950';
    deleteButton.addEventListener('click', () => handleDeleteItem(itemId));

    actionCell.appendChild(editButton);
    actionCell.appendChild(deleteButton);

    row.appendChild(imageCell);
    row.appendChild(nameCell);
    row.appendChild(categoryCell);
    row.appendChild(priceCell);
    row.appendChild(descriptionCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
};

const fetchAdminMenu = async () => {
  try {
    const response = await fetch('/admin/api/menu', {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Không thể tải thực đơn trong admin:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('[Admin] Nhận được dữ liệu:', Array.isArray(data) ? `${data.length} món ăn` : 'không phải array', data);
    
    state.menuItems = Array.isArray(data)
      ? data.map((item) => normalizeMenuItem(item)).filter(Boolean)
      : [];
    
    console.log('[Admin] Sau khi normalize:', state.menuItems.length, 'món ăn');
    renderAdminMenuList();
  } catch (error) {
    console.error('Lỗi khi tải thực đơn trong admin', error);
  }
};

const resetMenuForm = () => {
  const idInput = getElement('menu-id');
  const nameInput = getElement('menu-name');
  const priceInput = getElement('menu-price');
  const descriptionInput = getElement('menu-description');
  const categorySelect = getElement('menu-category');
  const imageInput = getElement('menu-image');
  const imageFileInput = getElement('menu-image-file');
  const imagePreview = getElement('menu-image-preview');
  const messageElement = getElement('menu-message');
  const submitButton = getElement('menu-submit-button');
  const modalTitle = getElement('menu-modal-title');

  if (
    !idInput ||
    !nameInput ||
    !priceInput ||
    !descriptionInput ||
    !imageInput ||
    !messageElement ||
    !submitButton
  ) {
    return;
  }

  idInput.value = '';
  nameInput.value = '';
  priceInput.value = '';
  descriptionInput.value = '';
  if (categorySelect) {
    categorySelect.value = 'combo';
  }
  imageInput.value = '';
  if (imageFileInput) {
    imageFileInput.value = '';
  }
  if (imagePreview) {
    imagePreview.src = '';
    imagePreview.style.display = 'none';
  }
  messageElement.textContent = '';
  submitButton.textContent = 'Lưu món ăn';
  if (modalTitle) {
    modalTitle.textContent = 'Thêm / Cập nhật món ăn';
  }

  state.editingItemId = null;
};

const handleImageFileChange = () => {
  const imageFileInput = getElement('menu-image-file');
  const imagePreview = getElement('menu-image-preview');

  if (!imageFileInput || !imagePreview) {
    return;
  }

  const [file] = imageFileInput.files || [];

  if (!file) {
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    imagePreview.src = reader.result;
    imagePreview.style.display = 'block';
  };
  reader.readAsDataURL(file);
};

const handleEditItem = (id) => {
  const targetId = id ? id.toString() : '';
  const item = state.menuItems.find((menuItem) => {
    const currentId = (menuItem.id || menuItem._id || '').toString();
    return currentId === targetId;
  });

  if (!item) {
    return;
  }

  const idInput = getElement('menu-id');
  const nameInput = getElement('menu-name');
  const priceInput = getElement('menu-price');
  const descriptionInput = getElement('menu-description');
  const categorySelect = getElement('menu-category');
  const imageInput = getElement('menu-image');
  const imagePreview = getElement('menu-image-preview');
  const submitButton = getElement('menu-submit-button');
  const modalTitle = getElement('menu-modal-title');

  if (
    !idInput ||
    !nameInput ||
    !priceInput ||
    !descriptionInput ||
    !imageInput ||
    !submitButton
  ) {
    return;
  }

  idInput.value = item.id;
  nameInput.value = item.name;
  priceInput.value = item.price;
  descriptionInput.value = item.description || '';
  if (categorySelect) {
    categorySelect.value = item.category || 'combo';
  }
  imageInput.value = item.image || '';
  if (imagePreview && item.image) {
    imagePreview.src = item.image;
    imagePreview.style.display = 'block';
  }
  submitButton.textContent = 'Cập nhật món ăn';
  if (modalTitle) {
    modalTitle.textContent = 'Chỉnh sửa món ăn';
  }

  state.editingItemId = id;
  openMenuModal();
};

const handleDeleteItem = async (id) => {
  const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa món ăn này không?');

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`/admin/api/menu/${id}`, {
      method: 'DELETE',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error('Không thể xóa món ăn');
      return;
    }

    state.menuItems = state.menuItems.filter((item) => item.id !== id);
    renderAdminMenuList();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Lỗi khi xóa món ăn', error);
  }
};

const handleMenuFormSubmit = async (event) => {
  event.preventDefault();

  const idInput = getElement('menu-id');
  const nameInput = getElement('menu-name');
  const priceInput = getElement('menu-price');
  const descriptionInput = getElement('menu-description');
  const categorySelect = getElement('menu-category');
  const imageInput = getElement('menu-image');
  const imageFileInput = getElement('menu-image-file');
  const messageElement = getElement('menu-message');

  if (
    !idInput ||
    !nameInput ||
    !priceInput ||
    !descriptionInput ||
    !categorySelect ||
    !imageInput ||
    !messageElement
  ) {
    return;
  }

  const name = nameInput.value.trim();
  const price = priceInput.value.trim();
  const description = descriptionInput.value.trim();
  const category = categorySelect.value;
  const image = imageInput.value.trim();

  if (!name || !price || !category) {
    messageElement.textContent = 'Tên, giá và loại món là bắt buộc.';
    return;
  }

  const payload = {
    name,
    price,
    description,
    category,
    image
  };

  const isEditing = Boolean(idInput.value);
  const url = isEditing ? `/admin/api/menu/${idInput.value}` : '/admin/api/menu';
  const method = isEditing ? 'PUT' : 'POST';

  try {
    if (imageFileInput && imageFileInput.files && imageFileInput.files[0]) {
      const file = imageFileInput.files[0];
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await fetch('/admin/api/upload/menu-image', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        messageElement.textContent =
          'Không thể tải ảnh lên. Vui lòng thử lại hoặc kiểm tra cấu hình AWS.';
        return;
      }

      const uploadResult = await uploadResponse.json();
      if (uploadResult.url) {
        payload.image = uploadResult.url;
      }
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      credentials: 'same-origin'
    });

    if (!response.ok) {
      messageElement.textContent =
        'Không thể lưu món ăn. Vui lòng kiểm tra lại dữ liệu hoặc thử lại sau.';
      return;
    }

    const result = await response.json();
    const normalizedResult = normalizeMenuItem(result);

    if (!normalizedResult) {
      messageElement.textContent =
        'Có lỗi xảy ra khi xử lý dữ liệu món ăn từ máy chủ.';
      return;
    }

    if (isEditing) {
      state.menuItems = state.menuItems.map((item) =>
        item.id === normalizedResult.id ? normalizedResult : item
      );
      messageElement.textContent = 'Đã cập nhật món ăn thành công.';
    } else {
      state.menuItems.push(normalizedResult);
      messageElement.textContent = 'Đã thêm món ăn mới thành công.';
    }

    renderAdminMenuList();
    resetMenuForm();
    closeMenuModal();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Lỗi khi lưu món ăn', error);
  }
};

const renderAdminOrders = () => {
  const tableBody = getElement('admin-orders-body');
  const emptyMessage = getElement('admin-orders-empty');

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = '';

  if (!state.orders || state.orders.length === 0) {
    if (emptyMessage) {
      emptyMessage.style.display = 'block';
    }
    return;
  }

  if (emptyMessage) {
    emptyMessage.style.display = 'none';
  }

  state.orders.forEach((order) => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-slate-900/80';
    row.style.cursor = 'pointer';

    const orderIdCell = document.createElement('td');
    orderIdCell.className = 'px-3 py-2 text-xs font-mono text-slate-300';
    orderIdCell.textContent = order._id ? order._id.substring(0, 8) : '—';

    const customerCell = document.createElement('td');
    customerCell.className = 'px-3 py-2 text-xs text-slate-100';
    customerCell.textContent = order.customerName || 'Khách vãng lai';

    const typeCell = document.createElement('td');
    typeCell.className = 'px-3 py-2 text-xs text-slate-300';
    typeCell.textContent = order.orderTypeText || order.orderType || '—';

    const totalCell = document.createElement('td');
    totalCell.className = 'px-3 py-2 text-xs text-amber-400 font-semibold';
    const totalValue = typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount) || 0;
    totalCell.textContent = `${totalValue.toLocaleString('vi-VN')} đ`;

    const statusCell = document.createElement('td');
    statusCell.className = 'px-3 py-2 text-xs';
    const statusBadge = document.createElement('span');
    statusBadge.className = 'inline-block rounded-full px-2 py-1 text-[10px] font-medium';
    
    if (order.status === 'CHO_XAC_NHAN') {
      statusBadge.className += ' bg-yellow-500/20 text-yellow-300';
    } else if (order.status === 'HOAN_THANH') {
      statusBadge.className += ' bg-green-500/20 text-green-300';
    } else if (order.status === 'DA_HUY') {
      statusBadge.className += ' bg-red-500/20 text-red-300';
    } else {
      statusBadge.className += ' bg-blue-500/20 text-blue-300';
    }
    
    statusBadge.textContent = order.statusText || order.status || '—';
    statusCell.appendChild(statusBadge);

    const dateCell = document.createElement('td');
    dateCell.className = 'px-3 py-2 text-xs text-slate-400';
    dateCell.textContent = order.createdAt || '—';

    row.appendChild(orderIdCell);
    row.appendChild(customerCell);
    row.appendChild(typeCell);
    row.appendChild(totalCell);
    row.appendChild(statusCell);
    row.appendChild(dateCell);

    row.addEventListener('click', () => openOrderDetail(order));
    tableBody.appendChild(row);
  });
};

const formatCurrency = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return `${num.toLocaleString('vi-VN')} đ`;
};

const openOrderDetail = (order) => {
  const overlay = document.getElementById('order-detail-modal');
  if (!overlay) return;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text || '—';
    }
  };

  setText('od-id', order._id || order.id || '—');
  setText('od-customer', order.customerName || 'Khách vãng lai');
  setText('od-type', order.orderTypeText || order.orderType || '—');
  setText('od-status', order.statusText || order.status || '—');
  setText('od-total', formatCurrency(order.totalAmount));
  setText('od-promo', order.promotion?.name || 'Không áp dụng');
  setText('od-created', order.createdAt || '—');

  overlay.style.display = 'flex';
};

const closeOrderDetail = () => {
  const overlay = document.getElementById('order-detail-modal');
  if (overlay) {
    overlay.style.display = 'none';
  }
};

const fetchAdminOrders = async () => {
  try {
    const response = await fetch('/admin/api/orders', {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Không thể tải danh sách đơn hàng:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('[Admin] Nhận được dữ liệu đơn hàng:', Array.isArray(data) ? `${data.length} đơn hàng` : 'không phải array');
    
    state.orders = Array.isArray(data) ? data : [];
    renderAdminOrders();
  } catch (error) {
    console.error('Lỗi khi tải danh sách đơn hàng', error);
  }
};

const renderAdminCustomers = () => {
  const tableBody = getElement('admin-customers-body');
  const emptyMessage = getElement('admin-customers-empty');

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = '';

  if (!state.customers || state.customers.length === 0) {
    if (emptyMessage) {
      emptyMessage.style.display = 'block';
    }
    return;
  }

  if (emptyMessage) {
    emptyMessage.style.display = 'none';
  }

  state.customers.forEach((customer) => {
    const row = document.createElement('tr');
    row.style.cursor = 'pointer';
    row.addEventListener('click', () => fetchCustomerDetail(customer.id || customer._id));

    const nameCell = document.createElement('td');
    nameCell.className = 'px-3 py-2 text-xs font-semibold text-slate-100';
    nameCell.textContent = customer.name || '—';

    const emailCell = document.createElement('td');
    emailCell.className = 'px-3 py-2 text-xs text-slate-300';
    emailCell.textContent = customer.email || '—';

    const phoneCell = document.createElement('td');
    phoneCell.className = 'px-3 py-2 text-xs text-slate-300';
    phoneCell.textContent = customer.phone || '—';

    const accountTypeCell = document.createElement('td');
    accountTypeCell.className = 'px-3 py-2 text-xs';
    const accountTypeBadge = document.createElement('span');
    accountTypeBadge.className = 'inline-block rounded-full px-2 py-1 text-[10px] font-medium';
    
    if (customer.accountType === 'THANH_VIEN') {
      accountTypeBadge.className += ' bg-blue-500/20 text-blue-300';
    } else {
      accountTypeBadge.className += ' bg-slate-500/20 text-slate-300';
    }
    
    accountTypeBadge.textContent = customer.accountTypeText || customer.accountType || '—';
    accountTypeCell.appendChild(accountTypeBadge);

    const dateCell = document.createElement('td');
    dateCell.className = 'px-3 py-2 text-xs text-slate-400';
    dateCell.textContent = customer.createdAt || '—';

    const actionCell = document.createElement('td');
    actionCell.className = 'px-3 py-2 text-right text-xs';
    actionCell.addEventListener('click', (e) => e.stopPropagation());

    row.appendChild(nameCell);
    row.appendChild(emailCell);
    row.appendChild(phoneCell);
    row.appendChild(accountTypeCell);
    row.appendChild(dateCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
};

const fetchAdminCustomers = async () => {
  try {
    const response = await fetch('/admin/api/customers', {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Không thể tải danh sách khách hàng:', response.status, errorText);
      return;
    }

    const data = await response.json();
    console.log('[Admin] Nhận được dữ liệu khách hàng:', Array.isArray(data) ? `${data.length} khách hàng` : 'không phải array');
    
    state.customers = Array.isArray(data) ? data : [];
    renderAdminCustomers();
  } catch (error) {
    console.error('Lỗi khi tải danh sách khách hàng', error);
  }
};

const openCustomerDetailModal = (customer) => {
  const overlay = getElement('customer-detail-modal-overlay');
  const nameEl = getElement('customer-detail-name');
  const emailEl = getElement('customer-detail-email');
  const phoneEl = getElement('customer-detail-phone');
  const accountTypeEl = getElement('customer-detail-account-type');
  const createdAtEl = getElement('customer-detail-created-at');
  const pointsEl = getElement('customer-detail-points');
  const totalSpentEl = getElement('customer-detail-total-spent');
  const tierEl = getElement('customer-detail-tier');
  const ordersBody = getElement('customer-detail-orders-body');
  const ordersEmpty = getElement('customer-detail-orders-empty');
  const pointsBody = getElement('customer-detail-points-body');
  const pointsEmpty = getElement('customer-detail-points-empty');

  if (!overlay) return;

  if (nameEl) nameEl.textContent = customer.name || '—';
  if (emailEl) emailEl.textContent = customer.email || '—';
  if (phoneEl) phoneEl.textContent = customer.phone || '—';
  if (accountTypeEl) accountTypeEl.textContent = customer.accountTypeText || customer.accountType || '—';
  if (createdAtEl) createdAtEl.textContent = customer.createdAt || '—';
  if (pointsEl) pointsEl.textContent = typeof customer.points === 'number' ? customer.points : (customer.member?.points ?? 0);
  if (totalSpentEl) totalSpentEl.textContent = customer.member?.totalSpent?.toLocaleString('vi-VN') || '0';
  if (tierEl) tierEl.textContent = customer.member?.tier || '—';

  if (ordersBody && ordersEmpty) {
    ordersBody.innerHTML = '';
    const list = customer.orders || [];
    if (!list.length) {
      ordersEmpty.style.display = 'block';
    } else {
      ordersEmpty.style.display = 'none';
      list.forEach((order) => {
        const tr = document.createElement('tr');
        const idTd = document.createElement('td');
        idTd.className = 'px-3 py-2 text-xs font-mono text-slate-300';
        idTd.textContent = order.id ? order.id.substring(0, 8) : '—';

        const totalTd = document.createElement('td');
        totalTd.className = 'px-3 py-2 text-xs text-amber-400';
        const totalValue = typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount) || 0;
        totalTd.textContent = `${totalValue.toLocaleString('vi-VN')} đ`;

        const typeTd = document.createElement('td');
        typeTd.className = 'px-3 py-2 text-xs text-slate-300';
        typeTd.textContent = order.orderTypeText || '—';

        const statusTd = document.createElement('td');
        statusTd.className = 'px-3 py-2 text-xs';
        statusTd.textContent = order.statusText || '—';

        const dateTd = document.createElement('td');
        dateTd.className = 'px-3 py-2 text-xs text-slate-400';
        dateTd.textContent = order.createdAt || '—';

        tr.appendChild(idTd);
        tr.appendChild(totalTd);
        tr.appendChild(typeTd);
        tr.appendChild(statusTd);
        tr.appendChild(dateTd);
        ordersBody.appendChild(tr);
      });
    }
  }

  if (pointsBody && pointsEmpty) {
    pointsBody.innerHTML = '';
    const list = customer.pointsHistory || [];
    if (!list.length) {
      pointsEmpty.style.display = 'block';
    } else {
      pointsEmpty.style.display = 'none';
      list.forEach((tx) => {
        const tr = document.createElement('tr');
        const typeTd = document.createElement('td');
        typeTd.className = 'px-3 py-2 text-xs';
        typeTd.textContent = tx.type === 'TIEU' ? 'Tiêu điểm' : 'Tích điểm';

        const pointTd = document.createElement('td');
        pointTd.className = 'px-3 py-2 text-xs text-amber-400';
        pointTd.textContent = tx.points != null ? tx.points : '—';

        const noteTd = document.createElement('td');
        noteTd.className = 'px-3 py-2 text-xs text-slate-300';
        noteTd.textContent = tx.note || '—';

        const dateTd = document.createElement('td');
        dateTd.className = 'px-3 py-2 text-xs text-slate-400';
        dateTd.textContent = tx.createdAt || '—';

        tr.appendChild(typeTd);
        tr.appendChild(pointTd);
        tr.appendChild(noteTd);
        tr.appendChild(dateTd);
        pointsBody.appendChild(tr);
      });
    }
  }

  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
};

const closeCustomerDetailModal = () => {
  const overlay = getElement('customer-detail-modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }
};

const fetchCustomerDetail = async (customerId) => {
  if (!customerId) return;
  try {
    const response = await fetch(`/admin/api/customers/${customerId}/detail`, {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Không thể tải chi tiết khách hàng:', response.status, errorText);
      return;
    }

    const data = await response.json();
    const detail = {
      ...data.customer,
      member: data.member,
      orders: data.orders,
      points: data.points?.balance ?? data.member?.points ?? 0,
      pointsHistory: data.points?.transactions || []
    };

    openCustomerDetailModal(detail);
  } catch (error) {
    console.error('Lỗi khi tải chi tiết khách hàng', error);
  }
};

const setupSectionToggle = () => {
  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  if (!navLinks.length) return;

  const isHashNav = Array.from(navLinks).every((link) => link.getAttribute('href')?.startsWith('#'));
  if (!isHashNav) {
    // Trang tách riêng (vd: /admin/orders) dùng link tuyệt đối, không chặn điều hướng
    return;
  }

  const detailSections = document.querySelectorAll('.detail-section');

  const hideAllDetails = () => {
    detailSections.forEach((section) => {
      section.classList.remove('is-visible');
    });
  };

  const setActiveLink = (targetId) => {
    navLinks.forEach((link) => {
      const linkTarget = link.getAttribute('href')?.replace('#', '');
      if (linkTarget === targetId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  const showSection = (targetId) => {
    if (!targetId || targetId === 'dashboard') {
      hideAllDetails();
      setActiveLink('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    hideAllDetails();
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.add('is-visible');
      setActiveLink(targetId);
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetId = link.getAttribute('href')?.replace('#', '');
      showSection(targetId);
    });
  });

  hideAllDetails();
  setActiveLink('dashboard');
};

const initializeAdminPage = () => {
  const menuForm = getElement('menu-form');
  const resetFormButton = getElement('reset-form-button');
  const modalCloseButton = getElement('menu-modal-close');
  const modalOverlay = getElement('menu-modal-overlay');
  const imageFileInput = getElement('menu-image-file');
  const addButton = getElement('menu-add-button');
  const orderDetailOverlay = document.getElementById('order-detail-modal');
  const orderDetailClose = document.getElementById('order-detail-close');

  if (menuForm) {
    menuForm.addEventListener('submit', handleMenuFormSubmit);
  }

  if (resetFormButton) {
    resetFormButton.addEventListener('click', resetMenuForm);
  }

  if (modalCloseButton) {
    modalCloseButton.addEventListener('click', closeMenuModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (event) => {
      if (event.target === modalOverlay) {
        closeMenuModal();
      }
    });
  }

  if (addButton) {
    addButton.addEventListener('click', () => {
      resetMenuForm();
      const modalTitle = getElement('menu-modal-title');
      if (modalTitle) {
        modalTitle.textContent = 'Thêm món ăn mới';
      }
      openMenuModal();
    });
  }

  if (imageFileInput) {
    imageFileInput.addEventListener('change', handleImageFileChange);
  }

  if (orderDetailClose) {
    orderDetailClose.addEventListener('click', closeOrderDetail);
  }

  if (orderDetailOverlay) {
    orderDetailOverlay.addEventListener('click', (event) => {
      if (event.target === orderDetailOverlay) {
        closeOrderDetail();
      }
    });
  }

  const customerDetailModalClose = getElement('customer-detail-modal-close');
  const customerDetailModalOverlay = getElement('customer-detail-modal-overlay');

  if (customerDetailModalClose) {
    customerDetailModalClose.addEventListener('click', closeCustomerDetailModal);
  }

  if (customerDetailModalOverlay) {
    customerDetailModalOverlay.addEventListener('click', (event) => {
      if (event.target === customerDetailModalOverlay) {
        closeCustomerDetailModal();
      }
    });
  }

  fetchAdminMenu();
  fetchAdminOrders();
  fetchAdminCustomers();
  setupSectionToggle();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdminPage);
} else {
  initializeAdminPage();
}



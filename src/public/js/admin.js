const state = {
  menuItems: [],
  orders: [],
  customers: [],
  categories: [],
  editingItemId: null,
  editingCategoryId: null
};

// Handle admin logout
const handleAdminLogout = async () => {
  try {
    const response = await fetch('/admin/logout', {
      method: 'POST',
      credentials: 'same-origin'
    });

    if (response.ok) {
      window.location.href = '/admin/login';
    } else {
      console.error('Lỗi khi đăng xuất');
      // Still redirect to login page even if logout fails
      window.location.href = '/admin/login';
    }
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
    // Still redirect to login page even if logout fails
    window.location.href = '/admin/login';
  }
};

// Initialize logout buttons on all admin pages
const initializeLogoutButtons = () => {
  const logoutButtons = document.querySelectorAll('.btn-logout');
  logoutButtons.forEach((btn) => {
    // Remove existing listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode?.replaceChild(newBtn, btn);
    
    newBtn.addEventListener('click', handleAdminLogout);
  });
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
  // Ensure category dropdown is populated before opening modal
  if (state.categories && state.categories.length > 0) {
    renderCategoryDropdown();
  }
  const overlay = getElement('menu-modal-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
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
    if (item.category) {
      const categoryName = typeof item.category === 'string' 
        ? (state.categories.find(c => c._id === item.category || c.id === item.category)?.name || '—')
        : (item.category.name || '—');
      categoryCell.textContent = categoryName;
    } else {
      categoryCell.textContent = '—';
    }

    const priceCell = document.createElement('td');
    priceCell.className = 'px-3 py-2 text-xs text-amber-400';
    const priceValue = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    priceCell.textContent = `${priceValue.toLocaleString('vi-VN')} đ`;

    const descriptionCell = document.createElement('td');
    descriptionCell.className = 'px-3 py-2 text-xs text-slate-300';
    descriptionCell.textContent = item.description || '';

    const actionCell = document.createElement('td');
    actionCell.className = 'table-action-cell';

    const actionWrapper = document.createElement('div');
    actionWrapper.className = 'action-buttons';

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.textContent = 'Sửa';
    editButton.className = 'btn-chip btn-chip--info';
    editButton.addEventListener('click', () => handleEditItem(itemId));

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = 'Xóa';
    deleteButton.className = 'btn-chip btn-chip--danger';
    deleteButton.addEventListener('click', () => handleDeleteItem(itemId));

    actionWrapper.appendChild(editButton);
    actionWrapper.appendChild(deleteButton);
    actionCell.appendChild(actionWrapper);

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

const fetchCategories = async () => {
  try {
    const response = await fetch('/admin/api/categories', {
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      console.error('Không thể tải danh sách danh mục:', response.status);
      return;
    }

    const data = await response.json();
    state.categories = Array.isArray(data) ? data : [];
    renderCategoryDropdown();
    renderCategoriesList();
  } catch (error) {
    console.error('Lỗi khi tải danh sách danh mục', error);
  }
};

const renderCategoryDropdown = () => {
  const categorySelect = getElement('menu-category');
  if (!categorySelect) {
    // Element only exists on menu management page, not on dashboard
    return;
  }

  // Store current selected value to restore it later
  const currentValue = categorySelect.value;

  // Clear dropdown
  categorySelect.innerHTML = '';

  // Add placeholder option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Chọn danh mục --';
  categorySelect.appendChild(defaultOption);

  // Add categories
  if (state.categories && state.categories.length > 0) {
    state.categories.forEach((category) => {
      const option = document.createElement('option');
      const categoryId = (category._id || category.id).toString();
      option.value = categoryId;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  } else {
    console.warn('[Admin] Không có categories để render vào dropdown');
  }

  // Restore previous value if it exists
  if (currentValue) {
    categorySelect.value = currentValue;
  }
};

// Render categories list in table
const renderCategoriesList = () => {
  const tableBody = getElement('admin-categories-body');
  const emptyMessage = getElement('admin-categories-empty');

  if (!tableBody || !emptyMessage) {
    return;
  }

  tableBody.innerHTML = '';

  if (!state.categories || state.categories.length === 0) {
    emptyMessage.style.display = 'block';
    return;
  }

  emptyMessage.style.display = 'none';

  state.categories.forEach((category) => {
    const categoryId = (category.id || category._id || '').toString();
    const row = document.createElement('tr');
    row.className = 'hover:bg-slate-900/80';

    const nameCell = document.createElement('td');
    nameCell.className = 'px-3 py-2 text-xs font-semibold text-slate-100';
    nameCell.textContent = category.name || '—';

    const descCell = document.createElement('td');
    descCell.className = 'px-3 py-2 text-xs text-slate-300';
    descCell.textContent = category.description || '—';

    const actionCell = document.createElement('td');
    actionCell.className = 'table-action-cell';
    const actionWrapper = document.createElement('div');
    actionWrapper.className = 'action-buttons';

    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-chip btn-chip--info';
    editBtn.textContent = 'Sửa';
    editBtn.addEventListener('click', () => {
      handleEditCategory(categoryId);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-chip btn-chip--danger';
    deleteBtn.textContent = 'Xóa';
    deleteBtn.addEventListener('click', () => {
      handleDeleteCategory(categoryId);
    });

    actionWrapper.appendChild(editBtn);
    actionWrapper.appendChild(deleteBtn);
    actionCell.appendChild(actionWrapper);

    row.appendChild(nameCell);
    row.appendChild(descCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
};

// Category Modal Functions
const openCategoryModal = () => {
  const overlay = getElement('category-modal-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
  }
};

const closeCategoryModal = () => {
  const overlay = getElement('category-modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }
};

const resetCategoryForm = () => {
  const idInput = getElement('category-id');
  const nameInput = getElement('category-name');
  const descInput = getElement('category-description');
  const messageElement = getElement('category-message');
  const submitButton = getElement('category-submit-button');
  const modalTitle = getElement('category-modal-title');

  if (idInput) idInput.value = '';
  if (nameInput) nameInput.value = '';
  if (descInput) descInput.value = '';
  if (messageElement) {
    messageElement.textContent = '';
    messageElement.className = 'admin-message';
  }
  if (submitButton) submitButton.textContent = 'Lưu danh mục';
  if (modalTitle) modalTitle.textContent = 'Thêm danh mục mới';
  state.editingCategoryId = null;
};

const handleEditCategory = (id) => {
  const targetId = id ? id.toString() : '';
  const category = state.categories.find((cat) => {
    const currentId = (cat.id || cat._id || '').toString();
    return currentId === targetId;
  });

  if (!category) {
    return;
  }

  const idInput = getElement('category-id');
  const nameInput = getElement('category-name');
  const descInput = getElement('category-description');
  const submitButton = getElement('category-submit-button');
  const modalTitle = getElement('category-modal-title');

  if (idInput) idInput.value = category.id || category._id;
  if (nameInput) nameInput.value = category.name || '';
  if (descInput) descInput.value = category.description || '';
  if (submitButton) submitButton.textContent = 'Cập nhật danh mục';
  if (modalTitle) modalTitle.textContent = 'Chỉnh sửa danh mục';

  state.editingCategoryId = id;
  openCategoryModal();
};

const handleDeleteCategory = async (id) => {
  const category = state.categories.find((cat) => {
    const currentId = (cat.id || cat._id || '').toString();
    return currentId === id.toString();
  });

  if (!category) {
    return;
  }

  const confirmDelete = window.confirm(
    `Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?`
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`/admin/api/categories/${id}`, {
      method: 'DELETE',
      credentials: 'same-origin'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Không thể xóa danh mục' }));
      alert(errorData.message || 'Không thể xóa danh mục');
      return;
    }

    state.categories = state.categories.filter((cat) => {
      const currentId = (cat.id || cat._id || '').toString();
      return currentId !== id.toString();
    });

    renderCategoriesList();
    renderCategoryDropdown();
  } catch (error) {
    console.error('Lỗi khi xóa danh mục', error);
    alert('Không thể xóa danh mục. Vui lòng thử lại.');
  }
};

const handleCategoryFormSubmit = async (event) => {
  event.preventDefault();

  const idInput = getElement('category-id');
  const nameInput = getElement('category-name');
  const descInput = getElement('category-description');
  const messageElement = getElement('category-message');

  if (!nameInput || !descInput || !messageElement) {
    return;
  }

  const name = nameInput.value.trim();
  const description = descInput.value.trim();

  if (!name) {
    messageElement.textContent = 'Tên danh mục là bắt buộc.';
    messageElement.className = 'admin-message';
    return;
  }

  const isEditing = Boolean(idInput && idInput.value);
  const url = isEditing ? `/admin/api/categories/${idInput.value}` : '/admin/api/categories';
  const method = isEditing ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        name,
        description
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Không thể lưu danh mục' }));
      messageElement.textContent = errorData.message || 'Không thể lưu danh mục';
      messageElement.className = 'admin-message';
      return;
    }

    const data = await response.json();

    // Reload categories
    await fetchCategories();
    resetCategoryForm();
    closeCategoryModal();
  } catch (error) {
    console.error('Lỗi khi lưu danh mục', error);
    messageElement.textContent = 'Không thể lưu danh mục. Vui lòng thử lại.';
    messageElement.className = 'admin-message';
  }
};

// Size Options Management
let sizeOptionCounter = 0;

const renderSizeOptions = (sizeOptions = []) => {
  const container = getElement('size-options-list');
  if (!container) return;

  container.innerHTML = '';
  sizeOptionCounter = 0;

  if (sizeOptions && sizeOptions.length > 0) {
    sizeOptions.forEach((opt) => {
      addSizeOptionRow(opt.name, opt.additionalPrice);
    });
  }
};

const addSizeOptionRow = (name = '', additionalPrice = 0) => {
  const container = getElement('size-options-list');
  if (!container) return;

  const index = sizeOptionCounter++;
  const row = document.createElement('div');
  row.className = 'size-option-row';
  row.style.cssText = 'display: flex; gap: 8px; margin-bottom: 8px; align-items: flex-end;';
  row.dataset.index = index;

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.className = 'form-input';
  nameInput.placeholder = 'VD: Nhỏ (S), Vừa (M), Lớn (L)...';
  nameInput.value = name;
  nameInput.style.flex = '1';
  nameInput.setAttribute('data-size-name', index);

  const priceInput = document.createElement('input');
  priceInput.type = 'number';
  priceInput.className = 'form-input';
  priceInput.placeholder = 'Giá cộng thêm (VNĐ)';
  priceInput.value = additionalPrice || 0;
  priceInput.min = 0;
  priceInput.style.width = '180px';
  priceInput.setAttribute('data-size-price', index);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn-text';
  removeBtn.textContent = 'Xóa';
  removeBtn.style.cssText = 'padding: 8px 12px; color: #ef4444;';
  removeBtn.addEventListener('click', () => {
    row.remove();
  });

  row.appendChild(nameInput);
  row.appendChild(priceInput);
  row.appendChild(removeBtn);
  container.appendChild(row);
};

const getSizeOptionsFromForm = () => {
  const container = getElement('size-options-list');
  if (!container) return [];

  const rows = container.querySelectorAll('.size-option-row');
  const options = [];

  rows.forEach((row) => {
    const nameInput = row.querySelector('[data-size-name]');
    const priceInput = row.querySelector('[data-size-price]');

    if (nameInput && nameInput.value.trim()) {
      options.push({
        name: nameInput.value.trim(),
        additionalPrice: Number(priceInput?.value) || 0
      });
    }
  });

  return options;
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
    // Ensure dropdown is populated before resetting
    if (state.categories && state.categories.length > 0) {
      renderCategoryDropdown();
    }
    categorySelect.value = '';
  }
  if (imageInput) imageInput.value = '';
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

  // Reset size options
  renderSizeOptions([]);

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

const handleEditItem = async (id) => {
  const targetId = id ? id.toString() : '';
  const item = state.menuItems.find((menuItem) => {
    const currentId = (menuItem.id || menuItem._id || '').toString();
    return currentId === targetId;
  });

  if (!item) {
    return;
  }

  // Ensure categories are loaded before opening modal
  if (!state.categories || state.categories.length === 0) {
    await fetchCategories();
  }

  // Ensure category dropdown is populated
  renderCategoryDropdown();

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
  
  // Set category - must be done after dropdown is populated
  if (categorySelect) {
    // Handle category - can be ID string or object with _id/id
    let categoryId = '';
    if (item.category) {
      if (typeof item.category === 'string') {
        categoryId = item.category;
      } else if (item.category._id) {
        categoryId = item.category._id.toString();
      } else if (item.category.id) {
        categoryId = item.category.id.toString();
      }
    }
    
    // Set value after ensuring dropdown is populated
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (categoryId && categorySelect.querySelector(`option[value="${categoryId}"]`)) {
        categorySelect.value = categoryId;
      } else {
        categorySelect.value = '';
      }
    });
  }
  
  imageInput.value = item.image || '';
  if (imagePreview && item.image) {
    imagePreview.src = item.image;
    imagePreview.style.display = 'block';
  }
  
  // Load size options
  renderSizeOptions(item.sizeOptions || []);
  
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

  // Get size options from form
  const sizeOptions = getSizeOptionsFromForm();

  const payload = {
    name,
    price,
    description,
    image,
    sizeOptions
  };
  
  // Only include category if one is selected
  if (category && category.trim()) {
    payload.category = category.trim();
  }

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

// Helper function to create action buttons based on order status
const createActionButtons = (order) => {
  const actionsCell = document.createElement('td');
  actionsCell.className = 'table-action-cell';
  actionsCell.style.cursor = 'default';
  
  // Stop event propagation to prevent row click when clicking buttons
  actionsCell.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'action-buttons';

  // Nút hủy - hiển thị trong mọi trạng thái trừ HOAN_THANH và DA_HUY
  if (order.status !== 'HOAN_THANH' && order.status !== 'DA_HUY') {
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn-chip btn-chip--danger';
    cancelBtn.textContent = 'Hủy';
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCancelOrder(order);
    });
    buttonContainer.appendChild(cancelBtn);
  }

  // Nút hành động theo trạng thái
  let actionBtn = null;
  
  if (order.status === 'CHO_XAC_NHAN' || order.status === 'CHO_THANH_TOAN') {
    actionBtn = document.createElement('button');
    actionBtn.className = 'btn-chip btn-chip--success';
    actionBtn.textContent = 'Xác nhận';
    actionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirmStatusModal(order, 'DA_XAC_NHAN', 'Xác nhận đơn hàng', 'Bạn có chắc chắn muốn xác nhận đơn hàng này?');
    });
  } else if (order.status === 'DA_XAC_NHAN') {
    actionBtn = document.createElement('button');
    actionBtn.className = 'btn-chip btn-chip--info';
    actionBtn.textContent = 'Đang chuẩn bị';
    actionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirmStatusModal(order, 'DANG_CHUAN_BI', 'Chuyển sang "Đang chuẩn bị"', 'Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái "Đang chuẩn bị"?');
    });
  } else if (order.status === 'DANG_CHUAN_BI') {
    // Nếu là giao hàng (ONLINE) thì chuyển sang "Đang giao", nếu không thì "Hoàn thành"
    const isDeliveryOrder = order.orderType === 'ONLINE' || order.orderTypeText === 'Giao hàng';
    if (isDeliveryOrder) {
      actionBtn = document.createElement('button');
      actionBtn.className = 'btn-chip btn-chip--info';
      actionBtn.textContent = 'Đang giao';
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirmStatusModal(order, 'DANG_GIAO', 'Chuyển sang "Đang giao"', 'Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái "Đang giao"?');
      });
    } else {
      actionBtn = document.createElement('button');
      actionBtn.className = 'btn-chip btn-chip--success';
      actionBtn.textContent = 'Hoàn thành';
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showConfirmStatusModal(order, 'HOAN_THANH', 'Hoàn thành đơn hàng', 'Bạn có chắc chắn muốn hoàn thành đơn hàng này?');
      });
    }
  } else if (order.status === 'DANG_GIAO') {
    actionBtn = document.createElement('button');
    actionBtn.className = 'btn-chip btn-chip--success';
    actionBtn.textContent = 'Hoàn thành';
    actionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showConfirmStatusModal(order, 'HOAN_THANH', 'Hoàn thành đơn hàng', 'Bạn có chắc chắn muốn hoàn thành đơn hàng này?');
    });
  }
  // HOAN_THANH và DA_HUY không có nút hành động

  if (actionBtn) {
    buttonContainer.insertBefore(actionBtn, buttonContainer.firstChild);
  }

  actionsCell.appendChild(buttonContainer);
  return actionsCell;
};

// Helper function to create order row
const createOrderRow = (order) => {
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
  
  if (order.status === 'CHO_XAC_NHAN' || order.status === 'CHO_THANH_TOAN') {
    statusBadge.className += ' bg-yellow-500/20 text-yellow-300';
  } else if (order.status === 'HOAN_THANH') {
    statusBadge.className += ' bg-green-500/20 text-green-300';
  } else if (order.status === 'DA_HUY' || order.status === 'THANH_TOAN_THAT_BAI') {
    statusBadge.className += ' bg-red-500/20 text-red-300';
  } else {
    statusBadge.className += ' bg-blue-500/20 text-blue-300';
  }
  
  // Hiển thị trạng thái kèm lý do hủy nếu có
  let statusText = order.statusText || order.status || '—';
  if (order.status === 'DA_HUY' && order.cancelReason) {
    statusText = `${statusText}: ${order.cancelReason}`;
  }
  statusBadge.textContent = statusText;
  // Thêm title để hiển thị đầy đủ khi hover
  if (order.status === 'DA_HUY' && order.cancelReason) {
    statusBadge.title = `${order.statusText || order.status} - Lý do: ${order.cancelReason}`;
  }
  statusCell.appendChild(statusBadge);

  const dateCell = document.createElement('td');
  dateCell.className = 'px-3 py-2 text-xs text-slate-400';
  dateCell.textContent = order.createdAt || '—';

  // Tạo cột thao tác với các nút
  const actionsCell = createActionButtons(order);

  row.appendChild(orderIdCell);
  row.appendChild(customerCell);
  row.appendChild(typeCell);
  row.appendChild(totalCell);
  row.appendChild(statusCell);
  row.appendChild(dateCell);
  row.appendChild(actionsCell);

  row.addEventListener('click', () => openOrderDetail(order));
  return row;
};

const renderAdminOrders = () => {
  const activeTableBody = getElement('admin-orders-active-body');
  const completedTableBody = getElement('admin-orders-completed-body');
  const activeEmptyMessage = getElement('admin-orders-active-empty');
  const completedEmptyMessage = getElement('admin-orders-completed-empty');

  if (!activeTableBody || !completedTableBody) {
    return;
  }

  // Clear both tables
  activeTableBody.innerHTML = '';
  completedTableBody.innerHTML = '';

  if (!state.orders || state.orders.length === 0) {
    if (activeEmptyMessage) activeEmptyMessage.style.display = 'block';
    if (completedEmptyMessage) completedEmptyMessage.style.display = 'block';
    return;
  }

  // Separate orders into active (not completed) and completed
  // Đơn đã hủy (DA_HUY) sẽ được đưa vào phần đã hoàn thành
  const activeOrders = state.orders.filter(order => order.status !== 'HOAN_THANH' && order.status !== 'DA_HUY');
  const completedOrders = state.orders.filter(order => order.status === 'HOAN_THANH' || order.status === 'DA_HUY');

  // Render active orders
  if (activeOrders.length === 0) {
    if (activeEmptyMessage) activeEmptyMessage.style.display = 'block';
  } else {
    if (activeEmptyMessage) activeEmptyMessage.style.display = 'none';
    activeOrders.forEach((order) => {
      const row = createOrderRow(order);
      activeTableBody.appendChild(row);
    });
  }

  // Render completed orders
  if (completedOrders.length === 0) {
    if (completedEmptyMessage) completedEmptyMessage.style.display = 'block';
  } else {
    if (completedEmptyMessage) completedEmptyMessage.style.display = 'none';
    completedOrders.forEach((order) => {
      const row = createOrderRow(order);
      completedTableBody.appendChild(row);
    });
  }
};

const formatCurrency = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return `${num.toLocaleString('vi-VN')} đ`;
};

const openOrderDetail = async (order) => {
  const overlay = document.getElementById('order-detail-modal');
  if (!overlay) return;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text || '—';
    }
  };

  const setHTML = (id, html) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = html || '—';
    }
  };

  const setDisplay = (id, display) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = display;
    }
  };

  setText('od-id', order._id || order.id || '—');
  setText('od-customer', order.customerName || 'Khách vãng lai');
  setText('od-type', order.orderTypeText || order.orderType || '—');
  
  // Hiển thị trạng thái kèm lý do hủy nếu có
  let statusDisplay = order.statusText || order.status || '—';
  if (order.status === 'DA_HUY' && order.cancelReason) {
    statusDisplay = `${statusDisplay} - Lý do: ${order.cancelReason}`;
  }
  setText('od-status', statusDisplay);
  
  setText('od-total', formatCurrency(order.totalAmount));
  setText('od-promo', order.promotion?.name || 'Không áp dụng');
  setText('od-created', order.createdAt || '—');

  // Hiển thị lý do hủy nếu có
  if (order.cancelReason && (order.status === 'DA_HUY')) {
    setText('od-cancel-reason', order.cancelReason);
    setDisplay('od-cancel-reason-row', 'block');
  } else {
    setDisplay('od-cancel-reason-row', 'none');
  }

  // Fetch order detail with items
  try {
    const orderId = order._id || order.id;
    const response = await fetch(`/admin/api/orders/${orderId}`, {
      credentials: 'same-origin'
    });
    if (response.ok) {
      const orderDetail = await response.json();
      if (orderDetail.items && orderDetail.items.length > 0) {
        const itemsHTML = orderDetail.items.map(item => {
          let itemHTML = `
            <div style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                  <p style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937;">${item.name}</p>
                  ${item.size ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #64748b;">Size: ${item.size}</p>` : ''}
                  <p style="margin: 0; font-size: 13px; color: #64748b;">Số lượng: ${item.quantity} × ${formatCurrency(item.price)}</p>
                  ${item.note ? `<p style="margin: 8px 0 0 0; padding: 8px; background: #f1f5f9; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 13px; color: #475569; font-style: italic;">Ghi chú: ${item.note}</p>` : ''}
                </div>
                <div style="font-weight: 600; color: #1f2937; margin-left: 16px;">
                  ${formatCurrency(item.total)}
                </div>
              </div>
            </div>
          `;
          return itemHTML;
        }).join('');
        setHTML('od-items', itemsHTML);
        setDisplay('od-items-row', 'block');
      } else {
        setHTML('od-items', '<p style="padding: 12px; color: #64748b;">Không có món nào trong đơn hàng này.</p>');
        setDisplay('od-items-row', 'block');
      }
    } else {
      setDisplay('od-items-row', 'none');
    }
  } catch (error) {
    console.error('Lỗi khi tải chi tiết đơn hàng:', error);
    setDisplay('od-items-row', 'none');
  }

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

// Handle update order status
const handleUpdateOrderStatus = async (orderId, newStatus, cancelReason = null) => {
  try {
    const body = { status: newStatus };
    if (cancelReason) {
      body.cancelReason = cancelReason;
    }

    const response = await fetch(`/admin/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Không thể cập nhật trạng thái đơn hàng' }));
      alert(errorData.message || 'Không thể cập nhật trạng thái đơn hàng');
      return;
    }

    // Reload orders list
    await fetchAdminOrders();
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
  }
};

// Handle update order status with cancel reason
const handleUpdateOrderStatusWithReason = async (orderId, newStatus, cancelReason) => {
  await handleUpdateOrderStatus(orderId, newStatus, cancelReason);
};

// Handle cancel order - show cancel reason modal
const handleCancelOrder = async (order) => {
  showCancelReasonModal(order);
};

// Show confirm status change modal
const showConfirmStatusModal = (order, newStatus, title, message) => {
  // Create modal overlay if it doesn't exist
  let modal = document.getElementById('confirm-status-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirm-status-modal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="confirm-status-title">
        <div class="modal-header">
          <h2 id="confirm-status-title" class="panel-title"></h2>
          <button type="button" id="confirm-status-close" class="btn-text" aria-label="Đóng">Đóng</button>
        </div>
        <div class="admin-form" aria-label="Xác nhận thay đổi trạng thái">
          <p id="confirm-status-message" class="panel-text"></p>
          <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button type="button" id="confirm-status-cancel" class="btn-secondary">Hủy</button>
            <button type="button" id="confirm-status-submit" class="btn-primary">Xác nhận</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Handle close button
    const closeBtn = document.getElementById('confirm-status-close');
    const cancelBtn = document.getElementById('confirm-status-cancel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        delete modal.dataset.orderId;
        delete modal.dataset.newStatus;
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        delete modal.dataset.orderId;
        delete modal.dataset.newStatus;
      });
    }

    // Handle submit
    const submitBtn = document.getElementById('confirm-status-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const orderId = modal.dataset.orderId;
        const status = modal.dataset.newStatus;

        if (!orderId || !status) {
          console.error('Missing orderId or status');
          return;
        }

        // Close modal
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');

        // Update order status
        try {
          await handleUpdateOrderStatus(orderId, status);
          
          // Clear data
          delete modal.dataset.orderId;
          delete modal.dataset.newStatus;
        } catch (error) {
          console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        }
      });
    }
  }

  // Set current order data
  modal.dataset.orderId = order._id;
  modal.dataset.newStatus = newStatus;
  
  // Update modal content
  const titleEl = document.getElementById('confirm-status-title');
  const messageEl = document.getElementById('confirm-status-message');
  if (titleEl) titleEl.textContent = title;
  if (messageEl) messageEl.textContent = message;

  // Show modal
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
};

// Show cancel reason modal
const showCancelReasonModal = (order) => {
  // Create modal overlay if it doesn't exist
  let modal = document.getElementById('cancel-reason-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cancel-reason-modal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="cancel-reason-title">
        <div class="modal-header">
          <h2 id="cancel-reason-title" class="panel-title">Hủy đơn hàng</h2>
          <button type="button" id="cancel-reason-close" class="btn-text" aria-label="Đóng">Đóng</button>
        </div>
        <div class="admin-form" aria-label="Chọn lý do hủy đơn hàng">
          <p class="panel-text">Vui lòng chọn lý do hủy đơn hàng:</p>
          <div class="form-group" style="margin-top: 1rem;">
            <label class="form-label">Lý do hủy</label>
            <select id="cancel-reason-select" class="form-input">
              <option value="">-- Chọn lý do --</option>
              <option value="Khách hàng yêu cầu hủy">Khách hàng yêu cầu hủy</option>
              <option value="Hết nguyên liệu">Hết nguyên liệu</option>
              <option value="Không liên lạc được với khách hàng">Không liên lạc được với khách hàng</option>
              <option value="Địa chỉ giao hàng không hợp lệ">Địa chỉ giao hàng không hợp lệ</option>
              <option value="Lý do khác">Lý do khác</option>
            </select>
          </div>
          <div class="form-group" id="cancel-reason-other-group" style="display: none; margin-top: 1rem;">
            <label class="form-label">Nhập lý do</label>
            <textarea id="cancel-reason-other" class="form-input" rows="3" placeholder="Nhập lý do hủy đơn hàng"></textarea>
          </div>
          <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
            <button type="button" id="cancel-reason-cancel" class="btn-secondary">Hủy</button>
            <button type="button" id="cancel-reason-submit" class="btn-primary">Xác nhận hủy</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Handle close button
    const closeBtn = document.getElementById('cancel-reason-close');
    const cancelBtn = document.getElementById('cancel-reason-cancel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
      });
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
      });
    }

    // Handle reason select change
    const reasonSelect = document.getElementById('cancel-reason-select');
    const otherGroup = document.getElementById('cancel-reason-other-group');
    if (reasonSelect) {
      reasonSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Lý do khác') {
          if (otherGroup) otherGroup.style.display = 'block';
        } else {
          if (otherGroup) otherGroup.style.display = 'none';
        }
      });
    }

    // Handle submit
    const submitBtn = document.getElementById('cancel-reason-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const selectedReason = reasonSelect.value;
        const otherReason = document.getElementById('cancel-reason-other')?.value.trim();

        if (!selectedReason) {
          alert('Vui lòng chọn lý do hủy đơn hàng');
          return;
        }

        let cancelReason = selectedReason;
        if (selectedReason === 'Lý do khác' && otherReason) {
          cancelReason = otherReason;
        } else if (selectedReason === 'Lý do khác' && !otherReason) {
          alert('Vui lòng nhập lý do hủy đơn hàng');
          return;
        }

        // Get order ID from modal dataset
        const orderId = modal.dataset.orderId;
        if (!orderId) {
          console.error('Không tìm thấy orderId');
          return;
        }

        // Close modal
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');

        // Update order status with cancel reason
        try {
          await handleUpdateOrderStatusWithReason(orderId, 'DA_HUY', cancelReason);
          
          // Reset form
          if (reasonSelect) reasonSelect.value = '';
          if (otherGroup) otherGroup.style.display = 'none';
          const otherInput = document.getElementById('cancel-reason-other');
          if (otherInput) otherInput.value = '';
          delete modal.dataset.orderId;
        } catch (error) {
          console.error('Lỗi khi hủy đơn hàng:', error);
        }
      });
    }
  }

  // Set current order ID
  modal.dataset.orderId = order._id;
  
  // Reset form
  const reasonSelect = document.getElementById('cancel-reason-select');
  const otherGroup = document.getElementById('cancel-reason-other-group');
  const otherInput = document.getElementById('cancel-reason-other');
  if (reasonSelect) reasonSelect.value = '';
  if (otherGroup) otherGroup.style.display = 'none';
  if (otherInput) otherInput.value = '';

  // Show modal
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
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

let adminTablesData = [];

const fetchAdminTables = async () => {
  try {
    console.log('[Admin] Fetching tables from /admin/api/tables...');
    const response = await fetch('/admin/api/tables', {
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`Không thể tải danh sách bàn: ${response.status}`);
    }
    
    const tables = await response.json();
    console.log('[Admin] Received tables:', tables.length);
    adminTablesData = tables;
    renderAdminTableMap();
  } catch (error) {
    console.error('[Admin] Lỗi khi tải danh sách bàn:', error);
    const container = getElement('admin-table-map-container');
    if (container) {
      container.innerHTML = '<p style="text-align: center; color: #ef4444; grid-column: 1/-1; padding: 20px;">Không thể tải danh sách bàn. Vui lòng thử lại.</p>';
    }
  }
};

const renderAdminTableMap = () => {
  const container = getElement('admin-table-map-container');
  if (!container) return;

  if (!adminTablesData || adminTablesData.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1; padding: 20px;">Chưa có bàn nào trong hệ thống.</p>';
    return;
  }

  container.innerHTML = adminTablesData.map(table => {
    let className = 'admin-table-item';
    let statusText = '';
    
    if (table.displayStatus === 'RESERVED') {
      className += ' reserved';
      statusText = 'Đã đặt';
    } else if (table.status === 'DANG_DUNG') {
      className += ' occupied';
      statusText = 'Đang dùng';
    } else if (table.status === 'DANG_DON') {
      className += ' occupied';
      statusText = 'Đang dọn';
    } else {
      className += ' available';
      statusText = 'Trống';
    }

    return `
      <div class="${className}" data-table-id="${table.id}" onclick="handleAdminTableClick('${table.id}')">
        <div class="admin-table-item-name">${table.name}</div>
        <div class="admin-table-item-seats">${table.seats} chỗ</div>
        ${table.location ? `<div class="admin-table-item-location">${table.location}</div>` : ''}
        <div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">${statusText}</div>
      </div>
    `;
  }).join('');
};

// Update Table Status Modal Functions
const openUpdateTableStatusModal = (tableId) => {
  const table = adminTablesData.find(t => t.id === tableId);
  if (!table) return;

  const overlay = getElement('update-table-status-modal-overlay');
  const form = getElement('update-table-status-form');
  const tableIdInput = getElement('update-table-status-id');
  const tableNameEl = getElement('update-table-status-name');
  const messageEl = getElement('update-table-status-message');
  
  if (overlay && form && tableIdInput && tableNameEl) {
    tableIdInput.value = tableId;
    tableNameEl.textContent = table.name;
    
    // Set current status as checked
    // If displayStatus is RESERVED, check RESERVED radio
    // Otherwise check the actual status
    const statusRadios = form.querySelectorAll('input[name="table-status"]');
    statusRadios.forEach(radio => {
      if (table.displayStatus === 'RESERVED' && radio.value === 'RESERVED') {
        radio.checked = true;
      } else if (table.displayStatus !== 'RESERVED' && radio.value === table.status) {
        radio.checked = true;
      } else {
        radio.checked = false;
      }
    });
    
    if (messageEl) {
      messageEl.style.display = 'none';
      messageEl.textContent = '';
    }
    
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
  }
};

const closeUpdateTableStatusModal = () => {
  const overlay = getElement('update-table-status-modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }
};

const handleAdminTableClick = (tableId) => {
  openUpdateTableStatusModal(tableId);
};

const updateAdminTableStatus = async (tableId, newStatus) => {
  try {
    // If RESERVED is selected, keep status as TRONG (RESERVED is only a display status)
    const actualStatus = newStatus === 'RESERVED' ? 'TRONG' : newStatus;
    
    const response = await fetch(`/admin/api/tables/${tableId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ status: actualStatus })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể cập nhật trạng thái bàn');
    }

    // Update local data
    const table = adminTablesData.find(t => t.id === tableId);
    if (table) {
      table.status = actualStatus;
      // Recalculate displayStatus
      if (actualStatus === 'TRONG') {
        // If RESERVED was selected, we want to show it as RESERVED
        // Otherwise, check if there are pending reservations
        if (newStatus === 'RESERVED') {
          table.displayStatus = 'RESERVED';
        } else {
          const hasReservedPending = table.reservations && table.reservations.some(r => {
            const reservedTime = new Date(r.reservedAt);
            const now = new Date();
            return r.status === 'DANG_CHO' || reservedTime > now;
          });
          table.displayStatus = hasReservedPending ? 'RESERVED' : 'TRONG';
        }
      } else {
        table.displayStatus = actualStatus;
      }
    }

    renderAdminTableMap();
    closeUpdateTableStatusModal();
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái bàn:', error);
    const messageEl = getElement('update-table-status-message');
    if (messageEl) {
      messageEl.textContent = error.message || 'Có lỗi xảy ra khi cập nhật trạng thái bàn';
      messageEl.className = 'admin-message';
      messageEl.style.display = 'block';
    }
  }
};

window.handleAdminTableClick = handleAdminTableClick;

// Dashboard Statistics
const fetchDashboardStats = async () => {
  try {
    console.log('[Admin] Fetching dashboard stats...');
    const response = await fetch('/admin/api/stats', {
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const stats = await response.json();
    console.log('[Admin] Received dashboard stats:', stats);
    renderDashboardStats(stats);
  } catch (error) {
    console.error('[Admin] Error fetching dashboard stats:', error);
  }
};

// Format currency VND for dashboard
const formatDashboardCurrency = (value) => {
  if (!value && value !== 0) return '0 đ';
  const numValue = Number(value);
  if (isNaN(numValue)) return '0 đ';
  
  if (numValue >= 1000000) {
    return `${(numValue / 1000000).toFixed(1)}M đ`;
  } else if (numValue >= 1000) {
    return `${(numValue / 1000).toFixed(0)}k đ`;
  }
  return `${numValue.toLocaleString('vi-VN')} đ`;
};

// Render dashboard statistics
const renderDashboardStats = (stats) => {
  // Revenue
  const revenueValueEl = getElement('dashboard-revenue-value');
  const revenueChangeEl = getElement('dashboard-revenue-change');
  if (revenueValueEl) {
    revenueValueEl.textContent = formatDashboardCurrency(stats.revenue.today);
  }
  if (revenueChangeEl) {
    const change = stats.revenue.change || 0;
    revenueChangeEl.className = `summary-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'}`;
    revenueChangeEl.textContent = change > 0 
      ? `+${change}% vs hôm qua`
      : change < 0
        ? `${change}% vs hôm qua`
        : 'Không thay đổi';
  }
  
  // Orders
  const ordersValueEl = getElement('dashboard-orders-value');
  const ordersChangeEl = getElement('dashboard-orders-change');
  if (ordersValueEl) {
    ordersValueEl.textContent = `${stats.orders.today || 0} đơn`;
  }
  if (ordersChangeEl) {
    const change = stats.orders.change || 0;
    ordersChangeEl.className = `summary-change ${change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'}`;
    ordersChangeEl.textContent = change > 0
      ? `+${change}% tăng trưởng`
      : change < 0
        ? `${change}% giảm`
        : 'Không thay đổi';
  }
  
  // Guests
  const guestsValueEl = getElement('dashboard-guests-value');
  if (guestsValueEl) {
    guestsValueEl.textContent = `${stats.guests.today || 0} khách`;
  }
  
  // Tables
  const tablesAvailableEl = getElement('dashboard-tables-available-value');
  if (tablesAvailableEl && stats.tables) {
    tablesAvailableEl.textContent = `${stats.tables.available || 0}/${stats.tables.total || 0}`;
  }
  
  // Reservations waiting
  const reservationsWaitingEl = getElement('dashboard-reservations-waiting-value');
  if (reservationsWaitingEl && stats.reservations) {
    reservationsWaitingEl.textContent = `${stats.reservations.waiting || 0} lượt`;
  }
  
  // Active guests
  const activeGuestsEl = getElement('dashboard-active-guests-value');
  if (activeGuestsEl && stats.reservations) {
    activeGuestsEl.textContent = `${stats.reservations.activeGuests || 0} khách`;
  }
};

const fetchAdminReservations = async () => {
  try {
    console.log('[Admin] Fetching reservations from /admin/api/reservations...');
    const response = await fetch('/admin/api/reservations', {
      credentials: 'same-origin'
    });
    
    console.log('[Admin] Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Admin] Error response:', errorText);
      throw new Error(`Không thể tải danh sách đặt bàn: ${response.status} ${response.statusText}`);
    }
    
    const reservations = await response.json();
    console.log('[Admin] Received reservations:', reservations.length);
    state.reservations = reservations;
    renderAdminReservations();
  } catch (error) {
    console.error('[Admin] Lỗi khi tải danh sách đặt bàn:', error);
    const tableBody = getElement('admin-reservations-body');
    const emptyMessage = getElement('admin-reservations-empty');
    if (tableBody) {
      tableBody.innerHTML = '';
    }
    if (emptyMessage) {
      emptyMessage.textContent = 'Không thể tải danh sách đặt bàn. Vui lòng thử lại.';
      emptyMessage.style.display = 'block';
    }
  }
};

const renderAdminReservations = () => {
  const activeTableBody = getElement('admin-reservations-active-body');
  const activeEmptyMessage = getElement('admin-reservations-active-empty');
  const completedTableBody = getElement('admin-reservations-completed-body');
  const completedEmptyMessage = getElement('admin-reservations-completed-empty');

  if (!activeTableBody || !activeEmptyMessage || !completedTableBody || !completedEmptyMessage) {
    return;
  }

  activeTableBody.innerHTML = '';
  completedTableBody.innerHTML = '';

  if (!state.reservations || state.reservations.length === 0) {
    activeEmptyMessage.style.display = 'block';
    completedEmptyMessage.style.display = 'block';
    return;
  }

  // Separate active and completed/cancelled reservations
  const activeReservations = state.reservations.filter(r => 
    r.status === 'DANG_CHO' || r.status === 'XAC_NHAN'
  );
  const completedReservations = state.reservations.filter(r => 
    r.status === 'HOAN_THANH' || r.status === 'DA_HUY'
  );

  // Render active reservations
  if (activeReservations.length === 0) {
    activeEmptyMessage.style.display = 'block';
  } else {
    activeEmptyMessage.style.display = 'none';
    activeReservations.forEach((reservation) => {
      renderReservationRow(reservation, activeTableBody, true);
    });
  }

  // Render completed/cancelled reservations
  if (completedReservations.length === 0) {
    completedEmptyMessage.style.display = 'block';
  } else {
    completedEmptyMessage.style.display = 'none';
    completedReservations.forEach((reservation) => {
      renderReservationRow(reservation, completedTableBody, false);
    });
  }
};

const renderReservationRow = (reservation, tableBody, showActions = true) => {
  const row = document.createElement('tr');
  row.className = 'hover:bg-slate-900/80';

  // Reservation ID
  const idCell = document.createElement('td');
  idCell.className = 'px-3 py-2 text-xs font-semibold text-slate-100';
  idCell.textContent = `#${reservation.id.substring(reservation.id.length - 6)}`;

  // Customer Name
  const nameCell = document.createElement('td');
  nameCell.className = 'px-3 py-2 text-xs text-slate-300';
  nameCell.textContent = reservation.customerName || '—';

  // Phone
  const phoneCell = document.createElement('td');
  phoneCell.className = 'px-3 py-2 text-xs text-slate-300';
  phoneCell.textContent = reservation.customerPhone || reservation.guestPhone || '—';

  // Guest Count
  const guestsCell = document.createElement('td');
  guestsCell.className = 'px-3 py-2 text-xs text-slate-300';
  guestsCell.textContent = `${reservation.guestCount} người`;

  // Date & Time
  const dateCell = document.createElement('td');
  dateCell.className = 'px-3 py-2 text-xs text-slate-300';
  dateCell.textContent = reservation.reservedAt || '—';

  // Tables
  const tablesCell = document.createElement('td');
  tablesCell.className = 'px-3 py-2 text-xs text-slate-300';
  if (reservation.tables && reservation.tables.length > 0) {
    tablesCell.textContent = reservation.tables.map(t => t.name).join(', ');
  } else {
    tablesCell.textContent = 'Chưa gán bàn';
  }

  // Status
  const statusCell = document.createElement('td');
  statusCell.className = 'px-3 py-2 text-xs';
  const statusBadge = document.createElement('span');
  statusBadge.className = 'px-2 py-1 rounded text-xs font-semibold';
  
  if (reservation.status === 'XAC_NHAN') {
    statusBadge.className += ' bg-green-500/20 text-green-400';
    statusBadge.textContent = 'Đã xác nhận';
  } else if (reservation.status === 'HOAN_THANH') {
    statusBadge.className += ' bg-blue-500/20 text-blue-400';
    statusBadge.textContent = 'Hoàn thành';
  } else if (reservation.status === 'DA_HUY') {
    statusBadge.className += ' bg-red-500/20 text-red-400';
    statusBadge.textContent = 'Đã hủy';
  } else {
    statusBadge.className += ' bg-yellow-500/20 text-yellow-400';
    statusBadge.textContent = 'Đang chờ';
  }
  statusCell.appendChild(statusBadge);

  row.appendChild(idCell);
  row.appendChild(nameCell);
  row.appendChild(phoneCell);
  row.appendChild(guestsCell);
  row.appendChild(dateCell);
  row.appendChild(tablesCell);
  row.appendChild(statusCell);

  if (showActions) {
    // Actions for active reservations
    const actionsCell = document.createElement('td');
    actionsCell.className = 'table-action-cell';
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'action-buttons';

    if (reservation.status === 'DANG_CHO') {
      const confirmBtn = document.createElement('button');
      confirmBtn.className = 'btn-chip btn-chip--success';
      confirmBtn.textContent = 'Xác nhận';
      confirmBtn.onclick = () => handleConfirmReservation(reservation.id);
      actionsDiv.appendChild(confirmBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn-chip btn-chip--danger';
      cancelBtn.textContent = 'Hủy';
      cancelBtn.onclick = () => openCancelReservationModal(reservation.id);
      actionsDiv.appendChild(cancelBtn);
    } else if (reservation.status === 'XAC_NHAN') {
      const completeBtn = document.createElement('button');
      completeBtn.className = 'btn-chip btn-chip--success';
      completeBtn.textContent = 'Hoàn thành';
      completeBtn.onclick = () => openCompleteReservationModal(reservation.id);
      actionsDiv.appendChild(completeBtn);

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn-chip btn-chip--danger';
      cancelBtn.textContent = 'Hủy đặt bàn';
      cancelBtn.onclick = () => openCancelReservationModal(reservation.id);
      actionsDiv.appendChild(cancelBtn);
    } else {
      actionsDiv.textContent = '—';
    }

    actionsCell.appendChild(actionsDiv);
    row.appendChild(actionsCell);
  } else {
    // Cancel reason for completed/cancelled reservations
    const cancelReasonCell = document.createElement('td');
    cancelReasonCell.className = 'px-3 py-2 text-xs text-slate-300';
    if (reservation.status === 'DA_HUY' && reservation.cancelReason) {
      cancelReasonCell.textContent = reservation.cancelReason;
    } else {
      cancelReasonCell.textContent = '—';
    }
    row.appendChild(cancelReasonCell);
  }

  tableBody.appendChild(row);
};

const handleConfirmReservation = async (reservationId) => {
  if (!confirm('Bạn có chắc chắn muốn xác nhận đặt bàn này? Bàn sẽ được đánh dấu là đang sử dụng.')) {
    return;
  }

  try {
    const response = await fetch(`/admin/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'XAC_NHAN' })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể xác nhận đặt bàn');
    }

    alert('Xác nhận đặt bàn thành công!');
    await fetchAdminReservations();
  } catch (error) {
    console.error('Lỗi khi xác nhận đặt bàn:', error);
    alert(error.message || 'Có lỗi xảy ra khi xác nhận đặt bàn');
  }
};

// Cancel Reservation Modal Functions
const openCancelReservationModal = (reservationId) => {
  const overlay = getElement('cancel-reservation-modal-overlay');
  const form = getElement('cancel-reservation-form');
  const reservationIdInput = getElement('cancel-reservation-id');
  const messageEl = getElement('cancel-reservation-message');
  
  if (overlay && form && reservationIdInput) {
    reservationIdInput.value = reservationId;
    if (messageEl) {
      messageEl.style.display = 'none';
      messageEl.textContent = '';
    }
    const reasonInput = getElement('cancel-reservation-reason');
    if (reasonInput) reasonInput.value = '';
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
  }
};

const closeCancelReservationModal = () => {
  const overlay = getElement('cancel-reservation-modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }
};

const handleCancelReservation = async (reservationId, cancelReason = null) => {
  try {
    const response = await fetch(`/admin/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ 
        status: 'DA_HUY',
        cancelReason: cancelReason || undefined
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể hủy đặt bàn');
    }

    await fetchAdminReservations();
    await fetchAdminTables();
    
    closeCancelReservationModal();
    
    // Show success toast
    if (typeof showToast === 'function') {
      showToast('Hủy đặt bàn thành công!');
    }
  } catch (error) {
    console.error('Lỗi khi hủy đặt bàn:', error);
    const messageEl = getElement('cancel-reservation-message');
    if (messageEl) {
      messageEl.textContent = error.message || 'Có lỗi xảy ra khi hủy đặt bàn';
      messageEl.className = 'admin-message';
      messageEl.style.display = 'block';
    }
  }
};

// Complete Reservation Modal Functions
const openCompleteReservationModal = (reservationId) => {
  const overlay = getElement('complete-reservation-modal-overlay');
  const form = getElement('complete-reservation-form');
  const reservationIdInput = getElement('complete-reservation-id');
  const messageEl = getElement('complete-reservation-message');
  
  if (overlay && form && reservationIdInput) {
    reservationIdInput.value = reservationId;
    if (messageEl) {
      messageEl.style.display = 'none';
      messageEl.textContent = '';
    }
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');
  }
};

const closeCompleteReservationModal = () => {
  const overlay = getElement('complete-reservation-modal-overlay');
  if (overlay) {
    overlay.style.display = 'none';
    overlay.setAttribute('aria-hidden', 'true');
  }
};

const handleCompleteReservation = async (reservationId) => {
  try {
    // Note: You may need to add a HOAN_THANH status to your Reservation model
    // For now, we'll update the table status to TRONG
    const response = await fetch(`/admin/api/reservations/${reservationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ 
        status: 'HOAN_THANH'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Không thể hoàn thành đặt bàn');
    }

    await fetchAdminReservations();
    await fetchAdminTables();
    
    closeCompleteReservationModal();
    
    // Show success toast
    if (typeof showToast === 'function') {
      showToast('Hoàn thành đặt bàn thành công!');
    }
  } catch (error) {
    console.error('Lỗi khi hoàn thành đặt bàn:', error);
    const messageEl = getElement('complete-reservation-message');
    if (messageEl) {
      messageEl.textContent = error.message || 'Có lỗi xảy ra khi hoàn thành đặt bàn';
      messageEl.className = 'admin-message';
      messageEl.style.display = 'block';
    }
  }
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
    addButton.addEventListener('click', async () => {
      // Ensure categories are loaded before opening modal
      if (!state.categories || state.categories.length === 0) {
        await fetchCategories();
      }
      // Ensure dropdown is populated
      renderCategoryDropdown();
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

  // Setup size options add button
  const addSizeOptionBtn = getElement('add-size-option-btn');
  if (addSizeOptionBtn) {
    addSizeOptionBtn.addEventListener('click', () => {
      addSizeOptionRow();
    });
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

  // Setup category management
  const categoryAddButton = getElement('category-add-button');
  const categoryModalClose = getElement('category-modal-close');
  const categoryModalOverlay = getElement('category-modal-overlay');
  const categoryForm = getElement('category-form');
  const categoryResetButton = getElement('category-reset-button');

  if (categoryAddButton) {
    categoryAddButton.addEventListener('click', async () => {
      // Ensure categories are loaded
      if (!state.categories || state.categories.length === 0) {
        await fetchCategories();
      }
      resetCategoryForm();
      openCategoryModal();
    });
  }

  if (categoryModalClose) {
    categoryModalClose.addEventListener('click', closeCategoryModal);
  }

  if (categoryModalOverlay) {
    categoryModalOverlay.addEventListener('click', (event) => {
      if (event.target === categoryModalOverlay) {
        closeCategoryModal();
      }
    });
  }

  if (categoryForm) {
    categoryForm.addEventListener('submit', handleCategoryFormSubmit);
  }

  if (categoryResetButton) {
    categoryResetButton.addEventListener('click', resetCategoryForm);
  }

  fetchCategories();
  fetchAdminMenu();
  fetchAdminOrders();
  fetchAdminCustomers();
  
  // Fetch pending counts for sidebar badges
  fetchPendingCounts(false);
  setupBadgePolling();
  
  // Initialize logout buttons
  initializeLogoutButtons();
  
  // Initialize reservation modals
  const cancelReservationForm = getElement('cancel-reservation-form');
  const cancelReservationModalClose = getElement('cancel-reservation-modal-close');
  const cancelReservationCancelBtn = getElement('cancel-reservation-cancel-btn');
  const cancelReservationOverlay = getElement('cancel-reservation-modal-overlay');
  
  if (cancelReservationForm) {
    cancelReservationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const reservationId = getElement('cancel-reservation-id')?.value;
      const cancelReason = getElement('cancel-reservation-reason')?.value.trim() || null;
      if (reservationId) {
        await handleCancelReservation(reservationId, cancelReason);
      }
    });
  }
  
  if (cancelReservationModalClose) {
    cancelReservationModalClose.addEventListener('click', closeCancelReservationModal);
  }
  
  if (cancelReservationCancelBtn) {
    cancelReservationCancelBtn.addEventListener('click', closeCancelReservationModal);
  }
  
  if (cancelReservationOverlay) {
    cancelReservationOverlay.addEventListener('click', (event) => {
      if (event.target === cancelReservationOverlay) {
        closeCancelReservationModal();
      }
    });
  }
  
  // Initialize complete reservation modal
  const completeReservationForm = getElement('complete-reservation-form');
  const completeReservationModalClose = getElement('complete-reservation-modal-close');
  const completeReservationCancelBtn = getElement('complete-reservation-cancel-btn');
  const completeReservationOverlay = getElement('complete-reservation-modal-overlay');
  
  if (completeReservationForm) {
    completeReservationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const reservationId = getElement('complete-reservation-id')?.value;
      if (reservationId) {
        await handleCompleteReservation(reservationId);
      }
    });
  }
  
  if (completeReservationModalClose) {
    completeReservationModalClose.addEventListener('click', closeCompleteReservationModal);
  }
  
  if (completeReservationCancelBtn) {
    completeReservationCancelBtn.addEventListener('click', closeCompleteReservationModal);
  }
  
  if (completeReservationOverlay) {
    completeReservationOverlay.addEventListener('click', (event) => {
      if (event.target === completeReservationOverlay) {
        closeCompleteReservationModal();
      }
    });
  }
  
  // Initialize update table status modal
  const updateTableStatusForm = getElement('update-table-status-form');
  const updateTableStatusModalClose = getElement('update-table-status-modal-close');
  const updateTableStatusCancelBtn = getElement('update-table-status-cancel-btn');
  const updateTableStatusOverlay = getElement('update-table-status-modal-overlay');
  
  if (updateTableStatusForm) {
    updateTableStatusForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const tableId = getElement('update-table-status-id')?.value;
      const selectedStatus = updateTableStatusForm.querySelector('input[name="table-status"]:checked')?.value;
      if (tableId && selectedStatus) {
        await updateAdminTableStatus(tableId, selectedStatus);
        closeUpdateTableStatusModal();
      }
    });
  }
  
  if (updateTableStatusModalClose) {
    updateTableStatusModalClose.addEventListener('click', closeUpdateTableStatusModal);
  }
  
  if (updateTableStatusCancelBtn) {
    updateTableStatusCancelBtn.addEventListener('click', closeUpdateTableStatusModal);
  }
  
  if (updateTableStatusOverlay) {
    updateTableStatusOverlay.addEventListener('click', (event) => {
      if (event.target === updateTableStatusOverlay) {
        closeUpdateTableStatusModal();
      }
    });
  }
  
  // Check if we're on reservations page
  const currentPath = window.location.pathname;
  if (currentPath.includes('/admin/reservations')) {
    console.log('[Admin] Initializing reservations page...');
    fetchAdminTables();
    fetchAdminReservations();
  } else if (currentPath === '/admin' || currentPath === '/admin/' || currentPath === '/admin#dashboard') {
    // Check if we're on dashboard (main admin page)
    console.log('[Admin] Initializing dashboard page...');
    fetchDashboardStats();
  }
  
  setupSectionToggle();
};

// Pending badge state
let lastPendingCounts = { pendingOrders: 0, pendingReservations: 0 };
let badgePollIntervalId = null;

// Fetch pending counts for sidebar badges
async function fetchPendingCounts(notify = false) {
  try {
    const response = await fetch('/admin/api/pending-counts', {
      credentials: 'same-origin'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();

    // Trigger toast when counts increase
    if (notify) {
      const newOrders = data.pendingOrders - lastPendingCounts.pendingOrders;
      if (newOrders > 0) {
        showToast(`Có ${newOrders} đơn mới cần xử lý`);
        playNotificationSound();
      }
      const newReservations = data.pendingReservations - lastPendingCounts.pendingReservations;
      if (newReservations > 0) {
        showToast(`Có ${newReservations} yêu cầu đặt bàn mới`);
        playNotificationSound();
      }
    }

    lastPendingCounts = {
      pendingOrders: data.pendingOrders,
      pendingReservations: data.pendingReservations
    };

    updateSidebarBadges(data);
  } catch (error) {
    console.error('[Admin] Error fetching pending counts:', error);
  }
}

// Update sidebar badges
function updateSidebarBadges(counts) {
  // Orders badge - always show
  const ordersBadge = getElement('nav-orders-badge');
  if (ordersBadge) {
    ordersBadge.textContent = counts.pendingOrders > 99 ? '99+' : counts.pendingOrders.toString();
    ordersBadge.style.display = 'inline-flex';
  }
  
  // Reservations badge - always show
  const reservationsBadge = getElement('nav-reservations-badge');
  if (reservationsBadge) {
    reservationsBadge.textContent = counts.pendingReservations > 99 ? '99+' : counts.pendingReservations.toString();
    reservationsBadge.style.display = 'inline-flex';
  }
}

// Toast notifications
function ensureToastContainer() {
  let container = document.getElementById('admin-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'admin-toast-container';
    container.className = 'admin-toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = 'admin-toast';
  toast.innerHTML = `
    <span class="admin-toast-icon" aria-hidden="true">🔔</span>
    <div class="admin-toast-body">
      <span class="admin-toast-title">Thông báo mới</span>
      <span class="admin-toast-text">${message}</span>
    </div>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('admin-toast-hide');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setupBadgePolling() {
  if (badgePollIntervalId) {
    clearInterval(badgePollIntervalId);
  }
  badgePollIntervalId = setInterval(() => {
    fetchPendingCounts(true);
  }, 15000);
}

function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      throw new Error('AudioContext not supported');
    }

    const ctx = new AudioCtx();
    ctx.resume?.();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.value = 880;
    gain.gain.value = 0.2; // louder

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 2.0); // 2 seconds
  } catch (error) {
    console.warn('Notification sound not played:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdminPage);
} else {
  initializeAdminPage();
}

// Make functions available globally for refresh buttons
window.fetchAdminReservations = fetchAdminReservations;
window.fetchAdminTables = fetchAdminTables;



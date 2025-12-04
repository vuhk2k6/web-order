const state = {
  menuItems: [],
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

    const priceCell = document.createElement('td');
    priceCell.className = 'px-3 py-2 text-xs text-amber-400';
    priceCell.textContent = item.price;

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
      // eslint-disable-next-line no-console
      console.error('Không thể tải thực đơn trong admin');
      return;
    }

    const data = await response.json();
    state.menuItems = Array.isArray(data)
      ? data.map((item) => normalizeMenuItem(item)).filter(Boolean)
      : [];
    renderAdminMenuList();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Lỗi khi tải thực đơn trong admin', error);
  }
};

const resetMenuForm = () => {
  const idInput = getElement('menu-id');
  const nameInput = getElement('menu-name');
  const priceInput = getElement('menu-price');
  const descriptionInput = getElement('menu-description');
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
  const imageInput = getElement('menu-image');
  const imageFileInput = getElement('menu-image-file');
  const messageElement = getElement('menu-message');

  if (
    !idInput ||
    !nameInput ||
    !priceInput ||
    !descriptionInput ||
    !imageInput ||
    !messageElement
  ) {
    return;
  }

  const name = nameInput.value.trim();
  const price = priceInput.value.trim();
  const description = descriptionInput.value.trim();
  const image = imageInput.value.trim();

  if (!name || !price) {
    messageElement.textContent = 'Tên món và giá là bắt buộc.';
    return;
  }

  const payload = {
    name,
    price,
    description,
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

const initializeAdminPage = () => {
  const menuForm = getElement('menu-form');
  const resetFormButton = getElement('reset-form-button');
  const modalCloseButton = getElement('menu-modal-close');
  const modalOverlay = getElement('menu-modal-overlay');
  const imageFileInput = getElement('menu-image-file');
  const addButton = getElement('menu-add-button');

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

  fetchAdminMenu();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdminPage);
} else {
  initializeAdminPage();
}



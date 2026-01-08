/* eslint-disable no-console */

// ============================================
// MENU PAGE
// ============================================

// Helper function to get element by ID
const getMenuElement = (id) => document.getElementById(id);

// Open menu detail modal
const openMenuDetailModal = (item) => {
  const overlay = getMenuElement('menu-detail-modal-overlay');
  if (!overlay) {
    console.error('Không tìm thấy menu detail modal overlay');
    return;
  }

  const image = getMenuElement('menu-detail-image');
  const title = getMenuElement('menu-detail-title');
  const price = getMenuElement('menu-detail-price');
  const priceOld = getMenuElement('menu-detail-price-old');
  const description = getMenuElement('menu-detail-description');
  const sizeLabel = getMenuElement('menu-detail-size');
  const ingredients = getMenuElement('menu-detail-ingredients');
  const calories = getMenuElement('menu-detail-calories');
  const note = getMenuElement('menu-detail-note');
  const addButton = getMenuElement('menu-detail-add-button');
  const sizeOptionsContainer = getMenuElement('menu-detail-size-options');

  if (image) {
    image.src = item.image || '';
    image.alt = item.name || 'Ảnh món ăn';
  }

  if (title) {
    title.textContent = item.name || 'Món ăn';
  }

  if (price) {
    price.textContent = getFormatCurrencyVnd()(item.price);
  }

  if (priceOld && item.originalPrice && item.originalPrice > item.price) {
    priceOld.textContent = getFormatCurrencyVnd()(item.originalPrice);
    priceOld.style.display = 'inline';
  } else if (priceOld) {
    priceOld.style.display = 'none';
  }

  if (description) {
    description.textContent = item.description || 'Món ăn đặc biệt của nhà hàng.';
  }

  if (sizeLabel) {
    sizeLabel.textContent = item.size || 'Vừa (M)';
  }

  if (ingredients) {
    ingredients.textContent = item.ingredients || item.ingredientsList || 'Đang cập nhật';
  }

  if (calories) {
    calories.textContent = item.calories ? `${item.calories} kcal` : 'Đang cập nhật';
  }

  if (note) {
    note.textContent = item.note || 'Đang cập nhật';
  }

  let selectedSize = item.size || 'Mặc định';
  let selectedPrice = item.price || 0;
  
  const basePrice = item.price || 0;
  const sizeOptions = item.sizeOptions || [];
  
  if (sizeOptions.length === 0) {
    selectedSize = 'Mặc định';
    selectedPrice = basePrice;
  } else {
    if (!item.size || sizeOptions.find(opt => opt.name === item.size) === undefined) {
      selectedSize = sizeOptions[0]?.name || 'Mặc định';
      selectedPrice = basePrice + (sizeOptions[0]?.additionalPrice || 0);
    } else {
      const selectedOpt = sizeOptions.find(opt => opt.name === item.size);
      if (selectedOpt) {
        selectedSize = selectedOpt.name;
        selectedPrice = basePrice + (selectedOpt.additionalPrice || 0);
      }
    }
    
    if (price) {
      price.textContent = getFormatCurrencyVnd()(selectedPrice);
    }
  }
  
  if (sizeOptionsContainer && sizeOptions.length > 0) {
    sizeOptionsContainer.innerHTML = '';
    sizeOptions.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'menu-size-option';
      btn.textContent = opt.name;
      btn.setAttribute('data-size', opt.name);
      btn.setAttribute('data-additional-price', opt.additionalPrice || 0);
      if (opt.name === selectedSize) {
        btn.classList.add('active');
      }
      btn.onclick = () => {
        selectedSize = opt.name;
        selectedPrice = basePrice + (opt.additionalPrice || 0);
        sizeOptionsContainer.querySelectorAll('.menu-size-option').forEach((b) => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        if (price) {
          price.textContent = getFormatCurrencyVnd()(selectedPrice);
        }
      };
      sizeOptionsContainer.appendChild(btn);
    });
  } else if (sizeOptionsContainer) {
    sizeOptionsContainer.innerHTML = '';
  }

  if (addButton) {
    const handleAddToCart = async (e) => {
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
        console.error('Cart không khả dụng');
        return;
      }

      const originalText = addButton.textContent;
      addButton.disabled = true;
      addButton.textContent = 'Đang thêm...';

      try {
        const success = window.appCart.addItem({
          id: item._id || item.id,
          name: item.name,
          price: selectedPrice,
          basePrice: basePrice,
          image: item.image,
          quantity: 1,
          size: selectedSize
        });

        if (success) {
          addButton.textContent = 'Đã thêm ✓';
          window.setTimeout(() => {
            addButton.disabled = false;
            addButton.textContent = originalText;
            closeMenuDetailModal();
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
    };

    const newAddButton = addButton.cloneNode(true);
    addButton.parentNode.replaceChild(newAddButton, addButton);
    newAddButton.addEventListener('click', handleAddToCart);
  }

  overlay.style.display = 'flex';
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeMenuDetailModal = () => {
  const overlay = getMenuElement('menu-detail-modal-overlay');
  if (!overlay) {
    return;
  }

  overlay.style.display = 'none';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

// Initialize menu detail modal - setup event listeners
const initializeMenuDetailModal = () => {
  const closeButton = getMenuElement('menu-detail-close-button');
  const overlay = getMenuElement('menu-detail-modal-overlay');

  if (closeButton) {
    closeButton.addEventListener('click', closeMenuDetailModal);
  }

  if (overlay) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeMenuDetailModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && overlay && overlay.style.display === 'flex') {
      closeMenuDetailModal();
    }
  });
};

// Expose functions globally
if (typeof window !== 'undefined') {
  window.openMenuDetailModal = openMenuDetailModal;
  window.closeMenuDetailModal = closeMenuDetailModal;
}

const getFormatCurrencyVnd = () => {
  if (window.formatCurrencyVnd) {
    return window.formatCurrencyVnd;
  }
  return (value) => {
  if (!value) {
    return '';
  }
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return value;
  }
  return `${numberValue.toLocaleString('vi-VN')} đ`;
  };
};

const createFullMenuCard = (item) => {
  const card = document.createElement('article');
  card.className = 'menu-card';

  const imageWrapper = document.createElement('div');
  imageWrapper.className = 'menu-card-image-wrapper';

  if (item.image) {
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.name || 'Ảnh món ăn';
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
  price.textContent = getFormatCurrencyVnd()(item.price);
  priceContainer.appendChild(price);

  if (item.originalPrice && item.originalPrice > item.price) {
    const oldPrice = document.createElement('span');
    oldPrice.className = 'menu-card-price-old';
    oldPrice.textContent = getFormatCurrencyVnd()(item.originalPrice);
    priceContainer.appendChild(oldPrice);
  }

  titleRow.appendChild(title);
  titleRow.appendChild(priceContainer);

  const description = document.createElement('p');
  description.className = 'menu-card-description';
  description.textContent = item.description || 'Món ăn đặc biệt của nhà hàng.';

  const sizeRow = document.createElement('div');
  sizeRow.className = 'menu-card-size-inline';
  const basePrice = item.price || 0;
  const sizeOptions = item.sizeOptions || [];
  let selectedSize = 'Mặc định';
  let selectedPrice = basePrice;
  
  if (sizeOptions.length === 0) {
    sizeRow.style.display = 'none';
  } else {
    selectedSize = sizeOptions[0]?.name || 'Mặc định';
    selectedPrice = basePrice + (sizeOptions[0]?.additionalPrice || 0);
    
    sizeOptions.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'menu-size-chip';
      btn.textContent = opt.name;
      btn.setAttribute('data-size', opt.name);
      btn.setAttribute('data-additional-price', opt.additionalPrice || 0);
      if (opt.name === selectedSize) btn.classList.add('active');
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        selectedSize = opt.name;
        selectedPrice = basePrice + (opt.additionalPrice || 0);
        sizeRow.querySelectorAll('.menu-size-chip').forEach((b) => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        
        const priceEl = card.querySelector('.menu-card-price');
        if (priceEl) {
          priceEl.textContent = getFormatCurrencyVnd()(selectedPrice);
        }
      });
      sizeRow.appendChild(btn);
    });
    
    // Update initial price display
    const priceEl = priceContainer.querySelector('.menu-card-price');
    if (priceEl && selectedPrice !== basePrice) {
      priceEl.textContent = getFormatCurrencyVnd()(selectedPrice);
    }
  }

  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'menu-card-actions';

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
        price: selectedPrice, // Use selected price with size addition
        basePrice: basePrice, // Store base price for reference
        image: item.image,
          size: selectedSize,
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

  const viewButton = document.createElement('button');
  viewButton.type = 'button';
  viewButton.className = 'menu-view-button';
  viewButton.textContent = 'Xem chi tiết';
  viewButton.setAttribute('aria-label', `Xem chi tiết ${item.name || 'món ăn'}`);
  
  viewButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const itemId = item._id || item.id;
    if (itemId) {
      window.location.href = `/menu/${itemId}`;
    } else {
      console.error('Không tìm thấy ID món ăn');
    }
  });

  actionsContainer.appendChild(viewButton);
  actionsContainer.appendChild(addButton);

  cardContent.appendChild(titleRow);
  cardContent.appendChild(description);
  cardContent.appendChild(sizeRow);
  cardContent.appendChild(actionsContainer);

  card.appendChild(imageWrapper);
  card.appendChild(cardContent);

  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.menu-card-size-inline')) {
      return;
    }
    const itemId = item._id || item.id;
    if (itemId) {
      window.location.href = `/menu/${itemId}`;
    }
  });

  return card;
};

const getCategoryKey = (category) => {
  if (!category) return 'other';
  
  if (typeof category === 'object') {
    const id = category._id || category.id;
    if (id) return id.toString();
    if (category.name) return category.name.trim().toLowerCase().replace(/\s+/g, '-');
  }
  
  if (typeof category === 'string') {
    return category;
  }
  
  return 'other';
};

const renderMenuTabs = (categories = []) => {
  const nav = document.querySelector('.menu-nav-tabs');
  if (!nav) return;

  nav.innerHTML = '';

  const createTab = (label, value, isActive = false) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-nav-tab';
    if (isActive) {
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
    } else {
      btn.setAttribute('aria-selected', 'false');
    }
    btn.setAttribute('data-category', value);
    btn.setAttribute('role', 'tab');
    btn.textContent = label;
    return btn;
  };

  nav.appendChild(createTab('Tất cả', 'all', true));

  categories.forEach((cat) => {
    const catId = (cat._id || cat.id || '').toString();
    if (!catId) return;
    nav.appendChild(createTab(cat.name || 'Danh mục', catId));
  });
};

const renderFullMenu = (items) => {
  const listElement = getMenuElement('full-menu-list');
  const emptyElement = getMenuElement('full-menu-empty');

  console.log('[menu.js] renderFullMenu được gọi với', items ? items.length : 0, 'món ăn');

  if (!listElement) {
    console.error('[menu.js] Không tìm thấy element #full-menu-list');
    return;
  }

  if (!emptyElement) {
    console.error('[menu.js] Không tìm thấy element #full-menu-empty');
  }

  listElement.innerHTML = '';

  if (!items || items.length === 0) {
    console.log('[menu.js] Không có món ăn để hiển thị');
    if (emptyElement) {
      emptyElement.style.display = 'block';
    }
    return;
  }

  if (emptyElement) {
    emptyElement.style.display = 'none';
  }
  
  console.log('[menu.js] Đang render', items.length, 'món ăn...');

  const menuGrid = document.createElement('div');
  menuGrid.className = 'menu-category-grid';

  let renderedCount = 0;
  let errorCount = 0;
  
  items.forEach((item, index) => {
    try {
      if (!item || !item.name) {
        console.warn(`[menu.js] Item tại index ${index} không hợp lệ:`, item);
        errorCount++;
        return;
      }
      
      const card = createFullMenuCard(item);
      if (!card) {
        console.warn(`[menu.js] Không thể tạo card cho item:`, item.name);
        errorCount++;
        return;
      }
      
      const categoryKey = getCategoryKey(item.category);
      card.setAttribute('data-category', categoryKey);
      menuGrid.appendChild(card);
      renderedCount++;
    } catch (error) {
      console.error(`[menu.js] Lỗi khi render món tại index ${index}:`, error, item);
      errorCount++;
    }
  });

  console.log(`[menu.js] Render kết quả: ${renderedCount} thành công, ${errorCount} lỗi`);

  if (renderedCount > 0) {
    listElement.appendChild(menuGrid);
    console.log(`[menu.js] Đã append grid với ${renderedCount} món ăn vào #full-menu-list`);
    
    // Verify grid was appended
    const verifyGrid = listElement.querySelector('.menu-category-grid');
    if (verifyGrid) {
      console.log('[menu.js] Grid đã được append thành công, số lượng cards:', verifyGrid.children.length);
    } else {
      console.error('[menu.js] Grid không được tìm thấy sau khi append!');
    }
  } else {
    console.error('[menu.js] Không có món nào được render thành công');
    if (emptyElement) {
      emptyElement.textContent = 'Không thể hiển thị món ăn. Vui lòng thử lại sau.';
      emptyElement.style.display = 'block';
    }
  }
  
  console.log('[menu.js] Hoàn tất render menu');
};

const fetchFullMenu = async () => {
  try {
    console.log('[menu.js] Đang fetch /api/menu...');
    const response = await fetch('/api/menu');

    if (!response.ok) {
      console.error('[menu.js] Không thể tải thực đơn, status:', response.status);
      renderFullMenu([]);
      return [];
    }

    const data = await response.json();
    console.log('[menu.js] Nhận được dữ liệu:', Array.isArray(data) ? `${data.length} món ăn` : 'không phải array');
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('[menu.js] Mẫu món ăn đầu tiên:', {
        _id: data[0]._id,
        name: data[0].name,
        price: data[0].price,
        image: data[0].image
      });
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[menu.js] Lỗi khi tải thực đơn', error);
    return [];
  }
};

// Fetch categories list from API
const fetchMenuCategories = async () => {
  try {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      console.error('[menu.js] Không thể tải danh mục, status:', response.status);
      return [];
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[menu.js] Lỗi khi tải danh mục', error);
    return [];
  }
};

// Initialize menu page - load data and setup event listeners
const initializeMenuPage = async () => {
  const container = document.getElementById('shared-header');
  const headerExists = container && container.children.length > 0;
  
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
        logoSubtext: 'Thực đơn nhà hàng',
        activeNavLink: 'menu',
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
    
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  
  if (typeof window.fetchCurrentUser === 'function' && typeof window.updateAuthUi === 'function') {
    try {
      const user = await window.fetchCurrentUser();
      window.updateAuthUi(user);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[menu.js] Lỗi khi đồng bộ trạng thái đăng nhập:', error);
    }
  }
  
  await new Promise((resolve) => window.setTimeout(resolve, 50));
  
  if (typeof window.appCart !== 'undefined' && window.appCart) {
    window.appCart.updateBadge();
    const dropdown = document.getElementById('cart-dropdown');
    if (!dropdown || !dropdown.querySelector('.cart-dropdown-panel')) {
      window.appCart.renderDropdown();
    }
  }
  
  if (typeof window.initializeAuth === 'function' && !window.__authInitialized) {
    await window.initializeAuth();
    window.__authInitialized = true;
  }


  const searchInput = getMenuElement('menu-search');

  const [categories, items] = await Promise.all([
    fetchMenuCategories(),
    fetchFullMenu()
  ]);

  renderMenuTabs(categories);

  let filteredItems = items;
  let activeCategory = 'all';

  const applyFilters = () => {
    let results = items;

    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (keyword) {
      results = results.filter((item) =>
        (item.name || '').toLowerCase().includes(keyword)
      );
    }

    filteredItems = results;
    renderFullMenu(filteredItems);
    
    if (activeCategory) {
      filterMenuItemsByCategory(activeCategory);
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      applyFilters();
    });
  }

  const menuList = getMenuElement('full-menu-list');
  const bindCategoryTabs = () => {
    const tabs = document.querySelectorAll('.menu-nav-tab');
    if (!tabs.length || !menuList) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        activeCategory = tab.getAttribute('data-category') || 'all';
        if (menuList) {
          menuList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        filterMenuItemsByCategory(activeCategory);
      });
    });
  };
  bindCategoryTabs();
  
  renderFullMenu(filteredItems);
};

const filterMenuItemsByCategory = (category) => {
  const menuGrid = document.querySelector('#full-menu-list .menu-category-grid');
  if (!menuGrid) return;

  const cards = menuGrid.querySelectorAll('.menu-card');
  
  cards.forEach((card) => {
    const cardCategory = card.getAttribute('data-category') || 'other';
    
    if (category === 'all') {
      card.style.display = '';
    } else {
      if (cardCategory === category) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    }
  });
  
  const visibleCards = Array.from(cards).filter(card => {
    const display = window.getComputedStyle(card).display;
    return display !== 'none';
  });
  
  const emptyElement = getMenuElement('full-menu-empty');
  if (emptyElement) {
    if (visibleCards.length === 0 && category !== 'all') {
      const activeTab = document.querySelector('.menu-nav-tab.active');
      const categoryName = activeTab ? activeTab.textContent.trim() : 'danh mục này';
      emptyElement.textContent = `Không có món nào trong ${categoryName}.`;
      emptyElement.style.display = 'block';
    } else {
      emptyElement.style.display = 'none';
    }
  }
};

let menuPageInitialized = false;

const startMenuPage = () => {
  if (menuPageInitialized) {
    return;
  }
  menuPageInitialized = true;
  initializeMenuDetailModal();
  initializeMenuPage();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startMenuPage);
} else {
  startMenuPage();
}



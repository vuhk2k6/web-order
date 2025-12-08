/* eslint-disable no-console */
const getMenuElement = (id) => document.getElementById(id);

// Menu Detail Modal Functions
const openMenuDetailModal = (item) => {
  const overlay = getMenuElement('menu-detail-modal-overlay');
  if (!overlay) {
    console.error('Không tìm thấy menu detail modal overlay');
    return;
  }

  // Set content
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

  // Setup size options
  let selectedSize = item.size || 'Vừa (M)';
  if (sizeOptionsContainer) {
    const options = Array.from(sizeOptionsContainer.querySelectorAll('.menu-size-option'));
    options.forEach((btn) => btn.classList.toggle('active', btn.getAttribute('data-size') === selectedSize));
    options.forEach((btn) => {
      btn.onclick = () => {
        selectedSize = btn.getAttribute('data-size');
        options.forEach((b) => b.classList.toggle('active', b === btn));
      };
    });
  }

  // Setup add button
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
          price: item.price,
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

    // Remove old listeners and add new one
    const newAddButton = addButton.cloneNode(true);
    addButton.parentNode.replaceChild(newAddButton, addButton);
    newAddButton.addEventListener('click', handleAddToCart);
  }

  // Show modal
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

// Initialize menu detail modal
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

// formatCurrencyVnd is defined in main.js - wait for it to be available
const getFormatCurrencyVnd = () => {
  if (window.formatCurrencyVnd) {
    return window.formatCurrencyVnd;
  }
  // Fallback if main.js hasn't loaded yet
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
  card.setAttribute('data-category', item.category || 'all');

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

  // Size selector (inline)
  const sizeRow = document.createElement('div');
  sizeRow.className = 'menu-card-size-inline';
  const sizes = item.sizes || ['Nhỏ (S)', 'Vừa (M)', 'Lớn (L)'];
  let selectedSize = item.size || sizes[1] || 'Vừa (M)';
  sizes.forEach((label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-size-chip';
    btn.textContent = label;
    btn.setAttribute('data-size', label);
    if (label === selectedSize) btn.classList.add('active');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      selectedSize = label;
      sizeRow.querySelectorAll('.menu-size-chip').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
    sizeRow.appendChild(btn);
  });

  // Actions container for buttons
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'menu-card-actions';

  // Add to cart button
  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'menu-add-button';
  addButton.textContent = 'Thêm giỏ hàng';
  addButton.setAttribute('aria-label', `Thêm ${item.name || 'món ăn'} vào giỏ hàng`);
  
  addButton.addEventListener('click', async (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Prevent double-click
    if (addButton.disabled) {
      return;
    }
    
    // Wait for cart to be available
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
    
    // Disable button temporarily
    const originalText = addButton.textContent;
    addButton.disabled = true;
    addButton.textContent = 'Đang thêm...';
    
    try {
        const success = window.appCart.addItem({
        id: item._id || item.id,
        name: item.name,
        price: item.price,
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

  // View details button
  const viewButton = document.createElement('button');
  viewButton.type = 'button';
  viewButton.className = 'menu-view-button';
  viewButton.textContent = 'Xem chi tiết';
  viewButton.setAttribute('aria-label', `Xem chi tiết ${item.name || 'món ăn'}`);
  
  viewButton.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    // Open detail modal
    if (window.openMenuDetailModal) {
      window.openMenuDetailModal({ ...item, size: selectedSize });
    } else {
      console.warn('openMenuDetailModal không khả dụng');
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

  return card;
};

// Category mapping for display names (phải khớp với tab text trong HTML)
const categoryNames = {
  combo: 'COMBO',
  main: 'KHAI VỊ',           // Tab: "Khai vị"
  appetizer: 'MÓN CHÍNH',    // Tab: "Món chính"
  drink: 'MÓN CHAY',         // Tab: "Món chay"
  dessert: 'THỨC UỐNG',      // Tab: "Thức uống"
  vegetarian: 'TRÁNG MIỆNG'  // Tab: "Tráng miệng"
};

// Category order for display
const categoryOrder = ['combo', 'main', 'appetizer', 'drink', 'dessert', 'vegetarian'];

const renderFullMenu = (items) => {
  const listElement = getMenuElement('full-menu-list');
  const emptyElement = getMenuElement('full-menu-empty');

  console.log('[menu.js] renderFullMenu được gọi với', items ? items.length : 0, 'món ăn');

  if (!listElement || !emptyElement) {
    console.error('[menu.js] Không tìm thấy DOM elements:', {
      listElement: !!listElement,
      emptyElement: !!emptyElement
    });
    return;
  }

  listElement.innerHTML = '';

  if (!items || items.length === 0) {
    console.log('[menu.js] Không có món ăn để hiển thị');
    emptyElement.style.display = 'block';
    return;
  }

  emptyElement.style.display = 'none';
  console.log('[menu.js] Đang render', items.length, 'món ăn...');

  // Group items by category
  const itemsByCategory = {};
  items.forEach((item) => {
    const category = item.category || 'other';
    if (!itemsByCategory[category]) {
      itemsByCategory[category] = [];
    }
    itemsByCategory[category].push(item);
  });

  // Render each category section
  categoryOrder.forEach((categoryKey) => {
    const categoryItems = itemsByCategory[categoryKey];
    if (!categoryItems || categoryItems.length === 0) {
      return;
    }

    // Create category section
    const categorySection = document.createElement('div');
    categorySection.className = 'menu-category-section';
    categorySection.setAttribute('data-category', categoryKey);

    // Create category title
    const categoryTitle = document.createElement('h2');
    categoryTitle.className = 'menu-category-title';
    categoryTitle.textContent = categoryNames[categoryKey] || categoryKey.toUpperCase();
    categorySection.appendChild(categoryTitle);

    // Create category grid
    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'menu-category-grid';

    // Add cards to grid
    categoryItems.forEach((item) => {
    try {
      const card = createFullMenuCard(item);
        categoryGrid.appendChild(card);
      } catch (error) {
        console.error(`[menu.js] Lỗi khi render món:`, error, item);
      }
    });

    categorySection.appendChild(categoryGrid);
    listElement.appendChild(categorySection);
  });

  // Handle 'other' category if exists
  const otherItems = itemsByCategory['other'] || itemsByCategory[''] || [];
  if (otherItems.length > 0) {
    const categorySection = document.createElement('div');
    categorySection.className = 'menu-category-section';
    categorySection.setAttribute('data-category', 'other');

    const categoryTitle = document.createElement('h2');
    categoryTitle.className = 'menu-category-title';
    categoryTitle.textContent = 'MÓN KHÁC';
    categorySection.appendChild(categoryTitle);

    const categoryGrid = document.createElement('div');
    categoryGrid.className = 'menu-category-grid';

    otherItems.forEach((item) => {
      try {
        const card = createFullMenuCard(item);
        categoryGrid.appendChild(card);
    } catch (error) {
        console.error(`[menu.js] Lỗi khi render món:`, error, item);
    }
  });

    categorySection.appendChild(categoryGrid);
    listElement.appendChild(categorySection);
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

const initializeMenuPage = async () => {
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
    
    // Wait for header to be initialized
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  
  // Wait a bit for cart to be initialized
  await new Promise((resolve) => window.setTimeout(resolve, 50));
  
  // Ensure cart is initialized (only update, don't re-render)
  if (typeof window.appCart !== 'undefined' && window.appCart) {
    window.appCart.updateBadge();
    // Only render dropdown if it doesn't exist
    const dropdown = document.getElementById('cart-dropdown');
    if (!dropdown || !dropdown.querySelector('.cart-dropdown-panel')) {
      window.appCart.renderDropdown();
    }
  }
  
  // Initialize auth only if not already initialized
  if (typeof window.initializeAuth === 'function' && !window.__authInitialized) {
    await window.initializeAuth();
    window.__authInitialized = true;
  }


  const searchInput = getMenuElement('menu-search');

  const items = await fetchFullMenu();
  let filteredItems = items;

  const applyFilter = () => {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

    if (!keyword) {
      filteredItems = items;
    } else {
      filteredItems = items.filter((item) =>
        (item.name || '').toLowerCase().includes(keyword)
      );
    }

    renderFullMenu(filteredItems);
  };

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  // Setup category filter
  const tabs = document.querySelectorAll('.menu-nav-tab');
  const menuList = getMenuElement('full-menu-list');
  
  if (tabs.length && menuList) {
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });

        // Add active class to clicked tab
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const category = tab.getAttribute('data-category');
        const categorySections = menuList.querySelectorAll('.menu-category-section');
        
        if (category === 'all') {
          // Show all sections
          categorySections.forEach((section) => {
            section.style.display = '';
          });
        } else {
          // Show only matching category section
          categorySections.forEach((section) => {
            const sectionCategory = section.getAttribute('data-category');
            if (sectionCategory === category) {
              section.style.display = '';
            } else {
              section.style.display = 'none';
            }
          });
        }
      });
    });
  }

  renderFullMenu(filteredItems);
};

// Prevent multiple initializations
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



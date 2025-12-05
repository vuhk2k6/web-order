/* eslint-disable no-console */
const getMenuElement = (id) => document.getElementById(id);

const formatCurrencyVnd = (value) => {
  if (!value) {
    return '';
  }

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return value;
  }

  return `${numberValue.toLocaleString('vi-VN')} đ`;
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

  const titleRow = document.createElement('div');
  titleRow.className = 'menu-card-title-row';

  const title = document.createElement('h3');
  title.className = 'menu-card-title';
  title.textContent = item.name || 'Món ăn';

  const price = document.createElement('p');
  price.className = 'menu-card-price';
  price.textContent = formatCurrencyVnd(item.price);

  titleRow.appendChild(title);
  titleRow.appendChild(price);

  const description = document.createElement('p');
  description.className = 'menu-card-description';
  description.textContent = item.description || 'Món ăn đặc biệt của nhà hàng.';

  const actions = document.createElement('div');
  actions.className = 'menu-card-actions';

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'menu-add-button';
  addButton.textContent = 'Thêm vào giỏ';
  addButton.addEventListener('click', () => {
    if (window.appCart && typeof window.appCart.addItem === 'function') {
      window.appCart.addItem({
        id: item._id || item.id,
        name: item.name,
        price: item.price,
        image: item.image
      });
    }
  });

  actions.appendChild(addButton);

  card.appendChild(imageWrapper);
  card.appendChild(titleRow);
  card.appendChild(description);
  card.appendChild(actions);

  return card;
};

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

  items.forEach((item, index) => {
    try {
      const card = createFullMenuCard(item);
      listElement.appendChild(card);
      if (index === 0) {
        console.log('[menu.js] Đã render món đầu tiên:', item.name);
      }
    } catch (error) {
      console.error(`[menu.js] Lỗi khi render món ${index}:`, error, item);
    }
  });
  
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
  const renderHeader = async () => {
    if (typeof window.renderSharedHeader === 'function') {
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
      return true;
    }
    return false;
  };

  let headerRendered = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!headerRendered && attempts < maxAttempts) {
    headerRendered = await renderHeader();
    if (!headerRendered) {
      await new Promise((resolve) => window.setTimeout(resolve, 50));
      attempts++;
    }
  }
  
  if (typeof window.initializeAuth === 'function') {
    await window.initializeAuth();
  }

  if (!headerRendered) {
    console.warn('Không thể render header sau', maxAttempts, 'lần thử');
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

  renderFullMenu(filteredItems);
};

const startMenuPage = () => {
  initializeMenuPage();
};

const ensureHeaderRendered = () => {
  const container = document.getElementById('shared-header');
  if (container && container.children.length === 0) {
    if (typeof window.renderSharedHeader === 'function') {
      window.renderSharedHeader({
        logoSubtext: 'Thực đơn nhà hàng',
        activeNavLink: 'menu',
        showAuthButton: true,
        authButtonText: 'Đăng nhập',
        authButtonId: 'auth-open-button',
        onAuthClick: () => {
          if (window.authState && window.authState.currentUser) {
            window.location.href = '/profile';
          } else {
            window.location.href = '/';
          }
        }
      });
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ensureHeaderRendered();
    startMenuPage();
  });
} else {
  ensureHeaderRendered();
  startMenuPage();
}

window.addEventListener('load', () => {
  ensureHeaderRendered();
});



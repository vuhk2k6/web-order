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
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', item.name || 'Món ăn');

  const imageWrapper = document.createElement('div');
  imageWrapper.className =
    'mb-3 flex h-32 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_top,_#fbbf24,_#e5e7eb_60%)]';

  if (item.image) {
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.name || 'Ảnh món ăn';
    image.loading = 'lazy';
    imageWrapper.appendChild(image);
  }

  const titleRow = document.createElement('div');
  titleRow.className = 'flex items-center justify-between gap-2';

  const title = document.createElement('h3');
  title.className = 'text-sm font-semibold text-slate-900';
  title.textContent = item.name;

  const price = document.createElement('p');
  price.className = 'text-sm font-semibold text-amber-600';
  price.textContent = formatCurrencyVnd(item.price);

  titleRow.appendChild(title);
  titleRow.appendChild(price);

  const description = document.createElement('p');
  description.className = 'mt-2 text-xs text-slate-600';
  description.textContent = item.description || 'Món ăn đặc biệt của nhà hàng.';

  const actions = document.createElement('div');
  actions.className = 'menu-card-actions';

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'menu-add-button';
  addButton.textContent = 'Thêm vào giỏ';
  addButton.setAttribute('aria-label', `Thêm ${item.name || 'món ăn'} vào giỏ hàng`);
  addButton.addEventListener('click', () => {
    if (window.appCart && typeof window.appCart.addItem === 'function') {
      window.appCart.addItem({
        id: item._id || item.id,
        name: item.name,
        price: item.price,
        image: item.image || item.imageUrl || ''
      });
      if (typeof window.appCart.open === 'function') {
        window.appCart.open();
      }
    }
  });

  actions.appendChild(addButton);

  card.appendChild(imageWrapper);
  card.appendChild(titleRow);
  card.appendChild(description);

  return card;
};

const renderFullMenu = (items) => {
  const listElement = getMenuElement('full-menu-list');
  const emptyElement = getMenuElement('full-menu-empty');

  console.log('[menu.js] renderFullMenu được gọi với', items ? items.length : 0, 'món ăn');

  if (!listElement || !emptyElement) {
    console.error('Không tìm thấy phần tử DOM: full-menu-list hoặc full-menu-empty');
    return;
  }

  listElement.innerHTML = '';

  if (!items || items.length === 0) {
    console.log('Không có món ăn để hiển thị');
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
  
  console.log('Đã render xong', items.length, 'món ăn');
};

const fetchFullMenu = async () => {
  try {
    console.log('Đang tải thực đơn từ /api/menu...');
    const response = await fetch('/api/menu');

    if (!response.ok) {
      console.error('Không thể tải thực đơn, status:', response.status);
      renderFullMenu([]);
      return;
    }

    const data = await response.json();
    console.log('Đã nhận được dữ liệu:', data.length, 'món ăn');
    if (data.length > 0) {
      console.log('Mẫu món ăn đầu tiên:', data[0]);
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('[menu.js] Lỗi khi tải thực đơn', error);
    return [];
  }
};

const initializeMenuPage = async () => {
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMenuPage);
} else {
  initializeMenuPage();
}



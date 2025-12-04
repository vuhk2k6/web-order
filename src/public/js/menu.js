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
  card.className =
    'group flex flex-col rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400/70';

  const imageWrapper = document.createElement('div');
  imageWrapper.className =
    'mb-3 flex h-32 items-center justify-center rounded-xl bg-[radial-gradient(circle_at_top,_#fbbf24,_#e5e7eb_60%)]';

  if (item.image) {
    const image = document.createElement('img');
    image.src = item.image;
    image.alt = item.name || 'Ảnh món ăn';
    image.style.maxHeight = '100%';
    image.style.maxWidth = '100%';
    image.style.borderRadius = '10px';
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

  card.appendChild(imageWrapper);
  card.appendChild(titleRow);
  card.appendChild(description);

  return card;
};

const renderFullMenu = (items) => {
  const listElement = getMenuElement('full-menu-list');
  const emptyElement = getMenuElement('full-menu-empty');

  if (!listElement || !emptyElement) {
    return;
  }

  listElement.innerHTML = '';

  if (!items || items.length === 0) {
    emptyElement.style.display = 'block';
    return;
  }

  emptyElement.style.display = 'none';

  items.forEach((item) => {
    const card = createFullMenuCard(item);
    listElement.appendChild(card);
  });
};

const fetchFullMenu = async () => {
  try {
    const response = await fetch('/api/menu');

    if (!response.ok) {
      console.error('Không thể tải thực đơn');
      renderFullMenu([]);
      return;
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Lỗi khi tải thực đơn', error);
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



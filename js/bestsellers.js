let currentTab = 'bestsellers';

// Best sellers items with badges
const bestsellersData = [
    { id: 6, badge: 'new', size: '9 inch', customName: 'PIZZA TÔM & BÒ XỐT PARMESAN' }, // Pizza Hải Sản - NEW!
    { id: 6, badge: 'extra', size: '9 inch', customName: 'PIZZA TÔM XỐT PARMESAN SIÊU TOPPING' }, // Pizza với extra topping
    { id: 12, badge: 'bestseller', size: '9 inch', customName: 'PIZZA BÒ GỎ BÒ MỸ XỐT PHÔ MAI' }, // Bò Bít Tết - BEST SELLER
    { id: 6, badge: 'bestseller', size: '9 inch', customName: 'PIZZA HẢI SÂN XỐT PESTO KEM CHANH' } // Pizza Hải Sản - BEST SELLER
];

// Today's menu items
const todayMenuData = [
    { id: 5, badge: 'new', size: '9 inch' }, // Burger Cổ Điển
    { id: 7, size: '9 inch' }, // Phở Bò Đặc Biệt
    { id: 8, size: '9 inch' }, // Gà Rán Giòn
    { id: 9, size: '9 inch' } // Mì Ý Sốt Bò Bằm
];

// Promo items
const promoMenuData = [
    { id: 6, badge: 'extra', size: '9 inch' }, // Pizza Hải Sản
    { id: 10, badge: 'new', size: '9 inch' }, // Cơm Sườn Bì Chả
    { id: 11, size: '9 inch' }, // Bún Chả Hà Nội
    { id: 13, size: '9 inch' } // Cơm Chiên Dương Châu
];

function getMenuItemById(id) {
    // Try to load from menu.js function first
    if (typeof loadMenuItems === 'function') {
        const menuItems = loadMenuItems();
        return menuItems.find(item => item.id === id);
    }
    // Fallback to localStorage
    const menuItems = JSON.parse(localStorage.getItem('menuItems') || '[]');
    return menuItems.find(item => item.id === id);
}

function getBadgeText(badge) {
    switch(badge) {
        case 'new':
            return 'NEW!';
        case 'extra':
            return 'EXTRA 50% TOPPING SAUCE & CHEESE';
        case 'bestseller':
            return 'BEST SELLER';
        default:
            return null;
    }
}

function getBadgeClass(badge) {
    switch(badge) {
        case 'new':
            return 'badge-new';
        case 'extra':
            return 'badge-extra';
        case 'bestseller':
            return 'badge-bestseller';
        default:
            return '';
    }
}

function displayBestsellersItems(items) {
    const grid = document.getElementById('bestsellers-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    items.forEach((itemData, index) => {
        const menuItem = getMenuItemById(itemData.id);
        if (!menuItem) return;
        
        const item = document.createElement('div');
        item.className = 'bestsellers-item';
        
        const image = document.createElement('div');
        image.className = 'bestsellers-image';
        
        const emoji = document.createElement('span');
        emoji.className = 'bestsellers-emoji';
        emoji.textContent = menuItem.emoji || '🍽️';
        image.appendChild(emoji);
        
        if (itemData.badge) {
            const badge = document.createElement('div');
            badge.className = `bestsellers-badge ${getBadgeClass(itemData.badge)}`;
            badge.textContent = getBadgeText(itemData.badge);
            image.appendChild(badge);
        }
        
        const details = document.createElement('div');
        details.className = 'bestsellers-details';
        
        const name = document.createElement('h3');
        name.textContent = itemData.customName || menuItem.name.toUpperCase();
        details.appendChild(name);
        
        if (itemData.size) {
            const size = document.createElement('div');
            size.className = 'bestsellers-size';
            size.textContent = itemData.size;
            details.appendChild(size);
        }
        
        const footer = document.createElement('div');
        footer.className = 'bestsellers-footer';
        
        const price = document.createElement('div');
        price.className = 'bestsellers-price';
        price.textContent = menuItem.price.toLocaleString('vi-VN') + '₫';
        footer.appendChild(price);
        
        const addBtn = document.createElement('button');
        addBtn.className = 'btn btn-add-cart';
        addBtn.textContent = 'Thêm vào giỏ';
        addBtn.addEventListener('click', function() {
            // No login required to add to cart
            if (typeof addToCart === 'function') {
                addToCart(menuItem.id, menuItem.name, menuItem.price);
            }
        });
        footer.appendChild(addBtn);
        
        details.appendChild(footer);
        
        item.appendChild(image);
        item.appendChild(details);
        
        grid.appendChild(item);
    });
}

function switchTab(tab) {
    currentTab = tab;
    
    // Update active tab
    const tabs = document.querySelectorAll('.bestsellers-tab');
    tabs.forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Display appropriate items
    let items = [];
    switch(tab) {
        case 'today':
            items = todayMenuData;
            break;
        case 'promo':
            items = promoMenuData;
            break;
        case 'bestsellers':
        default:
            items = bestsellersData;
            break;
    }
    
    displayBestsellersItems(items);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Wait for menu items to be loaded
    if (typeof loadMenuItems === 'function') {
        loadMenuItems();
    }
    
    // Set up tab buttons
    const tabs = document.querySelectorAll('.bestsellers-tab');
    tabs.forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Display initial bestsellers
    setTimeout(() => {
        switchTab('bestsellers');
    }, 100);
});


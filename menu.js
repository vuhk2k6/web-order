function loadMenuItems() {
    const menuItems = localStorage.getItem('menuItems');
    let items;
    
    if (!menuItems) {
        items = [
            { id: 1, name: 'Burger Cổ Điển', description: 'Bánh mì mềm, thịt bò tươi, phô mai, rau xà lách và sốt đặc biệt', price: 150000, emoji: '🍔', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { id: 2, name: 'Pizza Hải Sản', description: 'Pizza giòn với tôm, mực, nghêu và phô mai mozzarella', price: 220000, emoji: '🍕', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            { id: 3, name: 'Phở Bò Đặc Biệt', description: 'Phở truyền thống với nước dùng đậm đà, thịt bò tươi', price: 85000, emoji: '🍜', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
            { id: 4, name: 'Gà Rán Giòn', description: 'Gà tươi tẩm gia vị đặc biệt, chiên giòn vàng ươm', price: 120000, emoji: '🍗', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
            { id: 5, name: 'Mì Ý Sốt Bò Bằm', description: 'Mì Ý al dente với sốt cà chua và thịt bò bằm thơm ngon', price: 135000, emoji: '🍝', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
            { id: 6, name: 'Cơm Sườn Bì Chả', description: 'Cơm trắng với sườn nướng, bì và chả trứng thơm lừng', price: 95000, emoji: '🍱', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
        ];
        localStorage.setItem('menuItems', JSON.stringify(items));
    } else {
        items = JSON.parse(menuItems);
    }
    
    return items;
}

function displayMenuItems() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;
    
    const items = loadMenuItems();
    
    menuGrid.innerHTML = items.map(item => `
        <div class="menu-item" data-id="${item.id}">
            <div class="item-image" style="background: ${item.gradient};">
                <span class="image-placeholder">${item.emoji}</span>
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-description">${item.description}</p>
                <div class="item-footer">
                    <span class="item-price">${item.price.toLocaleString('vi-VN')}đ</span>
                    <button class="btn btn-add-cart" onclick="addToCart(${item.id}, '${item.name}', ${item.price})">Thêm vào giỏ</button>
                </div>
            </div>
        </div>
    `).join('');
}

if (document.querySelector('.menu-grid')) {
    document.addEventListener('DOMContentLoaded', displayMenuItems);
}

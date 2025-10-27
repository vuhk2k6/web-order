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
    menuGrid.innerHTML = '';
    
    items.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.dataset.id = item.id;
        
        const itemImage = document.createElement('div');
        itemImage.className = 'item-image';
        itemImage.style.background = item.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        
        const imagePlaceholder = document.createElement('span');
        imagePlaceholder.className = 'image-placeholder';
        imagePlaceholder.textContent = item.emoji || '🍽️';
        itemImage.appendChild(imagePlaceholder);
        
        const itemDetails = document.createElement('div');
        itemDetails.className = 'item-details';
        
        const itemName = document.createElement('h3');
        itemName.textContent = item.name;
        
        const itemDescription = document.createElement('p');
        itemDescription.className = 'item-description';
        itemDescription.textContent = item.description;
        
        const itemFooter = document.createElement('div');
        itemFooter.className = 'item-footer';
        
        const itemPrice = document.createElement('span');
        itemPrice.className = 'item-price';
        itemPrice.textContent = item.price.toLocaleString('vi-VN') + 'đ';
        
        const addButton = document.createElement('button');
        addButton.className = 'btn btn-add-cart';
        addButton.textContent = 'Thêm vào giỏ';
        addButton.addEventListener('click', function() {
            addToCart(item.id, item.name, item.price);
        });
        
        itemFooter.appendChild(itemPrice);
        itemFooter.appendChild(addButton);
        
        itemDetails.appendChild(itemName);
        itemDetails.appendChild(itemDescription);
        itemDetails.appendChild(itemFooter);
        
        menuItem.appendChild(itemImage);
        menuItem.appendChild(itemDetails);
        
        menuGrid.appendChild(menuItem);
    });
}

if (document.querySelector('.menu-grid')) {
    document.addEventListener('DOMContentLoaded', displayMenuItems);
}

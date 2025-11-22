let currentFilter = 'all';
const MENU_DATA_VERSION = 2; // Version control for menu data

function loadMenuItems() {
    const menuItems = localStorage.getItem('menuItems');
    const dataVersion = localStorage.getItem('menuDataVersion');
    let items;
    
    // Force update if no data or old version
    if (!menuItems || !dataVersion || parseInt(dataVersion) < MENU_DATA_VERSION) {
        items = [
            // Món khai vị
            { id: 1, name: 'Gỏi Cuốn Tôm Thịt', category: 'appetizer', description: 'Gỏi cuốn tươi ngon với tôm, thịt và rau thơm', price: 65000, emoji: '🥗', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { id: 2, name: 'Nem Rán Giòn', category: 'appetizer', description: 'Nem rán truyền thống chiên vàng giòn rụm', price: 55000, emoji: '🥟', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            { id: 3, name: 'Salad Trộn Đặc Biệt', category: 'appetizer', description: 'Salad tươi mát với sốt đặc biệt của nhà hàng', price: 75000, emoji: '🥗', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
            { id: 4, name: 'Chả Giò Hải Sản', category: 'appetizer', description: 'Chả giò giòn tan nhân hải sản tươi ngon', price: 85000, emoji: '🍤', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
            
            // Món chính
            { id: 5, name: 'Burger Cổ Điển', category: 'main', description: 'Bánh mì mềm, thịt bò tươi, phô mai, rau xà lách và sốt đặc biệt', price: 150000, emoji: '🍔', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
            { id: 6, name: 'Pizza Hải Sản', category: 'main', description: 'Pizza giòn với tôm, mực, nghêu và phô mai mozzarella', price: 220000, emoji: '🍕', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
            { id: 7, name: 'Phở Bò Đặc Biệt', category: 'main', description: 'Phở truyền thống với nước dùng đậm đà, thịt bò tươi', price: 85000, emoji: '🍜', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
            { id: 8, name: 'Gà Rán Giòn', category: 'main', description: 'Gà tươi tẩm gia vị đặc biệt, chiên giòn vàng ươm', price: 120000, emoji: '🍗', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
            { id: 9, name: 'Mì Ý Sốt Bò Bằm', category: 'main', description: 'Mì Ý al dente với sốt cà chua và thịt bò bằm thơm ngon', price: 135000, emoji: '🍝', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
            { id: 10, name: 'Cơm Sườn Bì Chả', category: 'main', description: 'Cơm trắng với sườn nướng, bì và chả trứng thơm lừng', price: 95000, emoji: '🍱', gradient: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)' },
            { id: 11, name: 'Bún Chả Hà Nội', category: 'main', description: 'Bún tươi, chả nướng thơm phức, nước mắm chua ngọt', price: 90000, emoji: '🍲', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
            { id: 12, name: 'Bò Bít Tết', category: 'main', description: 'Thịt bò mềm thơm nướng chín vừa, kèm khoai tây chiên', price: 180000, emoji: '🥩', gradient: 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)' },
            { id: 13, name: 'Cơm Chiên Dương Châu', category: 'main', description: 'Cơm chiên thập cẩm với tôm, xúc xích và rau củ', price: 110000, emoji: '🍚', gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
            { id: 14, name: 'Bún Bò Huế', category: 'main', description: 'Bún bò cay thơm đặc trưng miền Trung', price: 95000, emoji: '🍜', gradient: 'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)' },
            
            // Món tráng miệng
            { id: 15, name: 'Bánh Flan Caramen', category: 'dessert', description: 'Bánh flan mềm mịn với lớp caramen đậm đà', price: 45000, emoji: '🍮', gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
            { id: 16, name: 'Kem Tươi Ý', category: 'dessert', description: 'Kem gelato Ý nhiều hương vị: vani, socola, dâu', price: 55000, emoji: '🍦', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
            { id: 17, name: 'Chè Thái Đặc Biệt', category: 'dessert', description: 'Chè thái trái cây tươi mát lạnh', price: 50000, emoji: '🍧', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
            { id: 18, name: 'Bánh Tiramisu', category: 'dessert', description: 'Tiramisu Ý nguyên bản với cà phê espresso', price: 65000, emoji: '🍰', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { id: 19, name: 'Trái Cây Tươi', category: 'dessert', description: 'Đĩa trái cây tươi ngon theo mùa', price: 60000, emoji: '🍓', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)' },
            
            // Đồ uống
            { id: 20, name: 'Cà Phê Sữa Đá', category: 'drink', description: 'Cà phê phin truyền thống Việt Nam với sữa đá', price: 35000, emoji: '☕', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
            { id: 21, name: 'Trà Sữa Trân Châu', category: 'drink', description: 'Trà sữa ngọt ngào với trân châu dai mềm', price: 45000, emoji: '🧋', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
            { id: 22, name: 'Sinh Tố Bơ', category: 'drink', description: 'Sinh tố bơ béo ngậy, mát lạnh', price: 50000, emoji: '🥑', gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)' },
            { id: 23, name: 'Nước Ép Cam Tươi', category: 'drink', description: 'Nước cam vắt tươi 100% không đường', price: 40000, emoji: '🍊', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
            { id: 24, name: 'Trà Đào Cam Sả', category: 'drink', description: 'Trà trái cây thanh mát với đào, cam và sả', price: 48000, emoji: '🍑', gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)' },
            { id: 25, name: 'Coca Cola', category: 'drink', description: 'Nước ngọt có ga mát lạnh', price: 25000, emoji: '🥤', gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' }
        ];
        localStorage.setItem('menuItems', JSON.stringify(items));
        localStorage.setItem('menuDataVersion', MENU_DATA_VERSION.toString());
    } else {
        items = JSON.parse(menuItems);
        // Fallback: If items don't have category field, force upgrade
        if (items.length > 0 && !items[0].hasOwnProperty('category')) {
            localStorage.removeItem('menuItems');
            localStorage.removeItem('menuDataVersion');
            return loadMenuItems(); // Recursive call to reload
        }
    }
    
    return items;
}

function filterMenuItems(category) {
    currentFilter = category;
    
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    displayMenuItems();
}

function displayMenuItems() {
    const menuGrid = document.querySelector('.menu-grid');
    if (!menuGrid) return;
    
    const items = loadMenuItems();
    const filteredItems = currentFilter === 'all' 
        ? items 
        : items.filter(item => item.category === currentFilter);
    
    menuGrid.innerHTML = '';
    
    filteredItems.forEach((item, index) => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.dataset.id = item.id;
        menuItem.style.animationDelay = `${index * 50}ms`;
        
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
            // Check auth (login or dine-in) before adding to cart
            if (typeof requireAuth === 'function') {
                requireAuth(function() {
                    if (typeof addToCart === 'function') {
                        addToCart(item.id, item.name, item.price);
                    }
                });
            } else if (typeof requireLogin === 'function') {
                requireLogin(function() {
                    if (typeof addToCart === 'function') {
                        addToCart(item.id, item.name, item.price);
                    }
                });
            } else if (typeof addToCart === 'function') {
                addToCart(item.id, item.name, item.price);
            }
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

// Initialize menu when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const menuGrid = document.querySelector('.menu-grid');
    if (menuGrid) {
        displayMenuItems();
    }
});

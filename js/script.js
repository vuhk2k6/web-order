function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update old cart count elements
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = `(${totalItems})`;
    });
    
    // Update new cart badge
    const cartBadgeElements = document.querySelectorAll('#cart-badge');
    cartBadgeElements.forEach(element => {
        element.textContent = totalItems;
        if (totalItems === 0) {
            element.style.display = 'none';
        } else {
            element.style.display = 'flex';
        }
    });
}

function addToCart(id, name, price) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart(cart);
    showNotification(`Đã thêm "${name}" vào giỏ hàng!`);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
}

function displayCartItems() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');

    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>🛒 Giỏ hàng của bạn đang trống</p>
                <a href="menu.html" class="btn btn-primary">Xem Thực Đơn</a>
            </div>
        `;
        updateCartTotal();
        return;
    }

    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item" data-index="${index}">
            <span class="item-emoji">${getItemEmoji(item.id)}</span>
            <span class="item-name">${item.name}</span>
            <span class="item-price-display">${formatCurrency(item.price)}</span>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                       onchange="setQuantity(${index}, this.value)" readonly>
                <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <span class="item-total">${formatCurrency(item.price * item.quantity)}</span>
            <button class="remove-btn" onclick="removeItem(${index})">Xóa</button>
        </div>
    `).join('');

    updateCartTotal();
}

function getItemEmoji(id) {
    const emojis = {
        1: '🍔',
        2: '🍕',
        3: '🍜',
        4: '🍗',
        5: '🍝',
        6: '🍱'
    };
    return emojis[id] || '🍽️';
}

function updateQuantity(index, change) {
    const cart = getCart();
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity < 1) {
            cart[index].quantity = 1;
        }
        saveCart(cart);
        displayCartItems();
    }
}

function setQuantity(index, value) {
    const cart = getCart();
    const quantity = parseInt(value);
    if (cart[index] && quantity > 0) {
        cart[index].quantity = quantity;
        saveCart(cart);
        displayCartItems();
    }
}

function removeItem(index) {
    const cart = getCart();
    if (confirm(`Bạn có chắc muốn xóa "${cart[index].name}" khỏi giỏ hàng?`)) {
        cart.splice(index, 1);
        saveCart(cart);
        displayCartItems();
    }
}

function updateCartTotal() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');

    if (subtotalElement) {
        subtotalElement.textContent = formatCurrency(total);
    }
    if (totalElement) {
        totalElement.textContent = formatCurrency(total);
    }
}

function saveOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
}

function handleCheckout(event) {
    event.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
        alert('Giỏ hàng của bạn đang trống!');
        return;
    }

    const form = event.target;
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const address = form.address.value.trim();

    if (!name || !phone || !address) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const order = {
        id: 'DH' + Date.now(),
        customerName: name,
        phone: phone,
        address: address,
        items: [...cart],
        total: total,
        itemCount: itemCount,
        status: 'Mới',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    saveOrder(order);

    alert(`Đặt hàng thành công!\n\nMã đơn: ${order.id}\nTên: ${name}\nSố điện thoại: ${phone}\nĐịa chỉ: ${address}\n\nSố món: ${itemCount}\nTổng tiền: ${formatCurrency(total)}\n\nCảm ơn bạn đã đặt hàng!`);

    localStorage.removeItem('cart');
    form.reset();
    displayCartItems();
    updateCartCount();
}

// setActiveNavLink is defined in navbar.js
// This function is kept for backward compatibility and will be called after navbar loads
function setActiveNavLinkFallback() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a[data-page]');
    
    if (navLinks.length === 0) {
        // Fallback: try without data-page attribute
        const allNavLinks = document.querySelectorAll('.nav-menu a');
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for navbar to be injected
    setTimeout(() => {
        updateCartCount();
        setActiveNavLinkFallback();
    }, 50);

    if (document.getElementById('cart-items')) {
        displayCartItems();
    }

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
});

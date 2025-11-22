// Track Order Functions
function searchOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId.toUpperCase());
    
    return order;
}

function getMyOrders() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return [];
    }
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Filter orders by current user's phone or email
    const myOrders = orders.filter(order => {
        return order.phone === currentUser.phone || 
               order.customerName === currentUser.username ||
               order.email === currentUser.email;
    });
    
    // Sort by date (newest first)
    return myOrders.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
}

function getStatusClass(status) {
    const statusMap = {
        'Mới': 'status-new',
        'Đang xử lý': 'status-processing',
        'Đang giao hàng': 'status-delivering',
        'Hoàn thành': 'status-completed',
        'Đã hủy': 'status-cancelled'
    };
    return statusMap[status] || 'status-new';
}

function displayOrder(order) {
    const itemsHTML = order.items.map(item => `
        <div class="order-item">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">x${item.quantity}</span>
            <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
        </div>
    `).join('');

    return `
        <div class="order-detail">
            <div class="order-header">
                <div>
                    <div class="order-id">${order.id}</div>
                    <div class="order-date">Ngày đặt: ${formatDate(order.createdAt)}</div>
                </div>
                <div class="order-status ${getStatusClass(order.status)}">${order.status}</div>
            </div>
            <div class="order-info">
                <div class="info-item">
                    <span class="info-label">Tên khách hàng</span>
                    <span class="info-value">${order.customerName}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Số điện thoại</span>
                    <span class="info-value">${order.phone}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Địa chỉ</span>
                    <span class="info-value">${order.address}</span>
                </div>
            </div>
            <div class="order-items">
                <div class="order-items-title">Chi tiết đơn hàng:</div>
                ${itemsHTML}
            </div>
            <div class="order-footer">
                <div>
                    <span style="font-size: 0.9rem; color: var(--text-medium);">Tổng tiền: </span>
                    <span class="order-total">${formatCurrency(order.total)}</span>
                </div>
            </div>
        </div>
    `;
}

function displayOrderCard(order) {
    const itemsHTML = order.items.map(item => `
        <div class="order-item">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">x${item.quantity}</span>
            <span class="item-price">${formatCurrency(item.price * item.quantity)}</span>
        </div>
    `).join('');

    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">${order.id}</div>
                    <div class="order-date">${formatDate(order.createdAt)}</div>
                </div>
                <div class="order-status ${getStatusClass(order.status)}">${order.status}</div>
            </div>
            <div class="order-info">
                <div class="info-item">
                    <span class="info-label">Địa chỉ</span>
                    <span class="info-value">${order.address}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Số món</span>
                    <span class="info-value">${order.itemCount} món</span>
                </div>
            </div>
            <div class="order-items">
                <div class="order-items-title">Chi tiết:</div>
                ${itemsHTML}
            </div>
            <div class="order-footer">
                <div class="order-total">${formatCurrency(order.total)}</div>
                <div class="order-actions">
                    <button class="btn btn-primary btn-small" onclick="viewOrderDetail('${order.id}')">
                        <i class="ri-eye-line"></i> Chi tiết
                    </button>
                </div>
            </div>
        </div>
    `;
}

function handleSearchOrder(event) {
    event.preventDefault();
    const form = event.target;
    const orderId = form.orderId.value.trim().toUpperCase();
    const resultDiv = document.getElementById('search-result');
    
    if (!orderId) {
        resultDiv.innerHTML = '<p style="color: #721c24;">Vui lòng nhập mã đơn hàng!</p>';
        resultDiv.className = 'search-result show error';
        return;
    }
    
    const order = searchOrder(orderId);
    
    if (order) {
        resultDiv.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: #155724;">Tìm thấy đơn hàng:</h3>
            ${displayOrder(order)}
        `;
        resultDiv.className = 'search-result show success';
    } else {
        resultDiv.innerHTML = '<p style="color: #721c24;">Không tìm thấy đơn hàng với mã: ' + orderId + '</p>';
        resultDiv.className = 'search-result show error';
    }
}

function loadMyOrders() {
    const ordersList = document.getElementById('my-orders-list');
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i class="ri-login-box-line"></i>
                <p>Vui lòng đăng nhập để xem đơn hàng của bạn</p>
                <button class="btn btn-primary" onclick="if(typeof showLoginModal === 'function') showLoginModal();" style="margin-top: 1rem;">
                    Đăng Nhập
                </button>
            </div>
        `;
        return;
    }
    
    const orders = getMyOrders();
    
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-orders">
                <i class="ri-shopping-bag-line"></i>
                <p>Bạn chưa có đơn hàng nào</p>
                <p class="hint">Đặt hàng ngay để nhận được những món ăn ngon!</p>
                <a href="menu.html" class="btn btn-primary" style="margin-top: 1rem;">Xem Thực Đơn</a>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => displayOrderCard(order)).join('');
}

function viewOrderDetail(orderId) {
    const order = searchOrder(orderId);
    if (order) {
        const detailHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 24px; padding: 2rem; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative;">
                    <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 15px; right: 15px; width: 36px; height: 36px; border: none; background: #ff4444; color: white; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">×</button>
                    ${displayOrder(order)}
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', detailHTML);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Search form
    const searchForm = document.getElementById('search-order-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearchOrder);
    }
    
    // Load my orders
    loadMyOrders();
});


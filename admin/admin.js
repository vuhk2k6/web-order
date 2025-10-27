function getOrders() {
    const orders = localStorage.getItem('orders');
    return orders ? JSON.parse(orders) : [];
}

function saveOrders(orders) {
    localStorage.setItem('orders', JSON.stringify(orders));
}

function getMenuItems() {
    const menuItems = localStorage.getItem('menuItems');
    if (!menuItems) {
        const defaultMenu = [
            { id: 1, name: 'Burger Cổ Điển', description: 'Bánh mì mềm, thịt bò tươi, phô mai, rau xà lách và sốt đặc biệt', price: 150000, emoji: '🍔', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
            { id: 2, name: 'Pizza Hải Sản', description: 'Pizza giòn với tôm, mực, nghêu và phô mai mozzarella', price: 220000, emoji: '🍕', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
            { id: 3, name: 'Phở Bò Đặc Biệt', description: 'Phở truyền thống với nước dùng đậm đà, thịt bò tươi', price: 85000, emoji: '🍜', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
            { id: 4, name: 'Gà Rán Giòn', description: 'Gà tươi tẩm gia vị đặc biệt, chiên giòn vàng ươm', price: 120000, emoji: '🍗', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
            { id: 5, name: 'Mì Ý Sốt Bò Bằm', description: 'Mì Ý al dente với sốt cà chua và thịt bò bằm thơm ngon', price: 135000, emoji: '🍝', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
            { id: 6, name: 'Cơm Sườn Bì Chả', description: 'Cơm trắng với sườn nướng, bì và chả trứng thơm lừng', price: 95000, emoji: '🍱', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
        ];
        localStorage.setItem('menuItems', JSON.stringify(defaultMenu));
        return defaultMenu;
    }
    return JSON.parse(menuItems);
}

function saveMenuItems(items) {
    localStorage.setItem('menuItems', JSON.stringify(items));
}

function formatCurrency(amount) {
    return amount.toLocaleString('vi-VN') + 'đ';
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN');
}

function displayOrders() {
    const orders = getOrders();
    const ordersTableBody = document.getElementById('orders-table-body');
    
    if (!ordersTableBody) return;

    if (orders.length === 0) {
        ordersTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                    Chưa có đơn hàng nào
                </td>
            </tr>
        `;
        return;
    }

    ordersTableBody.innerHTML = orders.reverse().map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.phone}</td>
            <td>${formatCurrency(order.total)}</td>
            <td><span class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></td>
            <td>${formatDate(order.createdAt)}</td>
            <td>
                <button class="btn-small btn-info" onclick="viewOrderDetails('${order.id}')">Chi tiết</button>
                <button class="btn-small btn-success" onclick="updateOrderStatus('${order.id}')">Cập nhật</button>
                <button class="btn-small btn-danger" onclick="deleteOrder('${order.id}')">Xóa</button>
            </td>
        </tr>
    `).join('');
}

function viewOrderDetails(orderId) {
    const orders = getOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }

    const itemsList = order.items.map(item => 
        `- ${item.name} x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`
    ).join('\n');

    alert(`CHI TIẾT ĐỚN HÀNG\n\nMã đơn: ${order.id}\nKhách hàng: ${order.customerName}\nSố điện thoại: ${order.phone}\nĐịa chỉ: ${order.address}\n\nMÓN ĂN:\n${itemsList}\n\nTổng tiền: ${formatCurrency(order.total)}\nTrạng thái: ${order.status}\nNgày đặt: ${formatDate(order.createdAt)}`);
}

function updateOrderStatus(orderId) {
    const orders = getOrders();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        alert('Không tìm thấy đơn hàng!');
        return;
    }

    const statuses = ['Mới', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];
    const currentStatus = orders[orderIndex].status;
    const currentIndex = statuses.indexOf(currentStatus);
    
    const statusOptions = statuses.map((s, i) => `${i + 1}. ${s}${s === currentStatus ? ' (Hiện tại)' : ''}`).join('\n');
    const choice = prompt(`Chọn trạng thái mới:\n${statusOptions}\n\nNhập số (1-5):`);
    
    if (choice && choice >= 1 && choice <= 5) {
        orders[orderIndex].status = statuses[choice - 1];
        orders[orderIndex].updatedAt = new Date().toISOString();
        saveOrders(orders);
        displayOrders();
        alert('Cập nhật trạng thái thành công!');
    }
}

function deleteOrder(orderId) {
    if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) {
        return;
    }

    let orders = getOrders();
    orders = orders.filter(o => o.id !== orderId);
    saveOrders(orders);
    displayOrders();
    alert('Đã xóa đơn hàng!');
}

function displayMenuItems() {
    const menuItems = getMenuItems();
    const menuTableBody = document.getElementById('menu-table-body');
    
    if (!menuTableBody) return;

    menuTableBody.innerHTML = menuItems.map(item => `
        <tr>
            <td>${item.id}</td>
            <td><span style="font-size: 2rem;">${item.emoji}</span></td>
            <td>${item.name}</td>
            <td>${item.description}</td>
            <td>${formatCurrency(item.price)}</td>
            <td>
                <button class="btn-small btn-warning" onclick="editMenuItem(${item.id})">Sửa</button>
                <button class="btn-small btn-danger" onclick="deleteMenuItem(${item.id})">Xóa</button>
            </td>
        </tr>
    `).join('');
}

function showAddMenuForm() {
    document.getElementById('menu-form-title').textContent = 'Thêm Món Mới';
    document.getElementById('menu-item-form').reset();
    document.getElementById('menu-item-id').value = '';
    document.getElementById('menu-form-section').style.display = 'block';
    document.getElementById('menu-item-name').focus();
}

function editMenuItem(itemId) {
    const menuItems = getMenuItems();
    const item = menuItems.find(i => i.id === itemId);
    
    if (!item) {
        alert('Không tìm thấy món ăn!');
        return;
    }

    document.getElementById('menu-form-title').textContent = 'Sửa Món Ăn';
    document.getElementById('menu-item-id').value = item.id;
    document.getElementById('menu-item-name').value = item.name;
    document.getElementById('menu-item-description').value = item.description;
    document.getElementById('menu-item-price').value = item.price;
    document.getElementById('menu-item-emoji').value = item.emoji;
    document.getElementById('menu-item-gradient').value = item.gradient;
    document.getElementById('menu-form-section').style.display = 'block';
    document.getElementById('menu-item-name').focus();
}

function saveMenuItem(event) {
    event.preventDefault();
    
    const form = event.target;
    const itemId = document.getElementById('menu-item-id').value;
    const menuItems = getMenuItems();
    
    const itemData = {
        id: itemId ? parseInt(itemId) : Date.now(),
        name: form['item-name'].value.trim(),
        description: form['item-description'].value.trim(),
        price: parseInt(form['item-price'].value),
        emoji: form['item-emoji'].value.trim() || '🍽️',
        gradient: form['item-gradient'].value.trim() || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };

    if (!itemData.name || !itemData.description || !itemData.price) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
    }

    if (itemId) {
        const index = menuItems.findIndex(i => i.id === parseInt(itemId));
        if (index !== -1) {
            menuItems[index] = itemData;
        }
    } else {
        menuItems.push(itemData);
    }

    saveMenuItems(menuItems);
    displayMenuItems();
    cancelMenuForm();
    alert(itemId ? 'Cập nhật món ăn thành công!' : 'Thêm món ăn thành công!');
}

function cancelMenuForm() {
    document.getElementById('menu-form-section').style.display = 'none';
    document.getElementById('menu-item-form').reset();
}

function deleteMenuItem(itemId) {
    if (!confirm('Bạn có chắc muốn xóa món ăn này?')) {
        return;
    }

    let menuItems = getMenuItems();
    menuItems = menuItems.filter(i => i.id !== itemId);
    saveMenuItems(menuItems);
    displayMenuItems();
    alert('Đã xóa món ăn!');
}

function getOrderStats() {
    const orders = getOrders();
    const stats = {
        total: orders.length,
        new: orders.filter(o => o.status === 'Mới').length,
        processing: orders.filter(o => o.status === 'Đang xử lý').length,
        delivering: orders.filter(o => o.status === 'Đang giao').length,
        completed: orders.filter(o => o.status === 'Đã giao').length,
        cancelled: orders.filter(o => o.status === 'Đã hủy').length,
        revenue: orders.filter(o => o.status === 'Đã giao').reduce((sum, o) => sum + o.total, 0)
    };
    return stats;
}

function displayStats() {
    const stats = getOrderStats();
    
    document.getElementById('stat-total-orders').textContent = stats.total;
    document.getElementById('stat-new-orders').textContent = stats.new;
    document.getElementById('stat-processing-orders').textContent = stats.processing;
    document.getElementById('stat-revenue').textContent = formatCurrency(stats.revenue);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('orders-table-body')) {
        displayStats();
        displayOrders();
        displayMenuItems();

        const menuItemForm = document.getElementById('menu-item-form');
        if (menuItemForm) {
            menuItemForm.addEventListener('submit', saveMenuItem);
        }
    }
});

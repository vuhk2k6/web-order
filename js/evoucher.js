// Sample voucher database - In production, this would come from a server
const voucherDatabase = {
    'WELCOME10': {
        code: 'WELCOME10',
        type: 'Phần trăm giảm giá',
        value: '10%',
        discount: 10,
        discountType: 'percentage',
        expiry: '31/12/2025',
        description: 'Giảm 10% cho đơn hàng đầu tiên',
        used: false
    },
    'SAVE50K': {
        code: 'SAVE50K',
        type: 'Giảm giá cố định',
        value: '50,000₫',
        discount: 50000,
        discountType: 'fixed',
        expiry: '31/12/2025',
        description: 'Giảm 50,000₫ cho đơn hàng từ 200,000₫',
        used: false,
        minOrder: 200000
    },
    'NEWYEAR20': {
        code: 'NEWYEAR20',
        type: 'Phần trăm giảm giá',
        value: '20%',
        discount: 20,
        discountType: 'percentage',
        expiry: '31/01/2025',
        description: 'Giảm 20% cho đơn hàng trong tháng 1',
        used: false
    },
    'BIRTHDAY100K': {
        code: 'BIRTHDAY100K',
        type: 'Giảm giá cố định',
        value: '100,000₫',
        discount: 100000,
        discountType: 'fixed',
        expiry: '31/12/2025',
        description: 'Giảm 100,000₫ cho đơn hàng từ 500,000₫',
        used: false,
        minOrder: 500000
    }
};

function getMyVouchers() {
    const vouchers = localStorage.getItem('myVouchers');
    return vouchers ? JSON.parse(vouchers) : [];
}

function saveMyVouchers(vouchers) {
    localStorage.setItem('myVouchers', JSON.stringify(vouchers));
}

function addVoucherToMyList(voucher) {
    const myVouchers = getMyVouchers();
    
    // Check if voucher already exists
    if (myVouchers.find(v => v.code === voucher.code)) {
        return false;
    }
    
    // Add voucher with additional info
    const myVoucher = {
        ...voucher,
        addedAt: new Date().toISOString(),
        used: false
    };
    
    myVouchers.push(myVoucher);
    saveMyVouchers(myVouchers);
    return true;
}

function validateVoucher(code) {
    const upperCode = code.toUpperCase().trim();
    
    if (!upperCode) {
        return {
            valid: false,
            message: 'Vui lòng nhập mã voucher!'
        };
    }
    
    const voucher = voucherDatabase[upperCode];
    
    if (!voucher) {
        return {
            valid: false,
            message: 'Mã voucher không hợp lệ!'
        };
    }
    
    // Check if already used
    const myVouchers = getMyVouchers();
    const myVoucher = myVouchers.find(v => v.code === upperCode);
    
    if (myVoucher && myVoucher.used) {
        return {
            valid: false,
            message: 'Voucher này đã được sử dụng!'
        };
    }
    
    return {
        valid: true,
        voucher: voucher,
        message: 'Voucher hợp lệ!'
    };
}

function displayVoucherInfo(voucher) {
    document.getElementById('info-code').textContent = voucher.code;
    document.getElementById('info-type').textContent = voucher.type;
    document.getElementById('info-value').textContent = voucher.value;
    document.getElementById('info-expiry').textContent = voucher.expiry;
    document.getElementById('info-description').textContent = voucher.description;
    
    const voucherInfo = document.getElementById('voucher-info');
    voucherInfo.style.display = 'block';
}

function showMessage(message, type) {
    const messageEl = document.getElementById('voucher-message');
    messageEl.textContent = message;
    messageEl.className = `voucher-message show ${type}`;
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 5000);
}

function displayMyVouchers() {
    const myVouchers = getMyVouchers();
    const listContainer = document.getElementById('my-vouchers-list');
    
    if (myVouchers.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-vouchers">
                <i class="ri-coupon-3-fill"></i>
                <p>Bạn chưa có voucher nào</p>
                <p class="hint">Nhập mã voucher ở trên để thêm vào danh sách</p>
            </div>
        `;
        return;
    }
    
    listContainer.innerHTML = myVouchers.map(voucher => `
        <div class="voucher-item-card ${voucher.used ? 'used' : ''}">
            <div class="voucher-item-info">
                <div class="voucher-item-code">${voucher.code}</div>
                <div class="voucher-item-desc">${voucher.description}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="voucher-item-value">${voucher.value}</div>
                <div class="voucher-item-actions">
                    ${voucher.used ? 
                        '<span style="color: var(--text-medium); font-size: 0.9rem;">Đã sử dụng</span>' :
                        `<button class="btn btn-primary btn-small" onclick="useVoucher('${voucher.code}')">Sử dụng</button>
                         <button class="btn btn-small" onclick="removeVoucher('${voucher.code}')" style="background: #f8d7da; color: #721c24;">Xóa</button>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}

function useVoucher(code) {
    if (confirm(`Bạn có chắc muốn sử dụng voucher "${code}"?`)) {
        const myVouchers = getMyVouchers();
        const voucherIndex = myVouchers.findIndex(v => v.code === code);
        
        if (voucherIndex !== -1) {
            myVouchers[voucherIndex].used = true;
            myVouchers[voucherIndex].usedAt = new Date().toISOString();
            saveMyVouchers(myVouchers);
            
            // Save active voucher to use in cart
            localStorage.setItem('activeVoucher', JSON.stringify(myVouchers[voucherIndex]));
            
            showMessage(`Voucher "${code}" đã được kích hoạt! Voucher sẽ được áp dụng vào đơn hàng tiếp theo của bạn.`, 'success');
            displayMyVouchers();
        }
    }
}

function removeVoucher(code) {
    if (confirm(`Bạn có chắc muốn xóa voucher "${code}"?`)) {
        const myVouchers = getMyVouchers();
        const filteredVouchers = myVouchers.filter(v => v.code !== code);
        saveMyVouchers(filteredVouchers);
        
        // Remove from active voucher if it's the one being removed
        const activeVoucher = localStorage.getItem('activeVoucher');
        if (activeVoucher) {
            const active = JSON.parse(activeVoucher);
            if (active.code === code) {
                localStorage.removeItem('activeVoucher');
            }
        }
        
        showMessage(`Đã xóa voucher "${code}"!`, 'success');
        displayMyVouchers();
    }
}

function handleApplyVoucher() {
    const codeInput = document.getElementById('voucher-code');
    const code = codeInput.value.trim();
    
    const validation = validateVoucher(code);
    
    if (!validation.valid) {
        showMessage(validation.message, 'error');
        document.getElementById('voucher-info').style.display = 'none';
        return;
    }
    
    // Add to my vouchers if not already added
    const added = addVoucherToMyList(validation.voucher);
    
    if (added) {
        showMessage('Voucher đã được thêm vào danh sách của bạn!', 'success');
        displayMyVouchers();
    } else {
        showMessage('Voucher này đã có trong danh sách của bạn!', 'error');
    }
    
    // Display voucher info
    displayVoucherInfo(validation.voucher);
    
    // Clear input
    codeInput.value = '';
}

function handleUseFromInfo() {
    const code = document.getElementById('info-code').textContent;
    if (code && code !== '-') {
        // First add to my vouchers if not already added
        const myVouchers = getMyVouchers();
        const exists = myVouchers.find(v => v.code === code);
        
        if (!exists) {
            const voucher = voucherDatabase[code];
            if (voucher) {
                addVoucherToMyList(voucher);
                displayMyVouchers();
            }
        }
        
        // Then use the voucher
        useVoucher(code);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Apply button
    const applyBtn = document.getElementById('apply-voucher-btn');
    if (applyBtn) {
        applyBtn.addEventListener('click', handleApplyVoucher);
    }
    
    // Enter key in input
    const codeInput = document.getElementById('voucher-code');
    if (codeInput) {
        codeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleApplyVoucher();
            }
        });
    }
    
    // Use voucher button in info card
    const useBtn = document.getElementById('use-voucher-btn');
    if (useBtn) {
        useBtn.addEventListener('click', handleUseFromInfo);
    }
    
    // Display my vouchers
    displayMyVouchers();
    
    // Check for active voucher on page load
    const activeVoucher = localStorage.getItem('activeVoucher');
    if (activeVoucher) {
        try {
            const voucher = JSON.parse(activeVoucher);
            if (!voucher.used) {
                displayVoucherInfo(voucher);
            }
        } catch (e) {
            console.error('Error parsing active voucher:', e);
        }
    }
});


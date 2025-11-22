// Authentication functions
function isLoggedIn() {
    const user = localStorage.getItem('currentUser');
    return user !== null;
}

function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('dineInSession'); // Also clear dine-in session if exists
    updateNavbarUser();
    hideUserMenu();
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('Đã đăng xuất thành công!');
    }
    
    // Reload page to reset state
    location.reload();
}

function register(username, email, phone, password) {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        return {
            success: false,
            message: 'Email này đã được sử dụng!'
        };
    }
    
    // Check if phone already exists
    if (users.find(u => u.phone === phone)) {
        return {
            success: false,
            message: 'Số điện thoại này đã được sử dụng!'
        };
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        username: username,
        email: email,
        phone: phone,
        password: password, // In production, this should be hashed
        createdAt: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    setCurrentUser(newUser);
    
    return {
        success: true,
        message: 'Đăng ký thành công!',
        user: newUser
    };
}

function login(phone, password) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.phone === phone && u.password === password);
    
    if (!user) {
        return {
            success: false,
            message: 'Số điện thoại hoặc mật khẩu không đúng!'
        };
    }
    
    // Login successful
    setCurrentUser(user);
    
    return {
        success: true,
        message: 'Đăng nhập thành công!',
        user: user
    };
}

// Show login modal
function showLoginModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        // Switch to specified tab
        switchAuthTab(tab);
    }
}

// Show dine-in modal
function showDineInModal() {
    showLoginModal('dine-in');
}

// Hide login modal
function hideLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Switch between login, register and dine-in tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const dineInForm = document.getElementById('dine-in-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const dineInTab = document.getElementById('dine-in-tab');
    
    // Hide all forms
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'none';
    if (dineInForm) dineInForm.style.display = 'none';
    
    // Remove active from all tabs
    if (loginTab) loginTab.classList.remove('active');
    if (registerTab) registerTab.classList.remove('active');
    if (dineInTab) dineInTab.classList.remove('active');
    
    // Show selected form and activate tab
    if (tab === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (loginTab) loginTab.classList.add('active');
    } else if (tab === 'register') {
        if (registerForm) registerForm.style.display = 'block';
        if (registerTab) registerTab.classList.add('active');
    } else if (tab === 'dine-in') {
        if (dineInForm) dineInForm.style.display = 'block';
        if (dineInTab) dineInTab.classList.add('active');
    }
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const phone = form.phone.value.trim();
    const password = form.password.value.trim();
    
    if (!phone || !password) {
        showAuthMessage('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    if (!/^[0-9]{10,11}$/.test(phone)) {
        showAuthMessage('Số điện thoại không hợp lệ!', 'error');
        return;
    }
    
    const result = login(phone, password);
    
    if (result.success) {
        showAuthMessage(result.message, 'success');
        setTimeout(() => {
            hideLoginModal();
            updateNavbarUser();
            // Reload page if on track-order or checkout
            if (window.location.hash === '#track-order' || window.location.pathname.includes('cart.html')) {
                location.reload();
            }
        }, 1000);
    } else {
        showAuthMessage(result.message, 'error');
    }
}

// Handle register
function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value.trim();
    const confirmPassword = form.confirmPassword.value.trim();
    
    // Combine first name and last name
    const username = `${lastName} ${firstName}`.trim();
    
    // Validation
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        showAuthMessage('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthMessage('Mật khẩu xác nhận không khớp!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAuthMessage('Mật khẩu phải có ít nhất 6 ký tự!', 'error');
        return;
    }
    
    if (!/^[0-9]{10,11}$/.test(phone)) {
        showAuthMessage('Số điện thoại không hợp lệ!', 'error');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthMessage('Email không hợp lệ!', 'error');
        return;
    }
    
    const result = register(username, email, phone, password);
    
    if (result.success) {
        showAuthMessage(result.message, 'success');
        setTimeout(() => {
            hideLoginModal();
            updateNavbarUser();
            // Reload page if on track-order or checkout
            if (window.location.hash === '#track-order' || window.location.pathname.includes('cart.html')) {
                location.reload();
            }
        }, 1000);
    } else {
        showAuthMessage(result.message, 'error');
    }
}

// Show auth message
function showAuthMessage(message, type) {
    const messageEl = document.getElementById('auth-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type} show`;
        
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 5000);
    }
}

// Handle dine-in order
function handleDineIn(event) {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const table = form.table.value.trim();
    
    if (!name || !phone) {
        showAuthMessage('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    if (!/^[0-9]{10,11}$/.test(phone)) {
        showAuthMessage('Số điện thoại không hợp lệ!', 'error');
        return;
    }
    
    // Save dine-in session info
    const dineInInfo = {
        name: name,
        phone: phone,
        table: table || null,
        type: 'dine-in',
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('dineInSession', JSON.stringify(dineInInfo));
    
    showAuthMessage('Thông tin đã được lưu! Bạn có thể đặt món ngay.', 'success');
    
    setTimeout(() => {
        hideLoginModal();
        // Redirect to menu page
        if (window.location.pathname.includes('menu.html')) {
            location.reload();
        } else {
            window.location.href = 'menu.html';
        }
    }, 1000);
}

// Check if user is logged in or has dine-in session
function isAuthenticated() {
    return isLoggedIn() || localStorage.getItem('dineInSession') !== null;
}

// Get current session (user or dine-in)
function getCurrentSession() {
    if (isLoggedIn()) {
        return {
            type: 'user',
            data: getCurrentUser()
        };
    }
    
    const dineInSession = localStorage.getItem('dineInSession');
    if (dineInSession) {
        return {
            type: 'dine-in',
            data: JSON.parse(dineInSession)
        };
    }
    
    return null;
}

// Check login before action
function requireLogin(callback) {
    if (isLoggedIn()) {
        if (callback) callback();
    } else {
        showLoginModal();
    }
}

// Check authentication (login or dine-in) before action
function requireAuth(callback) {
    if (isAuthenticated()) {
        if (callback) callback();
    } else {
        // Show modal with option to login or dine-in
        showLoginModal();
    }
}

// Update navbar user display
function updateNavbarUser() {
    const userIcon = document.querySelector('.nav-icon.user-icon');
    const user = getCurrentUser();
    const session = getCurrentSession ? getCurrentSession() : null;
    
    if (userIcon) {
        if (user) {
            // Show user name or email
            const username = user.username || user.email.split('@')[0];
            userIcon.setAttribute('title', `Xin chào, ${username}`);
            // Add logged-in class
            userIcon.classList.add('logged-in');
            // Show user menu on click
            userIcon.onclick = function(e) {
                e.preventDefault();
                toggleUserMenu();
            };
        } else if (session && session.type === 'dine-in') {
            // Show dine-in session info
            userIcon.setAttribute('title', `Ăn tại nhà hàng - Bàn ${session.data.table || 'N/A'}`);
            userIcon.classList.add('dine-in-active');
            // Show user menu on click
            userIcon.onclick = function(e) {
                e.preventDefault();
                toggleUserMenu();
            };
        } else {
            userIcon.classList.remove('logged-in', 'dine-in-active');
            userIcon.setAttribute('title', 'Tài khoản');
            userIcon.onclick = function(e) {
                e.preventDefault();
                if (typeof requireLogin === 'function') {
                    requireLogin(function() {});
                } else if (typeof showLoginModal === 'function') {
                    showLoginModal();
                }
            };
        }
    }
}

// Toggle user menu
function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    if (menu) {
        if (menu.style.display === 'flex') {
            hideUserMenu();
        } else {
            showUserMenu();
        }
    } else {
        createUserMenu();
        showUserMenu();
    }
}

// Show user menu
function showUserMenu() {
    const menu = document.getElementById('user-menu');
    if (menu) {
        menu.style.display = 'flex';
        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);
    }
}

// Hide user menu
function hideUserMenu() {
    const menu = document.getElementById('user-menu');
    if (menu) {
        menu.style.display = 'none';
    }
    document.removeEventListener('click', handleClickOutside);
}

// Handle click outside menu
function handleClickOutside(event) {
    const menu = document.getElementById('user-menu');
    const userIcon = document.querySelector('.nav-icon.user-icon');
    
    if (menu && userIcon) {
        if (!menu.contains(event.target) && !userIcon.contains(event.target)) {
            hideUserMenu();
        }
    }
}

// Create user menu
function createUserMenu() {
    if (document.getElementById('user-menu')) return;
    
    const user = getCurrentUser();
    const session = getCurrentSession ? getCurrentSession() : null;
    
    let menuHTML = '<div class="user-menu" id="user-menu">';
    
    if (user) {
        const username = user.username || user.email.split('@')[0];
        menuHTML += `
            <div class="user-menu-header">
                <div class="user-avatar">
                    <i class="ri-user-fill"></i>
                </div>
                <div class="user-info">
                    <div class="user-name">${username}</div>
                    <div class="user-email">${user.email || ''}</div>
                </div>
            </div>
            <div class="user-menu-divider"></div>
            <a href="track-order.html" class="user-menu-item" onclick="hideUserMenu()">
                <i class="ri-file-list-3-line"></i>
                <span>Theo Dõi Đơn Hàng</span>
            </a>
            <div class="user-menu-divider"></div>
            <button class="user-menu-item logout-btn" onclick="logout()">
                <i class="ri-logout-box-line"></i>
                <span>Đăng Xuất</span>
            </button>
        `;
    } else if (session && session.type === 'dine-in') {
        menuHTML += `
            <div class="user-menu-header">
                <div class="user-avatar dine-in-avatar">
                    <i class="ri-restaurant-fill"></i>
                </div>
                <div class="user-info">
                    <div class="user-name">${session.data.name}</div>
                    <div class="user-email">Bàn số ${session.data.table || 'N/A'}</div>
                </div>
            </div>
            <div class="user-menu-divider"></div>
            <button class="user-menu-item logout-btn" onclick="clearDineInSession()">
                <i class="ri-close-circle-line"></i>
                <span>Hủy Phiên Đặt Món</span>
            </button>
        `;
    }
    
    menuHTML += '</div>';
    
    // Insert after navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.insertAdjacentHTML('afterend', menuHTML);
    }
}

// Clear dine-in session
function clearDineInSession() {
    if (confirm('Bạn có chắc muốn hủy phiên đặt món tại nhà hàng?')) {
        localStorage.removeItem('dineInSession');
        hideUserMenu();
        updateNavbarUser();
        if (typeof showNotification === 'function') {
            showNotification('Đã hủy phiên đặt món!');
        }
        location.reload();
    }
}

// Initialize auth modal
function initAuthModal() {
    // Create modal HTML if not exists
    if (!document.getElementById('auth-modal')) {
        const modalHTML = `
            <div class="auth-modal" id="auth-modal">
                <div class="auth-modal-overlay" onclick="hideLoginModal()"></div>
                <div class="auth-modal-content">
                    <button class="auth-modal-close" onclick="hideLoginModal()">
                        <i class="ri-close-line"></i>
                    </button>
                    
                    <div class="auth-modal-layout">
                        <!-- Left Side: Image -->
                        <div class="auth-modal-image">
                            <img src="assets/img/loginlogout.png" alt="Food Illustration" class="auth-image">
                        </div>
                        
                        <!-- Right Side: Forms -->
                        <div class="auth-modal-forms">
                            <div class="auth-tabs">
                                <button class="auth-tab active" id="login-tab" onclick="switchAuthTab('login')">Đăng Nhập</button>
                                <button class="auth-tab" id="register-tab" onclick="switchAuthTab('register')">Tạo Tài Khoản</button>
                                <button class="auth-tab" id="dine-in-tab" onclick="switchAuthTab('dine-in')">Ăn Tại Nhà Hàng</button>
                            </div>
                            
                            <div id="auth-message" class="auth-message"></div>
                            
                            <!-- Login Form -->
                            <form id="login-form" class="auth-form" onsubmit="handleLogin(event)">
                                <div class="form-group">
                                    <label for="login-phone">Số Điện Thoại</label>
                                    <input type="tel" id="login-phone" name="phone" placeholder="Nhập Số Điện Thoại" required>
                                </div>
                                <div class="form-group">
                                    <label for="login-password">Mật Khẩu</label>
                                    <input type="password" id="login-password" name="password" placeholder="Nhập Mật Khẩu" required>
                                    <div class="form-footer-link">
                                        <a href="#" class="forgot-password-link">Quên Mật Khẩu?</a>
                                    </div>
                                </div>
                                <button type="submit" class="btn btn-primary auth-submit-btn">Đăng Nhập</button>
                            </form>
                            
                            <!-- Register Form -->
                            <form id="register-form" class="auth-form" style="display: none;" onsubmit="handleRegister(event)">
                                <div class="form-group">
                                    <label for="register-phone">Số Điện Thoại</label>
                                    <input type="tel" id="register-phone" name="phone" placeholder="Nhập Số Điện Thoại Của Bạn" required>
                                </div>
                                <div class="form-group">
                                    <label for="register-lastname">Họ</label>
                                    <input type="text" id="register-lastname" name="lastName" placeholder="Nhập Họ Của Bạn" required>
                                </div>
                                <div class="form-group">
                                    <label for="register-firstname">Tên</label>
                                    <input type="text" id="register-firstname" name="firstName" placeholder="Nhập Tên Của Bạn" required>
                                </div>
                                <div class="form-group">
                                    <label for="register-email">Email</label>
                                    <input type="email" id="register-email" name="email" placeholder="Nhập Email Của Bạn" required>
                                    <p class="email-hint">Vui Lòng Nhập Email Đang Sử Dụng Để Nhận Thông Tin Điểm Thưởng Và Chương Trình Thành Viên Từ CAFRROTSFUD</p>
                                </div>
                                <div class="form-group">
                                    <label for="register-password">Mật Khẩu</label>
                                    <input type="password" id="register-password" name="password" placeholder="Nhập Mật Khẩu Của Bạn" required minlength="6">
                                </div>
                                <div class="form-group">
                                    <label for="register-confirm-password">Xác Nhận Mật Khẩu</label>
                                    <input type="password" id="register-confirm-password" name="confirmPassword" placeholder="Xác Nhận Mật Khẩu Của Bạn" required>
                                </div>
                                <button type="submit" class="btn btn-primary auth-submit-btn">Tạo Tài Khoản</button>
                            </form>
                            
                            <!-- Dine In Form -->
                            <form id="dine-in-form" class="auth-form" style="display: none;" onsubmit="handleDineIn(event)">
                                <div class="dine-in-info">
                                    <i class="ri-restaurant-line"></i>
                                    <p>Đặt món tại nhà hàng - Không cần đăng ký!</p>
                                </div>
                                <div class="form-group">
                                    <label for="dine-in-name">Họ và Tên</label>
                                    <input type="text" id="dine-in-name" name="name" placeholder="Nhập họ và tên của bạn" required>
                                </div>
                                <div class="form-group">
                                    <label for="dine-in-phone">Số Điện Thoại</label>
                                    <input type="tel" id="dine-in-phone" name="phone" placeholder="Nhập số điện thoại" required>
                                </div>
                                <div class="form-group">
                                    <label for="dine-in-table">Số Bàn (Tùy chọn)</label>
                                    <input type="text" id="dine-in-table" name="table" placeholder="Nhập số bàn nếu có">
                                </div>
                                <button type="submit" class="btn btn-primary auth-submit-btn">Tiếp Tục Đặt Món</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initAuthModal();
    
    // Wait for navbar to be injected
    setTimeout(() => {
        updateNavbarUser();
    }, 100);
});


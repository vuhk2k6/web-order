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
    updateNavbarUser();
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
function showLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        // Switch to login tab
        switchAuthTab('login');
    }
}

// Hide login modal
function hideLoginModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Switch between login and register tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    
    if (tab === 'login') {
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (loginTab) loginTab.classList.add('active');
        if (registerTab) registerTab.classList.remove('active');
    } else {
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (loginTab) loginTab.classList.remove('active');
        if (registerTab) registerTab.classList.add('active');
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

// Check login before action
function requireLogin(callback) {
    if (isLoggedIn()) {
        if (callback) callback();
    } else {
        showLoginModal();
    }
}

// Update navbar user display
function updateNavbarUser() {
    const userIcon = document.querySelector('.nav-icon.user-icon');
    const user = getCurrentUser();
    
    if (userIcon) {
        if (user) {
            // Show user name or email
            const username = user.username || user.email.split('@')[0];
            userIcon.setAttribute('title', `Xin chào, ${username}`);
            // Add logged-in class
            userIcon.classList.add('logged-in');
        } else {
            userIcon.classList.remove('logged-in');
            userIcon.setAttribute('title', 'Tài khoản');
        }
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
    updateNavbarUser();
    
    // Check for logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
            location.reload();
        });
    }
});


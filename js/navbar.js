/**
 * Create and inject navbar into the page
 */
function createNavbar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    const navbarHTML = `
        <nav class="navbar">
            <div class="container">
                <div class="nav-brand">
                    <a href="index.html" class="logo-link">
                        <img src="assets/img/Logo.png" alt="CAFRROTSFUD Logo" class="logo-img">
                        <span class="logo-text">CAFRROTSFUD</span>
                    </a>
                </div>
                <ul class="nav-menu">
                    <li><a href="evoucher.html" data-page="evoucher.html">MÃ E-VOUCHER</a></li>
                    <li><a href="promotions.html" data-page="promotions.html">KHUYẾN MÃI</a></li>
                    <li><a href="menu.html" data-page="menu.html">THỰC ĐƠN</a></li>
                    <li><a href="track-order.html" data-page="track-order.html" id="track-order-link">THEO DÕI ĐƠN HÀNG</a></li>
                    <li><a href="#blog">BLOG</a></li>
                </ul>
                <div class="nav-utilities">
                    <div class="language-selector">
                        <div class="flag-icon fi-vn" title="Tiếng Việt"></div>
                        <div class="flag-icon fi-gb" title="English"></div>
                    </div>
                    <div class="nav-icon user-icon" id="user-icon" title="Tài khoản">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <a href="cart.html" class="cart-icon-wrapper">
                        <div class="nav-icon" title="Giỏ hàng">
                           <i class="ri-takeaway-line"></i>
                        </div>
                        <span class="cart-icon-badge" id="cart-badge">0</span>
                    </a>
                </div>
            </div>
        </nav>
    `;
    
    // Insert navbar at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    
    // Set active link
    setActiveNavLink();
    
    // Update cart count if function exists
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    // Add event listener for track order link - require login
    setTimeout(() => {
        const trackOrderLink = document.getElementById('track-order-link');
        if (trackOrderLink) {
            trackOrderLink.addEventListener('click', function(e) {
                if (typeof requireLogin === 'function') {
                    if (!isLoggedIn()) {
                        e.preventDefault();
                        requireLogin(function() {
                            // After login, redirect to track order page
                            window.location.href = 'track-order.html';
                        });
                    }
                } else if (typeof showLoginModal === 'function' && typeof isLoggedIn === 'function') {
                    if (!isLoggedIn()) {
                        e.preventDefault();
                        showLoginModal();
                    }
                }
            });
        }
        
        // User icon click will be handled by updateNavbarUser in auth.js
        // This ensures it works for both logged-in users and dine-in sessions
    }, 100);
}

/**
 * Set active navigation link based on current page
 */
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a[data-page]');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const page = link.getAttribute('data-page');
        
        if (page === currentPage || 
            (currentPage === '' && page === 'index.html') ||
            (currentPage === 'index.html' && page === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Create navbar immediately (before page render if possible)
(function() {
    if (document.body) {
        createNavbar();
    } else {
        // If body not ready, wait for it
        document.addEventListener('DOMContentLoaded', createNavbar);
    }
})();

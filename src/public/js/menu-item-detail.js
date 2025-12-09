/* eslint-disable no-console */
const getElement = (id) => document.getElementById(id);

// Get menu item ID from URL
const getMenuItemIdFromUrl = () => {
  const pathParts = window.location.pathname.split('/');
  const menuIndex = pathParts.indexOf('menu');
  if (menuIndex !== -1 && pathParts[menuIndex + 1]) {
    return pathParts[menuIndex + 1];
  }
  return null;
};

// Format currency VND - use global function from main.js
const getFormatCurrencyVnd = () => {
  if (window.formatCurrencyVnd) {
    return window.formatCurrencyVnd;
  }
  // Fallback if main.js hasn't loaded yet
  return (value) => {
    if (!value) return '';
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return value;
    return `${numberValue.toLocaleString('vi-VN')} đ`;
  };
};

// Fetch menu item detail
const fetchMenuItemDetail = async (itemId) => {
  try {
    console.log('[Menu Item Detail] Fetching item:', itemId);
    const response = await fetch(`/api/menu/${itemId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('NOT_FOUND');
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const item = await response.json();
    console.log('[Menu Item Detail] Received item:', item);
    return item;
  } catch (error) {
    console.error('[Menu Item Detail] Error fetching item:', error);
    throw error;
  }
};

// Render menu item detail
const renderMenuItemDetail = (item) => {
  const loadingEl = getElement('menu-item-detail-loading');
  const errorEl = getElement('menu-item-detail-error');
  const contentEl = getElement('menu-item-detail-content');
  
  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'none';
  if (contentEl) contentEl.style.display = 'block';
  
  // Set image
  const imageEl = getElement('menu-item-detail-image');
  if (imageEl) {
    imageEl.src = item.image || '';
    imageEl.alt = item.name || 'Ảnh món ăn';
  }
  
  // Set title
  const titleEl = getElement('menu-item-detail-title');
  if (titleEl) {
    titleEl.textContent = item.name || 'Món ăn';
    document.title = `${item.name || 'Món ăn'} - Nhà hàng`;
  }
  
  // Set price
  const basePrice = item.price || 0;
  const sizeOptions = item.sizeOptions || [];
  let selectedSize = 'Mặc định';
  let selectedPrice = basePrice;
  
  if (sizeOptions.length > 0) {
    selectedSize = sizeOptions[0]?.name || 'Mặc định';
    selectedPrice = basePrice + (sizeOptions[0]?.additionalPrice || 0);
  }
  
  const formatCurrencyVnd = getFormatCurrencyVnd();
  
  const priceEl = getElement('menu-item-detail-price');
  if (priceEl) {
    priceEl.textContent = formatCurrencyVnd(selectedPrice);
  }
  
  const priceOldEl = getElement('menu-item-detail-price-old');
  if (priceOldEl && item.originalPrice && item.originalPrice > basePrice) {
    priceOldEl.textContent = formatCurrencyVnd(item.originalPrice);
    priceOldEl.style.display = 'inline';
  } else if (priceOldEl) {
    priceOldEl.style.display = 'none';
  }
  
  // Set description
  const descEl = getElement('menu-item-detail-description');
  if (descEl) {
    descEl.textContent = item.description || 'Món ăn đặc biệt của nhà hàng.';
  }
  
  // Set category
  if (item.category && item.category.name) {
    const categoryEl = getElement('menu-item-detail-category');
    const categoryValueEl = getElement('menu-item-detail-category-value');
    if (categoryEl) categoryEl.style.display = 'flex';
    if (categoryValueEl) categoryValueEl.textContent = item.category.name;
  }
  
  // Set ingredients
  if (item.ingredients || item.ingredientsList) {
    const ingredientsEl = getElement('menu-item-detail-ingredients');
    const ingredientsValueEl = getElement('menu-item-detail-ingredients-value');
    if (ingredientsEl) ingredientsEl.style.display = 'flex';
    if (ingredientsValueEl) {
      ingredientsValueEl.textContent = item.ingredients || item.ingredientsList || 'Đang cập nhật';
    }
  }
  
  // Set calories
  if (item.calories) {
    const caloriesEl = getElement('menu-item-detail-calories');
    const caloriesValueEl = getElement('menu-item-detail-calories-value');
    if (caloriesEl) caloriesEl.style.display = 'flex';
    if (caloriesValueEl) caloriesValueEl.textContent = `${item.calories} kcal`;
  }
  
  // Render size options
  const sizeSectionEl = getElement('menu-item-detail-size-section');
  const sizeOptionsEl = getElement('menu-item-detail-size-options');
  
  if (sizeOptions.length > 0 && sizeSectionEl && sizeOptionsEl) {
    sizeSectionEl.style.display = 'block';
    sizeOptionsEl.innerHTML = '';
    
    sizeOptions.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'menu-size-option';
      if (opt.name === selectedSize) {
        btn.classList.add('active');
      }
      btn.textContent = opt.name;
      btn.setAttribute('data-size', opt.name);
      btn.setAttribute('data-additional-price', opt.additionalPrice || 0);
      
      btn.addEventListener('click', () => {
        selectedSize = opt.name;
        selectedPrice = basePrice + (opt.additionalPrice || 0);
        
        // Update active state
        sizeOptionsEl.querySelectorAll('.menu-size-option').forEach((b) => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        
        // Update price display
        const formatCurrencyVnd = getFormatCurrencyVnd();
        if (priceEl) {
          priceEl.textContent = formatCurrencyVnd(selectedPrice);
        }
      });
      
      sizeOptionsEl.appendChild(btn);
    });
  } else if (sizeSectionEl) {
    sizeSectionEl.style.display = 'none';
  }
  
  // Setup add to cart button
  const addButton = getElement('menu-item-detail-add-button');
  if (addButton) {
    const handleAddToCart = async (e) => {
      e.preventDefault();
      
      if (addButton.disabled) return;
      
      // Wait for cart to be available
      let cartReady = false;
      let attempts = 0;
      const maxAttempts = 20;
      
      while (!cartReady && attempts < maxAttempts) {
        if (window.appCart && typeof window.appCart.addItem === 'function') {
          cartReady = true;
        } else {
          await new Promise((resolve) => window.setTimeout(resolve, 50));
          attempts++;
        }
      }
      
      if (!cartReady) {
        console.error('Cart không khả dụng');
        alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
        return;
      }
      
      const originalText = addButton.textContent;
      addButton.disabled = true;
      addButton.textContent = 'Đang thêm...';
      
      try {
        const success = window.appCart.addItem({
          id: item._id || item.id,
          name: item.name,
          price: selectedPrice,
          basePrice: basePrice,
          image: item.image,
          quantity: 1,
          size: selectedSize
        });
        
        if (success) {
          addButton.textContent = 'Đã thêm ✓';
          window.setTimeout(() => {
            addButton.disabled = false;
            addButton.textContent = originalText;
          }, 1500);
        } else {
          addButton.textContent = 'Lỗi';
          window.setTimeout(() => {
            addButton.disabled = false;
            addButton.textContent = originalText;
          }, 1500);
        }
      } catch (error) {
        console.error('Lỗi khi thêm vào giỏ hàng:', error);
        addButton.disabled = false;
        addButton.textContent = originalText;
        alert('Có lỗi xảy ra khi thêm vào giỏ hàng. Vui lòng thử lại.');
      }
    };
    
    addButton.addEventListener('click', handleAddToCart);
  }
};

// Show error state
const showError = () => {
  const loadingEl = getElement('menu-item-detail-loading');
  const errorEl = getElement('menu-item-detail-error');
  const contentEl = getElement('menu-item-detail-content');
  
  if (loadingEl) loadingEl.style.display = 'none';
  if (errorEl) errorEl.style.display = 'flex';
  if (contentEl) contentEl.style.display = 'none';
};

// Initialize page
const initializeMenuItemDetailPage = async () => {
  // Check if header is already rendered
  const container = document.getElementById('shared-header');
  const headerExists = container && container.children.length > 0;
  
  // Only render header if not already rendered
  if (!headerExists && typeof window.renderSharedHeader === 'function') {
    let authButtonText = 'Đăng nhập';
    
    if (typeof window.fetchCurrentUser === 'function') {
      const user = await window.fetchCurrentUser();
      if (user) {
        const initial = user.name ? user.name.trim().charAt(0).toUpperCase() : 'U';
        authButtonText = initial;
      }
    }
    
    window.renderSharedHeader({
      logoSubtext: 'Chi tiết món ăn',
      activeNavLink: 'menu',
      showAuthButton: true,
      authButtonText: authButtonText,
      authButtonId: 'auth-open-button',
      onAuthClick: () => {
        if (window.authState && window.authState.currentUser) {
          window.location.href = '/profile';
        } else {
          if (typeof window.switchAuthTab === 'function' && typeof window.openAuthModal === 'function') {
            window.switchAuthTab('login');
            window.openAuthModal();
          } else {
            window.location.href = '/';
          }
        }
      }
    });
    
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }
  
  // Wait for cart and auth to be initialized
  await new Promise((resolve) => window.setTimeout(resolve, 100));
  
  // Ensure cart is initialized
  if (typeof window.appCart !== 'undefined' && window.appCart) {
    window.appCart.updateBadge();
    const dropdown = document.getElementById('cart-dropdown');
    if (!dropdown || !dropdown.querySelector('.cart-dropdown-panel')) {
      window.appCart.renderDropdown();
    }
  }

  // Initialize auth modal - wait a bit for auth.js to load
  const initAuthModal = () => {
    if (typeof window.initializeAuthModal === 'function') {
      window.initializeAuthModal();
    } else if (typeof window.initializeAuth === 'function') {
      window.initializeAuth();
    }
  };
  
  // Try to initialize auth modal with retries
  let authInitAttempts = 0;
  const maxAuthInitAttempts = 10;
  const tryInitAuth = () => {
    if (typeof window.initializeAuthModal === 'function' || typeof window.initializeAuth === 'function') {
      initAuthModal();
    } else if (authInitAttempts < maxAuthInitAttempts) {
      authInitAttempts++;
      window.setTimeout(tryInitAuth, 100);
    }
  };
  tryInitAuth();

  // Setup review login link
  const reviewLoginLink = getElement('review-login-link');
  if (reviewLoginLink) {
    reviewLoginLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Wait a bit for auth functions to be available
      const openAuth = () => {
        if (typeof window.switchAuthTab === 'function' && typeof window.openAuthModal === 'function') {
          window.switchAuthTab('login');
          window.openAuthModal();
        } else if (typeof window.openAuthModal === 'function') {
          window.openAuthModal();
        } else {
          // Fallback: redirect to home
          window.location.href = '/';
        }
      };
      
      // Try immediately, then retry if needed
      if (typeof window.openAuthModal === 'function' || typeof window.switchAuthTab === 'function') {
        openAuth();
      } else {
        let attempts = 0;
        const maxAttempts = 10;
        const retry = () => {
          if (typeof window.openAuthModal === 'function' || typeof window.switchAuthTab === 'function') {
            openAuth();
          } else if (attempts < maxAttempts) {
            attempts++;
            window.setTimeout(retry, 100);
          } else {
            window.location.href = '/';
          }
        };
        retry();
      }
    });
  }
  
  // Get menu item ID from URL
  const itemId = getMenuItemIdFromUrl();
  
  if (!itemId) {
    console.error('[Menu Item Detail] No item ID found in URL');
    showError();
    return;
  }
  
  // Show loading
  const loadingEl = getElement('menu-item-detail-loading');
  if (loadingEl) loadingEl.style.display = 'flex';
  
  try {
    const item = await fetchMenuItemDetail(itemId);
    renderMenuItemDetail(item);
    await loadReviews(itemId);
  } catch (error) {
    console.error('[Menu Item Detail] Error:', error);
    showError();
  }
};

// Reviews functionality
let currentReviewRating = 0;

// Load reviews
const loadReviews = async (itemId) => {
  try {
    const response = await fetch(`/api/menu/${itemId}/reviews`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    renderReviews(data);
    setupReviewForm(itemId);
  } catch (error) {
    console.error('[Menu Item Detail] Error loading reviews:', error);
    const reviewsSection = getElement('menu-item-reviews-section');
    if (reviewsSection) {
      reviewsSection.style.display = 'none';
    }
  }
};

// Render reviews
const renderReviews = (data) => {
  const reviewsSection = getElement('menu-item-reviews-section');
  if (!reviewsSection) return;

  reviewsSection.style.display = 'block';

  // Update summary
  const avgRatingEl = getElement('reviews-average-rating-value');
  const totalCountEl = getElement('reviews-total-count');
  const starsDisplayEl = getElement('reviews-stars-display');

  if (avgRatingEl) {
    avgRatingEl.textContent = data.averageRating || '0';
  }

  if (totalCountEl) {
    totalCountEl.textContent = data.totalReviews || '0';
  }

  if (starsDisplayEl) {
    const rating = parseFloat(data.averageRating || 0);
    starsDisplayEl.innerHTML = renderStars(rating, true);
  }

  // Render reviews list
  const reviewsListEl = getElement('reviews-list');
  const reviewsEmptyEl = getElement('reviews-empty');

  if (data.reviews && data.reviews.length > 0) {
    if (reviewsListEl) {
      reviewsListEl.innerHTML = data.reviews.map(review => `
        <div class="review-item">
          <div class="review-item-header">
            <div class="review-item-customer">
              <div class="review-item-avatar">
                ${review.customer.name.charAt(0).toUpperCase()}
              </div>
              <div class="review-item-info">
                <div class="review-item-name">${review.customer.name || 'Khách hàng'}</div>
                <div class="review-item-date">${formatDate(review.createdAt)}</div>
              </div>
            </div>
            <div class="review-item-rating">
              ${renderStars(review.rating, false)}
            </div>
          </div>
          ${review.content ? `<div class="review-item-content">${escapeHtml(review.content)}</div>` : ''}
        </div>
      `).join('');
    }
    if (reviewsEmptyEl) {
      reviewsEmptyEl.style.display = 'none';
    }
  } else {
    if (reviewsListEl) {
      reviewsListEl.innerHTML = '';
    }
    if (reviewsEmptyEl) {
      reviewsEmptyEl.style.display = 'block';
    }
  }
};

// Render stars
const renderStars = (rating, isAverage = false) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let starsHtml = '';
  for (let i = 0; i < fullStars; i++) {
    starsHtml += '<span class="star filled">★</span>';
  }
  if (hasHalfStar) {
    starsHtml += '<span class="star half">★</span>';
  }
  for (let i = 0; i < emptyStars; i++) {
    starsHtml += '<span class="star empty">★</span>';
  }

  return starsHtml;
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Hôm nay';
  } else if (diffDays === 1) {
    return 'Hôm qua';
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} tuần trước`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} tháng trước`;
  } else {
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  }
};

// Escape HTML
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Setup review form
const setupReviewForm = async (itemId) => {
  // Check if user is logged in
  let isLoggedIn = false;
  if (typeof window.fetchCurrentUser === 'function') {
    try {
      const user = await window.fetchCurrentUser();
      isLoggedIn = !!user;
    } catch (error) {
      console.error('[Menu Item Detail] Error checking auth:', error);
    }
  }

  const addReviewFormContainer = getElement('add-review-form-container');
  const reviewLoginPrompt = getElement('review-login-prompt');

  if (isLoggedIn) {
    if (addReviewFormContainer) {
      addReviewFormContainer.style.display = 'block';
    }
    if (reviewLoginPrompt) {
      reviewLoginPrompt.style.display = 'none';
    }

    // Setup star buttons
    const starButtons = document.querySelectorAll('.star-btn');
    starButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        const rating = index + 1;
        currentReviewRating = rating;
        updateStarButtons(starButtons, rating);
        updateRatingText(rating);
      });
    });

    // Setup form submit
    const reviewForm = getElement('add-review-form');
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitReview(itemId);
      });
    }
  } else {
    if (addReviewFormContainer) {
      addReviewFormContainer.style.display = 'none';
    }
    if (reviewLoginPrompt) {
      reviewLoginPrompt.style.display = 'block';
    }
  }
};

// Update star buttons
const updateStarButtons = (buttons, rating) => {
  buttons.forEach((btn, index) => {
    const btnRating = index + 1;
    if (btnRating <= rating) {
      btn.classList.add('active');
      btn.querySelector('svg').setAttribute('fill', 'currentColor');
    } else {
      btn.classList.remove('active');
      btn.querySelector('svg').setAttribute('fill', 'none');
    }
  });
};

// Update rating text
const updateRatingText = (rating) => {
  const ratingTextEl = getElement('selected-rating-text');
  if (ratingTextEl) {
    const texts = {
      1: 'Rất không hài lòng',
      2: 'Không hài lòng',
      3: 'Bình thường',
      4: 'Hài lòng',
      5: 'Rất hài lòng'
    };
    ratingTextEl.textContent = texts[rating] || '';
  }
};

// Submit review
const submitReview = async (itemId) => {
  const contentInput = getElement('review-content-input');
  const submitButton = document.querySelector('.add-review-submit');

  if (!currentReviewRating) {
    alert('Vui lòng chọn số sao đánh giá');
    return;
  }

  const content = contentInput ? contentInput.value.trim() : '';

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Đang gửi...';
  }

  try {
    console.log('[Menu Item Detail] Submitting review:', {
      itemId,
      rating: currentReviewRating,
      hasContent: !!content
    });
    
    const response = await fetch(`/api/menu/${itemId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Ensure cookies are sent
      body: JSON.stringify({
        rating: currentReviewRating,
        content: content
      })
    });
    
    console.log('[Menu Item Detail] Review submission response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Không thể gửi đánh giá');
    }

    const result = await response.json();
    
    // Reload reviews
    await loadReviews(itemId);

    // Reset form
    currentReviewRating = 0;
    const starButtons = document.querySelectorAll('.star-btn');
    updateStarButtons(starButtons, 0);
    updateRatingText(0);
    if (contentInput) {
      contentInput.value = '';
    }

    alert(result.message || 'Đánh giá thành công!');
  } catch (error) {
    console.error('[Menu Item Detail] Error submitting review:', error);
    alert(error.message || 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Gửi đánh giá';
    }
  }
};

// Set footer year
const setFooterYear = () => {
  const footerYearEl = document.getElementById('footer-year');
  if (footerYearEl) {
    footerYearEl.textContent = new Date().getFullYear();
  }
};

// Start page initialization
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setFooterYear();
    initializeMenuItemDetailPage();
  });
} else {
  setFooterYear();
  initializeMenuItemDetailPage();
}



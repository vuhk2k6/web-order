// Promotions data
const promotionsData = [
    {
        id: 1,
        featured: true,
        tag: 'Khuyến Mãi Hot',
        title: 'Combo Gia Đình Tuyệt Vời',
        description: 'Ưu đãi đặc biệt cho gia đình! Đặt combo 4-5 người và nhận ngay giảm 30% + tặng 2 món tráng miệng miễn phí.',
        features: [
            'Giảm 30% cho đơn hàng từ 500,000₫',
            'Tặng 2 món tráng miệng miễn phí',
            'Áp dụng từ thứ 2 - thứ 6',
            'Không áp dụng với voucher khác'
        ],
        originalPrice: '700,000₫',
        discountPrice: '490,000₫',
        discount: '30%',
        emoji: '👨‍👩‍👧‍👦',
        badge: 'HOT',
        expiry: '31/01/2025',
        link: 'menu.html'
    },
    {
        id: 2,
        featured: false,
        tag: 'Giảm Giá',
        title: 'Pizza Mua 2 Tặng 1',
        description: 'Mua 2 pizza bất kỳ, tặng 1 pizza size M. Chỉ áp dụng cho pizza tại cửa hàng và đặt hàng online.',
        features: [
            'Áp dụng cho tất cả pizza',
            'Pizza tặng size M',
            'Pizza có giá thấp nhất được miễn phí',
            'Không áp dụng với combo khác'
        ],
        originalPrice: '440,000₫',
        discountPrice: '220,000₫',
        discount: '50%',
        emoji: '🍕',
        badge: '50%',
        expiry: '28/02/2025',
        link: 'menu.html'
    },
    {
        id: 3,
        featured: false,
        tag: 'Mới',
        title: 'Buffet Trưa Chỉ 199K',
        description: 'Thưởng thức buffet trưa phong phú với hơn 50 món ăn khác nhau. Chỉ 199,000₫/người cho bữa trưa từ 11:30 - 14:00.',
        features: [
            'Hơn 50 món ăn đa dạng',
            'Thời gian: 11:30 - 14:00',
            'Trẻ em dưới 1m miễn phí',
            'Đặt bàn trước để đảm bảo chỗ'
        ],
        originalPrice: '350,000₫',
        discountPrice: '199,000₫',
        discount: '43%',
        emoji: '🍽️',
        badge: 'NEW',
        expiry: '31/03/2025',
        link: '#'
    },
    {
        id: 4,
        featured: false,
        tag: 'Đặc Biệt',
        title: 'Sinh Nhật Miễn Phí',
        description: 'Nhân dịp sinh nhật, bạn sẽ nhận được bánh sinh nhật miễn phí + giảm 20% cho đơn hàng của mình.',
        features: [
            'Bánh sinh nhật miễn phí',
            'Giảm 20% tổng hóa đơn',
            'Áp dụng trong tháng sinh nhật',
            'Cần xuất trình CMND/CCCD'
        ],
        originalPrice: '-',
        discountPrice: 'MIỄN PHÍ',
        discount: 'FREE',
        emoji: '🎂',
        badge: 'SINH NHẬT',
        expiry: '31/12/2025',
        link: '#'
    },
    {
        id: 5,
        featured: false,
        tag: 'Ưu Đãi',
        title: 'Đặt Bàn Online Giảm 15%',
        description: 'Đặt bàn trước qua website hoặc hotline, nhận ngay giảm 15% cho đơn hàng đầu tiên. Không cần mã voucher!',
        features: [
            'Giảm 15% tự động khi đặt bàn',
            'Áp dụng cho tất cả món ăn',
            'Không giới hạn số lượng',
            'Áp dụng cả ngày trong tuần'
        ],
        originalPrice: '-',
        discountPrice: '15%',
        discount: '15%',
        emoji: '📱',
        badge: 'ONLINE',
        expiry: '31/12/2025',
        link: '#'
    },
    {
        id: 6,
        featured: false,
        tag: 'Combo',
        title: 'Combo Bạn Bè 299K',
        description: 'Combo dành cho nhóm 2-3 người: 2 món chính + 2 món phụ + 2 đồ uống. Giá chỉ 299,000₫ (tiết kiệm 150,000₫).',
        features: [
            '2 món chính tự chọn',
            '2 món phụ/khai vị',
            '2 đồ uống bất kỳ',
            'Áp dụng từ thứ 2 - chủ nhật'
        ],
        originalPrice: '449,000₫',
        discountPrice: '299,000₫',
        discount: '33%',
        emoji: '👥',
        badge: 'COMBO',
        expiry: '31/01/2025',
        link: 'menu.html'
    }
];

function createPromoCard(promo, featured = false) {
    const cardClass = featured ? 'promo-card featured' : 'promo-card small';
    
    const featuresHTML = promo.features.map(feature => 
        `<li>${feature}</li>`
    ).join('');

    const priceHTML = promo.originalPrice !== '-' 
        ? `<div class="promo-price">${promo.discountPrice}</div>
           <div class="promo-original-price">${promo.originalPrice}</div>`
        : `<div class="promo-price">${promo.discountPrice}</div>`;

    return `
        <div class="${cardClass}">
            ${promo.badge ? `<div class="promo-badge">${promo.badge}</div>` : ''}
            <div class="promo-card-body">
                <div class="promo-content">
                    <span class="promo-tag">${promo.tag}</span>
                    <h2 class="promo-title">${promo.title}</h2>
                    <p class="promo-description">${promo.description}</p>
                    <ul class="promo-features">
                        ${featuresHTML}
                    </ul>
                    <div class="promo-footer">
                        <div>
                            ${priceHTML}
                        </div>
                        <div class="promo-actions">
                            ${promo.link !== '#' ? 
                                `<a href="${promo.link}" class="btn btn-primary">Đặt Ngay</a>` : 
                                `<button class="btn btn-primary" onclick="showPromoDetail(${promo.id})">Xem Chi Tiết</button>`
                            }
                        </div>
                    </div>
                </div>
                <div class="promo-image">
                    <span class="promo-emoji">${promo.emoji}</span>
                    <div class="promo-expiry">
                        <i class="ri-time-line"></i> Hạn sử dụng: ${promo.expiry}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function displayPromotions() {
    // Display featured promotion
    const featuredPromo = promotionsData.find(p => p.featured);
    const featuredContainer = document.getElementById('featured-promo');
    
    if (featuredPromo && featuredContainer) {
        featuredContainer.innerHTML = createPromoCard(featuredPromo, true);
    }

    // Display other promotions
    const otherPromos = promotionsData.filter(p => !p.featured);
    const gridContainer = document.getElementById('promotions-grid');
    
    if (gridContainer) {
        gridContainer.innerHTML = otherPromos.map(promo => 
            createPromoCard(promo, false)
        ).join('');
    }
}

function showPromoDetail(promoId) {
    const promo = promotionsData.find(p => p.id === promoId);
    if (promo) {
        alert(`Chi tiết khuyến mãi:\n\n${promo.title}\n\n${promo.description}\n\nHạn sử dụng: ${promo.expiry}\n\nLiên hệ hotline: 1900-xxxx để biết thêm chi tiết!`);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    displayPromotions();
});


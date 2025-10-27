# Nhà Hàng Ngon - Restaurant Food Ordering Website

## Overview
A multi-page restaurant food ordering website built with pure HTML, CSS, and JavaScript. The website allows customers to browse a menu, add items to their cart, and place orders through a simple checkout form.

## Project Structure
- `index.html` - Home page with hero section and restaurant introduction
- `menu.html` - Menu page displaying 6 food items with add-to-cart functionality
- `cart.html` - Shopping cart page with quantity controls and checkout form
- `style.css` - Responsive CSS styling with mobile, tablet, and desktop support
- `script.js` - JavaScript for cart management using localStorage

## Features
✅ **Navigation Bar**: Consistent across all pages with active page highlighting and cart item counter
✅ **Home Page**: Beautiful hero section with call-to-action button and restaurant intro
✅ **Menu Page**: 6 food items displayed as cards with images, descriptions, prices, and "Add to Cart" buttons
✅ **Shopping Cart**: Full cart management with quantity controls, remove items, and total calculation
✅ **LocalStorage**: Cart data persists across page navigation
✅ **Checkout Form**: Simple form with name, phone, and address fields
✅ **Responsive Design**: Mobile-friendly with CSS media queries for all screen sizes
✅ **Notifications**: Visual feedback when items are added to cart
✅ **Order Confirmation**: Alert message when order is placed successfully

## Technology Stack
- HTML5 - Semantic markup
- CSS3 - Flexbox, Grid, Media Queries
- Vanilla JavaScript (ES6+) - No frameworks
- LocalStorage API - Data persistence

## How to Use
1. The website is served automatically via Python's HTTP server on port 5000
2. Navigate through pages using the navigation bar
3. Browse menu items and click "Thêm vào giỏ" to add items
4. View cart to see items, adjust quantities, or remove items
5. Fill out checkout form and click "Đặt Hàng" to place order

## Recent Changes
- **October 27, 2025**: Initial implementation of complete restaurant ordering system
  - Created all HTML pages with proper structure
  - Implemented responsive CSS design
  - Built cart functionality with localStorage
  - Set up Python HTTP server workflow
  - All features tested and verified working

## Notes
- Cart data is stored in browser's localStorage
- No backend processing - checkout shows confirmation alert only
- All text is in Vietnamese (Tiếng Việt)
- Designed for modern browsers with ES6 support

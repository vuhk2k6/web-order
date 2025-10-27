# Nhà Hàng Ngon - Restaurant Food Ordering Website

## Overview
A multi-page restaurant food ordering website built with pure HTML, CSS, and JavaScript. The website allows customers to browse a menu, add items to their cart, place orders, and provides a complete admin panel for managing orders and menu items.

## Project Structure
### Customer-Facing Pages
- `index.html` - Home page with hero section and restaurant introduction
- `menu.html` - Menu page dynamically loading items from localStorage
- `cart.html` - Shopping cart page with quantity controls and checkout form

### Admin Pages
- `admin.html` - Admin panel for managing orders and menu items

### Styles & Scripts
- `style.css` - Responsive CSS styling with mobile, tablet, and desktop support
- `script.js` - Core JavaScript for cart management and order processing
- `menu.js` - Dynamic menu rendering with secure DOM manipulation
- `admin.js` - Admin functionality for order and menu management

## Features

### Customer Features
✅ **Navigation Bar**: Consistent across all pages with active page highlighting and cart item counter
✅ **Home Page**: Beautiful hero section with call-to-action button and restaurant intro
✅ **Menu Page**: Dynamically loaded menu items from localStorage
✅ **Shopping Cart**: Full cart management with quantity controls, remove items, and total calculation
✅ **LocalStorage**: Cart data and orders persist across page navigation
✅ **Checkout Form**: Simple form with name, phone, and address fields
✅ **Responsive Design**: Mobile-friendly with CSS media queries for all screen sizes
✅ **Notifications**: Visual feedback when items are added to cart
✅ **Order Confirmation**: Alert with order ID and details when order is placed

### Admin Features
✅ **Dashboard Stats**: Real-time statistics showing total orders, new orders, processing orders, and revenue
✅ **Order Management**: 
  - View all orders with customer details
  - Update order status (Mới, Đang xử lý, Đang giao, Đã giao, Đã hủy)
  - View detailed order information
  - Delete orders
✅ **Menu Management**:
  - Add new menu items
  - Edit existing items (name, description, price, emoji, gradient)
  - Delete menu items
  - Changes reflect immediately on customer menu page
✅ **Status Badges**: Color-coded order status indicators
✅ **Responsive Tables**: Mobile-friendly order and menu management tables

## Technology Stack
- HTML5 - Semantic markup
- CSS3 - Flexbox, Grid, Media Queries
- Vanilla JavaScript (ES6+) - No frameworks
- LocalStorage API - Data persistence
- DOM API - Secure element creation with createElement/textContent

## Security Features
- **XSS Prevention**: All user input rendered using textContent instead of innerHTML
- **Quote Escaping**: Secure DOM manipulation prevents JavaScript injection
- **Event Listeners**: No inline event handlers to prevent code injection

## How to Use

### For Customers
1. Navigate to the website (served on port 5000)
2. Browse menu items on the "Thực đơn" page
3. Click "Thêm vào giỏ" to add items to cart
4. View cart, adjust quantities, or remove items
5. Fill out checkout form and click "Đặt Hàng" to place order
6. Receive order confirmation with order ID

### For Admin
1. Navigate to the "Quản lý" page
2. View dashboard statistics
3. **Order Management Tab**:
   - Click "Chi tiết" to view order details
   - Click "Cập nhật" to change order status
   - Click "Xóa" to delete orders
4. **Menu Management Tab**:
   - Click "+ Thêm Món Mới" to add items
   - Click "Sửa" to edit existing items
   - Click "Xóa" to remove items

## Data Structure

### Order Object
```javascript
{
  id: "DH" + timestamp,
  customerName: string,
  phone: string,
  address: string,
  items: [{id, name, price, quantity}],
  total: number,
  itemCount: number,
  status: "Mới" | "Đang xử lý" | "Đang giao" | "Đã giao" | "Đã hủy",
  createdAt: ISO datetime,
  updatedAt: ISO datetime
}
```

### Menu Item Object
```javascript
{
  id: number,
  name: string,
  description: string,
  price: number,
  emoji: string,
  gradient: string (CSS gradient)
}
```

## Recent Changes
- **October 27, 2025**: Initial implementation
  - Created all HTML pages with proper structure
  - Implemented responsive CSS design
  - Built cart functionality with localStorage
  - Set up Python HTTP server workflow

- **October 27, 2025**: Admin panel implementation
  - Created admin page with order and menu management
  - Implemented order tracking with status updates
  - Added menu CRUD operations
  - Refactored menu.js to use secure DOM manipulation
  - Fixed XSS vulnerabilities using createElement/textContent
  - Added statistics dashboard for admin

## Notes
- All data stored in browser's localStorage
- No backend server - purely frontend application
- All text is in Vietnamese (Tiếng Việt)
- Designed for modern browsers with ES6 support
- Admin panel accessible to anyone (no authentication)

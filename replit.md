# Nhà Hàng Ngon - Restaurant Food Ordering Website

## Overview
A multi-page restaurant food ordering website built with pure HTML, CSS, and JavaScript. The website allows customers to browse a menu, add items to their cart, place orders, and provides a complete admin panel for managing orders and menu items.

## Project Structure
### Customer-Facing Pages
- `index.html` - Home page with hero section and restaurant introduction
- `menu.html` - Menu page dynamically loading items from localStorage
- `cart.html` - Shopping cart page with quantity controls and checkout form

### Admin Panel (Separate Directory)
- `admin/` - Dedicated admin directory with isolated files
  - `admin/index.html` - Admin panel for managing orders and menu items
  - `admin/admin.css` - Admin-specific CSS styling
  - `admin/admin.js` - Admin functionality for order and menu management

### Styles & Scripts
- `style.css` - Responsive CSS styling for customer pages
- `script.js` - Core JavaScript for cart management and order processing
- `menu.js` - Dynamic menu rendering with secure DOM manipulation

## Features

### Customer Features
✅ **iOS-Style Glassmorphism Design**: Premium liquid glass effects with 42px blur, layered gradients, dual shadows, and edge glows
✅ **Premium Animations**: Spring transitions, floating effects, shimmer, glow pulses, and smooth micro-interactions
✅ **Navigation Bar**: Glass morphism navbar with active state highlighting and cart counter
✅ **Home Page**: Beautiful glass hero section with animated effects and call-to-action
✅ **Expanded Menu**: 25 diverse menu items across 4 categories (khai vị, món chính, tráng miệng, đồ uống)
✅ **Category Filters**: iOS-style segmented pill controls for filtering menu by category
✅ **Shopping Cart**: Full cart management with glass-effect cards, quantity controls, and animations
✅ **LocalStorage with Versioning**: Smart data migration ensures all users get updated menu catalog
✅ **Checkout Form**: Glass-effect form with smooth focus states
✅ **Responsive Design**: Mobile-optimized with prefers-reduced-motion accessibility support
✅ **Notifications**: Visual feedback when items are added to cart
✅ **Order Confirmation**: Alert with order ID and details when order is placed

### Admin Features
✅ **Premium Glass Design**: Matching iOS-style glassmorphism across entire admin panel
✅ **Dashboard Stats**: Animated glass stat cards with hover effects showing orders and revenue
✅ **iOS-Style Tab Controls**: Segmented pill navigation between order and menu management
✅ **Order Management**: 
  - View all orders with customer details in glass-effect tables
  - Update order status with animated glass badges (Mới, Đang xử lý, Đang giao, Đã giao, Đã hủy)
  - View detailed order information
  - Delete orders with smooth transitions
✅ **Menu Management**:
  - Add new menu items with category support
  - Edit existing items (name, description, price, emoji, gradient, category)
  - Delete menu items
  - Changes reflect immediately on customer menu page
✅ **Animated UI Elements**: Glass buttons with glow effects and spring transitions
✅ **Responsive Design**: Mobile-optimized admin panel with collapsible navigation

## Technology Stack
- HTML5 - Semantic markup
- CSS3 - Advanced glassmorphism with backdrop-filter, CSS variables, keyframe animations
- Vanilla JavaScript (ES6+) - No frameworks, versioned data management
- LocalStorage API - Data persistence with migration system
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
1. Navigate to the "Quản lý" page (located at `/admin/`)
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
  category: "appetizer" | "main" | "dessert" | "drink",
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

- **October 27, 2025**: Admin panel reorganization
  - Separated admin panel into dedicated `admin/` directory
  - Created `admin/admin.css` for isolated admin styling
  - Moved admin files to `admin/index.html` and `admin/admin.js`
  - Removed admin CSS from main `style.css` to avoid conflicts
  - Updated all navigation links to point to `/admin/`
  - Improved project organization and maintainability

- **October 27, 2025**: iOS-Inspired Premium Glassmorphism Redesign
  - Implemented premium liquid glass effects with 42px backdrop blur, saturation, and contrast filters
  - Added layered gradients, dual shadows (main + inset), and edge glows throughout
  - Created spring-like transitions using cubic-bezier easing for iOS-quality animations
  - Added floating, shimmer, and glow-pulse keyframe animations
  - Expanded menu from 6 to 25 items across 4 categories (appetizer, main, dessert, drink)
  - Implemented iOS-style segmented pill filter controls for category navigation
  - Added data versioning system (MENU_DATA_VERSION) for safe localStorage migrations
  - Applied matching glassmorphism to admin panel (stats, tabs, tables, buttons)
  - Added prefers-reduced-motion accessibility support
  - Installed Python 3.11 for HTTP server workflow
  - Comprehensive architect review confirms iOS-grade polish and functionality

## Design Philosophy
The website uses **iOS-inspired glassmorphism** (liquid glass) design language to create a premium, modern user experience:
- **Glass Effects**: Semi-transparent backgrounds with strong blur and saturation
- **Layered Depth**: Dual shadows and inset highlights create dimensional surfaces
- **Fluid Motion**: Spring easing and smooth transitions feel responsive and alive  
- **Accessibility**: Respects user motion preferences and maintains proper contrast
- **Consistency**: Unified visual language across customer and admin interfaces

## Notes
- All data stored in browser's localStorage
- No backend server - purely frontend application
- All text is in Vietnamese (Tiếng Việt)
- Designed for modern browsers with ES6 support
- Admin panel accessible to anyone (no authentication)

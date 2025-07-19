// API Configuration
export const API_CONFIG = {
  // Base URL cho API server
  BASE_URL: 'http://192.168.1.6:4000', // Đúng IP LAN của máy bạn
  
  // Các endpoint chính
  ENDPOINTS: {
    USERS: '/users',
    PRODUCTS: '/products',
    VARIANTS: '/variants',
    CART: '/cart',
    ORDERS: '/orders',
    ADDRESSES: '/addresses',
    DB: '/db',
    NOTIFICATIONS: '/notifications'
  }
};

// Helper function để tạo URL đầy đủ
export const createApiUrl = (endpoint, params = {}) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  // Thêm query parameters nếu có
  if (Object.keys(params).length > 0) {
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');
    url += `?${queryString}`;
  }
  
  return url;
};

// Helper function để tạo URL với ID
export const createApiUrlWithId = (endpoint, id) => {
  return `${API_CONFIG.BASE_URL}${endpoint}/${id}`;
};

// Export các URL thường dùng
export const API_URLS = {
  // Users
  USERS: () => createApiUrl(API_CONFIG.ENDPOINTS.USERS),
  USER_BY_ID: (id) => createApiUrlWithId(API_CONFIG.ENDPOINTS.USERS, id),
  USER_BY_EMAIL_PASSWORD: (email, password) => 
    createApiUrl(API_CONFIG.ENDPOINTS.USERS, { email, password }),
  
  // Products
  PRODUCTS: () => createApiUrl(API_CONFIG.ENDPOINTS.PRODUCTS),
  PRODUCT_BY_ID: (id) => createApiUrlWithId(API_CONFIG.ENDPOINTS.PRODUCTS, id),
  
  // Variants
  VARIANTS_BY_PRODUCT: (productId) => 
    createApiUrl(API_CONFIG.ENDPOINTS.VARIANTS, { productId }),
  VARIANTS_BY_PRODUCT_SIZE_COLOR: (productId, size, color) => 
    createApiUrl(API_CONFIG.ENDPOINTS.VARIANTS, { productId, size, color }),
  
  // Cart
  CART_BY_USER: (userId) => createApiUrl(API_CONFIG.ENDPOINTS.CART, { userId }),
  CART_ITEM: (id) => createApiUrlWithId(API_CONFIG.ENDPOINTS.CART, id),
  CART_BY_USER_PRODUCT: (userId, productId, size, color) => 
    createApiUrl(API_CONFIG.ENDPOINTS.CART, { userId, productId, size, color }),
  
  // Orders
  ORDERS: () => createApiUrl(API_CONFIG.ENDPOINTS.ORDERS),
  ORDERS_BY_USER: (userId) => createApiUrl(API_CONFIG.ENDPOINTS.ORDERS, { userId }),
  
  // Addresses
  ADDRESSES: () => createApiUrl(API_CONFIG.ENDPOINTS.ADDRESSES),
  ADDRESSES_BY_USER: (userId) => createApiUrl(API_CONFIG.ENDPOINTS.ADDRESSES, { userId }),
  ADDRESS_BY_ID: (id) => createApiUrlWithId(API_CONFIG.ENDPOINTS.ADDRESSES, id),
  
  // Database
  DB: () => createApiUrl(API_CONFIG.ENDPOINTS.DB),
  NOTIFICATIONS_BY_USER: (userId) => createApiUrl(API_CONFIG.ENDPOINTS.NOTIFICATIONS, { userId })
}; 
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://anhtv:p8TMG3dFByCNB9a4@cluster0.flcuv.mongodb.net/DA_TT?retryWrites=true&w=majority&appName=Cluster0');
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected!');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

const app = express();
app.use(cors());
app.use(express.json()); // Đảm bảo parse JSON body
app.use(bodyParser.json());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

// Định nghĩa schema và model cho Product
const productSchema = new mongoose.Schema({
  id: String,
  name: String,
  brand: String,
  image: String,
  description: String,
  sizes: [Number],
  colors: [String],
  price: Number,
  oldPrice: Number,
  rating: Number,
  reviews: Number,
  discount: Number,
  sold: Number,
  images: [String],
});
const Product = mongoose.model('Product', productSchema);

// Định nghĩa schema/model cho User
const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  email: String,
  password: String,
  address: String,
  role: String
});
const User = mongoose.model('User', userSchema);

const ORDER_STATUSES = [
  'Chờ xác nhận',
  'Chờ lấy hàng',
  'Đang giao hàng',
  'Đã giao hàng',
  'Đã huỷ'
];

// Mapping màu sắc cho từng trạng thái đơn hàng
const STATUS_COLORS = {
  'Chờ xác nhận': '#f59e0b',    // Màu cam
  'Chờ lấy hàng': '#6366f1',    // Màu tím
  'Đang giao hàng': '#3b82f6',  // Màu xanh dương
  'Đã giao hàng': '#10b981',    // Màu xanh lá
  'Đã huỷ': '#ef4444'           // Màu đỏ
};

const orderSchema = new mongoose.Schema({
  id: String,
  userId: String,
  items: Array,
  shippingMethod: String,
  shipping: Number,
  paymentMethod: String,
  total: Number,
  status: { type: String, enum: ORDER_STATUSES, default: 'Chờ xác nhận' },
  createdAt: String,
  address: String,
  cancelReason: String, // Lý do huỷ đơn
  history: [
    {
      status: String,
      time: String,
      by: String, // userId hoặc 'admin'
      reason: String // lý do nếu có
    }
  ]
});
const Order = mongoose.model('Order', orderSchema);

// Định nghĩa schema/model cho Cart
const cartSchema = new mongoose.Schema({
  id: String,
  userId: String,
  productId: String,
  name: String,
  image: String,
  size: Number,
  color: String,
  qty: Number,
  price: Number
});
const Cart = mongoose.model('Cart', cartSchema);

// Định nghĩa schema/model cho Address
const addressSchema = new mongoose.Schema({
  id: String,
  userId: String,
  detail: String,
  zip: String,
  selected: Boolean
});
const Address = mongoose.model('Address', addressSchema);

// Định nghĩa schema/model cho Variant
const variantSchema = new mongoose.Schema({
  id: String,
  productId: String,
  size: Number,
  color: String,
  price: Number,
  stock: Number
});
const Variant = mongoose.model('Variant', variantSchema);

// Đọc danh sách sản phẩm từ MongoDB
async function readProducts() {
  return await Product.find({});
}

// Gửi event cho tất cả client khi có thay đổi
async function broadcastProducts() {
  let products = await readProducts();
  if (!Array.isArray(products)) products = [];
  io.emit('products_update', products);
}

// Đã loại bỏ hoàn toàn mọi đoạn code thao tác với db.json và fs
// Tất cả API đều thao tác với MongoDB qua mongoose

// API lấy danh sách sản phẩm
app.get('/products', async (req, res) => {
  try {
    const products = await readProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy sản phẩm từ MongoDB' });
  }
});

// API lấy chi tiết sản phẩm theo id
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy sản phẩm từ MongoDB' });
  }
});

// API lấy user theo email và password (phục vụ đăng nhập)
app.get('/users', async (req, res) => {
  try {
    const { email, password } = req.query;
    if (email && password) {
      const user = await User.findOne({ email, password });
      if (user) {
        res.json([user]);
      } else {
        res.json([]);
      }
    } else {
      const users = await User.find({});
      res.json(users);
    }
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy users từ MongoDB' });
  }
});

// API lấy user theo id
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.id });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy user từ MongoDB' });
  }
});

// API lấy danh sách đơn hàng
app.get('/orders', async (req, res) => {
  try {
    const { userId } = req.query;
    let orders;
    
    if (userId) {
      // Nếu có userId, lấy đơn hàng của user cụ thể
      orders = await Order.find({ userId });
    } else {
      // Nếu không có userId, lấy tất cả đơn hàng (cho admin)
      orders = await Order.find({});
    }
    
    // Thêm màu sắc cho từng trạng thái
    const ordersWithColors = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.statusColor = STATUS_COLORS[order.status] || '#6b7280'; // Màu xám mặc định
      // Trả về cả lịch sử và lý do huỷ
      orderObj.history = order.history || [];
      orderObj.cancelReason = order.cancelReason || '';
      return orderObj;
    });
    
    res.json(ordersWithColors);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy orders từ MongoDB' });
  }
});

// API lấy danh sách cart
app.get('/cart', async (req, res) => {
  try {
    const { userId, productId, size, color } = req.query;
    console.log('DEBUG GET CART - QUERY PARAMS:', { userId, productId, size, color });
    if (userId && productId && size && color) {
      const searchQuery = { 
        userId: String(userId), 
        productId: String(productId), 
        size: Number(size), 
        color: String(color).toLowerCase().trim() 
      };
      console.log('DEBUG GET CART - SEARCH QUERY:', searchQuery);
      const cartItem = await Cart.findOne(searchQuery);
      console.log('DEBUG GET CART - SEARCH RESULT:', cartItem);
      res.json(cartItem ? [cartItem] : []);
    } else if (userId) {
      const cart = await Cart.find({ userId });
      console.log('DEBUG GET CART - ALL ITEMS FOR USER:', userId, cart);
      res.json(cart);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error('DEBUG GET CART ERROR:', err);
    res.status(500).json({ error: 'Lỗi lấy cart từ MongoDB' });
  }
});

// API xem tất cả cart items (chỉ để debug)
app.get('/cart-debug', async (req, res) => {
  try {
    const allCart = await Cart.find({});
    console.log('DEBUG ALL CART ITEMS:', allCart);
    res.json(allCart);
  } catch (err) {
    console.error('DEBUG ALL CART ERROR:', err);
    res.status(500).json({ error: 'Lỗi lấy tất cả cart từ MongoDB' });
  }
});

// API xóa tất cả cart items (chỉ để debug và test)
app.delete('/cart-debug', async (req, res) => {
  try {
    const result = await Cart.deleteMany({});
    console.log('DEBUG: Deleted all cart items, count:', result.deletedCount);
    res.json({ success: true, message: `Đã xóa ${result.deletedCount} cart items` });
  } catch (err) {
    console.error('DEBUG DELETE ALL CART ERROR:', err);
    res.status(500).json({ error: 'Lỗi xóa tất cả cart từ MongoDB' });
  }
});

// API lấy danh sách addresses
app.get('/addresses', async (req, res) => {
  try {
    const { userId } = req.query;
    console.log('DEBUG GET ADDRESSES - QUERY:', req.query);
    console.log('DEBUG GET ADDRESSES - USERID:', userId);
    
    if (userId) {
      // Lấy địa chỉ của user cụ thể
      const addresses = await Address.find({ userId });
      console.log('DEBUG GET ADDRESSES - FOUND:', addresses);
      res.json(addresses);
    } else {
      // Nếu không có userId, trả về mảng rỗng (bảo mật)
      console.log('DEBUG GET ADDRESSES - NO USERID, RETURNING EMPTY');
      res.json([]);
    }
  } catch (err) {
    console.error('DEBUG GET ADDRESSES ERROR:', err);
    res.status(500).json({ error: 'Lỗi lấy addresses từ MongoDB' });
  }
});

// API lấy danh sách variants
app.get('/variants', async (req, res) => {
  try {
    const variants = await Variant.find({});
    res.json(variants);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy variants từ MongoDB' });
  }
});

// API lấy thông tin màu sắc của các trạng thái đơn hàng
app.get('/order-status-colors', (req, res) => {
  try {
    res.json(STATUS_COLORS);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy thông tin màu sắc trạng thái' });
  }
});

// API thêm sản phẩm
app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product({ ...req.body, id: Date.now().toString() });
    await newProduct.save();
    await broadcastProducts();
    res.json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi thêm sản phẩm vào MongoDB' });
  }
});

// API sửa sản phẩm
app.patch('/products/:id', async (req, res) => {
  try {
    console.log('PATCH PRODUCT', req.params.id, req.body);
    const updateResult = await Product.updateOne({ id: req.params.id }, { $set: req.body });
    console.log('PATCH PRODUCT updateOne result:', updateResult);
    const updatedProduct = await Product.findOne({ id: req.params.id });
    console.log('PATCH PRODUCT after update:', updatedProduct);
    await broadcastProducts();
    res.json({ success: true, updatedProduct });
  } catch (err) {
    console.error('PATCH PRODUCT ERROR:', err);
    res.status(500).json({ error: 'Lỗi cập nhật sản phẩm trong MongoDB' });
  }
});

// API xóa sản phẩm
app.delete('/products/:id', async (req, res) => {
  try {
    await Product.deleteOne({ id: req.params.id });
    await broadcastProducts();
    console.log('Đã xóa sản phẩm với id:', req.params.id); // Thêm log xác nhận xóa
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xóa sản phẩm trong MongoDB' });
  }
});

// ===== USERS =====
// Thêm user
app.post('/users', async (req, res) => {
  try {
    const newUser = new User({ ...req.body, id: Date.now().toString() });
    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi thêm user vào MongoDB' });
  }
});
// Sửa user
app.patch('/users/:id', async (req, res) => {
  try {
    await User.updateOne({ id: req.params.id }, { $set: req.body });
    const updatedUser = await User.findOne({ id: req.params.id });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật user trong MongoDB' });
  }
});
// Xóa user
app.delete('/users/:id', async (req, res) => {
  try {
    await User.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xóa user trong MongoDB' });
  }
});

// ===== ORDERS =====
// Thêm order
app.post('/orders', async (req, res) => {
  try {
    let status = req.body.status;
    if (!ORDER_STATUSES.includes(status)) status = 'Chờ xác nhận';
    const now = new Date().toISOString();
    const newOrder = new Order({
      ...req.body,
      status,
      id: Date.now().toString(),
      createdAt: now,
      history: [{ status, time: now, by: req.body.userId || 'user', reason: '' }]
    });
    await newOrder.save();
    
    // Gửi thông báo realtime cho admin về đơn hàng mới
    try {
      const user = await User.findOne({ id: req.body.userId });
      const customerName = user ? user.name : `User ${req.body.userId}`;
      
      // Thêm màu sắc cho đơn hàng mới
      const orderWithColor = newOrder.toObject();
      orderWithColor.statusColor = STATUS_COLORS[newOrder.status] || '#6b7280';
      
      // Gửi qua WebSocket
      io.emit('new_order', {
        order: orderWithColor,
        customerName: customerName
      });
      
      console.log('🆕 Đơn hàng mới:', newOrder.id, 'từ', customerName);
    } catch (wsError) {
      console.log('WebSocket notification failed:', wsError);
    }
    
    // Trả về đơn hàng với màu sắc
    const orderWithColor = newOrder.toObject();
    orderWithColor.statusColor = STATUS_COLORS[newOrder.status] || '#6b7280';
    res.json(orderWithColor);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi thêm order vào MongoDB' });
  }
});
const ORDER_STATUS_FLOW = {
  'Chờ xác nhận': ['Chờ lấy hàng', 'Đã huỷ'],
  'Chờ lấy hàng': ['Đang giao hàng', 'Đã huỷ'],
  'Đang giao hàng': ['Đã giao hàng', 'Đã huỷ'],
  'Đã giao hàng': [],
  'Đã huỷ': []
};

// Sửa order
app.patch('/orders/:id', async (req, res) => {
  try {
    let update = { ...req.body };
    if (update.status && !ORDER_STATUSES.includes(update.status)) {
      return res.status(400).json({ error: 'Trạng thái đơn hàng không hợp lệ!' });
    }
    // Nếu cập nhật trạng thái, kiểm tra luồng nghiệp vụ
    if (update.status) {
      const order = await Order.findOne({ id: req.params.id });
      if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng!' });
      const currentStatus = order.status;
      const allowedNext = ORDER_STATUS_FLOW[currentStatus] || [];
      if (!allowedNext.includes(update.status)) {
        return res.status(400).json({ error: `Chỉ được chuyển từ '${currentStatus}' sang: ${allowedNext.join(', ') || 'không trạng thái nào'}` });
      }
      // Lưu lịch sử trạng thái
      const now = new Date().toISOString();
      const by = req.body.by || 'user';
      const reason = update.cancelReason || (update.status === 'Đã huỷ' ? 'User huỷ' : '');
      order.history = order.history || [];
      order.history.push({ status: update.status, time: now, by, reason });
      if (update.cancelReason) order.cancelReason = update.cancelReason;
      await order.save();
      // Cập nhật các trường khác nếu có
      await Order.updateOne({ id: req.params.id }, { $set: update });
    } else {
      await Order.updateOne({ id: req.params.id }, { $set: update });
    }
    
    // Nếu cập nhật trạng thái, gửi thông báo WebSocket và trả về thông tin đơn hàng với màu sắc mới
    if (update.status) {
      const updatedOrder = await Order.findOne({ id: req.params.id });
      if (updatedOrder) {
        const orderWithColor = updatedOrder.toObject();
        orderWithColor.statusColor = STATUS_COLORS[updatedOrder.status] || '#6b7280';
        
                  // Gửi thông báo WebSocket cho frontend và admin
          try {
            // Gửi cho admin qua WebSocket
            io.emit('order_update', {
              order: orderWithColor
            });
            
            // Gửi cho frontend qua Socket.IO
            io.emit('order_update', {
              order: orderWithColor
            });
            
            console.log('🔄 Cập nhật trạng thái đơn hàng #' + updatedOrder.id + ' sang: ' + update.status);
          } catch (wsError) {
            console.log('WebSocket notification failed:', wsError);
          }
        
        res.json(orderWithColor);
      } else {
        res.json({ success: true });
      }
    } else {
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật order trong MongoDB' });
  }
});
// Xóa order
app.delete('/orders/:id', async (req, res) => {
  try {
    await Order.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xóa order trong MongoDB' });
  }
});

// ===== CART =====
// Thêm cart item
app.post('/cart', async (req, res) => {
  try {
    // Đảm bảo đúng kiểu dữ liệu khi kiểm tra trùng
    const userId = String(req.body.userId);
    const productId = String(req.body.productId);
    const size = Number(req.body.size);
    const color = String(req.body.color).toLowerCase().trim();
    console.log('DEBUG CART POST - INPUT:', {
      userId,
      productId,
      size,
      color,
      body: req.body
    });
    // Kiểm tra đã có sản phẩm này trong giỏ chưa
    const query = { userId, productId, size, color };
    console.log('DEBUG CART POST - QUERY:', query);
    // Log tất cả cart items hiện tại để so sánh
    const allCartItems = await Cart.find({ userId });
    console.log('DEBUG CART POST - ALL EXISTING ITEMS:', allCartItems);
    let cartItem = await Cart.findOne(query);
    console.log('DEBUG CART POST - FOUND ITEM:', cartItem);
    if (cartItem) {
      // Nếu đã có, tăng số lượng
      console.log('DEBUG: Item exists, updating quantity from', cartItem.qty, 'to', cartItem.qty + 1);
      cartItem.qty += 1;
      await cartItem.save();
      console.log('DEBUG UPDATED CART ITEM:', cartItem);
      res.json(cartItem);
    } else {
      // Nếu chưa có, thêm mới
      console.log('DEBUG: Item does not exist, creating new item');
      const newCart = new Cart({ 
        ...req.body, 
        id: Date.now().toString(), 
        userId, 
        productId, 
        size, 
        color 
      });
      await newCart.save();
      console.log('DEBUG CREATED NEW CART ITEM:', newCart);
      res.json(newCart);
    }
  } catch (err) {
    console.error('DEBUG CART ERROR:', err);
    res.status(500).json({ error: 'Lỗi thêm cart vào MongoDB' });
  }
});
// Sửa cart item
app.patch('/cart/:id', async (req, res) => {
  try {
    await Cart.updateOne({ id: req.params.id }, { $set: req.body });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật cart trong MongoDB' });
  }
});
// Xóa cart item
app.delete('/cart/:id', async (req, res) => {
  try {
    await Cart.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xóa cart trong MongoDB' });
  }
});

// ===== ADDRESSES =====
// Thêm address
app.post('/addresses', async (req, res) => {
  try {
    console.log('DEBUG ADD ADDRESS:', req.body);
    const newAddress = new Address({ ...req.body, id: Date.now().toString() });
    await newAddress.save();
    console.log('DEBUG SAVED ADDRESS:', newAddress);
    res.json(newAddress);
  } catch (err) {
    console.error('DEBUG ADD ADDRESS ERROR:', err);
    res.status(500).json({ error: 'Lỗi thêm address vào MongoDB' });
  }
});
// Sửa address
app.patch('/addresses/:id', async (req, res) => {
  try {
    await Address.updateOne({ id: req.params.id }, { $set: req.body });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật address trong MongoDB' });
  }
});
// Xóa address
app.delete('/addresses/:id', async (req, res) => {
  try {
    await Address.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xóa address trong MongoDB' });
  }
});

// ===== VARIANTS =====
// Thêm variant
app.post('/variants', async (req, res) => {
  try {
    const newVariant = new Variant({ ...req.body, id: Date.now().toString() });
    await newVariant.save();
    res.json(newVariant);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi thêm variant vào MongoDB' });
  }
});
// Sửa variant
app.patch('/variants/:id', async (req, res) => {
  try {
    await Variant.updateOne({ id: req.params.id }, { $set: req.body });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi cập nhật variant trong MongoDB' });
  }
});
// Xóa variant
app.delete('/variants/:id', async (req, res) => {
  try {
    await Variant.deleteOne({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi xóa variant trong MongoDB' });
  }
});

// Khi client kết nối
io.on('connection', (socket) => {
  socket.emit('products_update', readProducts());
});

const PORT = 4000;
const HOST = '192.168.1.6';
server.listen(PORT, HOST, () => {
  console.log(`Realtime server running at http://${HOST}:${PORT}`);
});
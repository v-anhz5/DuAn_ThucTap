const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const WebSocket = require('ws');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://anhtv:p8TMG3dFByCNB9a4@cluster0.flcuv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected!');
});
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

// Tạo WebSocket server riêng biệt trên cổng 4001
const ws = new WebSocket.Server({ port: 4001 });

app.use(cors());
app.use(bodyParser.json());

const DB_PATH = './db.json';

// Đọc dữ liệu sản phẩm từ db.json
function readProducts() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  return db.products || [];
}

// Gửi event cho tất cả client khi có thay đổi
function broadcastProducts() {
  const products = readProducts();
  io.emit('products_update', products);
}

// Broadcast sản phẩm cho tất cả client WebSocket
function wsBroadcastProducts() {
  const products = readProducts();
  const data = JSON.stringify({ type: 'products_update', products });
  console.log('WS BROADCAST PRODUCTS:', products); // Thêm log để debug
  ws.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Theo dõi file db.json, mỗi khi thay đổi sẽ broadcast sản phẩm mới
fs.watchFile(DB_PATH, { interval: 500 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log('db.json changed, broadcasting products...');
    wsBroadcastProducts();
  }
});

// API lấy danh sách sản phẩm
app.get('/products', (req, res) => {
  res.json(readProducts());
});

// API lấy danh sách đơn hàng
app.get('/orders', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  res.json(db.orders || []);
});

// API cập nhật trạng thái đơn hàng
app.patch('/orders/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  let updatedOrder = null;
  db.orders = db.orders.map(order => {
    if (order.id == req.params.id) {
      updatedOrder = { ...order, ...req.body };
      return updatedOrder;
    }
    return order;
  });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  // Phát sự kiện WebSocket cho tất cả client
  const data = JSON.stringify({ type: 'order_update', order: updatedOrder });
  ws.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
  res.json({ success: true, order: updatedOrder });
});

// API thêm sản phẩm
app.post('/products', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  const newProduct = { ...req.body, id: Date.now() };
  db.products = db.products || [];
  db.products.push(newProduct);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  broadcastProducts();
  wsBroadcastProducts();
  res.json(newProduct);
});

// API sửa sản phẩm
app.patch('/products/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  db.products = db.products.map(p =>
    p.id == req.params.id ? { ...p, ...req.body } : p
  );
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  broadcastProducts();
  wsBroadcastProducts();
  res.json({ success: true });
});

// API xóa sản phẩm
app.delete('/products/:id', (req, res) => {
  const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  db.products = db.products.filter(p => p.id != req.params.id);
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  broadcastProducts();
  wsBroadcastProducts();
  console.log('Đã xóa sản phẩm với id:', req.params.id); // Thêm log xác nhận xóa
  res.json({ success: true });
});

// Khi client kết nối
io.on('connection', (socket) => {
  socket.emit('products_update', readProducts());
});

// Khi client WebSocket kết nối
ws.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'products_update', products: readProducts() }));
});

const PORT = 4000;
server.listen(PORT, '192.168.1.6', () => {
  console.log(`Realtime server running at http://192.168.1.6:${PORT}`);
});
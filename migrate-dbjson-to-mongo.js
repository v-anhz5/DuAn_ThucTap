const mongoose = require('mongoose');
const fs = require('fs');

// Kết nối MongoDB
mongoose.connect('mongodb+srv://anhtv:p8TMG3dFByCNB9a4@cluster0.flcuv.mongodb.net/DA_TT?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Định nghĩa schema/model giống realtime-server.js
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

const orderSchema = new mongoose.Schema({
  id: String,
  userId: String,
  items: Array,
  shippingMethod: String,
  paymentMethod: String,
  total: Number,
  status: String,
  createdAt: String
});
const Order = mongoose.model('Order', orderSchema);

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

const addressSchema = new mongoose.Schema({
  id: String,
  userId: String,
  detail: String,
  zip: String,
  selected: Boolean
});
const Address = mongoose.model('Address', addressSchema);

const variantSchema = new mongoose.Schema({
  id: String,
  productId: String,
  size: Number,
  color: String,
  price: Number,
  stock: Number
});
const Variant = mongoose.model('Variant', variantSchema);

// Đọc dữ liệu từ db.json
const db = JSON.parse(fs.readFileSync('./db.json', 'utf8'));

async function migrate() {
  try {
    // Xóa dữ liệu cũ (nếu có)
    await Product.deleteMany({});
    await User.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    await Address.deleteMany({});
    await Variant.deleteMany({});

    // Thêm mới dữ liệu
    if (db.products) await Product.insertMany(db.products);
    if (db.users) await User.insertMany(db.users);
    if (db.orders) await Order.insertMany(db.orders);
    if (db.cart) await Cart.insertMany(db.cart);
    if (db.addresses) await Address.insertMany(db.addresses);
    if (db.variants) await Variant.insertMany(db.variants);

    console.log('Đã chuyển dữ liệu thành công từ db.json sang MongoDB!');
  } catch (err) {
    console.error('Lỗi khi chuyển dữ liệu:', err);
  } finally {
    mongoose.connection.close();
  }
}

migrate(); 
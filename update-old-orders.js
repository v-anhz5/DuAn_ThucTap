const mongoose = require('mongoose');

// Kết nối tới MongoDB Atlas hoặc local (sửa lại nếu cần)
mongoose.connect('mongodb+srv://anhtv:p8TMG3dFByCNB9a4@cluster0.flcuv.mongodb.net/DA_TT?retryWrites=true&w=majority&appName=Cluster0');

const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

async function updateOldOrderStatuses() {
  const mappings = [
    { from: 'Đang xử lý', to: 'Chờ xác nhận' },
    { from: 'Đang giao', to: 'Đang giao hàng' },
    { from: 'Hoàn thành', to: 'Đã giao hàng' }
  ];
  let total = 0;
  for (const map of mappings) {
    const result = await Order.updateMany(
      { status: map.from },
      { $set: { status: map.to } }
    );
    console.log(`Đã cập nhật ${result.modifiedCount} đơn từ '${map.from}' sang '${map.to}'`);
    total += result.modifiedCount;
  }
  console.log('Tổng số đơn đã cập nhật:', total);
  process.exit();
}

async function fixOrderCreatedAtFormat() {
  const orders = await Order.find({});
  let updated = 0;
  for (const order of orders) {
    let newCreatedAt = order.createdAt;
    // Nếu là số (timestamp)
    if (typeof newCreatedAt === 'number') {
      newCreatedAt = new Date(newCreatedAt).toISOString();
    }
    // Nếu là chuỗi nhưng không phải ISO
    else if (typeof newCreatedAt === 'string' && !/^\d{4}-\d{2}-\d{2}T/.test(newCreatedAt)) {
      const d = new Date(newCreatedAt);
      if (!isNaN(d.getTime())) newCreatedAt = d.toISOString();
    }
    if (newCreatedAt !== order.createdAt) {
      await Order.updateOne({ id: order.id }, { $set: { createdAt: newCreatedAt } });
      updated++;
    }
  }
  console.log('Đã cập nhật', updated, 'đơn hàng về đúng định dạng createdAt ISO.');
  process.exit();
}

updateOldOrderStatuses();
fixOrderCreatedAtFormat(); 
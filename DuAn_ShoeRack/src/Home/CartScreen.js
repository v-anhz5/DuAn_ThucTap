import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { ThemeContext } from '../../App';
import { API_URLS } from '../utils/apiConfig';

const imageMap = {
  'icon_nike.webp': require('../../assets/img_icon/icon_nike.webp'),
  'icon_puma.jpg': require('../../assets/img_icon/icon_puma.jpg'),
  'icon_adidas.jpg': require('../../assets/img_icon/icon_adidas.jpg'),
  'icon_vans.jpg': require('../../assets/img_icon/icon_vans.jpg'),
  'icon_fila.png': require('../../assets/img_icon/icon_fila.png'),
  'icon_Red Tape.png': require('../../assets/img_icon/icon_Red Tape.png'),
  'icon_under armour.jpg': require('../../assets/img_icon/icon_under armour.jpg'),
  // 'icon_Under Armour.png': require('../../assets/img_icon/icon_Under Armour.png'), // Đã xóa dòng này vì file không tồn tại
  'image_giay.png': require('../../assets/img_icon/image_giay.png'),
  'under-armour-logo.png': require('../../assets/img_icon/under-armour-logo.png'),
  // Thêm các ảnh khác nếu cần
};

export default function CartScreen({ onBack, onCheckout, themeColors }) {
  const { themeColors: contextThemeColors } = useContext(ThemeContext);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const fetchCart = async () => {
    setLoading(true);
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    setUserId(user.id);
    try {
      const res = await fetch(API_URLS.CART_BY_USER(user.id));
      let data = await res.json();
      // Đồng bộ giá từng item với giá mới nhất từ variants
      const updatedCart = await Promise.all(data.map(async (item) => {
        try {
          const variantRes = await fetch(API_URLS.VARIANTS_BY_PRODUCT_SIZE_COLOR(item.productId, item.size, item.color));
          const variants = await variantRes.json();
          if (variants && variants.length > 0) {
            return { ...item, price: variants[0].price };
          }
        } catch (e) {}
        return item;
      }));
      setCart(updatedCart);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi tải giỏ hàng!' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQty = async (id, size, color, delta) => {
    const item = cart.find(i => i.productId === id && i.size === size && i.color === color);
    if (!item) return;
    const newQty = Math.max(1, item.qty + delta);
    try {
      await fetch(API_URLS.CART_ITEM(item.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: newQty })
      });
      await fetchCart(); // Refetch lại giỏ hàng từ BE
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi cập nhật số lượng!' });
    }
  };

  const removeItem = async (id, size, color) => {
    const item = cart.find(i => i.productId === id && i.size === size && i.color === color);
    if (!item) return;
    try {
      await fetch(API_URLS.CART_ITEM(item.id), { method: 'DELETE' });
      await fetchCart(); // Refetch lại giỏ hàng từ BE
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi xóa sản phẩm!' });
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={onBack} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={[styles.container, { backgroundColor: contextThemeColors.background }] }>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: contextThemeColors.text }]}>Giỏ hàng</Text>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={22} color={contextThemeColors.text} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 80}}>
          {loading ? (
            <Text style={{textAlign: 'center', color: contextThemeColors.textSecondary, marginTop: 40}}>Đang tải giỏ hàng...</Text>
          ) : cart.map(item => (
            <View key={item.id + '-' + item.size + '-' + item.color} style={[styles.cartItem, { backgroundColor: contextThemeColors.grayLight }] }>
              <Image 
                source={
                  item.image
                    ? (typeof item.image === 'string' && item.image.startsWith('http')
                        ? { uri: item.image }
                        : imageMap[item.image] || require('../../assets/img_icon/image_giay.png'))
                    : require('../../assets/img_icon/image_giay.png')
                }
                style={styles.cartImage} 
              />
              <View style={styles.cartInfo}>
                <Text style={[styles.cartName, { color: contextThemeColors.text }]}>{item.name}</Text>
                <Text style={[styles.cartPrice, { color: contextThemeColors.primary }]}>Giá: {item.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                <Text style={[styles.cartLineTotal, { color: contextThemeColors.textSecondary }]}>Tổng: {(item.price * item.qty)?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                <Text style={[styles.cartDesc, { color: contextThemeColors.textSecondary }]}>{item.desc}</Text>
                <View style={styles.cartMeta}>
                  <View style={[styles.cartColorCircle, {backgroundColor: item.color, borderColor: contextThemeColors.border}]} />
                  <Text style={[styles.cartMetaText, { color: contextThemeColors.text }]}>|</Text>
                  <Text style={[styles.cartMetaText, { color: contextThemeColors.text }]}>{`Size ${item.size}`}</Text>
                </View>
                <View style={[styles.cartActions, { backgroundColor: contextThemeColors.background }] }>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.productId, item.size, item.color, -1)}>
                    <Ionicons name="remove" size={18} color={contextThemeColors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: contextThemeColors.text }]}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.productId, item.size, item.color, 1)}>
                    <Ionicons name="add" size={18} color={contextThemeColors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.trashBtn} onPress={() => removeItem(item.productId, item.size, item.color)}>
                <Ionicons name="trash-outline" size={22} color={contextThemeColors.danger} />
              </TouchableOpacity>
            </View>
          ))}
          {(!loading && cart.length === 0) && (
            <View style={{alignItems: 'center', marginTop: 60}}>
              <Ionicons name="cart-outline" size={64} color={contextThemeColors.primary} style={{marginBottom: 16}} />
              <Text style={{color: contextThemeColors.textSecondary, fontSize: 18, marginBottom: 8}}>Giỏ hàng của bạn đang trống</Text>
              <Text style={{color: contextThemeColors.textSecondary, fontSize: 14, marginBottom: 20}}>Hãy chọn sản phẩm yêu thích và thêm vào giỏ hàng nhé!</Text>
              <TouchableOpacity style={{backgroundColor: contextThemeColors.primary, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32}} onPress={onBack}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Tiếp tục mua sắm</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: contextThemeColors.background, borderColor: contextThemeColors.border }] }>
          <View style={styles.totalBox}>
            <Text style={[styles.totalLabel, { color: contextThemeColors.textSecondary }]}>Total Price</Text>
            <Text style={[styles.totalValue, { color: contextThemeColors.text }]}>{total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
          </View>
          <TouchableOpacity style={[styles.payBtn, { backgroundColor: contextThemeColors.primary }]} onPress={onCheckout}>
            <Text style={styles.payBtnText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 36 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10, marginTop: 10, },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  cartItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 12, elevation: 1, },
  cartImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12, backgroundColor: '#fff', },
  cartInfo: { flex: 1, },
  cartName: { fontSize: 15, fontWeight: 'bold', marginBottom: 2, },
  cartPrice: { fontSize: 13, fontWeight: 'bold', marginBottom: 2, },
  cartLineTotal: { fontSize: 13, marginBottom: 2, },
  cartDesc: { fontSize: 13, marginBottom: 4, },
  cartMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, },
  cartColorCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, marginRight: 6, },
  cartMetaText: { fontSize: 12, marginRight: 6, },
  cartActions: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', },
  qtyBtn: { padding: 4, },
  qtyText: { fontSize: 15, fontWeight: 'bold', marginHorizontal: 8, },
  trashBtn: { marginLeft: 8, padding: 4, },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10, },
  totalBox: { flex: 1, },
  totalLabel: { fontSize: 13, marginBottom: 2, },
  totalValue: { fontSize: 22, fontWeight: 'bold', },
  payBtn: { borderRadius: 8, paddingVertical: 12, paddingHorizontal: 28, marginLeft: 16, },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', },
}); 
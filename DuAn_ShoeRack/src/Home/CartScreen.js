import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { ThemeContext } from '../theme/ThemeContext';
import { API_URLS } from '../utils/apiConfig';

const imageMap = {
  'icon_nike.jpg': require('../../assets/img_icon/icon_nike.jpg'),
  'icon_adidas.png': require('../../assets/img_icon/icon_adidas.png'),
  'icon_puma.png': require('../../assets/img_icon/icon_puma.png'),
  'icon_fila.png': require('../../assets/img_icon/icon_fila.png'),
  'icon_Red Tape.png': require('../../assets/img_icon/icon_Red Tape.png'),
  'icon_vans.webp': require('../../assets/img_icon/icon_vans.webp'),
  'image_giay.jpg': require('../../assets/img_icon/image_giay.jpg'),
  'under-armour-logo.png': require('../../assets/img_icon/under-armour-logo.png'),
};

export default function CartScreen({ onBack, onCheckout, cart, setCart, themeColors, fetchCart }) {
  const { themeColors: contextThemeColors } = useContext(ThemeContext);
  // XÓA: const [cart, setCart] = useState([]);
  // XÓA: const [loading, setLoading] = useState(true);
  // XÓA: const [userId, setUserId] = useState(null);

  // XÓA fetchCart và useEffect

  const updateQty = (id, size, color, delta) => {
    setCart(cart => {
      const newCart = cart.map(item =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      );
      fetchCart && fetchCart();
      return newCart;
    });
  };

  const removeItem = (id, size, color) => {
    setCart(cart => {
      const newCart = cart.filter(item => !(item.id === id && item.size === size && item.color === color));
      fetchCart && fetchCart();
      return newCart;
    });
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
          {cart.length === 0 ? (
            <View style={{alignItems: 'center', marginTop: 60}}>
              <Ionicons name="cart-outline" size={64} color={contextThemeColors.primary} style={{marginBottom: 16}} />
              <Text style={{color: contextThemeColors.textSecondary, fontSize: 18, marginBottom: 8}}>Giỏ hàng của bạn đang trống</Text>
              <Text style={{color: contextThemeColors.textSecondary, fontSize: 14, marginBottom: 20}}>Hãy chọn sản phẩm yêu thích và thêm vào giỏ hàng nhé!</Text>
              <TouchableOpacity style={{backgroundColor: contextThemeColors.primary, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32}} onPress={onBack}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Tiếp tục mua sắm</Text>
              </TouchableOpacity>
            </View>
          ) : cart.map(item => (
            <View key={item.id + '-' + item.size + '-' + item.color} style={[styles.cartItem, { backgroundColor: contextThemeColors.grayLight }] }>
              <Image 
                source={
                  item.image
                    ? (typeof item.image === 'string' && item.image.startsWith('http')
                        ? { uri: item.image }
                        : imageMap[item.image] || require('../../assets/img_icon/image_giay.jpg'))
                    : require('../../assets/img_icon/image_giay.jpg')
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
                  <Text style={[styles.cartMetaText, { color: contextThemeColors.text }]}>{item.colorName ? item.colorName : item.color}</Text>
                  <Text style={[styles.cartMetaText, { color: contextThemeColors.text }]}>|</Text>
                  <Text style={[styles.cartMetaText, { color: contextThemeColors.text }]}>{`Size ${item.size}`}</Text>
                </View>
                <View style={[styles.cartActions, { backgroundColor: contextThemeColors.background }] }>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.size, item.color, -1)}>
                    <Ionicons name="remove" size={18} color={contextThemeColors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.qtyText, { color: contextThemeColors.text }]}>{item.qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.size, item.color, 1)}>
                    <Ionicons name="add" size={18} color={contextThemeColors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.trashBtn} onPress={() => removeItem(item.id, item.size, item.color)}>
                <Ionicons name="trash-outline" size={22} color={contextThemeColors.danger} />
              </TouchableOpacity>
            </View>
          ))}
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
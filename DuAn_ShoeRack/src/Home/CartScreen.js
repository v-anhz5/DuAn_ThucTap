import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { ThemeContext } from '../theme/ThemeContext';
import { API_URLS } from '../utils/apiConfig';
import { useFocusEffect } from '@react-navigation/native';

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

const colorNameToHex = {
  'đen': '#000000',
  'trắng': '#ffffff',
  'đỏ': '#ff0000',
  'xanh dương': '#0000ff',
  'vàng': '#ffff00',
  'xanh lá': '#00ff00',
  'cam': '#ffa500'
};

const { width } = Dimensions.get('window');

export default function CartScreen({ onBack, onCheckout, cart, setCart, themeColors, fetchCart }) {
  const { themeColors: contextThemeColors } = useContext(ThemeContext);

  // Luôn fetch cart theo userId khi vào màn hình
  useFocusEffect(
    React.useCallback(() => {
      const fetchUserCart = async () => {
        const userStr = await AsyncStorage.getItem('user');
        console.log('DEBUG USER STRING:', userStr);
        if (userStr) {
          const user = JSON.parse(userStr);
          const url = API_URLS.CART_BY_USER(user.id);
          console.log('DEBUG GET CART URL:', url);
          try {
            const res = await fetch(url);
            const data = await res.json();
            console.log('DEBUG CART DATA:', data);
            setCart(data);
          } catch (e) {
            console.log('DEBUG CART FETCH ERROR:', e);
            setCart([]);
          }
        } else {
          setCart([]);
        }
      };
      fetchUserCart();
    }, [])
  );

  const updateQty = async (id, size, color, delta) => {
    try {
      // Lấy item hiện tại
      const item = cart.find(item => item.id === id && item.size === size && item.color === color);
      if (!item) return;
      const newQty = Math.max(1, item.qty + delta);
      await fetch(API_URLS.CART_ITEM(id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty: newQty })
      });
      // Refetch lại cart từ backend
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const res = await fetch(API_URLS.CART_BY_USER(user.id));
        const data = await res.json();
        setCart(data);
      } else {
        setCart([]);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi cập nhật số lượng!' });
    }
  };

  const removeItem = async (id, size, color) => {
    try {
      await fetch(API_URLS.CART_ITEM(id), { method: 'DELETE' });
      // Refetch lại cart từ backend
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const res = await fetch(API_URLS.CART_BY_USER(user.id));
        const data = await res.json();
        setCart(data);
      } else {
        setCart([]);
      }
      Toast.show({ type: 'success', text1: 'Đã xóa sản phẩm khỏi giỏ hàng!' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi xóa sản phẩm!' });
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <View style={{flex:1}}>
      {/* Header với nút back */}
      <View style={[styles.headerContainer, { backgroundColor: contextThemeColors.background }]}>
        <TouchableOpacity onPress={onBack} style={[styles.backButton, { backgroundColor: contextThemeColors.background }]}>
          <Ionicons name="arrow-back" size={24} color={contextThemeColors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: contextThemeColors.text }]}>Giỏ hàng</Text>
          <Text style={[styles.headerSubtitle, { color: contextThemeColors.textSecondary }]}>
            {itemCount} sản phẩm
          </Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={22} color={contextThemeColors.text} />
        </TouchableOpacity>
      </View>

      <View style={[styles.container, { backgroundColor: contextThemeColors.background }]}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {cart.length === 0 ? (
            <View style={styles.emptyCartContainer}>
              <View style={[styles.emptyCartIcon, { backgroundColor: contextThemeColors.grayLight }]}>
                <Ionicons name="cart-outline" size={64} color={contextThemeColors.primary} />
              </View>
              <Text style={[styles.emptyCartTitle, { color: contextThemeColors.text }]}>
                Giỏ hàng của bạn đang trống
              </Text>
              <Text style={[styles.emptyCartSubtitle, { color: contextThemeColors.textSecondary }]}>
                Hãy chọn sản phẩm yêu thích và thêm vào giỏ hàng nhé!
              </Text>
              <TouchableOpacity 
                style={[styles.continueShoppingBtn, { backgroundColor: contextThemeColors.primary }]} 
                onPress={onBack}
              >
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.continueShoppingText}>Tiếp tục mua sắm</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Danh sách sản phẩm */}
              {cart.map((item, index) => (
                <View key={`${item.id}-${item.size}-${item.color}`} style={[styles.cartItemCard, { backgroundColor: contextThemeColors.background }]}>
                  {/* Ảnh sản phẩm */}
                  <View style={styles.imageContainer}>
                    <Image 
                      source={
                        item.image
                          ? (typeof item.image === 'string' && item.image.startsWith('http')
                              ? { uri: item.image }
                              : imageMap[item.image] || require('../../assets/img_icon/image_giay.jpg'))
                          : require('../../assets/img_icon/image_giay.jpg')
                      }
                      style={styles.productImage} 
                    />
                    {/* Badge số lượng */}
                    <View style={[styles.quantityBadge, { backgroundColor: contextThemeColors.primary }]}>
                      <Text style={styles.quantityBadgeText}>{item.qty}</Text>
                    </View>
                  </View>

                  {/* Thông tin sản phẩm */}
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: contextThemeColors.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    
                    <View style={styles.productMeta}>
                      <View style={styles.sizeColorContainer}>
                        <View style={[styles.cartColorCircle, {backgroundColor: colorNameToHex[item.color] || '#fff', borderColor: contextThemeColors.border}]} />
                        <Text style={[styles.metaText, { color: contextThemeColors.textSecondary }]}>
                          Size {item.size} • {item.color}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.priceContainer}>
                      <Text style={[styles.priceText, { color: contextThemeColors.primary }]}>
                        {item.price?.toLocaleString('vi-VN')} ₫
                      </Text>
                      <Text style={[styles.totalPriceText, { color: contextThemeColors.text }]}>
                        Tổng: {(item.price * item.qty)?.toLocaleString('vi-VN')} ₫
                      </Text>
                    </View>

                    {/* Controls */}
                    <View style={styles.controlsContainer}>
                      <View style={[styles.quantityControls, { backgroundColor: contextThemeColors.grayLight }]}>
                        <TouchableOpacity 
                          style={[styles.quantityBtn, { backgroundColor: contextThemeColors.background }]}
                          onPress={() => updateQty(item.id, item.size, item.color, -1)}
                        >
                          <Ionicons name="remove" size={16} color={contextThemeColors.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.quantityText, { color: contextThemeColors.text }]}>
                          {item.qty}
                        </Text>
                        <TouchableOpacity 
                          style={[styles.quantityBtn, { backgroundColor: contextThemeColors.background }]}
                          onPress={() => updateQty(item.id, item.size, item.color, 1)}
                        >
                          <Ionicons name="add" size={16} color={contextThemeColors.primary} />
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity 
                        style={[styles.removeBtn, { backgroundColor: contextThemeColors.danger }]}
                        onPress={() => removeItem(item.id, item.size, item.color)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* Footer với tổng tiền và nút thanh toán */}
        {cart.length > 0 && (
          <View style={[styles.footer, { backgroundColor: contextThemeColors.background, borderColor: contextThemeColors.border }]}>
            <View style={styles.totalContainer}>
              <Text style={[styles.totalLabel, { color: contextThemeColors.textSecondary }]}>
                Tổng cộng ({itemCount} sản phẩm)
              </Text>
              <Text style={[styles.totalAmount, { color: contextThemeColors.text }]}>
                {total.toLocaleString('vi-VN')} ₫
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutBtn, { backgroundColor: contextThemeColors.primary }]} 
              onPress={onCheckout}
            >
              <Ionicons name="card-outline" size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.checkoutBtnText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 0 
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  searchButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  emptyCartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyCartIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyCartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCartSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  continueShoppingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  continueShoppingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    minHeight: 80,
    maxHeight: 100,
  },
  imageContainer: {
    marginRight: 8,
    position: 'relative',
  },
  productImage: { 
    width: 60, 
    height: 60, 
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  quantityBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  quantityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    minHeight: 60,
    justifyContent: 'center',
  },
  productName: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 2,
    lineHeight: 18,
  },
  productMeta: {
    marginBottom: 4,
  },
  sizeColorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartColorCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  metaText: {
    fontSize: 11,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  totalPriceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    padding: 2,
  },
  quantityBtn: {
    padding: 4,
    borderRadius: 4,
    marginHorizontal: 2,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginHorizontal: 6,
    minWidth: 16,
    textAlign: 'center',
  },
  removeBtn: {
    padding: 8,
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
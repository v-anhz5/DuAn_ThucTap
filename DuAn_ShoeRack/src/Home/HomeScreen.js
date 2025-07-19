import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProfileScreen from './ProfileScreen';
import CartScreen from './CartScreen';
import ProductDetailScreen from './ProductDetailScreen';
import NotificationScreen from './NotificationScreen';
import CheckoutScreen from './CheckoutScreen';
import OrderSuccessScreen from './OrderSuccessScreen';
import { ThemeContext } from '../theme/ThemeContext';
import Toast from 'react-native-toast-message';
import { useIsFocused } from '@react-navigation/native';
import { getImageSource } from '../utils/imageHelper';
import { API_URLS } from '../utils/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef } from 'react';

const BRANDS = [
  { name: 'Nike', icon: require('../../assets/img_icon/icon_nike.jpg') },
  { name: 'Puma', icon: require('../../assets/img_icon/icon_puma.png') },
  { name: 'Adidas', icon: require('../../assets/img_icon/icon_adidas.png') },
  { name: 'Vans', icon: require('../../assets/img_icon/icon_vans.webp') },
  { name: 'FILA', icon: require('../../assets/img_icon/icon_fila.png') },
  { name: 'Under ', icon: require('../../assets/img_icon/under-armour-logo.png') },
  { name: 'Red Tape', icon: require('../../assets/img_icon/icon_Red Tape.png') },
  { name: 'All', isAll: true },
];

const PRODUCTS = [
  {
    id: '1',
    name: 'Puma Black & White',
    brand: 'Puma',
    price: 2300,
    oldPrice: 2500,
    rating: 4.5,
    image: require('../../assets/img_icon/image_giay.jpg'),
    sizes: [40, 41, 42, 43],
    colors: ['#e53935', '#fbc02d', '#43a047', '#fff'],
    description: 'Giày Puma Black & White cực chất, phù hợp mọi hoạt động.',
    discount: 35,
    sold: 500,
  },
  {
    id: '2',
    name: 'ADIDAS Classic',
    brand: 'Adidas',
    price: 1619,
    oldPrice: 1799,
    rating: 4.7,
    image: require('../../assets/img_icon/image_giay.jpg'),
    sizes: [40, 41, 42, 43],
    colors: ['#e53935', '#fbc02d', '#43a047', '#fff'],
    description: 'ADIDAS Classic - thiết kế thể thao, năng động, bền bỉ.',
    discount: 20,
    sold: 320,
  },
  {
    id: '3',
    name: 'Puma Black',
    brand: 'Puma',
    price: 1099,
    oldPrice: 1699,
    rating: 4.5,
    image: require('../../assets/img_icon/image_giay.jpg'),
    sizes: [40, 41, 42, 43],
    colors: ['#e53935', '#fbc02d', '#43a047', '#fff'],
    description: 'Puma Black - đơn giản, tinh tế, dễ phối đồ.',
    discount: 15,
    sold: 210,
  },
  {
    id: '4',
    name: 'ADIDAS Solid Active',
    brand: 'Adidas',
    price: 1519,
    oldPrice: 1800,
    rating: 4.9,
    image: require('../../assets/img_icon/image_giay.jpg'),
    sizes: [40, 41, 42, 43],
    colors: ['#e53935', '#fbc02d', '#43a047', '#fff'],
    description: 'ADIDAS Solid Active - bền bỉ, mạnh mẽ, dành cho vận động viên.',
    discount: 25,
    sold: 410,
  },
];

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

export default function HomeScreen({ navigation }) {
  const { themeColors } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const isFocused = useIsFocused();
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerScrollRef = useRef();
  const { width } = Dimensions.get('window');
  const BANNER_WIDTH = Math.round(width * 0.9);
  const bannerHeight = 120;
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCartFromBackend = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    try {
      const res = await fetch(API_URLS.CART_BY_USER(user.id));
      let data = await res.json();
      setCart(data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi tải giỏ hàng!' });
    }
  };

  const fetchUnreadCount = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) {
      setUnreadCount(0);
      return;
    }
    const user = JSON.parse(userStr);
    try {
      const res = await fetch(API_URLS.NOTIFICATIONS_BY_USER(user.id));
      const data = await res.json();
      const unread = Array.isArray(data) ? data.filter(n => !n.read).length : 0;
      setUnreadCount(unread);
    } catch {
      setUnreadCount(0);
    }
  };

  const allSizes = Array.from(new Set(products.flatMap(p => p.sizes || [])));
  const allColors = Array.from(new Set(products.flatMap(p => p.colors || [])));

  useEffect(() => {
    setLoading(true);
    fetch(API_URLS.PRODUCTS())
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        console.error('Lỗi fetch sản phẩm:', err);
      });
  }, []);

  useEffect(() => {
    fetchCartFromBackend();
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [activeTab]);

  // Tự động chuyển slide
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (bannerIndex + 1) % banners.length;
      setBannerIndex(nextIndex);
      bannerScrollRef.current?.scrollTo({ x: nextIndex * BANNER_WIDTH, animated: true });
    }, 3000);
    return () => clearInterval(interval);
  }, [bannerIndex]);

  // Lắng nghe notification realtime và cập nhật unreadCount
  useEffect(() => {
    // Giả sử bạn có thể lấy notifications từ NotificationScreen hoặc fetch lại ở đây
    // Để đơn giản, thêm prop onUnreadCountChange vào NotificationScreen
  }, []);

  const filteredProducts = products.filter(product => {
    if (selectedBrand && product.brand !== selectedBrand) return false;
    if (searchText && !product.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (minPrice && product.price < parseInt(minPrice)) return false;
    if (maxPrice && product.price > parseInt(maxPrice)) return false;
    if (selectedSize && !(product.sizes || []).includes(selectedSize)) return false;
    if (selectedColor && !(product.colors || []).includes(selectedColor)) return false;
    return true;
  });

  const addToCart = (product, size, color) => {
    if (!size || !color) {
      Alert.alert('Vui lòng chọn đầy đủ size và màu sắc!');
      return;
    }
    const idx = cart.findIndex(
      item => item.id === product.id && item.size === size && item.color === color
    );
    if (idx !== -1) {
      const newCart = [...cart];
      newCart[idx].qty += 1;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          desc: product.desc,
          image: product.image,
          size,
          color,
          qty: 1,
          price: product.price,
        },
      ]);
    }
    setShowProductDetail(false);
    setActiveTab('cart');
  };

  const deleteProduct = (productId) => {
    fetch(`http://192.168.1.6:4000/products/${productId}`, {
      method: 'DELETE',
    })
      .then(res => res.json())
      .then(data => {
        Toast.show({ type: 'success', text1: 'Đã xóa sản phẩm!' });
      })
      .catch(err => {
        Toast.show({ type: 'error', text1: 'Xóa sản phẩm thất bại!' });
      });
  };

  // Thêm skeleton loader cho sản phẩm
  const renderSkeleton = () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 }}>
      {[1,2,3,4].map(i => (
        <View key={i} style={{ width: 155, height: 220, backgroundColor: '#f0f0f0', borderRadius: 16, marginBottom: 20, marginRight: i%2===0?0:10, marginLeft: i%2===0?10:0, padding: 12 }}>
          <View style={{ width: 140, height: 140, backgroundColor: '#e0e0e0', borderRadius: 12, marginBottom: 12 }} />
          <View style={{ width: 100, height: 18, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 8 }} />
          <View style={{ width: 60, height: 14, backgroundColor: '#e0e0e0', borderRadius: 4, marginBottom: 6 }} />
          <View style={{ width: 80, height: 14, backgroundColor: '#e0e0e0', borderRadius: 4 }} />
        </View>
      ))}
    </View>
  );

  const banners = [
    {
      title: '25% Today Special',
      desc: 'Get discount for every order, only valid today',
      img: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/7b6e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/air-max-90-shoe.png',
      bg: themeColors.primary
    },
    {
      title: 'FREESHIP toàn quốc',
      desc: 'Miễn phí vận chuyển cho đơn từ 500K',
      img: 'https://pngimg.com/d/shoes_PNG5746.png',
      bg: '#43e97b'
    },
    {
      title: 'Mua 1 tặng 1',
      desc: 'Chỉ áp dụng cho Adidas & Puma',
      img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308', // <-- Link ảnh mẫu hoạt động tốt
      bg: '#fff'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {showProductDetail && selectedProduct ? (
        <ProductDetailScreen
          onBack={() => setShowProductDetail(false)}
          addToCart={addToCart}
          product={selectedProduct}
          productId={selectedProduct.id}
          onCheckoutProduct={(product, size, color) => {
            if (!size || !color) return;
            setShowProductDetail(false);
            setCart([{ ...product, size, color, qty: 1, price: product.price, name: product.name, desc: product.desc, image: product.image }]);
            setShowCheckout(true);
          }}
          themeColors={themeColors}
          fetchCart={fetchCartFromBackend}
        />
      ) : showOrderSuccess ? (
        <OrderSuccessScreen onBack={() => { setShowOrderSuccess(false); setShowCheckout(false); setCart([]); }} themeColors={themeColors} />
      ) : showCheckout ? (
        <CheckoutScreen onBack={() => setShowCheckout(false)} cart={cart} setCart={setCart} themeColors={themeColors} onOrderSuccess={() => setShowOrderSuccess(true)} fetchCart={fetchCartFromBackend} />
      ) : activeTab === 'user' ? (
        <ProfileScreen onBack={() => setActiveTab('home')} navigation={navigation} themeColors={themeColors} onUnreadCountChange={setUnreadCount} />
      ) : activeTab === 'cart' ? (
        <CartScreen onBack={() => setActiveTab('home')} cart={cart} setCart={setCart} onCheckout={() => setShowCheckout(true)} themeColors={themeColors} fetchCart={fetchCartFromBackend} />
      ) : activeTab === 'notification' ? (
        <NotificationScreen onBack={() => setActiveTab('home')} onUnreadCountChange={setUnreadCount} />
      ) : (
        <FlatList
          data={loading ? [] : filteredProducts}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          columnWrapperStyle={styles.productRow}
          extraData={products}
          removeClippedSubviews={false}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <Text style={[styles.logo, { color: themeColors.text }]}><Text style={{ color: themeColors.primary }}>SHOE</Text>RACK</Text>
                <TouchableOpacity>
                  <Ionicons name="cart-outline" size={28} color={themeColors.primary} />
                </TouchableOpacity>
              </View>
              <View style={[styles.searchContainer, { backgroundColor: themeColors.grayLight }]}>
                <Ionicons name="search-outline" size={22} color={themeColors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: themeColors.text }]}
                  placeholder="Tìm kiếm sản phẩm..."
                  placeholderTextColor={themeColors.textSecondary}
                  value={searchText}
                  onChangeText={setSearchText}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                <View style={styles.filterGroup}>
                  <Text style={[styles.filterLabel, { color: themeColors.textSecondary }]}>Giá:</Text>
                  <TextInput
                    style={[styles.filterInput, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }]}
                    placeholder="Từ"
                    placeholderTextColor={themeColors.textSecondary}
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.filterSeparator, { color: themeColors.textSecondary }]}>-</Text>
                  <TextInput
                    style={[styles.filterInput, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }]}
                    placeholder="Đến"
                    placeholderTextColor={themeColors.textSecondary}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.filterGroup}>
                  <Text style={[styles.filterLabel, { color: themeColors.textSecondary }]}>Size:</Text>
                  {allSizes.map(size => (
                    <TouchableOpacity
                      key={size}
                      style={[styles.filterButton, selectedSize === size ? { backgroundColor: themeColors.primary } : { backgroundColor: themeColors.background, borderColor: themeColors.border }]}
                      onPress={() => setSelectedSize(selectedSize === size ? null : size)}
                    >
                      <Text style={[styles.filterButtonText, { color: selectedSize === size ? '#fff' : themeColors.text }]}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.filterGroup}>
                  <Text style={[styles.filterLabel, { color: themeColors.textSecondary }]}>Màu:</Text>
                  {allColors.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={[styles.colorButton, { backgroundColor: color, borderColor: selectedColor === color ? themeColors.primary : themeColors.border }]}
                      onPress={() => setSelectedColor(selectedColor === color ? null : color)}
                    >
                      {selectedColor === color && <Ionicons name="checkmark" size={16} color={color === '#fff' ? themeColors.primary : '#fff'} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {/* Banner Carousel */}
              <ScrollView
                ref={bannerScrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={e => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
                  setBannerIndex(idx);
                }}
                style={{ marginBottom: 12, marginTop: 10 }}
                contentContainerStyle={{ paddingHorizontal: (width - BANNER_WIDTH) / 2 }}
              >
                {banners.map((banner, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.banner,
                      {
                        backgroundColor: banner.bg,
                        width: BANNER_WIDTH,
                        height: bannerHeight,
                        marginRight: idx < banners.length - 1 ? 12 : 0,
                        marginLeft: idx === 0 ? 0 : 0,
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 2,
                        padding: 0,
                        overflow: 'hidden',
                        position: 'relative',
                        borderRadius: 16,
                      },
                    ]}
                  >
                    {idx === 2 ? (
                      <Image
                        source={{ uri: banner.img }}
                        style={{
                          position: 'absolute',
                          top: 0, left: 0,
                          width: BANNER_WIDTH,
                          height: bannerHeight,
                          borderRadius: 16,
                          resizeMode: 'cover',
                        }}
                      />
                    ) : null}
                    <View style={{ flex: 1, zIndex: 1, padding: 16 }}>
                      <Text style={styles.bannerTitle}>{banner.title}</Text>
                      <Text style={styles.bannerDesc}>{banner.desc}</Text>
                    </View>
                    {idx !== 2 && (
                      <Image source={{ uri: banner.img }} style={styles.bannerImage} />
                    )}
                  </View>
                ))}
              </ScrollView>
              {/* Dot indicator */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
                {banners.map((_, idx) => (
                  <View key={idx} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: bannerIndex === idx ? themeColors.primary : '#ccc', marginHorizontal: 3 }} />
                ))}
              </View>
              {(() => {
                let brandsToShow = [...BRANDS];
                while (brandsToShow.length < 8) brandsToShow.push({ name: '', isEmpty: true });
                const row1 = brandsToShow.slice(0, 4);
                const row2 = brandsToShow.slice(4, 8);
                return (
                  <>
                    <View style={styles.brandRow}>
                      {row1.map((brand, idx) => (
                        <TouchableOpacity
                          key={brand.name || idx}
                          style={[styles.brandItem, selectedBrand === brand.name && styles.brandItemActive]}
                          onPress={() => brand.isAll ? setSelectedBrand(null) : brand.name ? setSelectedBrand(selectedBrand === brand.name ? null : brand.name) : null}
                          activeOpacity={brand.name ? 0.7 : 1}
                          disabled={brand.isEmpty}
                        >
                          {brand.isAll ? (
                            <View style={[styles.brandIconImg, { backgroundColor: themeColors.grayLight }]}>
                              <Ionicons name="ellipsis-horizontal" size={28} color={themeColors.textSecondary} />
                            </View>
                          ) : brand.name ? (
                            <Image source={brand.icon} style={styles.brandIconImg} />
                          ) : (
                            <View style={styles.brandIconImg} />
                          )}
                          <Text style={[styles.brandText, selectedBrand === brand.name && styles.brandTextActive]}>{brand.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.brandRow}>
                      {row2.map((brand, idx) => (
                        <TouchableOpacity
                          key={brand.name || idx}
                          style={[styles.brandItem, selectedBrand === brand.name && styles.brandItemActive]}
                          onPress={() => brand.isAll ? setSelectedBrand(null) : brand.name ? setSelectedBrand(selectedBrand === brand.name ? null : brand.name) : null}
                          activeOpacity={brand.name ? 0.7 : 1}
                          disabled={brand.isEmpty}
                        >
                          {brand.isAll ? (
                            <View style={[styles.brandIconImg, { backgroundColor: themeColors.grayLight }]}>
                              <Ionicons name="ellipsis-horizontal" size={28} color={themeColors.textSecondary} />
                            </View>
                          ) : brand.name ? (
                            <Image source={brand.icon} style={styles.brandIconImg} />
                          ) : (
                            <View style={styles.brandIconImg} />
                          )}
                          <Text style={[styles.brandText, selectedBrand === brand.name && styles.brandTextActive]}>{brand.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                );
              })()}
              <View style={styles.brandDivider} />
              <View style={styles.popularHeader}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.popularTitle, { color: themeColors.text }]}>Most Popular</Text>
                  <View style={[styles.titleUnderline, { backgroundColor: themeColors.primary }]} />
                </View>
                <TouchableOpacity onPress={() => setSelectedBrand(null)} style={styles.seeAllButton}>
                  <Text style={[styles.seeAll, { color: themeColors.primary }]}>SEE ALL</Text>
                  <Ionicons name="chevron-forward" size={16} color={themeColors.primary} />
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
            loading ? renderSkeleton() : (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconContainer, { backgroundColor: themeColors.grayLight }]}>
                  <Ionicons name="cube-outline" size={64} color={themeColors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: themeColors.text }]}>Không có sản phẩm nào</Text>
                <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>Hãy thử chọn hãng khác hoặc quay lại sau.</Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.productCard, { backgroundColor: themeColors.background }]}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedProduct(item);
                setShowProductDetail(true);
              }}
            >
              <View style={styles.imageWrapper}>
                <Image source={getImageSource(item.image)} style={styles.productImage} />
                {item.discount > 0 && (
                  <View style={[styles.saleTag, { backgroundColor: themeColors.primary }]}>
                    <Text style={styles.saleTagText}>{`-${item.discount}%`}</Text>
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: themeColors.text }]} numberOfLines={2}>{item.name}</Text>
                <View style={styles.ratingContainer}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.rating, { color: themeColors.text }]}>{item.rating}</Text>
                  </View>
                  <Text style={[styles.reviewCount, { color: themeColors.textSecondary }]}>(150+)</Text>
                </View>
                <View style={styles.priceRowWrap}>
                  <View style={styles.priceBoxLeftClean}>
                    <Text style={[styles.priceCurrentClean, { color: themeColors.primary }]}>{item.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                    {item.oldPrice && (
                      <Text style={[styles.priceOldClean, { color: themeColors.textSecondary }]}>{item.oldPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      {activeTab === 'home' && !showProductDetail && !showCheckout && (
        <View style={[styles.bottomNav, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
          <TouchableOpacity style={[styles.navItem, activeTab === 'home' && styles.navItemActive]} onPress={() => setActiveTab('home')}>
            <Ionicons name={activeTab === 'home' ? 'home' : 'home-outline'} size={26} color={activeTab === 'home' ? themeColors.primary : themeColors.text} />
            <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>Trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, activeTab === 'cart' && styles.navItemActive]} onPress={() => setActiveTab('cart')}>
            <Ionicons name={activeTab === 'cart' ? 'cart' : 'cart-outline'} size={26} color={activeTab === 'cart' ? themeColors.primary : themeColors.text} />
            <Text style={[styles.navLabel, activeTab === 'cart' && styles.navLabelActive]}>Giỏ hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeTab === 'notification' ? styles.navItemActive : styles.navItem} onPress={() => setActiveTab('notification')}>
            <View style={{ position: 'relative' }}>
              <Ionicons name={activeTab === 'notification' ? 'notifications' : 'notifications-outline'} size={26} color={activeTab === 'notification' ? themeColors.primary : themeColors.text} />
              {unreadCount > 0 && (
                <View style={{
                  position: 'absolute', top: -4, right: -8,
                  backgroundColor: '#ff5252', borderRadius: 8, minWidth: 16, height: 16,
                  alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4
                }}>
                  <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>{unreadCount}</Text>
                </View>
              )}
            </View>
            <Text style={activeTab === 'notification' ? styles.navLabelActive : styles.navLabel}>Thông báo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navItem, activeTab === 'user' && styles.navItemActive]} onPress={() => setActiveTab('user')}>
            <Ionicons name={activeTab === 'user' ? 'person' : 'person-outline'} size={26} color={activeTab === 'user' ? themeColors.primary : themeColors.text} />
            <Text style={[styles.navLabel, activeTab === 'user' && styles.navLabelActive]}>Cá nhân</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontFamily: 'System', // Consider using a custom bold font
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'System', // Consider using a custom font
  },
  filterContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  filterInput: {
    width: 60,
    borderRadius: 8,
    padding: 6,
    fontSize: 14,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  filterSeparator: {
    fontSize: 14,
    marginHorizontal: 4,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  colorButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerContainer: {
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  banner: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    color: '#ffffff',
    fontFamily: 'System', // Consider using a custom bold font
  },
  bannerDesc: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  bannerImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginLeft: 12,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  brandItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
  },
  brandItemActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  brandIconImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    borderRadius: 20,
    marginBottom: 6,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  brandTextActive: {
    color: '#3ec6a7',
    fontWeight: '700',
  },
  brandDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
    marginVertical: 12,
  },
  popularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  titleContainer: {
    flex: 1,
  },
  popularTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: 'System', // Consider using a custom bold font
  },
  titleUnderline: {
    width: 50,
    height: 4,
    borderRadius: 2,
    marginTop: 6,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(62, 198, 167, 0.1)',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  productCard: {
    width: '48%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  saleTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saleTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
    paddingTop: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    fontWeight: '400',
  },
  priceRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceBoxLeftClean: {
    flexDirection: 'column',
  },
  priceCurrentClean: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  priceOldClean: {
    fontSize: 12,
    fontWeight: '400',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    borderTopWidth: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(62, 198, 167, 0.05)',
    borderTopWidth: 2,
    borderTopColor: '#3ec6a7',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  navLabelActive: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    color: '#3ec6a7',
  },
});
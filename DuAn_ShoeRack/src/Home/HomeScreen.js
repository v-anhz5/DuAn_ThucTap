import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
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
// import io from 'socket.io-client'; // Xóa dòng này

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

// Thêm map tĩnh cho ảnh cục bộ
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

  // Lấy tất cả size và màu có trong products
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

  // Khi chuyển sang tab giỏ hàng
  useEffect(() => {
    if (activeTab === 'cart') {
      fetchCartFromBackend();
    }
  }, [activeTab]);

  // Lọc sản phẩm theo filter
  const filteredProducts = products.filter(product => {
    if (selectedBrand && product.brand !== selectedBrand) return false;
    if (searchText && !product.name.toLowerCase().includes(searchText.toLowerCase())) return false;
    if (minPrice && product.price < parseInt(minPrice)) return false;
    if (maxPrice && product.price > parseInt(maxPrice)) return false;
    if (selectedSize && !(product.sizes || []).includes(selectedSize)) return false;
    if (selectedColor && !(product.colors || []).includes(selectedColor)) return false;
    return true;
  });

  // Hàm thêm vào giỏ hàng
  const addToCart = (product, size, color) => {
    if (!size || !color) {
      Alert.alert('Vui lòng chọn đầy đủ size và màu sắc!');
      return;
    }
    // Kiểm tra đã có sản phẩm cùng id, size, color chưa
    const idx = cart.findIndex(
      item => item.id === product.id && item.size === size && item.color === color
    );
    if (idx !== -1) {
      // Đã có, tăng số lượng
      const newCart = [...cart];
      newCart[idx].qty += 1;
      setCart(newCart);
    } else {
      // Thêm mới
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

  // Hàm xóa sản phẩm
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

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }] }>
      {showProductDetail && selectedProduct ? (
        <ProductDetailScreen
          onBack={() => setShowProductDetail(false)}
          addToCart={addToCart}
          product={selectedProduct}
          productId={selectedProduct.id} // Sửa lại: truyền đúng product.id
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
        <ProfileScreen onBack={() => setActiveTab('home')} navigation={navigation} themeColors={themeColors} />
      ) : activeTab === 'cart' ? (
        <CartScreen onBack={() => setActiveTab('home')} cart={cart} setCart={setCart} onCheckout={() => setShowCheckout(true)} themeColors={themeColors} fetchCart={fetchCartFromBackend} />
      ) : activeTab === 'notification' ? (
        <NotificationScreen onBack={() => setActiveTab('home')} themeColors={themeColors} />
      ) : (
        <FlatList
          data={loading ? [] : filteredProducts}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          columnWrapperStyle={styles.productRow}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.logo}><Text style={{color:themeColors.primary}}>SHOE</Text>RACK</Text>
                <TouchableOpacity>
                  <Text style={[styles.cartIcon, { color: themeColors.primary }]}>🛒</Text>
                </TouchableOpacity>
              </View>
              {/* Search + Filter */}
              {/* Đảm bảo ô tìm kiếm rõ ràng, UX tốt */}
              <View style={[styles.searchContainer, { backgroundColor: themeColors.grayLight }]}> 
                <Ionicons name="search-outline" size={20} style={styles.searchIcon} color={themeColors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: themeColors.text }]} 
                  placeholder="Tìm kiếm sản phẩm theo tên..." 
                  placeholderTextColor={themeColors.textSecondary}
                  value={searchText}
                  onChangeText={setSearchText}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                  autoCorrect={false}
                  autoCapitalize="none"
                />
              </View>
              {/* Filter UI */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 10, marginTop: 4, paddingHorizontal: 10}}>
                {/* Giá */}
                <View style={{flexDirection:'row',alignItems:'center',marginRight:12}}>
                  <Text style={{color:themeColors.textSecondary, fontSize:13, marginRight:4}}>Giá:</Text>
                  <TextInput
                    style={{width:50,backgroundColor:themeColors.background,borderRadius:6,padding:4,color:themeColors.text,borderWidth:1,borderColor:themeColors.border,marginRight:2,fontSize:13}}
                    placeholder="Từ"
                    placeholderTextColor={themeColors.textSecondary}
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                  />
                  <Text style={{color:themeColors.textSecondary, fontSize:13}}>-</Text>
                  <TextInput
                    style={{width:50,backgroundColor:themeColors.background,borderRadius:6,padding:4,color:themeColors.text,borderWidth:1,borderColor:themeColors.border,marginLeft:2,fontSize:13}}
                    placeholder="Đến"
                    placeholderTextColor={themeColors.textSecondary}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                  />
                </View>
                {/* Size */}
                <View style={{flexDirection:'row',alignItems:'center',marginRight:12}}>
                  <Text style={{color:themeColors.textSecondary, fontSize:13, marginRight:4}}>Size:</Text>
                  {allSizes.map(size => (
                    <TouchableOpacity
                      key={size}
                      style={{paddingHorizontal:8,paddingVertical:4,backgroundColor:selectedSize===size?themeColors.primary:themeColors.background,borderRadius:6,marginRight:4,borderWidth:1,borderColor:selectedSize===size?themeColors.primary:themeColors.border}}
                      onPress={() => setSelectedSize(selectedSize===size?null:size)}
                    >
                      <Text style={{color:selectedSize===size?'#fff':themeColors.text,fontWeight:selectedSize===size?'bold':'normal'}}>{size}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {/* Màu */}
                <View style={{flexDirection:'row',alignItems:'center'}}>
                  <Text style={{color:themeColors.textSecondary, fontSize:13, marginRight:4}}>Màu:</Text>
                  {allColors.map(color => (
                    <TouchableOpacity
                      key={color}
                      style={{width:22,height:22,borderRadius:11,backgroundColor:color,borderWidth:2,borderColor:selectedColor===color?themeColors.primary:themeColors.border,marginRight:6,alignItems:'center',justifyContent:'center'}}
                      onPress={() => setSelectedColor(selectedColor===color?null:color)}
                    >
                      {selectedColor===color && <Ionicons name="checkmark" size={14} color={color==='#fff'?themeColors.primary:'#fff'} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {/* Banner Carousel */}
              <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{marginBottom:18, marginTop:2}} contentContainerStyle={{paddingHorizontal: 10}}>
                {[{
                  title: '25% Today Special',
                  desc: 'Get discount for every order, only valid today',
                  img: 'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/7b6e2e2e-2e2e-4e2e-8e2e-2e2e2e2e2e2e/air-max-90-shoe.png',
                  bg: themeColors.primary
                }, {
                  title: 'FREESHIP toàn quốc',
                  desc: 'Miễn phí vận chuyển cho đơn từ 500K',
                  img: 'https://pngimg.com/d/shoes_PNG5746.png',
                  bg: '#43e97b'
                }, {
                  title: 'Mua 1 tặng 1',
                  desc: 'Chỉ áp dụng cho Adidas & Puma',
                  img: 'https://pngimg.com/d/running_shoes_PNG5816.png',
                  bg: '#fff'
                }].map((banner, idx) => (
                  <View key={idx} style={[styles.banner, { backgroundColor: banner.bg, marginRight: 14, minWidth: 320, maxWidth: 340, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 }] }>
                    <View style={{flex:1}}>
                      <Text style={styles.bannerTitle}>{banner.title}</Text>
                      <Text style={styles.bannerDesc}>{banner.desc}</Text>
                    </View>
                    <Image source={{uri: banner.img}} style={styles.bannerImage} />
                  </View>
                ))}
              </ScrollView>
              {/* Brands */}
              {(() => {
                // Đảm bảo luôn có 8 brand (nếu thiếu thì thêm brand rỗng)
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
                          style={[styles.brandItem, brand.isAll ? { opacity: 1 } : {}, selectedBrand === brand.name && styles.brandItemActive]}
                          onPress={() => brand.isAll ? setSelectedBrand(null) : brand.name ? setSelectedBrand(selectedBrand === brand.name ? null : brand.name) : null}
                          activeOpacity={brand.name ? 0.7 : 1}
                          disabled={brand.isEmpty}
                        >
                          {brand.isAll ? (
                            <View style={[styles.brandIconImg, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 16 }] }>
                              <Ionicons name="ellipsis-horizontal" size={28} color="#888" />
                            </View>
                          ) : brand.name ? (
                            <Image
                              source={brand.icon}
                              style={styles.brandIconImg}
                            />
                          ) : (
                            <View style={styles.brandIconImg} />
                          )}
                          <Text style={[styles.brandText, brand.isAll ? { color: '#888' } : {}, selectedBrand === brand.name && styles.brandTextActive]}>
                            {brand.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.brandRow}>
                      {row2.map((brand, idx) => (
                        <TouchableOpacity
                          key={brand.name || idx}
                          style={[styles.brandItem, brand.isAll ? { opacity: 1 } : {}, selectedBrand === brand.name && styles.brandItemActive]}
                          onPress={() => brand.isAll ? setSelectedBrand(null) : brand.name ? setSelectedBrand(selectedBrand === brand.name ? null : brand.name) : null}
                          activeOpacity={brand.name ? 0.7 : 1}
                          disabled={brand.isEmpty}
                        >
                          {brand.isAll ? (
                            <View style={[styles.brandIconImg, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 16 }] }>
                              <Ionicons name="ellipsis-horizontal" size={28} color="#888" />
                            </View>
                          ) : brand.name ? (
                            <Image
                              source={brand.icon}
                              style={styles.brandIconImg}
                            />
                          ) : (
                            <View style={styles.brandIconImg} />
                          )}
                          <Text style={[styles.brandText, brand.isAll ? { color: '#888' } : {}, selectedBrand === brand.name && styles.brandTextActive]}>
                            {brand.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                );
              })()}
              <View style={styles.brandDivider} />
              {/* Most Popular header mới */}
              <View style={styles.popularHeader}>
                <View style={styles.titleContainer}>
                  <Text style={styles.popularTitle}>Most Popular</Text>
                  <View style={styles.titleUnderline} />
                </View>
                <TouchableOpacity 
                  onPress={() => setSelectedBrand(null)}
                  style={styles.seeAllButton}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.seeAll, { color: themeColors.primary }]}>SEE ALL</Text>
                  <Ionicons name="chevron-forward" size={16} color={themeColors.primary} />
                </TouchableOpacity>
              </View>
            </>
          }
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
              </View>
            ) : searchText ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="search-outline" size={48} color={themeColors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
                <Text style={styles.emptySubtitle}>Không có sản phẩm nào phù hợp với từ khóa "{searchText}".</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="cube-outline" size={64} color={themeColors.primary} />
                </View>
                <Text style={styles.emptyTitle}>Không có sản phẩm nào</Text>
                <Text style={styles.emptySubtitle}>Hãy thử chọn hãng khác hoặc quay lại sau.</Text>
              </View>
            )
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.productCard, { backgroundColor: themeColors.grayLight }]}
              activeOpacity={0.8}
              onPress={() => {
                console.log('OPEN PRODUCT DETAIL, productId:', item.id);
                setSelectedProduct(item);
                setShowProductDetail(true);
              }}
            >
              <View style={styles.imageWrapper}>
                <Image 
                  source={getImageSource(item.image)}
                  style={styles.productImage} 
                />
                {item.discount > 0 && (
                  <View style={styles.saleTag}>
                    <Text style={styles.saleTagText}>{`-${item.discount}%`}</Text>
                  </View>
                )}
              </View>
              <View style={styles.productInfo}>
                <Text style={[styles.productName, { color: themeColors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.ratingContainer}>
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.rating}>{item.rating}</Text>
                  </View>
                  <Text style={styles.reviewCount}>(150+)</Text>
                </View>
                <View style={styles.priceRowWrap}>
                  <View style={styles.priceBoxLeftClean}>
                    <Text style={[styles.priceCurrentClean, { color: themeColors.primary }]}>{item.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                    {item.oldPrice && (
                      <Text style={styles.priceOldClean}>{item.oldPrice?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      {/* Bottom Navigation giữ nguyên */}
      {activeTab === 'home' && !showProductDetail && !showCheckout && (
        <View style={[styles.bottomNav, { backgroundColor: themeColors.background, borderColor: themeColors.border }] }>
          <TouchableOpacity style={activeTab === 'home' ? styles.navItemActive : styles.navItem} onPress={() => setActiveTab('home')}>
            <Ionicons name={activeTab === 'home' ? 'home' : 'home-outline'} size={26} color={activeTab === 'home' ? themeColors.primary : themeColors.text} />
            <Text style={activeTab === 'home' ? styles.navLabelActive : styles.navLabel}>Trang chủ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeTab === 'cart' ? styles.navItemActive : styles.navItem} onPress={() => setActiveTab('cart')}>
            <Ionicons name={activeTab === 'cart' ? 'cart' : 'cart-outline'} size={26} color={activeTab === 'cart' ? themeColors.primary : themeColors.text} />
            <Text style={activeTab === 'cart' ? styles.navLabelActive : styles.navLabel}>Giỏ hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeTab === 'notification' ? styles.navItemActive : styles.navItem} onPress={() => setActiveTab('notification')}>
            <Ionicons name={activeTab === 'notification' ? 'notifications' : 'notifications-outline'} size={26} color={activeTab === 'notification' ? themeColors.primary : themeColors.text} />
            <Text style={activeTab === 'notification' ? styles.navLabelActive : styles.navLabel}>Thông báo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={activeTab === 'user' ? styles.navItemActive : styles.navItem} onPress={() => setActiveTab('user')}>
            <Ionicons name={activeTab === 'user' ? 'person' : 'person-outline'} size={26} color={activeTab === 'user' ? themeColors.primary : themeColors.text} />
            <Text style={activeTab === 'user' ? styles.navLabelActive : styles.navLabel}>Cá nhân</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  cartIcon: {
    fontSize: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 44,
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  banner: {
    flexDirection: 'row',
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerDesc: {
    fontSize: 13,
  },
  bannerImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 4,
  },
  brandItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
  },
  brandIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  brandIconImg: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginBottom: 2,
  },
  brandText: {
    fontSize: 13,
    fontWeight: '500',
  },
  brandDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  popularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  popularTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 40,
    height: 3,
    backgroundColor: '#3ec6a7',
    marginTop: 4,
    borderRadius: 2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    paddingVertical: 60,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(62, 198, 167, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  productList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  productGrid: {
    paddingBottom: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  productCard: {
    width: '47%',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#fff',
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
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
    color: '#1a1a1a',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceBox: {
    backgroundColor: '#e60000',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 4,
    minWidth: 90,
  },
  priceCurrent: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
},
  priceOld: {
    color: '#888',
    fontSize: 13,
    textDecorationLine: 'line-through',
    opacity: 0.8,
    marginTop: 0,
},
  discountTag: {
    color: '#fff',
    backgroundColor: '#e53935',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
    marginBottom: 2,
    overflow: 'hidden',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    borderTopWidth: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navLabel: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '400',
  },
  navLabelActive: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: 'bold',
  },
  brandItemActive: {
    borderBottomWidth: 2,
    borderColor: '#3ec6a7',
  },
  brandTextActive: {
    color: '#3ec6a7',
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  priceBoxLeft: {
    backgroundColor: '#e60000',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 90,
  },
  priceCurrentBox: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  priceOldBox: {
    color: '#fff',
    fontSize: 13,
    textDecorationLine: 'line-through',
    opacity: 0.7,
    marginTop: 0,
  },
  priceBoxRight: {
    backgroundColor: '#ffe066',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 0,
  },
  flashIcon: {
    fontSize: 16,
    color: '#ff9800',
    marginRight: 2,
    fontWeight: 'bold',
  },
  discountPercent: {
    color: '#ff9800',
    fontSize: 15,
    fontWeight: 'bold',
  },
  priceRowWhite: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignSelf: 'flex-start',
  },
  priceBoxLeftWhite: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 90,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  priceCurrentBox: {
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  priceOldBoxWhite: {
    color: '#bbb',
    fontSize: 13,
    textDecorationLine: 'line-through',
    opacity: 0.8,
    marginTop: 0,
  },
  priceBoxRightWhite: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
    marginLeft: 0,
  },
  flashIconWhite: {
    fontSize: 16,
    color: '#ff9800',
    marginRight: 2,
    fontWeight: 'bold',
  },
  discountPercentWhite: {
    color: '#ff9800',
    fontSize: 15,
    fontWeight: 'bold',
  },
  priceRowPro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f2f2f2',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 0,
  },
  priceBoxLeftPro: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    marginRight: 10,
  },
  priceCurrentPro: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  priceOldPro: {
    color: '#bbb',
    fontSize: 13,
    textDecorationLine: 'line-through',
    opacity: 0.85,
    marginTop: 0,
  },
  discountCirclePro: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7d6',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 4,
    minWidth: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffe066',
  },
  flashIconPro: {
    fontSize: 15,
    color: '#ff9800',
    marginRight: 2,
    fontWeight: 'bold',
  },
  discountPercentPro: {
    color: '#ff9800',
    fontSize: 15,
    fontWeight: 'bold',
  },
  priceRowClean: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  priceBoxLeftClean: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    flexShrink: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    height: 'auto',
    minWidth: 0,
    maxWidth: '100%',
  },
  priceCurrentClean: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  priceOldClean: {
    color: '#bbb',
    fontSize: 12,
    textDecorationLine: 'line-through',
    opacity: 0.7,
    marginTop: 0,
    lineHeight: 16,
  },
  priceBoxRightClean: {
    backgroundColor: '#ffe066',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 0,
    justifyContent: 'center',
    flexGrow: 0,
    height: 36,
    minWidth: 44,
  },
  flashIconClean: {
    fontSize: 13,
    color: '#ff9800',
    marginRight: 2,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  discountPercentClean: {
    color: '#ff9800',
    fontSize: 13,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  priceRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 0,
    borderRadius: 0,
    overflow: 'visible',
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    maxWidth: '98%',
    height: 'auto',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e60000',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 2,
    minWidth: 38,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  saleTagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
}); 
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, FlatList, Dimensions, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { ThemeContext } from '../theme/ThemeContext';
import { processImageArray } from '../utils/imageHelper';
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

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route, productId: propProductId, ...props }) {
  const { themeColors: contextThemeColors } = useContext(ThemeContext);
  const productId = propProductId || route?.params?.productId;
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState({ size: '', color: '', price: '', stock: '' });
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  useEffect(() => {
    if (productId) {
      fetch(API_URLS.PRODUCT_BY_ID(productId))
        .then(res => res.json())
        .then(data => setProduct(data));
      fetch(API_URLS.VARIANTS_BY_PRODUCT(productId))
        .then(res => res.json())
        .then(data => setVariants(data));
    }
  }, [productId]);

  // Lấy danh sách size, màu từ variants
  const availableVariants = variants.map(v => ({ size: v.size, color: (v.color || '').toLowerCase().trim() }));
  const availableSizes = Array.from(new Set(variants.map(v => v.size).filter(Boolean)));
  const availableColors = Array.from(new Set(variants.map(v => (v.color || '').toLowerCase().trim()).filter(Boolean)));
  
  // Luôn hiển thị đủ size/màu mặc định
  const sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
  const colors = [
    { name: 'Đen', code: '#000000' },
    { name: 'Trắng', code: '#ffffff' },
    { name: 'Đỏ', code: '#ff0000' },
    { name: 'Xanh dương', code: '#0000ff' },
    { name: 'Vàng', code: '#ffff00' },
    { name: 'Xanh lá', code: '#00ff00' },
    { name: 'Cam', code: '#ffa500' },
  ];
  
  // Lọc chéo size-màu
  // Khi chọn size, chỉ enable màu có biến thể với size đó
  const enabledColors = selectedSize
    ? Array.from(new Set(availableVariants.filter(v => v.size === selectedSize).map(v => v.color)))
    : availableColors;
  // Khi chọn màu, chỉ enable size có biến thể với màu đó
  const enabledSizes = selectedColor
    ? Array.from(new Set(availableVariants.filter(v => v.color === selectedColor.toLowerCase().trim()).map(v => v.size)))
    : availableSizes;

  // Nếu chọn lại size/màu không hợp lệ, tự động bỏ chọn
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const found = availableVariants.find(v => v.size === selectedSize && v.color === selectedColor.toLowerCase().trim());
      if (!found) {
        setSelectedColor(null);
      }
    }
    if (selectedColor && selectedSize) {
      const found = availableVariants.find(v => v.size === selectedSize && v.color === selectedColor.toLowerCase().trim());
      if (!found) {
        setSelectedSize(null);
      }
    }
    
  }, [selectedSize, selectedColor, variants]);

 
  let displayPrice = '--';
  if (selectedSize && selectedColor) {
    const found = variants.find(v => v.size === selectedSize && v.color === selectedColor);
    if (found) displayPrice = found.price.toLocaleString();
  } else if (variants.length > 0) {
    displayPrice = Math.min(...variants.map(v => v.price)).toLocaleString();
  }

  // Xử lý ảnh từ backend
  let images = [];
  if (product) {
    if (product.images && product.images.length > 0) {
      // Nếu có mảng images
      images = processImageArray(product.images);
    } else if (product.image) {
      // Nếu chỉ có 1 ảnh
      if (typeof product.image === 'string') {
        if (product.image.startsWith('http')) {
          images = [{ uri: product.image }];
        } else {
          // Sử dụng helper để xử lý
          images = [processImageArray([product.image])[0]];
        }
      } else {
        images = [product.image];
      }
    }
  }
  
  
  if (product) {
    console.log('Product image data:', {
      productImage: product.image,
      productImages: product.images,
      processedImages: images
    });
  }

  // Hàm thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng chọn đầy đủ size và màu sắc!',
      });
      return;
    }
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) throw new Error('Chưa đăng nhập');
      const user = JSON.parse(userStr);
      // Lấy giá và ảnh biến thể đã chọn
      let variant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
      let price = variant ? variant.price : product.price;
      // Lấy ảnh đại diện (ưu tiên ảnh đầu tiên trong mảng images, hoặc product.image)
      let image = null;
      if (product.images && product.images.length > 0) {
        image = product.images[0];
      } else if (product.image) {
        image = product.image;
      }
      // Kiểm tra đã có sản phẩm này trong giỏ chưa
      const res = await fetch(API_URLS.CART_BY_USER_PRODUCT(user.id, product.id, selectedSize, selectedColor));
      const items = await res.json();
      if (items.length > 0) {
        // Đã có, PATCH tăng qty
        const item = items[0];
        await fetch(API_URLS.CART_ITEM(item.id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qty: item.qty + 1 })
        });
      } else {
        // Thêm mới
        await fetch(API_URLS.CART_BY_USER(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            productId: product.id,
            name: product.name,
            desc: product.desc,
            image: image,
            size: selectedSize,
            color: selectedColor,
            qty: 1,
            price: price
          })
        });
      }
      Toast.show({
        type: 'success',
        text1: 'Đã thêm vào giỏ hàng!',
      });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi thêm vào giỏ hàng!' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: contextThemeColors.background }]}>  
      {/* Header với nút back */}
      <View style={[styles.header, { backgroundColor: contextThemeColors.background }]}>
        <TouchableOpacity onPress={props.onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={contextThemeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: contextThemeColors.text }]}>Chi tiết sản phẩm</Text>
        <TouchableOpacity style={styles.favoriteButton} onPress={() => setIsFavorite(v => !v)}>
          <Ionicons 
            name={isFavorite ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isFavorite ? '#e53935' : contextThemeColors.text} 
          />
        </TouchableOpacity>
      </View>

      {/* Hiển thị lỗi nếu không có productId */}
      {!productId && (
        <Text style={[styles.errorText, { color: contextThemeColors.text }]}>Không có thông tin sản phẩm!</Text>
      )}
      {/* Hiển thị loading nếu chưa có product */}
      {productId && !product && (
        <Text style={[styles.loadingText, { color: contextThemeColors.text }]}>Đang tải sản phẩm...</Text>
      )}
      {/* Nếu có product thì hiển thị UI chi tiết như cũ */}
      {product && (
        <>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Ảnh sản phẩm */}
          <View style={styles.imageContainer}>
            <FlatList
              data={images.length > 0 ? images : [null]}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
              renderItem={({ item, index }) => (
                item ? (
                  <TouchableOpacity onPress={() => { setModalImageIndex(index); setShowImageModal(true); }}>
                    <Image
                      source={
                        typeof item === 'string'
                          ? (item.startsWith('http')
                              ? { uri: item }
                              : imageMap[item] || require('../../assets/img_icon/image_giay.jpg'))
                          : item
                      }
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={[styles.productImage, styles.placeholderImage]}>
                    <Ionicons name="image-outline" size={80} color="#ccc" />
                  </View>
                )
              )}
              keyExtractor={(_, idx) => idx.toString()}
            />
            {/* Dots indicator */}
            {images.length > 1 && (
              <View style={styles.dotsContainer}>
                {images.map((_, idx) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.dot, 
                      imageIndex === idx && styles.activeDot
                    ]} 
                  />
                ))}
              </View>
            )}
          </View>
          {/* Modal xem ảnh lớn */}
          <Modal visible={showImageModal} transparent animationType="fade" onRequestClose={() => setShowImageModal(false)}>
            <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.95)',justifyContent:'center',alignItems:'center'}}>
              <TouchableOpacity style={{position:'absolute',top:40,right:20,zIndex:10}} onPress={() => setShowImageModal(false)}>
                <Ionicons name="close" size={36} color="#fff" />
              </TouchableOpacity>
              <FlatList
                data={images}
                horizontal
                pagingEnabled
                initialScrollIndex={modalImageIndex}
                getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                renderItem={({ item }) => (
                  <Image
                    source={
                      typeof item === 'string'
                        ? (item.startsWith('http')
                            ? { uri: item }
                            : imageMap[item] || require('../../assets/img_icon/image_giay.jpg'))
                        : item
                    }
                    style={{ width: width * 0.95, height: width * 0.95, resizeMode: 'contain', marginVertical: 40 }}
                  />
                )}
                keyExtractor={(_, idx) => idx.toString()}
                showsHorizontalScrollIndicator={false}
                style={{flexGrow:0}}
              />
            </View>
          </Modal>

          {/* Thông tin sản phẩm */}
          <View style={styles.contentContainer}>
            {/* Tên và giá */}
            <View style={styles.productHeader}>
              <Text style={[styles.productName, { color: contextThemeColors.text }]}>{String(product.name || '')}</Text>
              <Text style={[styles.productPrice, { color: contextThemeColors.primary }]}> {displayPrice} VND </Text>
            </View>

            {/* Rating */}
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                <Ionicons name="star" size={16} color="#fbc02d" />
                <Text style={[styles.ratingText, { color: contextThemeColors.textSecondary }]}> 
                  {String(product.rating || '4.5')} ({String(product.reviews || '120')}) đánh giá
                </Text>
              </View>
              {product.discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{product.discount}%</Text>
                </View>
              )}
            </View>

            {/* Mô tả */}
            <View style={styles.descriptionContainer}>
              <Text style={[styles.descriptionLabel, { color: contextThemeColors.text }]}>Mô tả</Text>
              <Text style={[styles.descriptionText, { color: contextThemeColors.textSecondary }]} numberOfLines={showFullDesc ? 99 : 3}>
                {String(product.description || product.desc || 'Không có mô tả')}
              </Text>
              <TouchableOpacity onPress={() => setShowFullDesc(v => !v)}>
                <Text style={[styles.viewMoreText, { color: contextThemeColors.primary }]}> 
                  {showFullDesc ? 'Ẩn bớt' : 'Xem thêm'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Chọn size */}
            <View style={styles.selectionContainer}>
              <Text style={[styles.selectionLabel, { color: contextThemeColors.text }]}>Chọn size</Text>
              <View style={styles.sizeContainer}>
                {sizes.map(size => {
                  const isAvailable = enabledSizes.includes(size);
                  return (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeButton,
                        selectedSize === size && isAvailable && styles.sizeButtonActive,
                        !isAvailable && styles.sizeButtonDisabled,
                        { borderColor: contextThemeColors.border }
                      ]}
                      onPress={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                    >
                      <Text style={[
                        styles.sizeButtonText,
                        selectedSize === size && isAvailable ? styles.sizeButtonTextActive : { color: contextThemeColors.text },
                        !isAvailable && styles.sizeButtonTextDisabled
                      ]}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {availableSizes.length === 0 && (
                <Text style={[styles.availabilityText, { color: contextThemeColors.textSecondary }]}>Chưa có thông tin size, vui lòng liên hệ shop</Text>
              )}
            </View>

            {/* Chọn màu */}
            <View style={styles.selectionContainer}>
              <Text style={[styles.selectionLabel, { color: contextThemeColors.text }]}>Chọn màu</Text>
              <View style={styles.colorContainer}>
                {colors.map(colorObj => {
                  const color = colorObj.code.toLowerCase().trim();
                  const isAvailable = enabledColors.includes(color);
                  return (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        selectedColor === color && isAvailable && styles.colorButtonActive,
                        !isAvailable && styles.colorButtonDisabled
                      ]}
                      onPress={() => isAvailable && setSelectedColor(color)}
                      disabled={!isAvailable}
                    />
                  );
                })}
              </View>
              {availableColors.length === 0 && (
                <Text style={[styles.availabilityText, { color: contextThemeColors.textSecondary }]}>Chưa có thông tin màu, vui lòng liên hệ shop</Text>
              )}
            </View>


          </View>
        </ScrollView>
        </>
      )}
      {/* Footer với nút thêm vào giỏ hàng */}
      {product && (
        <View style={[styles.footer, { backgroundColor: contextThemeColors.background, borderColor: contextThemeColors.border }]}> 
          <TouchableOpacity 
            style={[styles.addToCartButton, { backgroundColor: contextThemeColors.primary }]} 
            onPress={handleAddToCart}
          >
            <Ionicons name="cart-outline" size={20} color="#fff" />
            <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 30,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#f8f8f8',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  favoriteButton: {
    padding: 6,
    borderRadius: 18,
    backgroundColor: '#f8f8f8',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  productImage: {
    width: width - 40,
    height: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 2,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingHorizontal: 12,
    paddingBottom: 60,
  },
  productHeader: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 12,
  },
  discountBadge: {
    backgroundColor: '#e53935',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginBottom: 12,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  viewMoreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectionContainer: {
    marginBottom: 12,
  },
  selectionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sizeButton: {
    borderWidth: 2,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 36,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 6,
  },
  sizeButtonActive: {
    backgroundColor: '#3ec6a7',
    borderColor: '#3ec6a7',
  },
  sizeButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  sizeButtonTextActive: {
    color: '#fff',
  },
  sizeButtonDisabled: {
    opacity: 0.4,
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
  },
  sizeButtonTextDisabled: {
    color: '#999',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 6,
  },
  colorButtonActive: {
    borderColor: '#3ec6a7',
    borderWidth: 2,
  },
  colorButtonDisabled: {
    opacity: 0.4,
    borderColor: '#ddd',
    borderWidth: 2,
  },
  availabilityText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    backgroundColor: '#fff',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 18,
    gap: 6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 60,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 60,
  },
}); 
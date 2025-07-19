import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { ThemeContext } from '../theme/ThemeContext';
import { API_URLS } from '../utils/apiConfig';
import AddressListScreen from './AddressListScreen';

export default function CheckoutScreen({ navigation, onBack, cart, setCart, onOrderSuccess, ...props }) {
  const { themeColors } = useContext(ThemeContext);
  const [step, setStep] = useState(1); // 1: Địa chỉ & đơn hàng, 2: Giao hàng, 3: Thanh toán, 4: Xác nhận
  const [shippingMethod, setShippingMethod] = useState('fast');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Tính phí giao hàng dựa trên phương thức được chọn
  const getShippingFee = () => {
    switch (shippingMethod) {
      case 'fast':
        return 50000;
      case 'standard':
        return 30000;
      default:
        return 30000;
    }
  };
  
  const shipping = getShippingFee();
  const amount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = amount + shipping;
  
  // Debug log để kiểm tra tính toán
  console.log('DEBUG CHECKOUT CALCULATION:', {
    shippingMethod,
    shipping,
    amount,
    total,
    calculation: `${amount} + ${shipping} = ${total}`
  });
  const [cartSnapshot, setCartSnapshot] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressList, setShowAddressList] = useState(false);

  const updateQty = (id, size, color, delta) => {
    setCart(cart => {
      return cart
        .map(item =>
          item.id === id && item.size === size && item.color === color
            ? { ...item, qty: Math.max(0, item.qty + delta) }
            : item
        )
        .filter(item => item.qty > 0);
    });
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

  // Fetch địa chỉ mặc định khi vào CheckoutScreen
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const res = await fetch(`${API_URLS.ADDRESSES_BY_USER(user.id)}`);
      const data = await res.json();
      const defaultAddr = data.find(a => a.selected) || data[0] || null;
      setSelectedAddress(defaultAddr);
    };
    fetchDefaultAddress();
    props.fetchCart && props.fetchCart(); // luôn đồng bộ Order List
  }, []);

  useEffect(() => {
    if (cart.length === 0 && step === 1) {
      onBack && onBack();
    }
  }, [cart, step]);

  const STEP_CONFIG = [
    { icon: 'location-outline', label: 'Địa chỉ' },
    { icon: 'bicycle', label: 'Giao hàng' },
    { icon: 'card-outline', label: 'Thanh toán' },
    { icon: 'checkmark-done-outline', label: 'Xác nhận' },
  ];

  // Step indicator UI
  const renderStepIndicator = () => (
    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',marginVertical:20}}>
      {STEP_CONFIG.map((stepCfg, i) => {
        const idx = i+1;
        const isActive = step === idx;
        const isDone = step > idx;
        return (
          <React.Fragment key={idx}>
            <View style={{alignItems:'center',width:70}}>
              <LinearGradient
                colors={isActive ? [themeColors.primary, '#43e97b'] : isDone ? [themeColors.primary, themeColors.primary] : [themeColors.grayLight, themeColors.grayLight]}
                style={{width:40,height:40,borderRadius:20,alignItems:'center',justifyContent:'center',shadowColor:'#000',shadowOpacity:isActive?0.15:0,shadowRadius:8,shadowOffset:{width:0,height:2},elevation:isActive?4:0}}
                start={{x:0,y:0}} end={{x:1,y:1}}
              >
                <Ionicons name={stepCfg.icon} size={22} color={isActive||isDone?'#fff':themeColors.textSecondary} />
              </LinearGradient>
              <Text style={{color:isActive?themeColors.primary:themeColors.textSecondary,fontWeight:isActive?'bold':'normal',fontSize:13,marginTop:6}}>{stepCfg.label}</Text>
            </View>
            {idx<STEP_CONFIG.length && (
              <View style={{height:2,flex:1,backgroundColor:step>idx?themeColors.primary:themeColors.grayLight,marginHorizontal:2,marginTop:19}} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // Step 1: Địa chỉ & đơn hàng
  const renderStep1 = () => (
    <>
      {/* Địa chỉ giao hàng */}
      <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 12 }]}>Địa chỉ giao hàng</Text>
      <TouchableOpacity onPress={() => setShowAddressList(true)}>
        <View style={[styles.addressBox, { backgroundColor: themeColors.grayLight }] }>
          <Ionicons name="home" size={22} color={themeColors.primary} style={{marginRight: 10}} />
          {/* Ô tròn radio button xác nhận địa chỉ */}
          <Ionicons name={selectedAddress?.selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={themeColors.primary} style={{marginRight: 10}} />
          <View style={{flex:1}}>
           
            <Text style={[styles.addressDetail, { color: themeColors.textSecondary }]}>{selectedAddress?.detail || 'Nhấn để chọn hoặc thêm địa chỉ mới'}</Text>
          </View>
          <Ionicons name="create-outline" size={20} color={themeColors.primary} />
        </View>
      </TouchableOpacity>
      {/* Danh sách sản phẩm */}
      <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 20 }]}>Order List</Text>
      <ScrollView style={styles.orderList}>
        {cart.map((item, idx) => (
          <View key={item.id + '-' + item.size + '-' + item.color + '-' + idx} style={[styles.orderItem, { backgroundColor: themeColors.background, borderColor: themeColors.border, borderWidth: 1 }] }>
            <Image source={
              item.image
                ? (typeof item.image === 'string' && item.image.startsWith('http')
                    ? { uri: item.image }
                    : require('../../assets/img_icon/image_giay.jpg'))
                : require('../../assets/img_icon/image_giay.jpg')
            } style={styles.orderImage} />
            <View style={{flex:1, marginLeft:10}}>
              <Text style={[styles.orderName, { color: themeColors.text }]}>{item.name}</Text>
              <Text style={[styles.orderDesc, { color: themeColors.textSecondary }]}>{item.desc}</Text>
              <View style={{flexDirection:'row',alignItems:'center',marginTop:2}}>
                <View style={{width:18,height:18,borderRadius:9,backgroundColor:colorNameToHex[item.color] || '#fff',borderWidth:1,borderColor:themeColors.border,marginRight:6}} />
                <Text style={[styles.orderMeta, { color: themeColors.textSecondary }]}>{item.colorName ? item.colorName : item.color}</Text>
                <Text style={[styles.orderMeta, { color: themeColors.textSecondary }]}>{`| Size ${item.size}`}</Text>
              </View>
              <Text style={[styles.orderPrice, { color: themeColors.primary }]}>{`${item.price?.toLocaleString()} ₫`}</Text>
            </View>
            <View style={[styles.qtyBox, { backgroundColor: themeColors.grayLight }] }>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.size, item.color, -1)}>
                <Ionicons name="remove" size={18} color={themeColors.primary} />
              </TouchableOpacity>
              <Text style={[styles.qtyText, { color: themeColors.text }]}>{item.qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.size, item.color, 1)}>
                <Ionicons name="add" size={18} color={themeColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
      {/* Tổng tiền */}
      <View style={styles.amountBox}>
        <View style={styles.amountRow}>
          <Text style={[styles.amountLabel, { color: themeColors.textSecondary }]}>Amount</Text>
          <Text style={[styles.amountValue, { color: themeColors.text }]}>{`${amount.toLocaleString()} ₫`}</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.payBtn, { backgroundColor: themeColors.primary }]} onPress={() => setStep(2)}>
        <Text style={styles.payBtnText}>Tiếp tục</Text>
      </TouchableOpacity>
      {/* Modal chọn địa chỉ */}
      {showAddressList && (
        <AddressListScreen
          onBack={() => setShowAddressList(false)}
          onAddNew={() => setShowAddressList(false)}
          themeColors={themeColors}
          // Khi chọn địa chỉ, cập nhật selectedAddress
          onSelectAddress={addr => { setSelectedAddress(addr); setShowAddressList(false); }}
        />
      )}
    </>
  );

  // Step 2: Chọn phương thức giao hàng
  const renderStep2 = () => (
    <>
      <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Chọn phương thức giao hàng</Text>
      <TouchableOpacity style={[styles.orderItem, { backgroundColor: shippingMethod==='fast'?themeColors.primary:themeColors.grayLight, borderColor: themeColors.border, borderWidth: 1, marginBottom: 12 }]} onPress={()=>setShippingMethod('fast')}>
        <Ionicons name="bicycle" size={24} color={shippingMethod==='fast'?'#fff':themeColors.primary} style={{marginRight: 12}} />
        <View style={{flex: 1}}>
          <Text style={{color:shippingMethod==='fast'?'#fff':themeColors.text,fontWeight:'bold',fontSize:15}}>Giao hàng nhanh (1-2 ngày)</Text>
          <Text style={{color:shippingMethod==='fast'?'#fff':themeColors.textSecondary,fontSize:13,marginTop:2}}>Phí: 50.000 ₫</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.orderItem, { backgroundColor: shippingMethod==='standard'?themeColors.primary:themeColors.grayLight, borderColor: themeColors.border, borderWidth: 1 }]} onPress={()=>setShippingMethod('standard')}>
        <Ionicons name="cube" size={24} color={shippingMethod==='standard'?'#fff':themeColors.primary} style={{marginRight: 12}} />
        <View style={{flex: 1}}>
          <Text style={{color:shippingMethod==='standard'?'#fff':themeColors.text,fontWeight:'bold',fontSize:15}}>Giao hàng tiêu chuẩn (3-5 ngày)</Text>
          <Text style={{color:shippingMethod==='standard'?'#fff':themeColors.textSecondary,fontSize:13,marginTop:2}}>Phí: 30.000 ₫</Text>
        </View>
      </TouchableOpacity>
      <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:32}}>
        <TouchableOpacity style={[styles.payBtn, { backgroundColor: themeColors.gray }]} onPress={() => setStep(1)}>
          <Text style={styles.payBtnText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.payBtn, { backgroundColor: themeColors.primary }]} onPress={() => setStep(3)}>
          <Text style={styles.payBtnText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // Step 3: Chọn phương thức thanh toán
  const handleConfirmOrder = async () => {
    try {
      if (!selectedAddress || !selectedAddress.detail) {
        Toast.show({ type: 'error', text1: 'Vui lòng chọn địa chỉ giao hàng!' });
        return;
      }
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) throw new Error('Chưa đăng nhập');
      const user = JSON.parse(userStr);

      // Log kiểm tra
      console.log('DEBUG selectedAddress:', selectedAddress);
      console.log('DEBUG shipping:', shipping);
      console.log('DEBUG orderData:', {
        userId: user.id,
        items: cart,
        shippingMethod,
        shipping,
        paymentMethod,
        total,
        status: 'Đang xử lý',
        createdAt: new Date().toISOString(),
        address: selectedAddress.detail
      });

      // Tạo đơn hàng
      const res = await fetch(API_URLS.ORDERS(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: cart,
          shippingMethod,
          shipping,
          paymentMethod,
          total,
          status: 'Đang xử lý',
          createdAt: new Date().toISOString(),
          address: selectedAddress.detail
        })
      });
      if (res.ok) {
        // Xóa toàn bộ giỏ hàng của user
        for (const item of cart) {
          await fetch(API_URLS.CART_ITEM(item.id), { method: 'DELETE' });
        }
        setCartSnapshot(cart); // Lưu lại cart hiện tại nếu cần
        Toast.show({ type: 'success', text1: 'Đặt hàng thành công!' });
        props.fetchCart && props.fetchCart();
        onOrderSuccess && onOrderSuccess();
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi đặt hàng!' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi đặt hàng!' });
    }
  };

  const renderStep3 = () => (
    <>
      <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Chọn phương thức thanh toán</Text>
      <TouchableOpacity style={[styles.orderItem, { backgroundColor: paymentMethod==='cod'?themeColors.primary:themeColors.grayLight, borderColor: themeColors.border, borderWidth: 1, marginBottom: 12 }]} onPress={()=>setPaymentMethod('cod')}>
        <Ionicons name="cash" size={24} color={paymentMethod==='cod'?'#fff':themeColors.primary} style={{marginRight: 12}} />
        <Text style={{color:paymentMethod==='cod'?'#fff':themeColors.text,fontWeight:'bold',fontSize:15}}>Thanh toán khi nhận hàng (COD)</Text>
      </TouchableOpacity>
      
      {/* Tổng tiền chi tiết */}
      <View style={[styles.amountBox, { marginTop: 20 }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginBottom: 12 }]}>Tổng thanh toán</Text>
        <View style={styles.amountRow}>
          <Text style={[styles.amountLabel, { color: themeColors.textSecondary }]}>Tiền hàng:</Text>
          <Text style={[styles.amountValue, { color: themeColors.text }]}>{`${amount.toLocaleString()} ₫`}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={[styles.amountLabel, { color: themeColors.textSecondary }]}>Phí giao hàng:</Text>
          <Text style={[styles.amountValue, { color: themeColors.text }]}>{`${shipping.toLocaleString()} ₫`}</Text>
        </View>
        <View style={[styles.amountRow, { borderTopWidth: 1, borderTopColor: themeColors.border, paddingTop: 8, marginTop: 8 }]}>
          <Text style={[styles.amountLabelTotal, { color: themeColors.text }]}>Tổng cộng:</Text>
          <Text style={[styles.amountValueTotal, { color: themeColors.primary }]}>{`${total.toLocaleString()} ₫`}</Text>
        </View>
      </View>
      
      <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:32}}>
        <TouchableOpacity style={[styles.payBtn, { backgroundColor: themeColors.gray }]} onPress={() => setStep(2)}>
          <Text style={styles.payBtnText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.payBtn, { backgroundColor: themeColors.primary }]} onPress={handleConfirmOrder}>
          <Text style={styles.payBtnText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={onBack} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={[styles.container, { backgroundColor: themeColors.background }] }>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack}>
            <Ionicons name="arrow-back-outline" size={22} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>Checkout</Text>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={22} color={themeColors.text} />
          </TouchableOpacity>
        </View>
        {renderStepIndicator()}
        {step===1 && renderStep1()}
        {step===2 && renderStep2()}
        {step===3 && renderStep3()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, },
  title: { fontSize: 20, fontWeight: 'bold' },
  addressBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginHorizontal: 16, padding: 12, marginBottom: 10, },
  addressLabel: { fontSize: 15, fontWeight: 'bold' },
  addressDetail: { fontSize: 13, },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', marginLeft: 16, marginTop: 8, marginBottom: 4, },
  orderList: { maxHeight: 220, marginHorizontal: 8, },
  orderItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginBottom: 10, padding: 10, elevation: 1, },
  orderImage: { width: 54, height: 54, borderRadius: 10, backgroundColor: '#f6f6f6', },
  orderName: { fontSize: 15, fontWeight: 'bold' },
  orderDesc: { fontSize: 12, },
  orderMeta: { fontSize: 12, marginRight: 8, },
  orderPrice: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 10, },
  qtyBtn: { padding: 4, },
  qtyText: { fontSize: 15, fontWeight: 'bold', marginHorizontal: 8, },
  amountBox: { borderRadius: 12, marginHorizontal: 16, marginTop: 10, padding: 12, },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, },
  amountLabel: { fontSize: 13, },
  amountValue: { fontSize: 13, },
  amountLabelTotal: { fontSize: 15, fontWeight: 'bold' },
  amountValueTotal: { fontSize: 15, fontWeight: 'bold' },
  payBtn: { borderRadius: 8, paddingVertical: 16, marginHorizontal: 16, marginTop: 16, alignItems: 'center', },
  payBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold', },
}); 
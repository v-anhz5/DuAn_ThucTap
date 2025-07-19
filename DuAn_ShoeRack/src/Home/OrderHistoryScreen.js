import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, ScrollView, Modal, TextInput, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { API_URLS, API_CONFIG } from '../utils/apiConfig';
import { useFocusEffect } from '@react-navigation/native';
import io from 'socket.io-client';

const ORDER_TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'Chờ xác nhận', label: 'Chờ xác nhận' },
  { key: 'Chờ lấy hàng', label: 'Chờ lấy hàng' },
  { key: 'Đang giao hàng', label: 'Đang giao hàng' },
  { key: 'Đã giao hàng', label: 'Đã giao hàng' },
  { key: 'Đã huỷ', label: 'Đã huỷ' },
];

// Màu sắc mặc định nếu không lấy được từ backend
const DEFAULT_STATUS_COLORS = {
  'Chờ xác nhận': '#f59e0b',
  'Chờ lấy hàng': '#6366f1',
  'Đang giao hàng': '#3b82f6',
  'Đã giao hàng': '#10b981',
  'Đã huỷ': '#ef4444',
};

export default function OrderHistoryScreen({ onBack, onSelectOrder, themeColors }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [statusColors, setStatusColors] = useState(DEFAULT_STATUS_COLORS);
  const socketRef = useRef(null);
  const [activeTab, setActiveTab] = useState('all');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const CANCEL_REASONS = [
    'Tôi muốn thay đổi địa chỉ nhận hàng',
    'Tôi muốn thay đổi sản phẩm',
    'Tìm được giá tốt hơn ở nơi khác',
    'Không còn nhu cầu',
    'Khác',
  ];

  // Đưa fetchOrders ra ngoài để có thể gọi ở mọi nơi
  const fetchOrders = async () => {
    setLoading(true);
    const userStr = await AsyncStorage.getItem('user');
    if (!userStr) {
      setOrders([]);
      setLoading(false);
      return;
    }
    const user = JSON.parse(userStr);
    setUserId(user.id);
    setUserName(user.name || '');
    try {
      const res = await fetch(API_URLS.ORDERS_BY_USER(user.id));
      const data = await res.json();
      setOrders(data.reverse());
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      const fetchStatusColors = async () => {
        try {
          const res = await fetch(`${API_URLS.BASE_URL}/order-status-colors`);
          const colors = await res.json();
          setStatusColors(colors);
        } catch (error) {
          console.log('Không thể lấy màu sắc từ backend, sử dụng màu mặc định');
        }
      };

      fetchOrders();
      fetchStatusColors();
      
      // Kết nối Socket.IO để nhận thông báo realtime
      socketRef.current = io('http://192.168.1.6:4000', {
        transports: ['websocket'],
        forceNew: true,
        reconnection: true,
      });
      
      socketRef.current.on('connect', () => {
        console.log('Socket.IO connected for order updates');
      });
      
      socketRef.current.on('order_update', (data) => {
        console.log('Socket.IO order update received:', data);
        
        if (data.order) {
          // Cập nhật danh sách đơn hàng
          fetchOrders();
          
          // Hiển thị thông báo
          Toast.show({ 
            type: 'success', 
            text1: `Đơn hàng #${data.order.id} đã được cập nhật!`,
            text2: `Trạng thái: ${data.order.status}`
          });
        }
      });
      
      socketRef.current.on('disconnect', () => {
        console.log('Socket.IO disconnected');
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.log('Socket.IO connection error:', error);
      });
      
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }, [])
  );

  // Đếm số lượng đơn theo từng trạng thái
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  statusCounts['all'] = orders.length;

  // Lọc đơn hàng theo tab
  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab);

  // Helper: lấy thời gian trạng thái cuối cùng của đơn hàng
  const getStatusTime = (order, status) => {
    if (!order.history) return null;
    const found = [...order.history].reverse().find(h => h.status === status);
    return found ? found.time : null;
  };

  // --- XỬ LÝ UI ĐỒNG NHẤT CHIỀU CAO CÁC TAB ---
  // Tính chiều cao tối thiểu cho vùng hiển thị đơn hàng
  const MIN_LIST_HEIGHT = 320; // px, tuỳ chỉnh cho đẹp

  // --- HỦY ĐƠN HÀNG ---
  const handleCancelOrder = (orderId) => {
    setCancelOrderId(orderId);
    setCancelModalVisible(true);
    setCancelReason('');
    setCustomReason('');
  };

  const confirmCancelOrder = async () => {
    if (!cancelOrderId) return;
    let reason = cancelReason === 'Khác' ? customReason : cancelReason;
    if (!reason || reason.trim().length < 3) {
      Toast.show({ type: 'error', text1: 'Vui lòng chọn hoặc nhập lý do huỷ!' });
      return;
    }
    try {
      const patchUrl = `${API_CONFIG.BASE_URL}/orders/${cancelOrderId}`;
      console.log('PATCH URL:', patchUrl);
      const res = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Đã huỷ', cancelReason: reason })
      });
      const data = await res.json();
      setCancelModalVisible(false);
      setCancelOrderId(null);
      setCancelReason('');
      setCustomReason('');
      if (data.status === 'Đã huỷ' || data.success) {
        Toast.show({ type: 'success', text1: 'Đã huỷ đơn hàng thành công!' });
        fetchOrders(); // Cập nhật lại danh sách đơn hàng ngay
      } else {
        console.log('Huỷ đơn lỗi:', data);
        Toast.show({ type: 'error', text1: 'Huỷ đơn hàng thất bại!' });
      }
    } catch (err) {
      setCancelModalVisible(false);
      console.log('Lỗi khi huỷ đơn:', err);
      Toast.show({ type: 'error', text1: 'Có lỗi khi huỷ đơn hàng!' });
    }
  };

  // Thêm hàm xác nhận đã nhận hàng
  const handleConfirmReceived = async (orderId) => {
    try {
      const patchUrl = `${API_CONFIG.BASE_URL}/orders/${orderId}`;
      const res = await fetch(patchUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Đã nhận hàng' })
      });
      const data = await res.json();
      if (data.status === 'Đã nhận hàng' || data.success) {
        Toast.show({ type: 'success', text1: 'Cảm ơn bạn đã xác nhận!' });
        fetchOrders();
      } else {
        Toast.show({ type: 'error', text1: 'Xác nhận thất bại!' });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Có lỗi khi xác nhận!' });
    }
  };

  const renderCancelModal = () => (
    <Modal
      visible={cancelModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setCancelModalVisible(false)}
    >
      <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.3)',justifyContent:'center',alignItems:'center'}}>
        <View style={{backgroundColor:'#fff',borderRadius:16,padding:24,width:'85%',maxWidth:400}}>
          <Text style={{fontSize:18,fontWeight:'bold',marginBottom:12}}>Lý do huỷ đơn hàng</Text>
          {CANCEL_REASONS.map(reason => (
            <TouchableOpacity
              key={reason}
              style={{flexDirection:'row',alignItems:'center',marginBottom:8}}
              onPress={() => setCancelReason(reason)}
            >
              <View style={{width:20,height:20,borderRadius:10,borderWidth:1,borderColor:'#ccc',marginRight:8,justifyContent:'center',alignItems:'center',backgroundColor:cancelReason===reason?'#10b981':'#fff'}}>
                {cancelReason===reason && <View style={{width:12,height:12,borderRadius:6,backgroundColor:'#10b981'}} />}
              </View>
              <Text style={{fontSize:15}}>{reason}</Text>
            </TouchableOpacity>
          ))}
          {cancelReason==='Khác' && (
            <TextInput
              style={{borderWidth:1,borderColor:'#ccc',borderRadius:8,padding:8,marginTop:8,minHeight:40}}
              placeholder="Nhập lý do huỷ..."
              value={customReason}
              onChangeText={setCustomReason}
              multiline
            />
          )}
          <View style={{flexDirection:'row',justifyContent:'flex-end',marginTop:18}}>
            <TouchableOpacity onPress={()=>setCancelModalVisible(false)} style={{marginRight:16}}>
              <Text style={{color:'#888',fontSize:16}}>Huỷ</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={confirmCancelOrder}>
              <Text style={{color:'#ef4444',fontWeight:'bold',fontSize:16}}>Xác nhận huỷ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderItem = ({ item }) => {
    const statusTime = getStatusTime(item, item.status);
    return (
      <View style={[styles.card, { backgroundColor: '#fff', borderColor: themeColors.border, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }]}>  
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
          <Text style={[styles.orderId, { color: themeColors.primary }]}>#{item.id}</Text>
          <View style={{
            backgroundColor: item.statusColor || statusColors[item.status] || '#ccc',
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>{item.status}</Text>
          </View>
        </View>
        {statusTime && (
          <Text style={{color: themeColors.textSecondary, fontSize:12, marginTop:2}}>
            {`Cập nhật: ${new Date(statusTime).toLocaleString('vi-VN')}`}
          </Text>
        )}
        <Text style={{color: themeColors.text, fontWeight:'bold', marginTop: 6}}>{userName}</Text>
        <Text style={{color: themeColors.textSecondary, marginTop: 2}}>Tổng tiền: <Text style={{color: themeColors.primary, fontWeight:'bold'}}>{item.total?.toLocaleString()} đ</Text></Text>
        <Text style={{color: themeColors.textSecondary, marginTop: 2}}>Ngày đặt: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
        <TouchableOpacity
          style={{
            marginTop: 10,
            borderRadius: 8,
            backgroundColor: '#10b981',
            alignItems: 'center',
            paddingVertical: 8,
          }}
          onPress={() => onSelectOrder(item)}
        >
          <Text style={{color:'#fff',fontWeight:'bold'}}>Xem chi tiết</Text>
        </TouchableOpacity>
        {/* Nút huỷ đơn cho trạng thái Chờ xác nhận */}
        {item.status === 'Chờ xác nhận' && (
          <TouchableOpacity
            style={{
              marginTop: 8,
              borderRadius: 8,
              backgroundColor: '#ef4444',
              alignItems: 'center',
              paddingVertical: 8,
            }}
            onPress={() => handleCancelOrder(item.id)}
          >
            <Text style={{color:'#fff',fontWeight:'bold'}}>Huỷ đơn</Text>
          </TouchableOpacity>
        )}
        {/* Nút xác nhận đã nhận hàng cho trạng thái Đã giao hàng, chỉ hiện nếu chưa là Đã nhận hàng */}
        {item.status === 'Đã giao hàng' && (
          <TouchableOpacity
            style={{
              marginTop: 8,
              borderRadius: 8,
              backgroundColor: '#3b82f6',
              alignItems: 'center',
              paddingVertical: 8,
            }}
            onPress={() => handleConfirmReceived(item.id)}
          >
            <Text style={{color:'#fff',fontWeight:'bold'}}>Đã nhận được hàng</Text>
          </TouchableOpacity>
        )}
        {/* Nếu đã nhận hàng thì hiển thị trạng thái chuyên nghiệp */}
        {item.status === 'Đã nhận hàng' && (
          <View style={{marginTop: 8, borderRadius: 8, backgroundColor: '#10b981', alignItems: 'center', paddingVertical: 8}}>
            <Text style={{color:'#fff',fontWeight:'bold'}}>Đã nhận hàng</Text>
          </View>
        )}
      </View>
    );
  };

  const renderTabBar = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 12, marginTop: 8, backgroundColor:'#fff', paddingVertical: 4}}>
      {ORDER_TABS.map(tab => (
        <TouchableOpacity
          key={tab.key}
          style={{
            flexDirection:'row',
            alignItems:'center',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: activeTab === tab.key ? themeColors.primary : themeColors.grayLight,
            marginRight: 10,
            borderWidth: activeTab === tab.key ? 1 : 0,
            borderColor: themeColors.primary
          }}
          onPress={() => setActiveTab(tab.key)}
        >
          <Text style={{ color: activeTab === tab.key ? '#fff' : themeColors.text, fontWeight: activeTab === tab.key ? 'bold' : 'normal' }}>{tab.label}</Text>
          <View style={{
            minWidth: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: activeTab === tab.key ? '#fff' : '#e5e7eb',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 6,
            paddingHorizontal: 4
          }}>
            <Text style={{ color: activeTab === tab.key ? themeColors.primary : themeColors.textSecondary, fontSize: 13, fontWeight: 'bold' }}>{statusCounts[tab.key] || 0}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={{flex:1, backgroundColor: themeColors.grayLight}}>
      <FlatList
        data={filteredOrders}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingBottom: 40, paddingTop: 8, minHeight:MIN_LIST_HEIGHT}}
        ListHeaderComponent={
          <>
            <View style={{flexDirection:'row',alignItems:'center',padding:16, backgroundColor:'#fff', borderBottomWidth:1, borderBottomColor:themeColors.border}}>
              <TouchableOpacity onPress={onBack} style={{marginRight:12}}>
                <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
              </TouchableOpacity>
              <Text style={{fontSize:20,fontWeight:'bold',color:themeColors.text}}>Đơn đã mua</Text>
            </View>
            {renderTabBar()}
          </>
        }
        ListEmptyComponent={
          <View style={{flex:1, justifyContent:'center', alignItems:'center', minHeight:MIN_LIST_HEIGHT}}>
            <Text style={{textAlign:'center', color:themeColors.textSecondary}}>Không có đơn hàng nào.</Text>
          </View>
        }
      />
      {renderCancelModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, marginHorizontal: 16, marginBottom: 18, padding: 16, borderWidth: 1 },
  orderId: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
}); 
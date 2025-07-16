import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { API_URLS } from '../utils/apiConfig';

export default function OrderHistoryScreen({ onBack, onSelectOrder, themeColors }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const wsRef = useRef(null);

  // Hàm fetch đơn hàng
  const fetchOrders = async (uid) => {
    setLoading(true);
    try {
      const res = await fetch(API_URLS.ORDERS_BY_USER(uid));
      const data = await res.json();
      setOrders(data.reverse());
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi tải đơn hàng!' });
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setUserId(user.id);
      setUserName(user.name || '');
      fetchOrders(user.id);
      // Kết nối WebSocket
      wsRef.current = new WebSocket('ws://192.168.1.6:4001');
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'order_update' && data.order && data.order.userId === user.id) {
            fetchOrders(user.id);
            Toast.show({ type: 'success', text1: `Đơn hàng #${data.order.id} đã được cập nhật trạng thái!` });
          }
        } catch {}
      };
    };
    init();
    // Cleanup khi rời màn hình
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>  
      <View style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
        <Ionicons name="cube-outline" size={32} color={themeColors.primary} style={{marginRight: 12}} />
        <View style={{flex:1}}>
          <Text style={[styles.orderId, { color: themeColors.primary }]}>Đơn #{item.id}</Text>
          <Text style={[styles.orderStatus, { color: themeColors.textSecondary }]}>{item.status}</Text>
        </View>
        <TouchableOpacity style={styles.detailBtn} onPress={() => onSelectOrder(item)}>
          <Text style={{color: themeColors.primary, fontWeight:'bold'}}>Xem chi tiết</Text>
          <Ionicons name="chevron-forward-outline" size={18} color={themeColors.primary} />
        </TouchableOpacity>
      </View>
      <View style={{marginLeft:44}}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Người nhận:</Text>
        <Text style={[styles.value, { color: themeColors.text }]}>{userName}</Text>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Tổng tiền:</Text>
        <Text style={[styles.value, { color: themeColors.text }]}>{item.total?.toLocaleString()} đ</Text>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Ngày đặt:</Text>
        <Text style={[styles.value, { color: themeColors.textSecondary }]}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={onBack} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={[styles.container, { backgroundColor: themeColors.background }] }>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>Lịch sử đơn hàng</Text>
          <View style={{width:22}} />
        </View>
        {loading ? (
          <ActivityIndicator color={themeColors.primary} style={{marginTop: 40}} />
        ) : orders.length === 0 ? (
          <View style={{alignItems: 'center', marginTop: 60}}>
            <Ionicons name="cube-outline" size={64} color={themeColors.primary} style={{marginBottom: 16}} />
            <Text style={{color: themeColors.textSecondary, fontSize: 18, marginBottom: 8}}>Bạn chưa có đơn hàng nào</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={item => item.id+''}
            renderItem={renderItem}
            contentContainerStyle={{paddingBottom: 40}}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { borderRadius: 14, marginHorizontal: 16, marginBottom: 18, padding: 16, borderWidth: 1, elevation: 2 },
  orderId: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  orderStatus: { fontSize: 13, marginBottom: 2 },
  label: { fontSize: 13, marginTop: 2 },
  value: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  detailBtn: { flexDirection:'row', alignItems:'center', paddingHorizontal:10, paddingVertical:4, borderRadius:8, borderWidth:1, borderColor:'#eee', backgroundColor:'#f6f6f6' }
}); 
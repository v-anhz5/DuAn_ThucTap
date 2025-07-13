import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { API_URLS } from '../utils/apiConfig';

export default function OrderHistoryScreen({ onBack, onSelectOrder, themeColors }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setUserId(user.id);
      try {
        const res = await fetch(API_URLS.ORDERS_BY_USER(user.id));
        const data = await res.json();
        setOrders(data.reverse());
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Lỗi tải đơn hàng!' });
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.orderItem, { backgroundColor: themeColors.background, borderColor: themeColors.border }]} onPress={() => onSelectOrder(item)}>
      <Ionicons name="cube-outline" size={32} color={themeColors.primary} style={{marginRight: 12}} />
      <View style={{flex:1}}>
        <Text style={[styles.orderId, { color: themeColors.primary }]}>Đơn #{item.id}</Text>
        <Text style={[styles.orderStatus, { color: themeColors.textSecondary }]}>{item.status}</Text>
        <Text style={[styles.orderTotal, { color: themeColors.text }]}>{item.total?.toLocaleString()} đ</Text>
        <Text style={[styles.orderDate, { color: themeColors.textSecondary }]}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={22} color={themeColors.textSecondary} />
    </TouchableOpacity>
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
  orderItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginHorizontal: 16, marginBottom: 16, padding: 16, borderWidth: 1, },
  orderId: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  orderStatus: { fontSize: 13, marginBottom: 2 },
  orderTotal: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  orderDate: { fontSize: 12 },
}); 
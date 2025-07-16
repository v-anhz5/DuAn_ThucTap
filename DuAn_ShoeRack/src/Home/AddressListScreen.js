import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from '../utils/apiConfig';
import EditAddressScreen from './EditAddressScreen';

const defaultAddresses = [
  { id: 1, label: 'Home', detail: 'Rong even, vn, 35000/kerala', selected: true },
  { id: 2, label: 'Office', detail: 'Rong street, 00000/abc', selected: false },
  { id: 3, label: 'Apartment', detail: 'Rong avenue, 00000/xyz', selected: false },
];

export default function AddressListScreen({ onBack, onAddNew, themeColors, onSelectAddress }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setUserId(user.id);
      try {
        const res = await fetch(API_URLS.ADDRESSES_BY_USER(user.id));
        const data = await res.json();
        setAddresses(data);
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Lỗi tải địa chỉ!' });
      }
      setLoading(false);
    };
    fetchAddresses();
  }, []);

  const selectAddress = async (id) => {
    try {
      // Đảm bảo chỉ 1 địa chỉ được chọn
      for (const addr of addresses) {
        await fetch(API_URLS.ADDRESS_BY_ID(addr.id), {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selected: addr.id === id })
        });
      }
      setAddresses(addr => addr.map(a => ({...a, selected: a.id === id})));
      const selected = addresses.find(a => a.id === id);
      onSelectAddress && onSelectAddress(selected);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi chọn địa chỉ!' });
    }
  };

  const addAddress = async (label, detail) => {
    try {
      const res = await fetch(API_URLS.ADDRESSES(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, label, detail, selected: false })
      });
      if (res.ok) {
        const newAddr = await res.json();
        setAddresses(addr => [...addr, newAddr]);
        Toast.show({ type: 'success', text1: 'Đã thêm địa chỉ!' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi thêm địa chỉ!' });
    }
  };

  const removeAddress = async (id) => {
    try {
      await fetch(API_URLS.ADDRESS_BY_ID(id), { method: 'DELETE' });
      setAddresses(addr => addr.filter(a => a.id !== id));
      Toast.show({ type: 'success', text1: 'Đã xóa địa chỉ!' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi xóa địa chỉ!' });
    }
  };

  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={onBack} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={[styles.container, { backgroundColor: themeColors.background }] }>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>Địa chỉ nhận hàng</Text>
          <View style={{width:22}} />
        </View>
        <FlatList
          data={addresses}
          keyExtractor={item => item.id+''}
          renderItem={({item}) => (
            <TouchableOpacity style={[styles.addressItem, { backgroundColor: themeColors.background, borderColor: themeColors.border, borderWidth: 1 }]} onPress={() => selectAddress(item.id)}>
              <Ionicons name="home" size={22} color={themeColors.primary} style={{marginRight: 10}} />
              <View style={{flex:1}}>
                <Text style={[styles.addressLabel, { color: themeColors.text }]}>{item.label}</Text>
                <Text style={[styles.addressDetail, { color: themeColors.textSecondary }]}>{item.detail}</Text>
              </View>
              {/* Ô tròn radio button để chọn địa chỉ */}
              <TouchableOpacity onPress={() => selectAddress(item.id)} style={{marginLeft: 10}}>
                <Ionicons name={item.selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={item.selected ? themeColors.primary : themeColors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditingAddress(item)} style={{marginLeft: 10}}>
                <Ionicons name="create-outline" size={22} color={themeColors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeAddress(item.id)} style={{marginLeft: 10}}>
                <Ionicons name="trash-outline" size={22} color={themeColors.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            loading ? (
              <Text style={{textAlign: 'center', color: themeColors.textSecondary, marginTop: 40}}>Đang tải địa chỉ...</Text>
            ) : (
              <View style={{alignItems: 'center', marginTop: 60}}>
                <Ionicons name="location-outline" size={64} color={themeColors.primary} style={{marginBottom: 16}} />
                <Text style={{color: themeColors.textSecondary, fontSize: 18, marginBottom: 8}}>Chưa có địa chỉ nào</Text>
                <Text style={{color: themeColors.textSecondary, fontSize: 14, marginBottom: 20}}>Hãy thêm địa chỉ nhận hàng để thuận tiện giao dịch.</Text>
                <TouchableOpacity style={{backgroundColor: themeColors.primary, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32}} onPress={onAddNew}>
                  <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Thêm địa chỉ mới</Text>
                </TouchableOpacity>
              </View>
            )
          }
          style={{marginHorizontal: 8, marginTop: 10}}
        />
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: themeColors.primary }]} onPress={onAddNew}>
          <Text style={styles.addBtnText}>Thêm địa chỉ mới</Text>
        </TouchableOpacity>
      </View>
      {editingAddress && (
        <EditAddressScreen
          address={editingAddress}
          onBack={() => setEditingAddress(null)}
          themeColors={themeColors}
          onSave={async () => {
            setEditingAddress(null);
            // Fetch lại danh sách địa chỉ
            const userStr = await AsyncStorage.getItem('user');
            if (userStr) {
              const user = JSON.parse(userStr);
              const res = await fetch(API_URLS.ADDRESSES_BY_USER(user.id));
              const data = await res.json();
              setAddresses(data);
              // Nếu đang ở CheckoutScreen, gọi onSelectAddress với địa chỉ vừa sửa nếu nó đang được chọn
              if (onSelectAddress && editingAddress) {
                const updated = data.find(a => a.id === editingAddress.id);
                if (updated && updated.selected) onSelectAddress(updated);
              }
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, },
  title: { fontSize: 20, fontWeight: 'bold' },
  addressItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginBottom: 10, padding: 12, elevation: 1, },
  addressLabel: { fontSize: 15, fontWeight: 'bold' },
  addressDetail: { fontSize: 13 },
  addBtn: { borderRadius: 8, paddingVertical: 16, marginHorizontal: 16, marginTop: 16, alignItems: 'center', },
  addBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold', },
}); 
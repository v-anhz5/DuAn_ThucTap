import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import { API_URLS } from '../utils/apiConfig';

export default function AddAddressScreen({ onBack, onAdd, themeColors }) {
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddAddress = async () => {
    if (!address || !zip) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập đầy đủ địa chỉ và mã vùng!' });
      return;
    }
    setLoading(true);
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) throw new Error('Chưa đăng nhập');
      const user = JSON.parse(userStr);

      // Gửi địa chỉ mới lên backend
      const res = await fetch(API_URLS.ADDRESSES(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          detail: address,
          zip: zip,
          selected: false
        })
      });
      if (!res.ok) throw new Error('Lỗi thêm địa chỉ!');
      Toast.show({ type: 'success', text1: 'Đã thêm địa chỉ mới!' });
      onAdd && onAdd();
      onBack && onBack();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi thêm địa chỉ!' });
    }
    setLoading(false);
  };

  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={onBack} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={[styles.container, { backgroundColor: themeColors.background }] }>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>Thêm mới địa chỉ</Text>
          <View style={{width:22}} />
        </View>
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.grayLight }]}
            value={address}
            onChangeText={setAddress}
            placeholder="Địa chỉ"
            placeholderTextColor={themeColors.textSecondary}
          />
          <TextInput
            style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.grayLight }]}
            value={zip}
            onChangeText={setZip}
            placeholder="Mã vùng"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: themeColors.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleAddAddress}
          disabled={loading}
        >
          <Text style={styles.addBtnText}>{loading ? 'Đang thêm...' : 'Thêm'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, },
  title: { fontSize: 20, fontWeight: 'bold' },
  form: { marginHorizontal: 20, marginTop: 20 },
  input: { borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 16 },
  addBtn: { borderRadius: 8, paddingVertical: 16, marginHorizontal: 20, marginTop: 24, alignItems: 'center', },
  addBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold', },
}); 
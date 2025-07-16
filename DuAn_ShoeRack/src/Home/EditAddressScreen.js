import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { API_URLS } from '../utils/apiConfig';

export default function EditAddressScreen({ onBack, address, themeColors, onSave }) {
  const [detail, setDetail] = useState(address?.detail || '');
  const [zip, setZip] = useState(address?.zip || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!detail || !zip) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập đầy đủ địa chỉ và mã vùng!' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URLS.ADDRESS_BY_ID(address.id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detail, zip })
      });
      if (!res.ok) throw new Error('Lỗi cập nhật địa chỉ!');
      Toast.show({ type: 'success', text1: 'Cập nhật địa chỉ thành công!' });
      onSave && onSave();
      onBack && onBack();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi cập nhật địa chỉ!' });
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
          <Text style={[styles.title, { color: themeColors.text }]}>Chỉnh sửa địa chỉ</Text>
          <View style={{width:22}} />
        </View>
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.grayLight }]}
            value={detail}
            onChangeText={setDetail}
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
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.addBtnText}>{loading ? 'Đang lưu...' : 'Lưu'}</Text>
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
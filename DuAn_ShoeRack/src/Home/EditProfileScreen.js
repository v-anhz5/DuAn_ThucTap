import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfileScreen({ onBack, onSave, user, themeColors }) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={onBack} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={[styles.container, { backgroundColor: themeColors.background }] }>
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.text }]}>Sửa thông tin cá nhân</Text>
          <View style={{width:22}} />
        </View>
        <View style={styles.form}>
          <TextInput style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.grayLight }]} value={name} onChangeText={setName} placeholder="Họ tên" placeholderTextColor={themeColors.textSecondary} />
          <TextInput style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.grayLight }]} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" placeholderTextColor={themeColors.textSecondary} />
          <TextInput style={[styles.input, { color: themeColors.text, backgroundColor: themeColors.grayLight }]} value={phone} onChangeText={setPhone} placeholder="Số điện thoại" keyboardType="phone-pad" placeholderTextColor={themeColors.textSecondary} />
        </View>
        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: themeColors.primary }]} onPress={() => onSave && onSave({name, email, phone})}>
          <Text style={styles.saveBtnText}>Sửa</Text>
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
  saveBtn: { borderRadius: 8, paddingVertical: 16, marginHorizontal: 20, marginTop: 24, alignItems: 'center', },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: 'bold', },
}); 
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URLS } from '../utils/apiConfig';

export default function DBScreen({ navigation, ...props }) {
  const [data, setData] = useState({});
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URLS.DB());
      const json = await res.json();
      setData(json);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lấy dữ liệu từ server!');
    }
    setLoading(false);
  };

  const updateData = async () => {
    if (!key || !value) {
      Alert.alert('Lỗi', 'Vui lòng nhập cả key và value!');
      return;
    }
    const newData = { ...data, [key]: value };
    setLoading(true);
    try {
      await fetch(API_URLS.DB(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      setData(newData);
      setKey('');
      setValue('');
      Alert.alert('Thành công', 'Đã cập nhật dữ liệu!');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể cập nhật dữ liệu lên server!');
    }
    setLoading(false);
  };

  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dữ liệu từ API:</Text>
        {Object.entries(data).map(([k, v]) => (
          <Text key={k} style={styles.item}>{k}: {v}</Text>
        ))}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Key"
            value={key}
            onChangeText={setKey}
          />
          <TextInput
            style={styles.input}
            placeholder="Value"
            value={value}
            onChangeText={setValue}
          />
        </View>
        <Button title="Thêm/Sửa" onPress={updateData} disabled={loading} />
        <View style={{ height: 10 }} />
        <Button title="Làm mới" onPress={fetchData} disabled={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  item: {
    fontSize: 16,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
    flex: 1,
  },
}); 
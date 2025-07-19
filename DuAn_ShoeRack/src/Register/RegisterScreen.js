import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_URLS } from '../utils/apiConfig';

export default function RegisterScreen({ navigation, ...props }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePassword = (pw) => pw.length >= 6;

  const handleRegister = async () => {
    if (!name || !phone || !email || !password) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập đầy đủ thông tin!' });
      return;
    }
    if (!validateEmail(email)) {
      Toast.show({ type: 'error', text1: 'Email không hợp lệ!' });
      return;
    }
    if (!validatePassword(password)) {
      Toast.show({ type: 'error', text1: 'Mật khẩu phải từ 6 ký tự trở lên!' });
      return;
    }
    setLoading(true);
    try {
      // Kiểm tra email đã tồn tại chưa (API mới)
      const res = await fetch(API_URLS.USERS());
      const users = await res.json();
      if (users.some(u => u.email === email)) {
        setLoading(false);
        Toast.show({ type: 'error', text1: 'Email đã tồn tại!' });
        return;
      }
      // Đăng ký mới (API mới)
      const res2 = await fetch(API_URLS.USERS(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, password, role: 'customer' })
      });
      if (res2.ok) {
        const newUser = await res2.json();
        console.log('USER REGISTER:', newUser);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        setLoading(false);
        Toast.show({ type: 'success', text1: 'Đăng ký thành công!' });
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
      } else {
        setLoading(false);
        Toast.show({ type: 'error', text1: 'Lỗi đăng ký!' });
      }
    } catch (e) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Lỗi kết nối server!' });
    }
  };

  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={styles.title}>Tạo tài khoản</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Họ và tên"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.registerButtonText}>Đăng kí</Text>}
        </TouchableOpacity>
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>Hoặc đăng kí với</Text>
          <View style={styles.line} />
        </View>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png'}} style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png'}} style={styles.socialIcon} />
          </TouchableOpacity>
        </View>
        <Text style={styles.loginText}>
          Đã có tài khoản?{' '}
          <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
            Đăng nhập
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 10,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  registerButton: {
    backgroundColor: '#3ec6a7',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 8,
    color: '#888',
    fontSize: 14,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
  },
  socialButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 10,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  loginText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  loginLink: {
    color: '#3ec6a7',
    fontWeight: 'bold',
  },
}); 
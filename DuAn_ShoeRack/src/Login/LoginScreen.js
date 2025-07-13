import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_URLS } from '../utils/apiConfig';

export default function LoginScreen({ navigation, ...props }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập email và mật khẩu!' });
      return;
    }
    if (!validateEmail(email)) {
      Toast.show({ type: 'error', text1: 'Email không hợp lệ!' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_URLS.USER_BY_EMAIL_PASSWORD(email, password));
      const users = await res.json();
      if (users.length > 0) {
        await AsyncStorage.setItem('user', JSON.stringify(users[0]));
        setLoading(false);
        Toast.show({ type: 'success', text1: 'Đăng nhập thành công!' });
        navigation.navigate('Home');
      } else {
        setLoading(false);
        Toast.show({ type: 'error', text1: 'Email hoặc mật khẩu không đúng!' });
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
        <Text style={styles.logoTitle}>SHOE</Text>
        <Text style={styles.logoSubTitle}>RACK</Text>
        <Text style={styles.loginTitle}>Login to Your Account</Text>
        <View style={styles.inputContainer}>
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
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Log In</Text>}
        </TouchableOpacity>
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>or continue with</Text>
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
        <Text style={styles.signupText}>
          Chưa có tài khoản?{' '}
          <Text style={styles.signupLink} onPress={() => navigation.navigate('Register')}>
            Đăng ký
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
  logoTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3ec6a7',
    letterSpacing: 2,
    marginTop: 20,
    marginBottom: 0,
  },
  logoSubTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
    letterSpacing: 2,
    marginBottom: 24,
    marginTop: -10,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
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
  loginButton: {
    backgroundColor: '#3ec6a7',
    borderRadius: 8,
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
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
  signupText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  signupLink: {
    color: '#3ec6a7',
    fontWeight: 'bold',
  },
}); 
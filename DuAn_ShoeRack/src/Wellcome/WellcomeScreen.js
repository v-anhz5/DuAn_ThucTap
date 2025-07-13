import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function WellcomeScreen({ navigation, ...props }) {
  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.logoTitle}>SHOE</Text>
            <Text style={styles.logoSubTitle}>RACK</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={styles.heart}>♡</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.rowCenter}>
              <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png'}} style={styles.socialIcon} />
              <Text style={styles.socialText}>Continue with Google</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <View style={styles.rowCenter}>
              <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png'}} style={styles.socialIcon} />
              <Text style={styles.socialText}>Continue with Facebook</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.orText}>or</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>Đăng nhập bằng mật khẩu</Text>
        </TouchableOpacity>
        <Text style={styles.signupText}>
          Bạn chưa có tài khoản?{' '}
          <Text style={styles.signupLink} onPress={() => navigation.navigate('Register')}>Đăng kí</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    marginBottom: 40,
    marginTop: -10,
  },
  heart: {
    fontSize: 24,
    color: '#3ec6a7',
    fontWeight: 'bold',
  },
  socialContainer: {
    width: '100%',
    marginBottom: 16,
  },
  socialButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3ec6a7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
    marginRight: 10,
  },
  socialText: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  orText: {
    color: '#888',
    fontSize: 14,
    marginVertical: 8,
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
    fontSize: 16,
    fontWeight: 'bold',
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
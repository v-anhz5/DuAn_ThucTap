import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeContext } from './src/theme/ThemeContext';

import WellcomeScreen from './src/Wellcome/WellcomeScreen';
import HomeScreen from './src/Home/HomeScreen';
import LoginScreen from './src/Login/LoginScreen';
import RegisterScreen from './src/Register/RegisterScreen';
import ProfileScreen from './src/Home/ProfileScreen';
import CartScreen from './src/Home/CartScreen';
import ProductDetailScreen from './src/Home/ProductDetailScreen';
import CheckoutScreen from './src/Home/CheckoutScreen';
import OrderHistoryScreen from './src/Home/OrderHistoryScreen';
import OrderDetailScreen from './src/Home/OrderDetailScreen';
import NotificationScreen from './src/Home/NotificationScreen';
import AddAddressScreen from './src/Home/AddAddressScreen';
import AddressListScreen from './src/Home/AddressListScreen';
import EditProfileScreen from './src/Home/EditProfileScreen';
import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();

export default function App() {
  const [theme, setTheme] = React.useState('light');
  const themeColors = theme === 'light'
    ? {
        primary: '#3ec6a7',
        background: '#fff',
        text: '#222',
        textSecondary: '#888',
        border: '#e0e0e0',
        gray: '#f2f2f2',
        grayLight: '#f6f6f6',
        danger: '#e53935',
        shadow: '#000',
      }
    : {
        primary: '#3ec6a7',
        background: '#222',
        text: '#fff',
        textSecondary: '#aaa',
        border: '#444',
        gray: '#333',
        grayLight: '#444',
        danger: '#e53935',
        shadow: '#000',
      };

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ themeColors, toggleTheme, theme }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Wellcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Wellcome" component={WellcomeScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="AddAddress" component={AddAddressScreen} />
          <Stack.Screen name="AddressList" component={AddressListScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </ThemeContext.Provider>
  );
} 
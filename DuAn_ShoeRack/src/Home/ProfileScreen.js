import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../theme/ThemeContext';
import EditProfileScreen from './EditProfileScreen';
import AddressListScreen from './AddressListScreen';
import AddAddressScreen from './AddAddressScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OrderHistoryScreen from './OrderHistoryScreen';
import OrderDetailScreen from './OrderDetailScreen';
import { API_URLS } from '../utils/apiConfig';
import { useFocusEffect } from '@react-navigation/native';
import NotificationScreen from './NotificationScreen';

function getStyles(themeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
      paddingTop: 36,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 10,
      marginTop: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: themeColors.text,
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 18,
    },
    avatarCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: themeColors.background,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      borderColor: themeColors.border,
      borderWidth: 1,
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      color: themeColors.text,
      marginBottom: 2,
    },
    phone: {
      fontSize: 14,
      color: themeColors.text,
      marginBottom: 8,
    },
    menuList: {
      backgroundColor: themeColors.background,
      borderRadius: 12,
      marginHorizontal: 16,
      paddingVertical: 4,
      elevation: 1,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderColor: themeColors.background,
    },
    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuLabel: {
      fontSize: 15,
      color: themeColors.text,
      marginLeft: 14,
    },
  });
}

export default function ProfileScreen({ onBack, navigation, themeColors, onUnreadCountChange }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [user, setUser] = useState(null); // KHÔNG hardcode user mặc định
  const [showNotification, setShowNotification] = useState(false); // Thêm state để mở NotificationScreen từ Profile
  const [unreadCount, setUnreadCount] = useState(0); // State badge thông báo

  // Lấy user từ AsyncStorage, nếu có thì fetch lại từ backend
  const fetchUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const localUser = JSON.parse(userStr);
      console.log('USER FROM ASYNC:', localUser);
      try {
        const res = await fetch(API_URLS.USER_BY_ID(localUser.id));
        if (res.ok) {
          const freshUser = await res.json();
          console.log('USER FROM API:', freshUser);
          setUser(freshUser);
          await AsyncStorage.setItem('user', JSON.stringify(freshUser));
        } else {
          setUser(localUser);
        }
      } catch {
        setUser(localUser);
      }
    } else {
      setUser(null);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUser();
    }, [])
  );

  const styles = getStyles(themeColors);

  const handleLogout = async () => {
    await AsyncStorage.clear(); // Xóa toàn bộ storage khi đăng xuất
    setShowLogout(false);
    if (navigation && typeof navigation.reset === 'function') {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } else if (onBack) {
      onBack();
    }
  };

  if (!user) return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Text>Chưa đăng nhập hoặc lỗi tải user!</Text>
      <TouchableOpacity onPress={handleLogout} style={{marginTop:20, padding:10, backgroundColor:'#3ec6a7', borderRadius:8}}>
        <Text style={{color:'#fff'}}>Đăng nhập lại</Text>
      </TouchableOpacity>
    </View>
  );

  if (showEdit) return (
    <EditProfileScreen
      onBack={() => setShowEdit(false)}
      user={user}
      onSave={async (u) => {
        try {
          const res = await fetch(API_URLS.USER_BY_ID(user.id), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(u)
          });
          if (!res.ok) throw new Error('Lỗi cập nhật backend');
          const updatedUser = await res.json();
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
          setShowEdit(false);
          fetchUser();
        } catch (e) {
          alert('Lỗi cập nhật thông tin!');
        }
      }}
      themeColors={themeColors}
    />
  );
  if (showAddress) return <AddressListScreen onBack={() => setShowAddress(false)} onAddNew={() => { setShowAddress(false); setShowAddAddress(true); }} themeColors={themeColors} />;
  if (showAddAddress) return <AddAddressScreen onBack={() => setShowAddAddress(false)} onAdd={() => setShowAddAddress(false)} themeColors={themeColors} />;
  if (showOrderHistory && !selectedOrder) return <OrderHistoryScreen onBack={() => setShowOrderHistory(false)} onSelectOrder={order => setSelectedOrder(order)} themeColors={themeColors} />;
  if (selectedOrder) return <OrderDetailScreen order={selectedOrder} onBack={() => setSelectedOrder(null)} themeColors={themeColors} />;
  if (showNotification) return (
    <NotificationScreen onBack={() => setShowNotification(false)} onUnreadCountChange={count => {
      setUnreadCount(count);
      if (typeof onUnreadCountChange === 'function') onUnreadCountChange(count);
    }} />
  );

  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={onBack} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>Profile</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Ionicons name="search-outline" size={22} color={themeColors.text} />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView contentContainerStyle={{paddingBottom: 40}} showsVerticalScrollIndicator={false}>
          {/* Avatar & Info */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarCircle, { backgroundColor: themeColors.background, borderColor: themeColors.border, borderWidth: 1 }] }>
              <Ionicons name="person-outline" size={60} color={themeColors.text} />
            </View>
            <Text style={[styles.name, { color: themeColors.text }]}>{user.name}</Text>
            <Text style={[styles.phone, { color: themeColors.textSecondary }]}>{user.phone}</Text>
          </View>
          {/* Menu List */}
          <View style={[styles.menuList, { backgroundColor: themeColors.background, shadowColor: themeColors.shadow }] }>
            <MenuItem icon="create-outline" label="Chỉnh sửa trang cá nhân" onPress={() => setShowEdit(true)} themeColors={themeColors} styles={styles} />
            <MenuItem icon="location-outline" label="Địa chỉ" onPress={() => setShowAddress(true)} themeColors={themeColors} styles={styles} />
            <TouchableOpacity onPress={() => setShowNotification(true)} style={{flexDirection:'row',alignItems:'center',paddingVertical:14,paddingHorizontal:20}}>
              <Ionicons name="notifications-outline" size={22} color={themeColors.primary} style={{marginRight:14}} />
              <Text style={{fontSize:16,color:themeColors.text,flex:1}}>Thông báo</Text>
              {unreadCount > 0 && (
                <View style={{backgroundColor:'#ff5252',borderRadius:8,minWidth:18,height:18,alignItems:'center',justifyContent:'center',paddingHorizontal:5,marginLeft:6}}>
                  <Text style={{color:'#fff',fontSize:12,fontWeight:'bold'}}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <MenuItem icon="moon-outline" label={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'} onPress={toggleTheme} themeColors={themeColors} styles={styles} />
            <MenuItem icon="shield-checkmark-outline" label="Chính sách bảo mật" onPress={() => setShowPrivacy(true)} themeColors={themeColors} styles={styles} />
            <MenuItem icon="document-text-outline" label="Điều khoản & Điều kiện" onPress={() => setShowTerms(true)} themeColors={themeColors} styles={styles} />
            <MenuItem icon="list-outline" label="Lịch sử đơn hàng" onPress={() => setShowOrderHistory(true)} themeColors={themeColors} styles={styles} />
            <MenuItem icon="log-out-outline" label="Đăng xuất" danger onPress={() => setShowLogout(true)} themeColors={themeColors} styles={styles} />
          </View>
        </ScrollView>
        {/* Modal xác nhận đăng xuất */}
        <Modal visible={showLogout} transparent animationType="fade">
          <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.2)',justifyContent:'center',alignItems:'center'}}>
            <View style={{backgroundColor:themeColors.background,borderRadius:12,padding:24,width:300,alignItems:'center'}}>
              <Text style={{fontSize:18,fontWeight:'bold',color:themeColors.danger,marginBottom:10}}>Đăng xuất</Text>
              <Text style={{fontSize:15,marginBottom:20,color:themeColors.text}}>Bạn có muốn đăng xuất không?</Text>
              <View style={{flexDirection:'row',justifyContent:'space-between',width:'100%'}}>
                <TouchableOpacity style={{flex:1,alignItems:'center',padding:10}} onPress={() => setShowLogout(false)}>
                  <Text style={{color:themeColors.text,fontSize:16}}>Thoát</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{flex:1,alignItems:'center',padding:10}} onPress={handleLogout}>
                  <Text style={{color:themeColors.primary,fontSize:16,fontWeight:'bold'}}>Có, đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Modal Chính sách bảo mật */}
        <Modal visible={showPrivacy} transparent animationType="slide">
          <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.2)',justifyContent:'center',alignItems:'center'}}>
            <View style={{backgroundColor:themeColors.background,borderRadius:12,padding:24,width:'90%',maxHeight:'80%'}}>
              <Text style={{fontSize:18,fontWeight:'bold',color:themeColors.primary,marginBottom:10}}>Chính sách bảo mật</Text>
              <ScrollView style={{marginBottom:16}}>
                <Text style={{color:themeColors.text,fontSize:15,lineHeight:22,marginBottom:10}}>
                  <Text style={{fontWeight:'bold'}}>1. Thu thập thông tin cá nhân</Text>{'\n'}
                  Chúng tôi thu thập các thông tin như họ tên, số điện thoại, địa chỉ, email khi bạn đăng ký tài khoản hoặc đặt hàng. Việc cung cấp thông tin là tự nguyện nhưng cần thiết để sử dụng các dịch vụ của chúng tôi.
                </Text>
                <Text style={{color:themeColors.text,fontSize:15,lineHeight:22,marginBottom:10}}>
                  <Text style={{fontWeight:'bold'}}>2. Mục đích sử dụng thông tin</Text>{'\n'}
                  Thông tin cá nhân được sử dụng để xử lý đơn hàng, giao hàng, hỗ trợ khách hàng, gửi thông báo về chương trình khuyến mãi, cải thiện chất lượng dịch vụ và đảm bảo quyền lợi người tiêu dùng.
                </Text>
                <Text style={{color:themeColors.text,fontSize:15,lineHeight:22,marginBottom:10}}>
                  <Text style={{fontWeight:'bold'}}>3. Bảo mật thông tin</Text>{'\n'}
                  Chúng tôi cam kết bảo mật thông tin cá nhân của bạn bằng các biện pháp kỹ thuật và quản lý phù hợp. Mọi thông tin sẽ không được tiết lộ cho bên thứ ba trừ khi có sự đồng ý của bạn hoặc theo yêu cầu của pháp luật.
                </Text>
                <Text style={{color:themeColors.text,fontSize:15,lineHeight:22,marginBottom:10}}>
                  <Text style={{fontWeight:'bold'}}>4. Quyền của khách hàng</Text>{'\n'}
                  Bạn có quyền kiểm tra, cập nhật, chỉnh sửa hoặc yêu cầu xóa thông tin cá nhân của mình bất cứ lúc nào bằng cách liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.
                </Text>
                <Text style={{color:themeColors.text,fontSize:15,lineHeight:22}}>
                  <Text style={{fontWeight:'bold'}}>5. Thay đổi chính sách</Text>{'\n'}
                  Chính sách bảo mật có thể được cập nhật để phù hợp với quy định pháp luật và nhu cầu kinh doanh. Mọi thay đổi sẽ được thông báo trên ứng dụng.
                </Text>
              </ScrollView>
              <TouchableOpacity style={{alignSelf:'flex-end',padding:8}} onPress={() => setShowPrivacy(false)}>
                <Text style={{color:themeColors.primary,fontWeight:'bold',fontSize:16}}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Modal Điều khoản & Điều kiện */}
        <Modal visible={showTerms} transparent animationType="slide">
          <View style={{flex:1,backgroundColor:'rgba(0,0,0,0.2)',justifyContent:'center',alignItems:'center'}}>
            <View style={{backgroundColor:themeColors.background,borderRadius:12,padding:24,width:'90%',maxHeight:'80%'}}>
              <Text style={{fontSize:18,fontWeight:'bold',color:themeColors.primary,marginBottom:10}}>Điều khoản & Điều kiện</Text>
              <ScrollView style={{marginBottom:16}}>
                <Text style={{color:themeColors.text,fontSize:15,lineHeight:22,marginBottom:10}}>
                  <Text style={{fontWeight:'bold'}}>1. Đăng ký và sử dụng tài khoản</Text>{'\n'}
                  Người dùng phải cung cấp thông tin chính xác khi đăng ký và chịu trách nhiệm bảo mật tài khoản của mình. Không sử dụng tài khoản của người khác hoặc cho người khác sử dụng tài khoản của mình.
                </Text>
                <Text style={{color:themeColors.text,fontSize:15,lineHeight:22,marginBottom:10}}>
                  <Text style={{fontWeight:'bold'}}>2. Đặt hàng và thanh toán</Text>{'\n'}
                  Khi đặt hàng, bạn cần kiểm tra kỹ thông tin sản phẩm, giá cả, địa chỉ nhận hàng. Việc thanh toán phải tuân thủ các phương thức được hỗ trợ trên ứng dụng.
                </Text>
                <Text style={{color:themeColors.text,fontSize:15,lineHeight:22,marginBottom:10}}>
                  <Text style={{fontWeight:'bold'}}>3. Giao hàng và đổi trả</Text>{'\n'}
                  Chúng tôi cam kết giao hàng đúng thời gian, địa điểm đã xác nhận. Chính sách đổi trả, hoàn tiền được áp dụng theo quy định đăng tải trên ứng dụng.
                </Text>
                <Text style={{color:themeColors.text,fontSize:15,lineHeight:22,marginBottom:10}}>
                  <Text style={{fontWeight:'bold'}}>4. Quyền và trách nhiệm của các bên</Text>{'\n'}
                  Người dùng có trách nhiệm cung cấp thông tin trung thực, tuân thủ quy định pháp luật và quy định của ứng dụng. Chúng tôi có quyền từ chối phục vụ hoặc khóa tài khoản nếu phát hiện vi phạm.
                </Text>
                <Text style={{color:themeColors.text,fontSize:15,lineHeight:22}}>
                  <Text style={{fontWeight:'bold'}}>5. Giải quyết tranh chấp</Text>{'\n'}
                  Mọi tranh chấp phát sinh sẽ được ưu tiên giải quyết bằng thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết theo quy định của pháp luật Việt Nam.
                </Text>
              </ScrollView>
              <TouchableOpacity style={{alignSelf:'flex-end',padding:8}} onPress={() => setShowTerms(false)}>
                <Text style={{color:themeColors.primary,fontWeight:'bold',fontSize:16}}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

function MenuItem({ icon, label, danger, onPress, themeColors, styles }) {
  return (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={22} color={danger ? themeColors.danger : themeColors.text} />
        <Text style={[styles.menuLabel, { color: danger ? themeColors.danger : themeColors.text }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={20} color={themeColors.text} />
    </TouchableOpacity>
  );
} 
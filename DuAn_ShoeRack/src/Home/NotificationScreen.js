import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { ThemeContext } from '../../App';

const notifications = [
  {
    id: 1,
    title: 'Đơn hàng #102xxx của bạn đang trên đường...',
    content: 'Mặt hàng vừa được thay đổi thành công.',
    time: '11:12',
    unread: true,
  },
  {
    id: 2,
    title: 'Cập nhật thông tin cá nhân!',
    content: '',
    time: '20 ngày trước',
    unread: false,
  },
];

export default function NotificationScreen({ onBack, themeColors }) {
  return (
    <View style={{flex:1}}>
      <TouchableOpacity onPress={onBack} style={{padding: 12, position: 'absolute', top: 30, left: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 20, elevation: 2}}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>
      <View style={[styles.container, { backgroundColor: themeColors.background }] }>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.danger }]}>Thông báo</Text>
          <TouchableOpacity>
            <Ionicons name="trash-outline" size={22} color={themeColors.danger} />
          </TouchableOpacity>
        </View>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Image source={require('../../assets/img_icon/icon_nike.webp')} style={styles.avatar} />
          <View>
            <Text style={[styles.hello, { color: themeColors.textSecondary }]}>Xin chào,</Text>
            <Text style={[styles.username, { color: themeColors.text }]}>Nguyễn Văn A</Text>
          </View>
        </View>
        {/* Notification List */}
        <ScrollView style={[styles.listBox, { backgroundColor: themeColors.background, borderColor: themeColors.border, borderWidth: 1 }]} contentContainerStyle={{paddingBottom: 40}}>
          {notifications.length === 0 ? (
            <View style={{alignItems: 'center', marginTop: 60}}>
              <Ionicons name="notifications-outline" size={64} color={themeColors.primary} style={{marginBottom: 16}} />
              <Text style={{color: themeColors.textSecondary, fontSize: 18, marginBottom: 8}}>Chưa có thông báo nào</Text>
              <Text style={{color: themeColors.textSecondary, fontSize: 14, marginBottom: 20}}>Bạn sẽ nhận thông báo khi có cập nhật mới.</Text>
              <TouchableOpacity style={{backgroundColor: themeColors.primary, borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32}} onPress={() => onBack()}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 16}}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          ) : notifications.map(n => (
            <View key={n.id} style={[styles.notiItem, { borderColor: themeColors.border }]}>
              <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
                <Text style={[styles.notiTitle, { color: themeColors.text }]}>{n.title}</Text>
                {n.unread && <View style={[styles.dot, { backgroundColor: themeColors.danger }]} />}
                <Text style={[styles.notiTime, { color: themeColors.textSecondary }]}>{n.time}</Text>
              </View>
              {n.content ? <Text style={[styles.notiContent, { color: themeColors.textSecondary }]}>{n.content}</Text> : null}
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, },
  title: { fontSize: 20, fontWeight: 'bold' },
  userInfo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10, },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, },
  hello: { fontSize: 13, },
  username: { fontSize: 15, fontWeight: 'bold' },
  listBox: { borderRadius: 12, marginHorizontal: 16, padding: 10, minHeight: 200, },
  notiItem: { borderBottomWidth: 1, paddingVertical: 10, },
  notiTitle: { fontSize: 15, fontWeight: 'bold' },
  notiContent: { fontSize: 13, marginTop: 2, },
  notiTime: { fontSize: 11, marginLeft: 8, },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 6, },
}); 
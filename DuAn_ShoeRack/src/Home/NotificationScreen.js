import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, TouchableHighlight, Modal } from 'react-native';
import { ThemeContext } from '../theme/ThemeContext';
import { API_URLS } from '../utils/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import io from 'socket.io-client';

export default function NotificationScreen({ onBack, onUnreadCountChange }) {
  const { themeColors } = useContext(ThemeContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [selectedNoti, setSelectedNoti] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const fetchUserAndNotifications = async () => {
      const userStr = await AsyncStorage.getItem('user');
      if (!userStr) return;
      const user = JSON.parse(userStr);
      setUserId(user.id);
      try {
        const res = await fetch(API_URLS.NOTIFICATIONS_BY_USER(user.id));
        const data = await res.json();
        console.log('DEBUG NOTIFICATIONS DATA:', data);
        setNotifications(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
        if (onUnreadCountChange) {
          const unread = Array.isArray(data) ? data.filter(n => !n.read).length : 0;
          onUnreadCountChange(unread);
        }
        // ĐÃ XÓA đoạn PATCH hàng loạt ở đây!
      } catch (e) {
        console.log('DEBUG NOTIFICATIONS ERROR:', e);
        setNotifications([]);
        if (onUnreadCountChange) onUnreadCountChange(0);
      }
      setLoading(false);
      // Kết nối socket và join room
      const socket = io('http://192.168.1.6:4000');
      socket.emit('join', user.id);
      socket.on('notification', (noti) => {
        if (!noti.userId || noti.userId === user.id) {
          setNotifications(prev => {
            const newList = [noti, ...prev];
            if (onUnreadCountChange) {
              const unread = newList.filter(n => !n.read).length;
              onUnreadCountChange(unread);
            }
            return newList;
          });
        }
      });
      return () => socket.disconnect();
    };
    fetchUserAndNotifications();
  }, []);

  // Swipe để xóa notification
  const handleDelete = async (id) => {
    await fetch(API_URLS.NOTIFICATIONS_ITEM(id), { method: 'DELETE' });
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (onUnreadCountChange) onUnreadCountChange(notifications.filter(n => n.id !== id && !n.read).length);
  };

  // Phân loại icon/màu
  const getNotiIcon = (item) => {
    if (item.title?.toLowerCase().includes('đơn hàng')) return { name: 'cube', color: '#3b82f6' };
    if (item.title?.toLowerCase().includes('cá nhân')) return { name: 'person', color: '#10b981' };
    if (item.title?.toLowerCase().includes('sản phẩm')) return { name: 'pricetag', color: '#f59e0b' };
    return { name: 'notifications', color: themeColors.primary };
  };

  // Sửa lại hàm mở chi tiết: chỉ mở modal, không đánh dấu đã đọc
  const handleOpenDetail = (item) => {
    setSelectedNoti(item);
    setShowDetail(true);
  };

  // Sửa lại hàm đóng chi tiết: khi đóng modal mới đánh dấu đã đọc
  const handleCloseDetail = async () => {
    setShowDetail(false);
    // Nếu thông báo chưa đọc thì đánh dấu đã đọc
    if (selectedNoti && !selectedNoti.read) {
      await fetch(API_URLS.NOTIFICATIONS_ITEM(selectedNoti.id), { method: 'PATCH' });
      setNotifications(prev => {
        const updated = prev.map(n => n.id === selectedNoti.id ? { ...n, read: true } : n);
        // Luôn cập nhật số badge sau khi cập nhật state
        if (onUnreadCountChange) {
          const unread = updated.filter(n => !n.read).length;
          onUnreadCountChange(unread);
        }
        return updated;
      });
    } else {
      // Cập nhật lại số badge nếu không có gì thay đổi
      if (onUnreadCountChange) {
        const unread = notifications.filter(n => !n.read).length;
        onUnreadCountChange(unread);
      }
    }
  };

  const renderItem = ({ item }) => {
    const icon = getNotiIcon(item);
    return (
      <TouchableHighlight
        underlayColor={'#e0f7fa'}
        onPress={() => handleOpenDetail(item)}
        style={{ borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}
      >
        <Animated.View style={[styles.notiCard, { backgroundColor: item.read ? themeColors.background : '#e0f7fa', opacity: 1 }] }>
          <Ionicons name={icon.name} size={28} color={icon.color} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.notiTitle, { color: themeColors.text }]}>{item.title}</Text>
            <Text style={[styles.notiContent, { color: themeColors.textSecondary }]}>{item.content}</Text>
            <Text style={styles.notiTime}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
          </View>
          {!item.read && <View style={styles.unreadDot} />}
        </Animated.View>
      </TouchableHighlight>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Thông báo</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={themeColors.primary} style={{ marginTop: 40 }} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color={themeColors.primary} />
          <Text style={styles.emptyText}>Chưa có thông báo nào!</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          extraData={notifications}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderRightActions={({ item }) => (
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ backgroundColor: '#ff5252', justifyContent: 'center', alignItems: 'center', width: 64, height: '100%', borderRadius: 12 }}>
              <Ionicons name="trash" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        />
      )}
      {/* Modal chi tiết notification */}
      <Modal
        visible={showDetail}
        transparent
        animationType="fade"
        onRequestClose={handleCloseDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name={getNotiIcon(selectedNoti || {}).name}
              size={48}
              color={getNotiIcon(selectedNoti || {}).color}
              style={{ marginBottom: 16 }}
            />
            <Text style={styles.modalTitle}>{selectedNoti?.title}</Text>
            <Text style={styles.modalContentText}>{selectedNoti?.content}</Text>
            <Text style={styles.modalTime}>
              {selectedNoti?.createdAt
                ? new Date(selectedNoti.createdAt).toLocaleString('vi-VN')
                : ''}
            </Text>
            <TouchableOpacity onPress={handleCloseDetail} style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    marginRight: 16,
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notiCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  notiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  notiContent: {
    fontSize: 14,
    marginBottom: 4,
  },
  notiTime: {
    fontSize: 12,
    color: '#888',
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff5252',
    marginLeft: 8,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    minWidth: 300,
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222',
    textAlign: 'center',
  },
  modalContentText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 14,
    textAlign: 'center',
  },
  modalTime: {
    fontSize: 13,
    color: '#888',
    marginBottom: 18,
  },
  modalCloseBtn: {
    backgroundColor: '#3ec6a7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 36,
    marginTop: 8,
  },
  modalCloseBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 
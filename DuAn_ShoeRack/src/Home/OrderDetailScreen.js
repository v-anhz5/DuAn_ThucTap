import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function OrderDetailScreen({ order, onBack, themeColors }) {
  if (!order) return null;
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }] }>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back-outline" size={22} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>Chi tiết đơn #{order.id}</Text>
        <View style={{width:22}} />
      </View>
      <View style={styles.infoBox}>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Trạng thái:</Text>
        <Text style={[styles.value, { color: themeColors.primary }]}>{order.status}</Text>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Ngày đặt:</Text>
        <Text style={[styles.value, { color: themeColors.text }]}>{new Date(order.createdAt).toLocaleString()}</Text>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Tổng tiền:</Text>
        <Text style={[styles.value, { color: themeColors.text }]}>{order.total?.toLocaleString()} đ</Text>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Phương thức giao hàng:</Text>
        <Text style={[styles.value, { color: themeColors.text }]}>{order.shippingMethod}</Text>
        <Text style={[styles.label, { color: themeColors.textSecondary }]}>Phương thức thanh toán:</Text>
        <Text style={[styles.value, { color: themeColors.text }]}>{order.paymentMethod}</Text>
      </View>
      <Text style={[styles.sectionTitle, { color: themeColors.text, marginLeft: 20 }]}>Sản phẩm</Text>
      <FlatList
        data={order.items}
        keyExtractor={(item, idx) => item.productId + '-' + item.size + '-' + item.color + '-' + idx}
        renderItem={({item}) => (
          <View style={[styles.productItem, { backgroundColor: themeColors.grayLight }]}>
            <Image source={require('../../assets/img_icon/image_giay.png')} style={styles.productImage} />
            <View style={{flex:1, marginLeft:10}}>
              <Text style={[styles.productName, { color: themeColors.text }]}>{item.name}</Text>
              <Text style={[styles.productDesc, { color: themeColors.textSecondary }]}>{item.desc}</Text>
              <View style={{flexDirection:'row',alignItems:'center',marginTop:2}}>
                <View style={[styles.colorCircle, {backgroundColor: item.color, borderColor: themeColors.border}]} />
                <Text style={[styles.meta, { color: themeColors.text }]}>{`Size ${item.size}`}</Text>
              </View>
              <Text style={[styles.price, { color: themeColors.primary }]}>{item.price?.toLocaleString()} đ x {item.qty}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={{paddingBottom: 40}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, },
  title: { fontSize: 20, fontWeight: 'bold' },
  infoBox: { marginHorizontal: 20, marginBottom: 16, borderRadius: 12, padding: 16, backgroundColor: '#f6f6f6' },
  label: { fontSize: 13, marginTop: 4 },
  value: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
  productItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, marginHorizontal: 16, marginBottom: 16, padding: 12, },
  productImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#fff', },
  productName: { fontSize: 15, fontWeight: 'bold', marginBottom: 2, },
  productDesc: { fontSize: 13, marginBottom: 4, },
  colorCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 1, marginRight: 6, },
  meta: { fontSize: 12, marginRight: 6, },
  price: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
}); 
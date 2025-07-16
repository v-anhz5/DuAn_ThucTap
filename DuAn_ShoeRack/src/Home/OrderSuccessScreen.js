import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OrderSuccessScreen({ onBack, themeColors }) {
  return (
    <View style={{alignItems:'center',justifyContent:'center',flex:1,padding:32,backgroundColor:themeColors.background}}>
      <Ionicons name="checkmark-circle" size={64} color={themeColors.primary} style={{marginBottom:16}} />
      <Text style={{fontSize:22,fontWeight:'bold',color:themeColors.primary,marginBottom:8}}>Đặt hàng thành công!</Text>
      <Text style={{color:themeColors.textSecondary,fontSize:16,textAlign:'center',marginBottom:24}}>Cảm ơn bạn đã mua sắm tại SHOE RACK. Đơn hàng của bạn sẽ được xử lý và giao trong thời gian sớm nhất.</Text>
      <TouchableOpacity style={{borderRadius:8,paddingVertical:16,minWidth:120,backgroundColor:themeColors.primary,alignItems:'center'}} onPress={onBack}>
        <Text style={{color:'#fff',fontSize:17,fontWeight:'bold'}}>Về trang chủ</Text>
      </TouchableOpacity>
    </View>
  );
} 
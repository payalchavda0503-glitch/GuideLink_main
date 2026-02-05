import {Text, View} from 'react-native';
import React from 'react';
import {DefaultStyle} from '../../../util/ConstVar';
import {Image} from 'react-native';

import {styles} from './styles';
import {COLORS} from '../../../util/Theme';
import FastImage from 'react-native-fast-image';
import {useNavigation} from '@react-navigation/native';

const BookingHistory = ({item}) => {
  let navigation = useNavigation();
  return (
    <View style={{paddingHorizontal: 15, paddingVertical: 8}}>
      <View style={[DefaultStyle.row]}>
        {/* <Image
          source={{uri: item.image_url}}
          style={styles.limage}
          resizeMode="contain"
        /> */}
        <FastImage
          style={styles.limage}
          source={{uri: item.image_url}}
          // defaultSource={require('../../../assets/images/ic_empty.jpg')}
          resizeMode={FastImage.resizeMode.contain}
          fallback
        />
        <View style={{paddingHorizontal: 15}}>
          <Text
            style={styles.name}
            onPress={() => {
              navigation.navigate('ExpertDetail', {ID: item.booked_with_id});
            }}>
            {item.name}
          </Text>
          <Text style={[styles.booking_date, {fontSize: 12}]}>
            {item.from_user_timezone}
          </Text>
          <Text style={[styles.booking_date, {fontSize: 12}]}>
            Call booked on {item.booking_date}
          </Text>
        </View>
      </View>

      <View style={styles.nameContent}>
        <View style={[DefaultStyle.flexDirectionSpace, {marginTop: 10}]}>
          <View style={{flex: 1}}>
            <Text style={DefaultStyle.txtblack13}>Appointment Id :</Text>
            <Text style={DefaultStyle.txtblack12}>{item.appointment_id}</Text>
          </View>
        </View>

        <View style={[DefaultStyle.flexDirectionSpace, {marginVertical: 10}]}>
          <View style={{flex: 1}}>
            <Text style={DefaultStyle.txtblack13}>Booked by :</Text>
            <Text style={DefaultStyle.txtblack12}>
              {item.booked_by == 0 ? 'You' : item.name}
            </Text>
          </View>

          <View style={{flex: 1}}>
            <Text style={[DefaultStyle.txtblack13, {textAlign: 'left'}]}>
              Amount :
            </Text>
            <Text style={[DefaultStyle.txtblack12, {textAlign: 'left'}]}>
              {item.total_amount ? item.total_amount : '-'}
            </Text>
          </View>
        </View>

        <View style={DefaultStyle.flexDirectionSpace}>
          <View style={{flex: 1}}>
            <Text style={DefaultStyle.txtblack13}>Call Date :</Text>
            <Text style={DefaultStyle.txtblack12}>
              {item.aapt_date ? item.aapt_date : '-'}
            </Text>
          </View>

          <View style={{flex: 1}}>
            <Text style={[DefaultStyle.txtblack13, {textAlign: 'left'}]}>
              Call Time :
            </Text>
            <Text style={[DefaultStyle.txtblack12, {textAlign: 'left'}]}>
              {item.start_time ? item.start_time : '-'}{' '}
              {item.slot_mins ? `(${item.slot_mins})` : ''}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BookingHistory;

import {Text, View} from 'react-native';
import React from 'react';
import {DefaultStyle} from '../../../util/ConstVar';
import {Image} from 'react-native';

import {styles} from './styles';

const List = ({item, select, onCancel, onRating, CancelApptDialogBox}) => {
  return (
    <View>
      <View style={[DefaultStyle.row, {marginTop: 5}]}>
        <View style={styles.imageContent}>
          {/* //source={{uri: item.image_url}} */}
          <Image
            source={item.image}
            style={styles.limage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.nameContent}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.booking_date}>{item.booking_date}</Text>

          <View style={[DefaultStyle.flexDirectionSpace, {marginVertical: 10}]}>
            <View>
              <Text style={DefaultStyle.txtblack13}>Amount :</Text>
              <Text style={DefaultStyle.txtblack12}>
                {item.total_amount ? item.total_amount : '-'}
              </Text>
            </View>

            <View>
              <Text style={DefaultStyle.txtblack13}>Total Time :</Text>
              <Text style={DefaultStyle.txtblack12}>
                {item.slot_mins ? item.slot_mins : '-'}
              </Text>
            </View>
          </View>

          <View style={[DefaultStyle.flexDirectionSpace, {marginVertical: 10}]}>
            <View>
              <Text style={DefaultStyle.txtblack13}>Call Date :</Text>
              <Text style={DefaultStyle.txtblack12}>
                {item.total_amount ? item.total_amount : '-'}
              </Text>
            </View>

            <View>
              <Text style={DefaultStyle.txtblack13}>Call Time :</Text>
              <Text style={DefaultStyle.txtblack12}>
                {item.slot_mins ? item.slot_mins : '-'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View style={[DefaultStyle.devider]} />
    </View>
  );
};

export default List;

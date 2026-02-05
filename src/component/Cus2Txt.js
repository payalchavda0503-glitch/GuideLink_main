import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {DefaultStyle} from '../util/ConstVar';
import {COLORS} from '../util/Theme';

const Cus2Txt = ({lbl1, lbl2}) => {
  return (
    <View>
      <Text style={[DefaultStyle.blackBold, {color: COLORS.primary}]}>
        {lbl1}
      </Text>
      <Text style={[DefaultStyle.txtblack12,{marginBottom:15}]}>{lbl2}</Text>
    </View>
  );
};

export default Cus2Txt;

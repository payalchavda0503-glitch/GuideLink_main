import {Pressable, StyleSheet, Text, View} from 'react-native';
import React from 'react';

const CustomLabel = ({label1, label2, lbl1style, lbl2style, onpress}) => {
  return (
    <Pressable onPress={onpress}>
      <View style={styles.row}>
        <Text style={lbl1style}>{label1}</Text>
        <Text style={lbl2style}>{label2}</Text>
      </View>
    </Pressable>
  );
};

export default CustomLabel;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flex: 1,
    alignSelf: 'center',
    marginVertical: 10,
  },
});

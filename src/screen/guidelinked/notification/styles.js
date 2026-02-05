import {StyleSheet, Text, View} from 'react-native';
import {COLORS} from '../../../util/Theme';

export const styles = StyleSheet.create({
  itemBox: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  imageBox: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 5,
    width: 30,
    height: 30,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center', // Add this line to center vertically
  },
  title: {fontSize: 16, color: COLORS.black2, fontWeight: 'bold'},
  description: {fontSize: 12, color: COLORS.gray},
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
});

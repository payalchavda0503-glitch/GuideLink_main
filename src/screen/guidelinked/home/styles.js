import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS, SIZES} from '../../../util/Theme';

export const styles = StyleSheet.create({
  container: {backgroundColor: COLORS.white,flex:1},
  
  nextApt: {
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
  },
  date: {
    fontSize: 20,
    color: COLORS.black,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 0,
    marginTop: 0,
  },
  browse: {fontWeight: 'bold', fontSize: 18, color: COLORS.black},
  linearGradient: {
    marginVertical: 5,
    minWidth: SIZES.width * 0.44,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 18,
  },
  img: {width: 68, height: 68, tintColor: COLORS.white},
  bookings: {
    fontWeight: 'bold',
    fontSize: 18,
    color: COLORS.white,
    marginTop: 5,
  },
  join: {
    fontWeight: 'bold',
    fontSize: 20,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
});

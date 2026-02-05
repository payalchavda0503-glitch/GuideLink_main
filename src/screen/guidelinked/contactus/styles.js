import {Platform, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS, SIZES} from '../../../util/Theme';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: 'bold',
    textAlign: 'center',
    //textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 40,
  },
  label: {fontSize: 16, color: COLORS.black, marginBottom: 2},
  input: {
    borderColor: COLORS.gray,
    marginBottom: 10,
    borderWidth: 1,
    color: COLORS.black,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical:Platform.OS=="ios"? 15 :12
  },
 Message:{
  borderColor: COLORS.gray,
  marginBottom: 10,
  borderWidth: 1,
  color: COLORS.black,
  borderRadius: 10,
  paddingHorizontal: 15,
  paddingVertical:Platform.OS=="ios"? 12 :12,
  minHeight:Platform.OS=='ios'&&80,

 },
  //dropdown

  dropdownTitle: {color: COLORS.black, fontSize: 14},
  dropdownLabel: {color: COLORS.black, fontSize: 15, paddingStart: 10},
  dropdownicon: {tintColor: COLORS.black, height: 18, width: 18, marginEnd: 10},
  dropdoenContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    //width: wp('92%'),
    //height: 52,
    alignSelf: 'center',
    fontSize: 14,

    marginBottom: 10,
  },
  dropdownPlaceholder: {color: COLORS.black, fontSize: 14, fontWeight: 'bold'},

  btn: {
   minWidth: SIZES.width * 0.3,
    backgroundColor: COLORS.primary,
    marginVertical: 20,
   // paddingHorizontal: 50,
    borderRadius: 20,
    alignSelf: 'center',
  },

  phoneContainerStyle: {
    backgroundColor: COLORS.white,
    color: COLORS.black,
    borderRadius: 10,
    height: 48,
    borderColor: COLORS.gray,
    marginBottom: 10,
    borderWidth: 1,
    alignItems: 'center',
    // alignSelf: 'center',
    width: 'auto',
  },
  phoneTextContainerStyle: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    height: 46,
    padding: 0,
    backgroundColor: COLORS.white,
  },
  phoneFlugBtnStyle: {
    backgroundColor: COLORS.white,
    width: 62,
    height: 46,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  phoneTextInputStyle: {
    backgroundColor: COLORS.white,
    height: 45,
    marginStart: -5,
    fontSize: 14,
    padding: 0,
    color: COLORS.black,
  },
  countrycodeStyle: {
    height: 28,
    paddingVertical: 5,
    marginStart: -5,
    backgroundColor: COLORS.white,
    color: COLORS.black,
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'center',
  },
  countryContaine: {paddingHorizontal: 15, backfaceVisibility: COLORS.red},
  flag: {width: 10, height: 10},
  countryName: {fontSize: 16, color: COLORS.black},
});

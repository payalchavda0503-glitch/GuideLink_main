import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {COLORS, SIZES} from '../../util/Theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  textH1: {
    fontSize: hp('4%'),
    textAlign: 'left',
    fontWeight: 'bold',
    color: COLORS.black,
  },
  img: {
    height: 300, // 70% of height device screen
    width: 300,
    alignSelf: 'center',
  },
  back: {marginStart: 0, fontSize: 18, color: COLORS.black},
  forgotPass: {
    marginVertical: 10,
    fontSize: 22,
    color: COLORS.black,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  txt: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: COLORS.black,
  },
  otpContainer: {
    alignSelf: 'center',
    //width: wp('65%'),
  },
  textInputStyle: {
    borderRadius: 10,
    borderWidth: 1,
    width: 42, //38
    borderBottomWidth: 1,
    backgroundColor: COLORS.disabled,
    marginEnd: 8, //4
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.black,
  },
  text1: {
    paddingStart: 5,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.pink,
    textDecorationLine: 'underline',
  },
  codeFieldRoot: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  cell: {
    width: SIZES.width * 0.1,
    height: 50,
    lineHeight: 48,
    fontSize: 20,
    borderWidth: 1,
    marginBottom: 10,
    borderColor: '#ccc',
    textAlign: 'center',
    marginHorizontal: 8,
    borderRadius: 8,
  },
  focusCell: {
    borderColor: '#007AFF',
  },
});

import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {COLORS, SIZES} from '../../util/Theme';

export const styles = StyleSheet.create({
  container: {
    // alignSelf: 'center',
    // marginHorizontal: 20,
  },
  img: {
    height: 250,
    width: 250,
    alignSelf: 'center',
  },
  back: {marginStart: 8, fontSize: 14, color: COLORS.black},
  forgotPass: {
    marginTop: 20,
    marginVertical: 10,
    fontSize: hp('3.5%'),
    color: COLORS.primary,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  donotEnter: {
    //width: SIZES.width * 0.8,
    color: COLORS.primary,
    fontSize: 12,
    marginTop: 0,
    marginBottom: 10,
  },
  dropdownTitle: {color: COLORS.black, fontSize: 14},
  dropdownLabel: {color: COLORS.black, fontSize: 15, paddingStart: 10},
  dropdownicon: {tintColor: COLORS.black, height: 18, width: 18, marginEnd: 10},
  dropdoenContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 6,
    //width: wp('92%')
    height: 52,
    alignSelf: 'center',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
  },

  phoneContainerStyle: {
    backgroundColor: COLORS.white,
    color: COLORS.black,
    borderRadius: 10,
    height: 52,
    borderColor: COLORS.gray,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
    alignSelf: 'center',
    // width: wp('92%'),
    width: 'auto',
  },
  phoneTextContainerStyle: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row', // Ensures inline alignment
    backgroundColor: COLORS.white,
  },
  phoneFlagBtnStyle: {
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
    marginStart: -5,
    height: 45,
    fontSize: 14,
    padding: 0,
    color: COLORS.black,
  },

  countrycodeStyle: {
    height: 28,
    paddingVertical: Platform.OS == 'ios' ? 5 : 4,
    marginStart: -5,
    backgroundColor: COLORS.white,
    color: COLORS.black,
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'center',
  },

  //phoneinput
  containerStyle: {
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 10,
    // alignSelf: 'center',
    height: 48,
    marginTop: 5,
    width: 'auto',
    borderColor: COLORS.gray,
    borderWidth: 1,
    backgroundColor: COLORS.white,
    color: COLORS.black,
    //marginBottom: 10,
  },
  textContainerStyle: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    height: 46,
    padding: 0,
    backgroundColor: COLORS.white,
  },
  flugBtnStyle: {
    //borderRightWidth: 1,
    backgroundColor: COLORS.disabled,
    width: 62,
    height: 46,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  textInputStyle: {
    backgroundColor: COLORS.white,
    height: 45,
    marginStart: -5,
    fontSize: 14,
    padding: 0,
    color: COLORS.black,
  },

  Already: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.black,
  },
  Login: {
    paddingStart: 5,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
    color: COLORS.primary,
  },

  resend: {
    marginStart: 5,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.black,
    textDecorationLine: 'underline',
  },
  txt: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: COLORS.black,
  },
  otpContainer: {
    alignSelf: 'center',
    // width: wp('65%'),
  },
  otpTextInputStyle: {
    borderRadius: 10,
    borderWidth: 1,
    //width: 42,
    minWidth: 30,
    maxWidth: 42,
    borderBottomWidth: 1,
    backgroundColor: COLORS.disabled,
  },
  txt1: {
    fontSize: 14,

    color: COLORS.gray,
  },
  privacy: {
    fontSize: 14,
    paddingHorizontal: 5,
    fontWeight: 'bold',
    color: COLORS.gray,
    textDecorationLine: 'underline',
  },
  term: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray,
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

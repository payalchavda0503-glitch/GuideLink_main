import {StyleSheet, Platform} from 'react-native';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {COLORS, SIZES} from '../../../util/Theme';

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  img: {
    height: hp('30%'), // 70% of height device screen
    width: wp('50%'),
    marginTop: 20,
    alignSelf: 'center',
  },

  textTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: hp('3%'),
    color: COLORS.black,
  },
  text: {
    fontSize: 14,
    color: COLORS.gray,
  },
  unverify: {
    color: COLORS.green,
    fontWeight: 'bold',
    fontSize: 14,
  },

  input1: {
    borderColor: COLORS.gray,
    marginVertical: 10,
    borderWidth: 1,
    paddingVertical: 12,
    color: COLORS.black,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  empty: {
    fontSize: 16,
    color: COLORS.black,
    textAlign: 'center',
    marginVertical: 10,
    marginHorizontal: 10,
  },
  btnplus: {
    right: 20,
    position: 'absolute',
    backgroundColor: COLORS.white,
    bottom: Platform.OS == 'ios' ? 130 : 90,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 5}, // Shadow offset
    shadowOpacity: 0.5, // Shadow opacity
    elevation: 10,
    borderRadius: 100,
  },
  btn: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    minWidth: SIZES.width * 0.3,
    paddingHorizontal: 35,
  },
  otpContainer: {
    alignSelf: 'center',
    marginVertical: 10,
    width: SIZES.width * 0.95,
  },
  // otpTextInputStyle: {
  //   borderRadius: 10,
  //   borderWidth: 1,
  //   width: 50, //38
  //   borderBottomWidth: 1,
  //   backgroundColor: COLORS.disabled,
  //   marginEnd: 8, //4
  // },
  otpTextInputStyle: {
    borderRadius: 10,
    borderWidth: 1,
    //width: 42,
    minWidth: 30,
    maxWidth: 42,
    borderBottomWidth: 1,
    backgroundColor: COLORS.disabled,
  },

  lbl1: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.black,
  },
  lbl2: {
    paddingStart: 5,
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  iconStatus: {
    alignItems: 'center',
  },
  email: {
    fontSize: 14,
    color: COLORS.black,
    marginStart: 10,
  },
  fabImg: {
    width: 50,
    height: 50,
  },

  addBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 20,

    backgroundColor: COLORS.primary,
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

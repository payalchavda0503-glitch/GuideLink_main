import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS, SIZES} from '../../../util/Theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  searchInput: {
    borderColor: COLORS.gray,
    borderWidth: 1,
    color: COLORS.black,
    borderRadius: 10,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    width: SIZES.width * 0.6,
    height: 38,
  },
  iconSearch: {position: 'absolute', right: SIZES.width * 0.3, top: 10},
  leftcontain: {
    position: 'absolute',
    right: 20,
    top: 8,
    flexDirection: 'row',
  },

  textTabUnSelect: {
    textTransform: 'uppercase',
    fontSize: 16,
    paddingHorizontal: 8,
    color: COLORS.gray,
  },
  textTabSelect: {
    textTransform: 'uppercase',
    fontSize: 16,
    paddingHorizontal: 8,
    color: COLORS.primary,
  },
  scrollView: {
    height: SIZES.height * 0.85,
    paddingBottom: 80,
    marginBottom: 50,
  },
  icon: {
    height: hp('35%'), // 70% of height device screen
    width: wp('100%'),
  },
  ic_bak: {position: 'absolute', top: 10, left: 10, padding: 5},

  flexSpaceCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  leftConatiner: {
    flex: 1.5,
    marginTop: 10,
  },
  leftRightConatent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightConatiner: {
    flex: 0.5,
    marginTop: 10,
  },
  row: {flexDirection: 'row'},
  counting: {fontSize: 16, color: COLORS.red, marginStart: 4},
  name: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: 'bold',
    maxWidth: SIZES.width * 0.75,
  },
  flag: {width: 30, height: 20, marginStart: 10},
  dolar: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 20,
    paddingHorizontal: 5,
  },
  circlelinkedin: {
    width: 30,
    height: 30,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlefb: {
    width: 30,
    height: 30,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: COLORS.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInsta: {
    width: 30,
    height: 30,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: COLORS.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },

  booking_date: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 2,
  },
  whatHelp: {
    marginTop: 5,
    color: COLORS.black,
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewmore: {
    textAlign: 'right',
    fontSize: 14,
    color: COLORS.red,
    marginTop: 10,
    marginBottom: 20,
  },
  textAVL: {
    color: COLORS.black,
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  devider: {
    marginVertical: 10,
    backgroundColor: COLORS.gray,
    height: 1,
  },
  deviderBold: {
    marginVertical: 10,
    backgroundColor: COLORS.black,
    height: 2,
  },
  rate: {
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
    textAlign: 'center',
  },

  //Rating and commet
  ratingItem: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  imageContainer: {
    marginRight: 10,
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  detailsContainer: {
    flex: 1,
    marginTop: 5,
  },

  ratingDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginRight: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: 'orange', // Adjust color as needed
  },

  //List exper screen

  imageContent: {
    alignItems: 'center',
    width: SIZES.width * 0.2,
  },
  nameContent: {
    width: SIZES.width * 0.85,
  },

  limage: {
    width: 50,
    height: 40,
    borderRadius: 100,
  },
  review: {color: COLORS.red, fontSize: 14, fontWeight: 'bold'},
  forbidden: {color: COLORS.red, fontSize: 12, fontWeight: 'bold'},

  cancelBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 20,

    backgroundColor: COLORS.primary,
  },

  rateNowBtn: {
    flexDirection: 'row',
    width: '48%',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 20,

    backgroundColor: COLORS.primary,
  },

  SucBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },

  cancelBtn1: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.red,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },

  // SucBtn1: {
  //   borderRadius: 20,
  //   paddingVertical: 6,
  //   marginVertical: 10,
  //   maxWidth: SIZES.width * 0.25,
  //   justifyContent: 'center',
  //   backgroundColor: COLORS.green,
  //   paddingHorizontal: 15,
  // },
  underLine: {
    //textAlign: 'center',
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

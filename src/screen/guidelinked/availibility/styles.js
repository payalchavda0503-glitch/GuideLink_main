import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {COLORS, SIZES} from '../../../util/Theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  fabContent: {
    right: 30,
    position: 'absolute',
    backgroundColor: COLORS.white,
    bottom: 80,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 5}, // Shadow offset
    shadowOpacity: 0.5, // Shadow opacity
    elevation: 4,
    borderRadius: 100,
  },
  fabImg: {
    width: 50,
    height: 50,
  },

  modalContentBottomDialog: {
    flex: 1,
    justifyContent: 'flex-end',
    alignContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  modalContentDialog: {
    backgroundColor: COLORS.white,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 10,
    paddingHorizontal: 15,
  },
  label: {
    fontSize: 16,
    color: COLORS.black,
    marginStart: 0,
    marginBottom: 4,
    color: COLORS.black,
    fontWeight: 'bold',
  },

  datediview: {
    color: 'white',
    borderRadius: 10,
    width: SIZES.width * 0.5,
    backgroundColor: COLORS.white,
    height: 40,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderColor: COLORS.darkgray, //COLORS.black,
    borderWidth: 1,
  },
  dateTxt: {
    fontSize: 14,
    color: COLORS.black,
  },
  stime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  action: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    width: SIZES.width * 0.2,
    marginTop: 15,
    marginBottom: 10,
  },
  startTmtDiv: {
    color: 'white',
    borderRadius: 10,
    width: SIZES.width * 0.28,
    backgroundColor: COLORS.white,
    height: 40,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderColor: COLORS.darkgray, //COLORS.black,
    borderWidth: 1,
  },
  iconCancel: {
    borderRadius: 10,
    height: 40,
    width: 40,
    backgroundColor: COLORS.white,
    borderColor: COLORS.red,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderColor: COLORS.gray,
    borderWidth: 1,
    color: COLORS.black,
    borderRadius: 10,
    padding: 10,
    maxHeight: 50,
  },
  listItemContainer: {
    flexDirection: 'column',
  },
  listItemHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    color: COLORS.primary,
  },
  listItemAvilableSlots: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  listItemSlotContainer: {
    flexDirection: 'column',
  },
  listItemSlotHeading: {
    color: COLORS.black,
    flex: 2,
  },
  btnSave: {
    backgroundColor: COLORS.primary,
    marginVertical: 10,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignSelf: 'center',
  },
});

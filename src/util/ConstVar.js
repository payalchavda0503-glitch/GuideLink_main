import {Platform, StyleSheet} from 'react-native';
import {COLORS, SIZES} from './Theme';

export const DATA = '__DATA__';
export const TOKEN = 'Token';
export const CAMERA = 'Camera';
export const STORAGE = '_STORAGE_PERMISSION_';
export const STORAGEANDCAMREA = '_CAMERA_STORAGE_PERMISSION_';
export const FCMID = 'FcmId';
export const DEFAULT_THEME = 'DefaultTheme';
export const FCMTOKEN = '_fcmToken_';
export const COUNTRYCODE = '_country _code _';

export const DefaultStyle = StyleSheet.create({
  flexView: {flex: 1, backgroundColor: COLORS.white},
  flexBg: {flex: 1, backgroundColor: COLORS.white},
  flexPrimary: {flex: 1, backgroundColor: COLORS.primary},

  Center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: COLORS.white,
  },
  margingView: {flex: 1, marginStart: 20, marginEnd: 20},
  flexDirection: {flexDirection: 'row', alignItems: 'center'},
  flexDirectionSpace: {flexDirection: 'row', justifyContent: 'space-between'},
  flexSpaceCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  row: {flexDirection: 'row'},
  flexCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flexAround: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-around',
  },
  viewCenter: {alignItems: 'center', flex: 1, backgroundColor: COLORS.white},

  btn: {
    backgroundColor: COLORS.primary,
    width: SIZES.width * 0.9,
    borderRadius: 10,
    marginVertical: 10,
  },

  btnClear: {
    width: SIZES.width * 0.3,
    margin: 10,
    borderRadius: 10,
    backgroundColor: COLORS.darkgray,
  },
  btnBorder: {
    width: SIZES.width * 0.3,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderColor: COLORS.gray,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignContent: 'center',
  },

  btnSmall: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'center',
  },

  btnLogin: {
    paddingHorizontal: 40,
    backgroundColor: COLORS.primary,
    marginVertical: 10,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  btnDanger: {
    paddingHorizontal: 40,
    backgroundColor: COLORS.primary,
    marginVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },

  cancelButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
  },
  btnClose: {
    backgroundColor: COLORS.white,
    color: COLORS.black,
    borderColor: COLORS.gray,
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  icon: {width: 18, height: 18, tintColor: COLORS.black},
  tabIcon: {width: 26, height: 28, tintColor: COLORS.white},
  input: {
    width: SIZES.width * 0.9,
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 6,
    paddingHorizontal: 20,
    color: COLORS.black,
    borderColor: COLORS.gray,
  },

  inputRating: {
    //width: SIZES.width * 0.7,
    borderWidth: 1,
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 6,
    paddingHorizontal: 15,
    color: COLORS.black,
    paddingVertical: Platform.OS == 'ios' && 12,
    // minHeight:Platform.OS=='ios'&&80,
    borderColor: COLORS.gray,
  },
  textblack: {fontSize: 14, color: COLORS.black},
  blackBold: {fontSize: 15, color: COLORS.black, fontWeight: 'bold'},
  text: {fontSize: 14, color: COLORS.gray},
  texBold13: {fontSize: 16, color: COLORS.black, fontWeight: 'bold'},
  textPrimaryheading: {
    fontSize: SIZES.font20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  txtgray12: {fontSize: 14, color: COLORS.gray},
  txtblack12: {fontSize: 12, color: COLORS.black},
  txtgray12bold: {fontSize: 12, color: COLORS.gray, fontWeight: 'bold'},
  txtblack13: {fontSize: 13, color: COLORS.black, fontWeight: 'bold'},
  txtPrimary14: {fontSize: 14, color: COLORS.primary},
  txt14: {fontSize: 14, color: COLORS.black},
  txt14bold: {fontSize: 14, color: COLORS.black, fontWeight: 'bold'},
  textH1: {fontSize: 20, color: COLORS.black, fontWeight: 'bold'},
  txtCapital: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  whiteBold: {
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.white,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#rgba(0, 0, 0.5, 0.5)',
    zIndex: 1000,
  },

  modalContent: {
    backgroundColor: 'white',
    width: SIZES.width * 0.9,
    borderRadius: 10,
    padding: 10,
    elevation: 1,
  },

  modalContentBottomDialog: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  modalContentCenterDialog: {
    position: 'absolute', // Ensure it stacks on top
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    elevation: 0,
  },
  modalContentDialog: {
    backgroundColor: COLORS.white,
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },

  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.disabled,
    padding: 10,
    borderRadius: 10,
  },

  devider: {
    backgroundColor: COLORS.darkgray,
    height: 1,
  },
  shadow: {
    shadowColor: COLORS.red,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.53,
    shadowRadius: 13.97,
    elevation: 22,
  },
});

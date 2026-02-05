import {StyleSheet} from 'react-native';
import {COLORS, SIZES} from '../../util/Theme';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    //alignSelf: 'center',
  },
  back: {marginStart: 0, fontSize: 18, color: COLORS.black},
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  img: {
    height: 300, // 70% of height device screen
    width: 300,

    alignSelf: 'center',
  },
  login: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLORS.black,
  },
  input: {
    height: 48,
    paddingHorizontal: 15,
    //width: wp('80%'),
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 10,
    marginVertical: 10,
  },
  Keepme: {fontSize: 14, color: COLORS.black2, marginStart: 6},
  forgot: {
    color: COLORS.blue,
    fontSize: 12,
    textAlign: 'right',
    paddingVertical: 5,
    fontWeight: 'bold',
  },

  text: {
    textAlign: 'center',
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.blue,
  },

  txt: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
    color: COLORS.black,
  },
  otpContainer: {
    alignSelf: 'center',
    width: wp('80%'),
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
  Already: {
    fontSize: 16,
    textAlign: 'center',
    color: COLORS.black,
  },

  resend: {
    marginStart: 5,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.black,
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

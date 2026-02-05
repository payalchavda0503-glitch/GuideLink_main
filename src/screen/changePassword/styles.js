import {StyleSheet} from 'react-native';

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {COLORS, SIZES} from '../../util/Theme';

export const styles = StyleSheet.create({
  container: {
    padding:20,
  },
  img: {
    height:250,
    width:250,
    alignSelf: 'center',
  },

  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 10,
    fontSize: hp('3%'),
    color: COLORS.primary,
  },
});

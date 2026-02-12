import {StyleSheet} from 'react-native';
import {COLORS, SIZES} from '../../../util/Theme';

export const styles = StyleSheet.create({
  scrollView: {
    height: SIZES.height * 0.85,
    paddingBottom: 80,
    marginBottom: 50,
  },
  scrollViewDetails: {
    height: SIZES.height * 1,
    paddingBottom: 80,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    flexShrink: 1,
    maxWidth: '60%',
    marginTop: 4,
    marginRight: 0,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.black,
    marginRight: 8,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 0,
    borderColor: 'transparent',
    marginRight: 8,
    marginTop:4
  },
  categoryPillText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '500',
  },
  expertTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  expertTypePillText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  auraText: {
    fontSize: 12,
    color: COLORS.black,
    fontWeight: '500',
    marginLeft: 4,
  },
  auraIcon: {
    width: 16,
    height: 16,
  },
  //expert deatil  style

  ic_back: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 5,
  },
  imgVerify: {width: 20, height: 20, marginStart: 4},

  flexSpaceCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  leftConatiner: {
    flex: 1.5,
    //marginTop: 10,
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
  counting: {fontSize: 16, color: '#808080', marginHorizontal: 4},
  name: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: 'bold',
    maxWidth: SIZES.width,
    marginEnd: 2,
  },
  flag: {width: 30, height: 15, marginStart: 4},
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

  desc: {
    color: COLORS.black,
    fontSize: 14,
    marginVertical: 15,
  },
  whatHelp: {
    marginTop: 5,
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewmore: {
    textAlign: 'right',
    fontSize: 14,
    color: COLORS.red,
    marginTop: 10,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  textAVL: {
    fontSize: 16,
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

  icon: {
    height: 250, //undefined
    width: 250,
    aspectRatio: 1,
    borderRadius: 200,
    alignSelf: 'center',
    marginVertical: 8,
    borderWidth: 2,
    borderColor: COLORS.gray,

    // width:SIZES.width,
    // height:290,
  },

  Lname: {fontSize: 16, color: COLORS.black, fontWeight: 'bold', marginEnd: 6},

  //List exper screen
  flatlistContainer: {marginTop: 0},
  imageContent: {alignItems: 'center', flex: 1},
  nameContent: {
    marginStart: 15,
    flex: 4,
  },

  limage: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },

  lBtn: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 6,
    borderColor: COLORS.primary,
    paddingHorizontal: 15,
    marginTop: 10,
  },
  price: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 5,
  },
});

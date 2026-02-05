import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import {COLORS, SIZES} from '../../../util/Theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  version: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.black,
    fontSize: 15,
    marginVertical: 50,
  },
  DrawerContainer: {
    backgroundColor: COLORS.white,
    width: SIZES.width * 0.8,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.85,
    shadowRadius: 3.84,
    elevation: 1,
    //  //marginTop: Platform.OS == "ios" ? 0 : StatusBar.currentHeight,
  },
  drawerStyle: {
    backgroundColor: COLORS.white,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    width: SIZES.width * 0.8,
    marginTop: Platform.OS == 'ios' ? 0 : StatusBar.currentHeight,
  },
  headerView: {
    paddingVertical: 20,
    //paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  profileLogo: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderColor: COLORS.primary,
    resizeMode: 'contain',
    backgroundColor: COLORS.graySolid,
    borderWidth: 1,
    overflow: 'hidden',
  },
  headerSubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  phone: {fontSize: 14, color: COLORS.black},

  renderView: {
    flexDirection: 'row',
    alignItems: 'center',
    alignContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  icon: {
    width: 22,
    height: 22,
    tintColor: COLORS.primary,
    resizeMode: 'contain',
  },
  label: {
    marginHorizontal: 15,
    fontSize: 16,
    color: COLORS.black,
  },

  subMenuContainer: {
    marginHorizontal: 37,
    paddingBottom: 10,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 15,
  },
  subMenuLabel: {
    fontSize: 14,
    color: COLORS.black,
    marginLeft: 10, // Space between submenu icon and text
  },
});

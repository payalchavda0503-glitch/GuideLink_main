import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';

import {DrawerActions} from '@react-navigation/native';
import {COLORS, SIZES} from '../util/Theme';
import AppIcons from './AppIcons';

const AppHeader = ({
  background,
  marginTop,
  iconType,
  iconName,
  iconColor,
  navigation,
  tittle,
  titleColor,
}) => {
  return (
    <View
      style={[
        styles.header,
        {backgroundColor: background, marginTop: marginTop},
      ]}>
      <View>
        <TouchableOpacity
          style={styles.Icon}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
          <AppIcons
            type={iconType}
            name={iconName}
            size={28}
            color={iconColor}
          />
        </TouchableOpacity>
      </View>
      <Text style={[styles.headingTile, {color: titleColor}]}>{tittle}</Text>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  header: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    width: SIZES.width,
    height: 48,
    // justifyContent: 'center',   // Vertically center
    alignItems: 'center', // Horizontally center``
  },

  Icon: {
    padding: 10,
  },

  headingTile: {
    // textAlign: 'center',
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: 12,
  },
});

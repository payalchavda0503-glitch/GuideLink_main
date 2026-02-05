import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {DrawerActions} from '@react-navigation/native';
import {COLORS, SIZES} from '../util/Theme';
import AppIcons from './AppIcons';

export const Header = ({
  background,
  menuiconColor,
  iconColor,
  navigation,
  rightButtonLabel,
  onRightButtonPress,
}) => {
  const showRightButton = !!rightButtonLabel && typeof onRightButtonPress === 'function';

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: background,
        },
      ]}>
      <TouchableOpacity
        style={{
          paddingHorizontal: 5,
          alignItems: 'center',
          width: SIZES.width * 0.1,
        }}
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
        <AppIcons
          type={'Feather'}
          name={'menu'}
          size={28}
          color={menuiconColor}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ExpertIndex');
        }}
        style={{flex: 1}}>
        <TextInput
          onPress={() => {
            navigation.navigate('ExpertIndex');
          }}
          backgroundColor={COLORS.white}
          style={[
            styles.searchInput,
            {borderColor: iconColor,fontSize:12},
            showRightButton && {width: '105%'},
            
          ]}
          placeholder="Search for a guide/guidance"
          clearButtonMode="never"
          keyboardType="default"
          readOnly
          returnKeyType="search"
          placeholderTextColor={COLORS.gray}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconSearch}
        onPress={() => {
          navigation.navigate('ExpertIndex');
        }}>
        <Image
          source={require('../assets/images/ic_serach.png')}
          style={{width: 20, height: 20}}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {showRightButton && (
        <TouchableOpacity
          style={styles.rightButton}
          onPress={onRightButtonPress}>
          <View>
            <Text style={styles.rightButtonText}>{rightButtonLabel}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* <View style={styles.option}>
        <Pressable
          style={{padding: 10}}
          onPress={() => {
            navigation.navigate('NotificationTabIndex');
          }}>
          <Image
            source={require('../assets/images/notifications.png')}
            style={{
              width: 20,
              height: 20,
              tintColor: menuiconColor,
            }}
            resizeMode="contain"
          />
        </Pressable>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    // justifyContent: 'center',
    alignItems: 'center',
  },

  searchInput: {
    // textAlign: 'center',
    width: SIZES.width * 0.86,
   // marginHorizontal: 5,
    paddingHorizontal: 15,
    height: 38,
    color: COLORS.black,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.white,
  },

  iconSearch: {
    position: 'relative',
    top: 0,
    right: 20,
  },
  option: {
    position: 'absolute',
    flexDirection: 'row',
    right: 0,
    paddingHorizontal: 1,
  },
  rightButton: {
    marginRight: 10,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.Yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
});

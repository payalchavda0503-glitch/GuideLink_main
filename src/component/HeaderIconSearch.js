import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';

import {DrawerActions} from '@react-navigation/native';
import {COLORS, SIZES} from '../util/Theme';
import AppIcons from './AppIcons';
import {useDispatch} from 'react-redux';

export const HeaderIconSearch = ({
  background,
  menuiconColor,
  iconColor,
  navigation,
  search,
  setSearch,
  onSearchClick,
}) => {
  const dispatch = useDispatch();
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
          paddingHorizontal: 0,
          alignItems: 'center',
          width: SIZES.width * 0.1,
        }}
        onPress={() => navigation.goBack()}>
        <AppIcons
          name={'arrow-back'}
          type={'MaterialIcons'}
          size={28}
          color={COLORS.black}
        />
      </TouchableOpacity>

      <TextInput
        style={[styles.searchInput, {borderColor: iconColor}]}
        placeholder="Search for a guide/guidance"
        clearButtonMode="never"
        keyboardType="default"
        value={search}
        returnKeyType="search"
        onChangeText={txt => {
          setSearch(txt);
        }}
        placeholderTextColor={COLORS.gray}
        onSubmitEditing={() => {
          onSearchClick();
        }}
      />

      <TouchableOpacity style={styles.iconSearch} onPress={onSearchClick}>
        <Image
          source={require('../assets/images/ic_serach.png')}
          style={{width: 20, height: 20}}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* <View style={styles.option}>
        <Pressable
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
    marginHorizontal: 5,
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
    right: 40,
  },
  option: {
    position: 'absolute',
    flexDirection: 'row',
    right: 10,
    paddingHorizontal: 1,
  },
});

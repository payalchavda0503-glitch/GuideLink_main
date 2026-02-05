import {StyleSheet, Text, View, Animated, Image} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {useDispatch, useSelector} from 'react-redux';
import {COLORS} from '../../../../util/Theme';
import AppIcons from '../../../../component/AppIcons';

import BookingIndex from '../../booking/BookingIndex';
import ExpertIndex from '../../expert';
import ProfileIndex from '../ProfileIndex';
import {DefaultStyle} from '../../../../util/ConstVar';
import {log} from '../../../../util/Toast';
import {ChangeTab} from '../../../../redux/ChangeSlice';
import NotificationIndex from '../../notification/NotificationIndex';

const Tab = createBottomTabNavigator();

const BottomTabProfile = ({route}) => {
  return (
    <Tab.Navigator
      initialRouteName={'ProfileIndex'}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopColor: 'transparent',
          height: 70,
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 10,
          borderRadius: 40,
          elevation: 0,
          ...styles.shadow,
        },
      }}>
      <Tab.Screen
        name={'ProfileIndex'}
        component={ProfileIndex}
        options={{
          headerShown: false,
          headerShadowVisible: false,
          tabBarIcon: ({focused}) => (
            <View style={{marginTop: 0, marginStart: 10}}>
              <Image
                source={require('../../../../assets/images/ic_home.png')}
                style={DefaultStyle.tabIcon}
                resizeMode="contain"
              />
            </View>
          ),
          tabBarShowLabel: true,
          tabBarLabel: ({focused}) => (
            <Text
              style={[
                styles.label,
                {
                  color: focused ? COLORS.white : COLORS.white,
                  marginStart: 10,
                },
              ]}>
              HOME
            </Text>
          ),
        }}
        listeners={{
          tabPress: () => {},
        }}
      />

      <Tab.Screen
        name="ProBookingIndex"
        component={BookingIndex}
        options={{
          headerShown: false,
          headerShadowVisible: false,

          tabBarIcon: ({focused}) => (
            <View style={{marginTop: 0, marginStart: 10}}>
              <Image
                source={require('../../../../assets/images/my-bookings.png')}
                style={DefaultStyle.tabIcon}
                resizeMode="contain"
              />
            </View>
          ),
          tabBarShowLabel: true,
          tabBarLabel: ({focused}) => (
            <Text
              style={[
                styles.label,
                {
                  color: focused ? COLORS.white : COLORS.white,
                  marginStart: 10,
                },
              ]}>
              BOOKINGS
            </Text>
          ),
        }}
      />

      <Tab.Screen
        name="ProExpertIndex"
        component={ExpertIndex}
        options={{
          headerShown: false,
          headerShadowVisible: false,

          tabBarIcon: ({focused}) => (
            <View style={{marginTop: 0, marginStart: 10}}>
              <AppIcons
                type={'Feather'}
                name={'calendar'}
                size={20}
                color={focused ? COLORS.white : COLORS.white}
              />
            </View>
          ),
          tabBarShowLabel: true,
          tabBarLabel: ({focused}) => (
            <Text
              style={[
                styles.label,
                {
                  color: focused ? COLORS.white : COLORS.white,
                  marginStart: 10,
                },
              ]}>
              EXPERT
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabProfile;

const styles = StyleSheet.create({
  shadow: {
    elevation: 0, // for Android
    shadowOffset: {
      width: 0,
      height: 10, // for iOS
    },
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
  },

  tabBarIcon: {
    height: 20,
    width: 20,
    marginTop: 0,
    tintColor: COLORS.white,
    // backgroundColor: COLORS.white,
  },
  tabBarIconFocused: {
    // height: 28,
    // width: 28,
    marginTop: 0,
    height: 20,
    width: 20,
    // backgroundColor: COLORS.white,
    tintColor: COLORS.primary,
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: COLORS.white,
    resizeMode: 'contain',
  },

  label: {fontSize: 12, marginBottom: 12, marginTop: -10},
});

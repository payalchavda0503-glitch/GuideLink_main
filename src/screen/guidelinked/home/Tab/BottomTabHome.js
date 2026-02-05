import {StyleSheet, Text, View, Animated} from 'react-native';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {COLORS} from '../../../../util/Theme';
import AppIcons from '../../../../component/AppIcons';
import ExpertIndex from '../../expert';
import {Image} from 'react-native';
import {DefaultStyle} from '../../../../util/ConstVar';
import HomeIndex from '../HomeIndex';
import BookingIndex from '../../booking/BookingIndex';
import {log} from '../../../../util/Toast';
import ProfileIndex from '../../profile/ProfileIndex';

const Tab = createBottomTabNavigator();

const BottomTabHome = () => {
  return (
    <Tab.Navigator
      initialRouteName={'HomeIndex'}
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
        name="HomeIndex"
        component={HomeIndex}
        options={{
          headerShown: false,
          headerShadowVisible: false,

          tabBarIcon: ({focused}) => (
            <View style={{marginTop: 0, marginStart: 10}}>
              <AppIcons
                type={'SimpleLineIcons'}
                name={'home'}
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
              HOME
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="BookingIndex"
        component={BookingIndex}
        options={{
          headerShown: false,
          headerShadowVisible: false,

          tabBarIcon: ({focused}) => (
            <View style={{marginTop: 0, marginStart: 10}}>
              {/* <AppIcons
                type={'MaterialCommunityIcons'}
                name={'human-male-female'}
                size={20}
                color={focused ? COLORS.white : COLORS.white}
              /> */}

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
        name="ExpertIndex"
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

export default BottomTabHome;

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

  label: {fontSize: 12, marginBottom: 12, marginTop: -10},
});

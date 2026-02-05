import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import { useFocusEffect } from '@react-navigation/native';

export const ScreenStatusBar = ({backgroundColor, barStyle}) => {
  useFocusEffect(() => {
    StatusBar.setBarStyle(barStyle);
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(backgroundColor);
    }
  });

  return null;
};

import {Platform, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../../util/Theme';

export const styles = StyleSheet.create({
  input: {
    borderColor: COLORS.gray,
    marginBottom: 12,
    borderWidth: 1,
    color: COLORS.black,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS == 'ios' && 12,
  },
  socialInput1: {
    color: COLORS.black,
    color: COLORS.black,
    borderRadius: 10,
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  circlelinkedin: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    left: 10,
    top: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlefb: {
    width: 30,
    height: 30,
    borderRadius: 16,
    backgroundColor: COLORS.blue,
    position: 'absolute',
    left: 10,
    top: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInsta: {
    width: 30,
    height: 30,
    borderRadius: 16,
    position: 'absolute',
    left: 10,
    top: 12,
    backgroundColor: COLORS.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconview: {
    position: 'absolute',
    left: 10,
    top: 15,
  },
});

import {Platform, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../../util/Theme';

export const styles = StyleSheet.create({
  input: {
    backgroundColor: COLORS.white,
  //  marginBottom: 10,
    color: COLORS.black,
    paddingHorizontal: 0,
    paddingVertical: 8,
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
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    position: 'absolute',
    left: 0,
        top: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlefb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.blue,
    position: 'absolute',
    left: 0,
    top: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInsta: {
    width: 30,
    height: 30,
    borderRadius: 15,
    position: 'absolute',
    left: 0,
    top: 10,
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

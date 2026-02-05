import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {COLORS} from './Theme';

function Loader({loaderVisible}) {
  if (!loaderVisible) return null;
  return (
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <ActivityIndicator size="large" color={COLORS.lightGray} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    position: 'absolute', // Overlay covers entire screen
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
    zIndex: 9999, // Ensure it's above all content
  },
  modalView: {
    backgroundColor: 'rgba(0,0,0,1)', // Solid dark background for the loader "card"
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default Loader;

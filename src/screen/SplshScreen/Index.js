import {Image, StatusBar, Text, View} from 'react-native';
import React from 'react';
import IMG1 from '../../assets/images/ic_logo.png';
import {Styles} from './Styles';
import {SafeAreaView} from 'react-native';
import {COLORS} from '../../util/Theme';

const IndexSplash = () => {
  return (
    <SafeAreaView style={Styles.container}>
      <StatusBar backgroundColor={COLORS.black} barStyle="light-content" />
      <Image source={IMG1} style={Styles.img} resizeMode="contain" />
    </SafeAreaView>
  );
};

export default IndexSplash;

import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {COLORS} from '../../../util/Theme';
import AppHeader from '../../../component/AppHeader';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import IosStatusBar from '../../../component/IosStatusBar';
import BottomTab from '../../../component/BottomTab';
import {DefaultStyle} from '../../../util/ConstVar';

const TermConditionIndex = ({navigation}) => {
  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />
      {/* <SafeAreaView
        style={[DefaultStyle.flexView, {backgroundColor: COLORS.gray2}]}> */}
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="dark-content"
        />
        <AppHeader
          background={COLORS.primary}
          iconType={'Feather'}
          iconName={'menu'}
          iconColor={COLORS.white}
          navigation={navigation}
          tittle={'Simplified Terms & Conditions'}
          titleColor={COLORS.white}
        />
        <View style={{flex: 1}}>
          <Text>TermConditionIndex screen</Text>
        </View>
        <View style={{position:'absolute',bottom:0}}>
          <BottomTab />
        </View>
        
      {/* </SafeAreaView> */}
    </>
  );
};

export default TermConditionIndex;

const styles = StyleSheet.create({});

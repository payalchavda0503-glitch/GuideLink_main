import {
  Pressable,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Linking,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import AppHeader from '../../../component/AppHeader';
import {SafeAreaView} from 'react-native';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import {styles} from './styles';
import AppHeaderNormal from '../../../component/AppHeaderNormal';
import WebView from 'react-native-webview';
import IosStatusBar from '../../../component/IosStatusBar';

const OnboardingProcess = ({navigation, route}) => {
  const delay = ms => new Promise(res => setTimeout(res, ms));

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.container}>
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="dark-content"
        />
        <AppHeaderNormal
          background={COLORS.primary}
          iconColor={COLORS.white}
          tittle={'Account Setup'}
          titleColor={COLORS.white}
          onBackPress={() => {
            navigation.goBack();
          }}
        />

        <View style={{flexDirection: 'column', flex: 1}}>
          <WebView
            source={{uri: route.params.INIT_URL}}
            style={{flex: 1, width: '100%'}}
            onNavigationStateChange={event => {
              console.log('asgdfiuagsiudgauisdu');
              console.log(event);

              let inUrl = event.url.indexOf('stripe/onboarding/return');

              console.log(event.url, inUrl);

              if (inUrl != -1) {
                setTimeout(() => {
                  navigation.navigate('AvailibilityTabIndex', {guide: true});
                }, 1000);
              }
            }}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default OnboardingProcess;

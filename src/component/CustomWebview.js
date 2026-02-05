import React, {Component} from 'react';

import {WebView} from 'react-native-webview';
import IosStatusBar from './IosStatusBar';
import { SafeAreaView, View } from 'react-native';
import { COLORS } from '../util/Theme';
import AppHeaderNormal from './AppHeaderNormal';
import { ScreenStatusBar } from '../util/ScreenStatusBar';
const CustomWebview = ({route,navigation}) => {
  let Url = route.params?.Url;
  let Title = route.params?.Title;
  return (
    <>
    <IosStatusBar backgroundColor={COLORS.primary}/>
      <SafeAreaView style={{flex:1,backgroundColor:COLORS.white}}>
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="dark-content"
        />
        <AppHeaderNormal
          background={COLORS.primary}
          iconColor={COLORS.white}
          tittle={Title}
          titleColor={COLORS.white}
          onBackPress={()=>{
            navigation.goBack()
          }}
        />
         <View style={{flexDirection: 'column', flex:1}}>
          <WebView source={{uri: Url}} sstyle={{ flex: 1, width: '100%' }} />
        </View>

    </SafeAreaView>
    </>
  );
};

export default CustomWebview;

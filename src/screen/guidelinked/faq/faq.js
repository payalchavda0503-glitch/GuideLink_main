import React, {useEffect, useState} from 'react';
import {View, SafeAreaView, StyleSheet, ActivityIndicator} from 'react-native';
import {WebView} from 'react-native-webview';
import {COLORS} from '../../../util/Theme';
import AppHeader from '../../../component/AppHeader';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import IosStatusBar from '../../../component/IosStatusBar';
import {DefaultStyle} from '../../../util/ConstVar';
import BottomTab from '../../../component/BottomTab';

const FAQScreen = ({navigation}) => {
  const [htmlContent, setHtmlContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHtml();
  }, []);

  const fetchHtml = async () => {
    try {
      const response = await fetch('https://guidelinked.com/files/faq.html');
      const html = await response.text();
      setHtmlContent(html);
    } catch (error) {
      console.error('Failed to fetch FAQ HTML:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <IosStatusBar backgroundColor={COLORS?.primary} />
      {/* <SafeAreaView style={DefaultStyle?.flexView}> */}
        <AppHeader
          background={COLORS.primary}
          iconType={'Feather'}
          iconName={'menu'}
          iconColor={COLORS.white}
          navigation={navigation}
          tittle={'FAQs'}
          titleColor={COLORS.white}
        />
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="light-content"
        />

        {loading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{flex: 1, justifyContent: 'center'}}
          />
        ) : (
          <WebView
            originWhitelist={['*']}
            source={{uri: 'https://guidelinked.com/files/faq.html'}}
            style={{flex: 1, marginBottom: 60}}
            showsVerticalScrollIndicator={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
          />
        )}

        <View>
          <BottomTab />
        </View>
      {/* </SafeAreaView> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default FAQScreen;

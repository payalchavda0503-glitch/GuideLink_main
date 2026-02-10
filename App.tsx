import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {NavigationContainer} from '@react-navigation/native';
import {useStripe} from '@stripe/stripe-react-native';
import React, {useCallback, useEffect} from 'react';
import {Alert, Linking, LogBox, Platform, StyleSheet} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import {ToastProvider} from 'react-native-toast-notifications';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {navigationRef} from './navigationRef';
import CustomToast from './src/component/CustomToast';
import Authenication from './src/navigation/Authenication';
import {persistor, store} from './src/redux/Store';
import {
  CallNotification,
  onDisplayNotification,
  onDisplayNotificationCall,
  requestUserPermission,
} from './src/screen/guidelinked/notification/NotificationManger';
import NetworkError from './src/screen/internet/NetworkError';
// @ts-ignore
import VersionCheck from 'react-native-version-check';
import {DefaultStyle} from './src/util/ConstVar';

const App = () => {
  const linking = {
    prefixes: ['guidelinked://', 'https://guidelinked.com'],
    config: {
      screens: {
        CallScreen: 'call', // Add a route for the target screen
      },
    },
  };

  return (
    <NavigationContainer linking={linking} ref={navigationRef}>
      <AppNV />
    </NavigationContainer>
  );
};

// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   let data = remoteMessage.data;

//   if (data?.type == '1') {
//     console.log('xx');
//     // this is call
//     await onDisplayNotificationCall(data?.title, data?.body);
//     //CallNotification(data)
//   } else {
//     await onDisplayNotification(data?.title, data?.body);
//   }
// });

const AppNV = () => {
  useEffect(() => {
    AsyncStorage.setItem('APP_ALREADY_LAUNCHED', 'true');
  }, []);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const latestVersion = await VersionCheck.getLatestVersion();
        const currentVersion = VersionCheck.getCurrentVersion();

        const updateNeeded = await VersionCheck.needUpdate();

        if (updateNeeded?.isNeeded) {
          Alert.alert(
            'Update Available',
            'A new version of the app is available. Please update to continue.',
            [
              {
                text: 'Update Now',
                onPress: () => {
                  const storeUrl =
                    Platform.OS === 'android'
                      ? 'https://play.google.com/store/apps/details?id=com.app.guidelinked&pcampaignid=web_share'
                      : 'https://apps.apple.com/us/app/guidelinked/id6743425814';

                  Linking.openURL(storeUrl);
                },
              },
            ],
            {cancelable: false}, // Prevent dismissal
          );
        }
      } catch (error) {
        console.log('Version check failed', error);
      }
    };

    checkVersion();
  }, []);

  useEffect(() => {
    const setupNotificationCategories = async () => {
      await notifee.setNotificationCategories([
        {
          id: 'incoming_call',
          actions: [
            {
              id: 'accept',
              title: 'Join Call',
              foreground: true,
            },
          ],
        },
      ]);
    };

    requestUserPermission();
    setupNotificationCategories();
  }, []);

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(remoteMessage);
      console.log(remoteMessage.data?.type);
      if (remoteMessage.data?.type == '1') {
        CallNotification(remoteMessage.data);
      }
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage && remoteMessage.data?.type == '1') {
          setTimeout(() => {
            CallNotification(remoteMessage.data);
          }, 3000);
        }
      });
  }, []);

  useEffect(() => {
    // Listen for foreground messages
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Message', remoteMessage);

      let data = remoteMessage.data;

      if (data?.type == '1') {
        // this is call
        await onDisplayNotificationCall(data?.title, data?.body, data);
      } else {
        await onDisplayNotification(data?.title, data?.body);
      }
    });

    // Listen for background messages

    return unsubscribeForeground;
  }, []);

  useEffect(() => {
    //splash-screen or launcher screen hide
    SplashScreen.hide();

    LogBox.ignoreAllLogs();

    requestUserPermission();
    // notificationListerner();
  }, []);
  const {handleURLCallback} = useStripe();

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          console.log('__DATA__ stripe success');
          // This was a Stripe URL - you can return or add extra handling here as you see fit
        } else {
          // This was NOT a Stripe URL – handle as you normally would
          console.log('__DATA__ No stripe');
        }
      }
    },
    [handleURLCallback],
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    const deepLinkListener = Linking.addEventListener(
      'url',
      (event: {url: string}) => {
        handleDeepLink(event.url);
      },
    );

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  return (
    <ToastProvider animationType="slide-in" animationDuration={100}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <SafeAreaProvider>
            <SafeAreaView
              style={DefaultStyle.flexView}
              edges={Platform.OS === 'ios' ? [] : ['top']}>
              <NetworkError>
                <Authenication />
                <CustomToast />
              </NetworkError>
            </SafeAreaView>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </ToastProvider>
  );
};

export default App;

const styles = StyleSheet.create({});

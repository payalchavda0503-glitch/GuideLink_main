import {AppRegistry, PermissionsAndroid} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {
  onDisplayNotification,
  onDisplayNotificationCall,
  CallNotification,
} from './src/screen/guidelinked/notification/NotificationManger';
import AsyncStorage from '@react-native-async-storage/async-storage';

notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'accept') {
    const fromQuitState = await AsyncStorage.getItem('APP_ALREADY_LAUNCHED');

    if (fromQuitState !== 'true') {
      await AsyncStorage.setItem('APP_ALREADY_LAUNCHED', 'true');
      setTimeout(() => {
        CallNotification(detail.notification?.data);
      }, 3000);
    } else {
      CallNotification(detail.notification?.data);
    }
  }
});

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('__DATA__ notification', remoteMessage);
  let data = remoteMessage.data;

  if (data?.type == '1') {
    await onDisplayNotificationCall(data?.title, data?.body, data, true);
  } else {
    await onDisplayNotification(data?.title, data?.body);
  }
});

AppRegistry.registerComponent(appName, () => App);

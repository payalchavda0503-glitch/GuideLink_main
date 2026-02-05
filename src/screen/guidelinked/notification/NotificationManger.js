import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidStyle,
  EventType,
} from '@notifee/react-native';
import {getFcmToken} from '../../../util/Pref';
import {PermissionsAndroid, Platform} from 'react-native';
import base64 from 'base-64';
import Api from '../../../service/Api';
import {API_BOOK_APPOINTMENT_PAY_STATUS} from '../../../service/apiEndPoint';
import {navigationRef} from '../../../../navigationRef';

export async function onDisplayNotification(title, body) {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });

  // Display a notification
  await notifee.displayNotification({
    title: title,
    body: body,
    android: {
      channelId,
      smallIcon: 'ic_launcher', // Replace with your app icon
      sound: 'default',
      pressAction: {
        id: 'default',
      },
    },
  });
}

export async function onDisplayNotificationCall(title, body, data, background) {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: 'call_channel',
    name: 'Call Channel',
    importance: AndroidImportance.HIGH,
    sound: 'call_notification',
    vibration: true,
  });

  // Display a notification
  await notifee.displayNotification({
    title: title,
    body: body,
    data: data,
    ios: {
      sound: 'call_notification.wav', // Must match file in iOS Resources folder
      categoryId: 'incoming_call', // Used for call notifications
      actions: [
        {
          id: 'accept',
          title: 'Join Call',
          foreground: true,
        },
      ],
    },
    android: {
      channelId,
      smallIcon: 'ic_launcher',
      sound: 'call_notification',
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
      fullScreenAction: {
        id: 'default',
        launchActivity: 'default',
      },
      // Customize other Android-specific options like importance, icon, etc.
      importance: AndroidImportance.HIGH,
      category: AndroidCategory.CALL,
      actions: [
        {
          title: 'Join Call',
          pressAction: {id: 'accept', launchActivity: 'default'},
        },
      ],
    },
  });

  notifee.onForegroundEvent(({type, detail}) => {
    if (type === EventType.ACTION_PRESS) {
      if (detail.pressAction.id === 'accept') {
        if (background == true) {
          setTimeout(() => {
            CallNotification(data);
          }, 5000);
        } else {
          CallNotification(data);
        }
      }
    }
  });
}

export async function CallNotification(data) {
  let encoded = `${data?.data}`;
  let decodedData = base64.decode(encoded);
  let json = JSON.parse(decodedData);
  console.log(json);

  await checkPaymentStatus(json.appt_id);
}

const checkPaymentStatus = async aptId => {
  const response = await Api.get(`${API_BOOK_APPOINTMENT_PAY_STATUS}/${aptId}`);

  if (response.status == 'RC200') {
    let data = response.data;
    console.log(data);

    if (data == 1) {
      navigationRef.navigate('VideoCall', {ID: aptId, FROM: 0});
    } else {
      navigationRef.navigate('ChargePayment', {ID: aptId, FROM: 0});
    }
  }
};

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    getFcmToken();
  }
  requestNotificationPermission();
}

//Handle Incoming Messages
export const notificationListerner = async () => {
  //getInitialNotification: application is opened from a quit state
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App is locked or (quit state) kill notification:-');
      }
    });

  // application is running, but in the background.
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('App is open from background state notification :-');
  });
};

//android 13 or 13+ (Notification permission not needed for iOS, as it is handled by Firebase)
export const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 33) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        ]);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

// export const displayNotification = async data => {
//   console.log('__DATA__ forgound notification lock or not ', data);

//   // Request permissions (required for iOS)
//   await notifee.requestPermission();

//   // Create a channel (required for Android)
//   const channelId = await notifee.createChannel({
//     id: 'default',
//     name: 'Default Channel',
//   });

//   // Display a notification
//   await notifee.displayNotification({
//     title: data.notification.title,
//     body: data.notification.body,
//     android: {
//       channelId,
//       smallIcon: 'ic_launcher', // optional,

//       // pressAction is needed if you want the notification to open the app when pressed
//       pressAction: {
//         id: 'default',
//       },

//       style: {
//         type: AndroidStyle.BIGPICTURE,
//         picture: data.notification.android.imageUrl,
//       },
//     },
//   });
// };

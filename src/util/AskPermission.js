import {
  PERMISSIONS,
  RESULTS,
  request,
  check,
  requestMultiple,
  openSettings,
} from 'react-native-permissions';
import {PermissionsAndroid, Platform, Alert, Linking} from 'react-native';
import {setCamrarGalleryPermission} from './Pref';
import {useEffect} from 'react';
import {log} from './Toast';

const showPermissionBlockedPopup = () => {
  Alert.alert(
    'Permission Blocked',
    'You have blocked camera and storage permission. Please go to Settings to enable it.',
    [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Settings', onPress: () => openAppSettings()},
    ],
    {cancelable: false},
  );
};

const openAppSettings = () => {
  Linking.openSettings();
};

const checkAndRequestPermission = async permission => {
  const result = await check(permission);
  console.log(result);

  if (result === RESULTS.GRANTED) {
    return true;
  } else if (result === RESULTS.DENIED) {
    const requestResult = await request(permission);
    if (requestResult === RESULTS.BLOCKED) {
      showPermissionBlockedPopup();
      return false;
    }
    return requestResult === RESULTS.GRANTED;
  } else if (result === RESULTS.BLOCKED) {
    showPermissionBlockedPopup();
    return false;
  }
  return false;
};

export const requestCameraPermission = async () => {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  });
  return await checkAndRequestPermission(permission);
};

export const requestGalleryPermission = async () => {
  const permission = Platform.select({
    ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
    android: PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
  });
  return await checkAndRequestPermission(permission);
};

export const Permission = permission => {
  request(permission).then(result => {
    log('permssion :-' + result);
  });
};

//both storage and camera
export const reqCameraGalleyPer = async () => {
  const version = Platform.Version;

  if (Platform.OS === 'android') {
    if (version >= 31) {
      const permissions = [
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
        PERMISSIONS.ANDROID.CAMERA,
      ];

      try {
        const results = await requestMultiple(permissions);

        // Check if any permission is permanently blocked
        const blocked = Object.values(results).some(
          result => result === RESULTS.BLOCKED,
        );
        if (blocked) {
          showPermissionBlockedPopup();
        }

        const granted = Object.values(results).every(
          result => result === RESULTS.GRANTED,
        );
        if (granted) {
          setCamrarGalleryPermission('true');
        } else {
          setCamrarGalleryPermission('false');
        }
      } catch (error) {
        console.error('Error requesting permissions', error);
        setCamrarGalleryPermission('false');
      }
    } else {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);

        if (
          granted['android.permission.CAMERA'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            PermissionsAndroid.RESULTS.GRANTED
        ) {
          setCamrarGalleryPermission('true');
        } else {
          // log('Camera permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  } else if (Platform.OS === 'ios') {
    try {
      const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
      const photoLibraryStatus = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);

      if (
        cameraStatus === RESULTS.BLOCKED ||
        photoLibraryStatus === RESULTS.BLOCKED
      ) {
        showPermissionBlockedPopup();
      }

      if (
        cameraStatus === RESULTS.GRANTED &&
        photoLibraryStatus === RESULTS.GRANTED
      ) {
        setCamrarGalleryPermission('true');
      } else {
        setCamrarGalleryPermission('false');
      }
    } catch (err) {
      console.warn(err);
    }
  }
};

export async function requestCameraAndAudioPermission() {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);
    if (
      granted['android.permission.RECORD_AUDIO'] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.CAMERA'] ===
        PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('You can use the cameras & mic');
    } else {
      console.log('Permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
}
export const reqCameraAndAudioPermission = async () => {
  // Request permissions for iOS
  try {
    // Request both camera and microphone permissions at the same time
    const response = await requestMultiple([
      PERMISSIONS.IOS.CAMERA,
      PERMISSIONS.IOS.MICROPHONE,
    ]);

    const cameraPermission = response[PERMISSIONS.IOS.CAMERA];
    const microphonePermission = response[PERMISSIONS.IOS.MICROPHONE];

    if (
      cameraPermission === RESULTS.BLOCKED ||
      microphonePermission === RESULTS.BLOCKED
    ) {
      showPermissionBlockedPopup();
    }

    // Handle the permissions result
    if (
      cameraPermission === RESULTS.GRANTED &&
      microphonePermission === RESULTS.GRANTED
    ) {
      console.log('Both camera and microphone permissions granted');
    } else {
      if (cameraPermission !== RESULTS.GRANTED) {
        console.log('Camera permission denied');
      }
      if (microphonePermission !== RESULTS.GRANTED) {
        console.log('Microphone permission denied');
      }
    }
  } catch (error) {
    console.error('Error requesting permissions:', error);
  }
};

export const usePermission = () => {
  useEffect(() => {
    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission();
    } else {
      reqCameraAndAudioPermission();
    }
  }, []);
};

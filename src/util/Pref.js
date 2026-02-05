import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import {COUNTRYCODE, FCMTOKEN, STORAGE, STORAGEANDCAMREA} from './ConstVar';
import {log} from './Toast';

//fcm token
export async function getFcmToken() {
  let fcm_id = await AsyncStorage.getItem(FCMTOKEN);
  console.log(fcm_id);

  if (!fcm_id || fcm_id == null) {
    try {
      fcm_id = await messaging().getToken();
      if (fcm_id) {
        console.log('__DATA__ new generate fcmToken:-', fcm_id);
        await AsyncStorage.setItem(FCMTOKEN, fcm_id);
      }
    } catch (err) {
      log(err);
    }
  }

  return fcm_id;
}

export async function isStoragePermission() {
  try {
    const result = await AsyncStorage.getItem(STORAGE);

    return result != null ? true : false;
  } catch (err) {
    log(err);
  }
}

//storage
export async function setStoragePermission(storagePermission) {
  try {
    if (storagePermission !== null) {
      await AsyncStorage.setItem(STORAGE, storagePermission.toString());
      // log(DATA, 'storage Permission:-', storagePermission);
    } else {
      log('storage permission is null');
    }
  } catch (e) {
    log('Error setting token:', e);
  }
}

//both permssion storage and camera
export async function isCamrarGalleryPermission() {
  try {
    const result = await AsyncStorage.getItem(STORAGEANDCAMREA);
    // log(STORAGEANDCAMREA, 'Permission:-', result);
    return result == null ? true : false;
  } catch (err) {
    log(err);
  }
}

export async function setCamrarGalleryPermission(storagePermission) {
  try {
    if (storagePermission !== null) {
      await AsyncStorage.setItem(
        STORAGEANDCAMREA,
        storagePermission.toString(),
      );
      log(' both permssion camera and storage Permission:-', storagePermission);
    } else {
      log('storage permission is null');
    }
  } catch (e) {
    log('Error setting token:', e);
  }
}

export const setCountryCode = async value => {
  try {
    await AsyncStorage.setItem(COUNTRYCODE, value);
  } catch (error) {
    // Error saving data
    console.error('Error saving data', error);
  }
};

export const clearStorage = async () => {
  setCamrarGalleryPermission('false');
  await AsyncStorage.removeItem('PROFILE_AUTOSAVE');
  await AsyncStorage.removeItem('userId');
  await AsyncStorage.clear();
};

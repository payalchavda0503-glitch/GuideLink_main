import {Alert, Modal, Platform, Pressable, Text, PermissionsIOS} from 'react-native';
import React from 'react';
import {PERMISSIONS, request} from 'react-native-permissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Permission} from '../util/AskPermission';
import {log} from '../util/Toast';
import DeviceInfo from 'react-native-device-info';

export const CustomeImagePicker = () => {
  return new Promise((resolve, reject) => {
    if (Platform.OS === 'ios') {
      Permission(PERMISSIONS.IOS.PHOTO_LIBRARY);
    } else {
      Permission(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
    }

    var options = {
      storageOptions: {
        skipBackup: true,
        path: 'image',
      },
    };

    launchImageLibrary(options, response => {
      console.log("__DATA___",response)
      if (response.error) {
        log('ImagePicker Error: ', response.error);
        reject(response.error);
      }

      if (response.didCancel) {
        log('User cancelled image picker');
      } else if (response != null && response.assets.length > 0) {
        const img = response.assets[0]?.uri;
        log(img);
        resolve(img);
      } else {
        // Handle case where no image is selected
        reject('No image selected');
      }
    });
  });
};

export const customCameraPicker = () => {
  return new Promise(async (resolve, reject) => {
    let img;
    const options = {
      storageOptions: {
        skipBackup: true,
        includeBase64: true,
        path: 'images',
      },
      mediaType: 'photo',
      cameraType: 'back',
    };
    const isAndroid = Platform.OS === 'android';
    const cameraAvailable = await DeviceInfo.isCameraPresent();

    if (isAndroid) {
      launchCamera(options, response => {
        log(response);

        if(response.errorCode!="camera_unavailable" ){
        if (response.didCancel) {
          log('User cancelled image picker');
        } else if (response.error) {
          log('camera Error: ', response.error);
        } else if (response.customButton) {
          log('User tapped custom button: ', response.customButton);
        } else {
          //if (response.assets?.length > 0) {
            img = response.uri || response.assets?.[0]?.uri
            resolve(img);
         // }
        }
      }else{
        Alert.alert('No camera found','Sorry, your device does not have a camera.');
        reject('No camera found');
      }

      });
    } else {
      launchCamera(options, response => {
        log('options = ', options);
        log(response);

        if(response.errorCode!="camera_unavailable"){
   
          if (response.didCancel) {
            log('User cancelled camera picker');
          } else if (response.error) {
            log('camera picker error:- ', response.error);
          } else if (response.customButton) {
            log('User tapped custom button: ', response.customButton);
          } else {
            //const source = {uri: response.uri};
            const source = response.uri || response.assets?.[0]?.uri
  
            img = source;
            resolve(img);
          }
        }else{
              Alert.alert('No camera found','Sorry, your device does not have a camera.');
          reject('No camera found');
        }
       
      });
    }
  });
};

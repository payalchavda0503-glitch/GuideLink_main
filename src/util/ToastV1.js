//import Toast from 'react-native-root-toast';
import React, {createContext, useContext} from 'react';
//import Toast from 'react-native-toast-message';
import {Toast, useToast} from 'react-native-toast-notifications';
//import Toast from 'react-native-toast-message';

// export const showToast1 = msg => {
//   console.log(msg);

//   const toast = useToast();
//   toast.show(msg, {
//     type: 'success',
//     duration: 4000,
//     placement: 'bottom',
//     animationType: 'slide-in',
//   });
// };

// export const showToast1 = msg => {
//   Toast.show({
//     text1: msg,
//     text2: msg,
//     position: 'top',
//     type: 'error',
//     visibilityTime: 3000,
//     autoHide: true,
//   });
// };

// export const showToastV1 = () => {
//   console.log('jkljkjhklh');
//   Toast.show(
//     'This is a toast message! hello darsha how are you , what are you doing..',
//     {
//       duration: Toast.durations.SHORT,
//       position: Toast.positions.BOTTOM,
//       shadow: true,
//       animation: true,
//       hideOnPress: true,
//       delay: 1000,
//     },
//   );
// };

const ToastContext = createContext();

//const toast = useToast();

export const showToast1 = message => {
  Toast.show(message);
};

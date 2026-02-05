import Toast from 'react-native-simple-toast';
import {Toast as T} from 'react-native-toast-notifications';
import {DATA} from './ConstVar';

export function showToast(msg) {
  // Toast.showWithGravity(msg, Toast.LONG, Toast.BOTTOM);
  T.show(msg, {style: { zIndex: 99999 }});
}

export function simpleToast(msg){
  Toast.showWithGravity(msg, Toast.LONG, Toast.BOTTOM);
}

export const log = msg => {
  console.log(DATA, msg);
};

import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  View,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
//import {showToast} from '../../util/Toast';
import {COLORS, SIZES} from '../../util/Theme';
import ic_no_wifi from '../../assets/images/ic_no_wifi.png';
import {useDispatch, useSelector} from 'react-redux';
import {showToast} from '../../redux/toastSlice';
import IosStatusBar from '../../component/IosStatusBar';
import NetInfo from '@react-native-community/netinfo';
import { checkInternet } from '../../redux/NetworkStatus';
import { DefaultStyle } from '../../util/ConstVar';
import { simpleToast } from '../../util/Toast';

const DEBOUNCE_MS = 600;

const NetworkError = ({children}) => {
  const dispatch = useDispatch();
  const debounceRef = useRef(null);
  const lastDispatchedRef = useRef(null);

  const onRefresh = () => {
    if(Platform.OS=='ios')
    {
      simpleToast("Please check your Internet connection")
    }else{
      showToast('Please check your Internet connection');
     }
  };

  // Internet check: debounce so connection switches (e.g. wifi <-> mobile) don't flicker the UI
  useEffect(() => {
    const applyState = (state) => {
      let online;
      if (Platform.OS === 'ios') {
        online = state.isConnected;
      } else {
        if (state.type === 'wifi') {
          online =
            state.isConnected && state.isInternetReachable && state.isWifiEnabled;
        } else {
          online = state.isConnected && state.isInternetReachable;
        }
      }
      if (lastDispatchedRef.current !== online) {
        lastDispatchedRef.current = online;
        dispatch(checkInternet(online));
      }
    };

    const removeNetInfoSubscription = NetInfo.addEventListener(state => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        applyState(state);
      }, DEBOUNCE_MS);
    });

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      removeNetInfoSubscription();
    };
  }, [dispatch]);

  const isOnline = useSelector(s => s.NetworkStatus.status);

  return (
    
    isOnline ? children : (
        <>
          <IosStatusBar backgroundColor={COLORS.primary}/>
          <StatusBar barStyle={'white-content'} backgroundColor={COLORS.primary} />
          <SafeAreaView style={[DefaultStyle.flexView]}>
              <View style={[styles.contaner, {justifyContent: 'center'}]}>
                <Image source={ic_no_wifi} style={styles.img} resizeMode="contain" />
                <View>
                  <Text style={styles.title}>No Internet Connection</Text>
                  <Text style={styles.desc}>
                    Please connect and try again.
                  </Text>

                  <TouchableOpacity style={styles.btn} onPress={onRefresh}>
                    <Text style={styles.retry}>Retry</Text>
                  </TouchableOpacity>
                </View>
              </View>
          </SafeAreaView>
        </>
    )
  );
};

export default NetworkError;

const styles = StyleSheet.create({
  contaner: {
    flex: 1,
    backgroundColor: COLORS.shine,
    // justifyContent: 'center',
  },
  img: {
    width: 250,
    height: 250,
    alignSelf: 'center'
  },
  title: {
    textAlign: 'center',
    color: COLORS.black,
    fontSize: 24,
    fontWeight: 'bold',
  },
  desc: {
    textAlign: 'center',
    color: COLORS.black,
    fontSize: 16,
    marginHorizontal: 40,
    marginVertical: 5,
  },
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    // alignItems: 'center',
    alignSelf: 'center',
    width: SIZES.width * 0.4,
    height: 40,
    marginVertical: 20,
  },
  retry: {
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

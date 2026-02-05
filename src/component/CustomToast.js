import React, {useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Animated, Text, StyleSheet, View} from 'react-native';
import {hideToast} from '../redux/toastSlice';
import {COLORS} from '../util/Theme';

const CustomToast = () => {
  const {message, visible} = useSelector(state => state.toastSlice);
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          dispatch(hideToast());
        });
      }, 2000);
    } else {
      fadeAnim.setValue(0);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, fadeAnim, dispatch]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.toast, {opacity: fadeAnim}]}>
        <Text style={styles.message}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 1000,
  },
  toast: {
    backgroundColor: '#333333EE',
    padding: 10,
    borderRadius: 8,
  },
  message: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CustomToast;

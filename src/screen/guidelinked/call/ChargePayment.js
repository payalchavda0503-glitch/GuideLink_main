import {
  Pressable,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Linking,
  StyleSheet,
  Platform,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import AppHeaderNormal from '../../../component/AppHeaderNormal';
import {
  API_GET_STRIPE_PAYMENT,
  API_GET_STRIPE_PUB_KEY,
  WEB_URL,
} from '../../../service/apiEndPoint';
import Api from '../../../service/Api';
import {
  initPaymentSheet,
  presentPaymentSheet,
  StripeProvider,
} from '@stripe/stripe-react-native';
import {useFocusEffect} from '@react-navigation/native';
import {simpleToast} from '../../../util/Toast';
import Loader from '../../../util/Loader';
import {useDispatch} from 'react-redux';
import {showToast} from '../../../redux/toastSlice';
import IosStatusBar from '../../../component/IosStatusBar';

const ChargePayment = ({navigation, route}) => {
  const dispatch = useDispatch();
  let APPT_ID = route.params.ID;

  const [loaderVisible, setLoaderVisible] = useState(true);
  const [stripePublishableKey, setStripePublishableKey] = useState('');

  const getPublishableKey = async () => {
    setLoaderVisible(true);

    const response = await Api.get(`${API_GET_STRIPE_PUB_KEY}`);

    if (response.status == 'RC200') {
      let data = response.data;

      setStripePublishableKey(data);
      get_payment_details();
    } else {
      navigation.goBack();
    }
  };

  const get_payment_details = async () => {
    const response = await Api.get(`${API_GET_STRIPE_PAYMENT}/${APPT_ID}`);

    setLoaderVisible(false);

    if (response.status == 'RC200') {
      let data = response.data;
      console.log(data.display_name);

      const {error} = await initPaymentSheet({
        merchantDisplayName: data.display_name,
        customerId: data.cid,
        customerEphemeralKeySecret: data.ekey_secret,
        paymentIntentClientSecret: data.pintent_secret,
        allowsDelayedPaymentMethods: true,
        ...(Platform.OS === 'ios'
          ? {returnURL: 'guidelinked://stripe-redirect'}
          : {}),
      });

      if (error) {
        console.log(error);
        //simpleToast("Something want wrong, Please try again...")
        dispatch(showToast('Something went wrong, Please try again...'));
        navigation.goBack();
        return;
      }

      const {error: Err} = await presentPaymentSheet();

      if (Err) {
        console.log('Payment failed:', Err.message);
        navigation.goBack();
        return;
        // Show an error message to the user
      } else {
        //simpleToast('Payment successful! Starting call');
        dispatch(showToast('Payment successful! Starting call'));

        navigation.navigate('VideoCall', {ID: APPT_ID, FROM: 1});
      }
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      getPublishableKey();
    }, []),
  );

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.container}>
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="dark-content"
        />

        <AppHeaderNormal
          background={COLORS.primary}
          iconColor={COLORS.white}
          tittle={'Process Payment'}
          titleColor={COLORS.white}
          onBackPress={() => {
            navigation.goBack();
          }}
        />

        {loaderVisible && (
          <Loader
            loaderVisible={loaderVisible}
            setLoaderVisible={setLoaderVisible}
          />
        )}

        <View style={{flexDirection: 'column', flex: 1}}>
          {!loaderVisible && (
            <StripeProvider
              publishableKey={stripePublishableKey}
              merchantIdentifier="merchant.com.guidelinked.app" // required for Apple Pay
              urlScheme={`${WEB_URL}stripe-secure-after-payment`} // required for 3D Secure and bank redirects
            ></StripeProvider>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default ChargePayment;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

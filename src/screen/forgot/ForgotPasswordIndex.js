import {Button} from '@rneui/themed';
import React, {useEffect, useState} from 'react';
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import IMG from '../../assets/images/ic_logo.png';
import AppIcons from '../../component/AppIcons';
import CustomInputBox from '../../component/CustomInputBox';
import {showToast} from '../../redux/toastSlice';
import Api from '../../service/Api';
import {
  API_FORGOTPASS_VERIFY_OTP,
  API_POST_FORGOT_PASSWORD,
} from '../../service/apiEndPoint';
import {DefaultStyle} from '../../util/ConstVar';
import Loader from '../../util/Loader';
import {COLORS} from '../../util/Theme';
import TimerComponent from '../../util/Timer';
import {log} from '../../util/Toast';
import {styles} from './styles';

//TODO: FORGOT PASSWORD SCREEN
const ForgotPasswordIndex = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [showOtp, SetshowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [isShowTimer, setIsShowTimer] = useState(false);
  const dispatch = useDispatch();
  const ref = useBlurOnFulfill({value: otp, cellCount: 6});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });
  const empty = () => {
    setEmail('');
  };
  const sendOtp = async () => {
    if (!email) {
      // showToast('Please enter email address');
      dispatch(showToast('Please enter email address'));
    } else {
      try {
        setLoaderVisible(true);
        const data = {
          email: email,
        };
        const response = await Api.post(API_POST_FORGOT_PASSWORD, data);

        setLoaderVisible(false);

        if (response.status == 'RC200') {
          SetshowOtp(true);
          setIsShowTimer(true);
        }
      } catch (error) {
        log(error);
        setLoaderVisible(false);
      }
    }
  };

  const onHandleResend = async () => {
    try {
      setLoaderVisible(true);
      const data = {
        email: email,
      };
      const response = await Api.post(API_POST_FORGOT_PASSWORD, data);
      setLoaderVisible(false);

      if (response.status == 'RC200') {
        setIsShowTimer(true);
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  const onForgotPassword = async () => {
    if (otp?.length !== 6) {
      //showToast('Please enter a valid 6 digit OTP');
      dispatch(showToast('Please enter a valid PIN'));
    } else {
      try {
        setLoaderVisible(true);
        const formData = {
          email: email,
          otp: otp,
        };

        const response = await Api.post(API_FORGOTPASS_VERIFY_OTP, formData);
        log(response);
        setLoaderVisible(false);

        if (response.status === 'RC200') {
          // dispatch(login({token: response.data.token}));
          navigation.navigate('ResetPasswordIndex', formData);
        }
      } catch (error) {
        log(error);
        setLoaderVisible(false);
      }
    }
  };

  useEffect(() => {
    const backAction = () => {
      if (showOtp) {
        SetshowOtp(false);

        setEmail('');
        return true; // Prevent default behavior (i.e., navigating back)
      }
      return false; // Allow default behavior (i.e., navigating back)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [showOtp]);

  return (
    <SafeAreaView style={DefaultStyle.flexView}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={DefaultStyle.flexDirection}>
            <Pressable
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
              onPress={() => {
                {
                  !showOtp ? navigation.goBack() : SetshowOtp(false);
                }
                empty();
              }}>
              <AppIcons
                type={'Ionicons'}
                name={'arrow-back-circle'}
                size={26}
                color={COLORS.black}
              />
            </Pressable>
            <Text style={styles.back}>Back</Text>
          </View>

          <View
            style={[
              styles.container,
              {flexWrap: 'wrap', width: '100%', alignSelf: 'center'},
            ]}>
            <Image source={IMG} style={styles.img} resizeMode="contains" />

            <View style={{paddingHorizontal: 20, width: '100%'}}>
              {!showOtp ? (
                <>
                  {/* <Text style={styles.textH1}>Forgot Password</Text> */}
                  <Text style={styles.forgotPass}>Forgot Password?</Text>

                  <CustomInputBox
                    inputPlaceHolder={'Email Address'}
                    keyboardType="email-address"
                    autoComplete="email"
                    value={email}
                    setValue={setEmail}
                  />
                  <View style={{alignSelf: 'center'}}>
                    <Button
                      title="Submit"
                      buttonStyle={[
                        DefaultStyle.btnLogin,
                        {marginTop: 20, marginBottom: 35},
                      ]}
                      onPress={sendOtp}
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.forgotPass}>Forgot Password?</Text>

                  <Text style={[styles.txt, {marginBottom: 20}]}>
                    Enter PIN received to proceed
                  </Text>

                  <View style={styles.otpContainer}>
                    {/* <OtpInput
                      handleTextChange={val => {
                        setOtp(val);
                      }}
                      numberOfInputs={6}
                      textContentType="oneTimeCode"
                      autoComplete="sms-otp"
                      keyboardType="number-pad"
                      tintColor={COLORS.primary}
                      containerStyle={{marginBottom: 10}}
                      textInputStyle={styles.textInputStyle}
                      inputCount={6}
                      inputCellLength={1}
                      autoFocus={true}
                    /> */}

                    <CodeField
                      ref={ref}
                      {...props}
                      value={otp}
                      onChangeText={setOtp}
                      cellCount={6}
                      rootStyle={styles.codeFieldRoot}
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      autoComplete="sms-otp"
                      renderCell={({index, symbol, isFocused}) => (
                        <Text
                          key={index}
                          style={[styles.cell, isFocused && styles.focusCell]}
                          onLayout={getCellOnLayoutHandler(index)}>
                          {symbol || (isFocused ? <Cursor /> : null)}
                        </Text>
                      )}
                    />
                  </View>
                  {isShowTimer ? (
                    <TimerComponent
                      initialTime={120}
                      onComplete={() => setIsShowTimer(false)} // Hide timer when it completes
                    />
                  ) : (
                    // <CustomLabel
                    //   onpress={onHandleResend}
                    //   label1={"Didn't receive the OTP?"}
                    //   label2={'Resend Now'}
                    //   lbl1style={styles.text}
                    //   lbl2style={styles.text1}
                    // />
                    <TouchableOpacity
                      onPress={() => {
                        onHandleResend();
                      }}
                      style={{justifyContent: 'center', flexDirection: 'row'}}>
                      <Text style={styles.text}>Didn't receive the PIN?</Text>
                      <Text style={[styles.text1]}>Resend Now</Text>
                    </TouchableOpacity>
                  )}

                  <View style={{alignSelf: 'center'}}>
                    <Button
                      title="PROCEED"
                      buttonStyle={[
                        DefaultStyle.btnLogin,
                        {marginTop: 20, paddingHorizontal: 50},
                      ]}
                      onPress={onForgotPassword}
                    />
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </SafeAreaView>
  );
};

export default ForgotPasswordIndex;

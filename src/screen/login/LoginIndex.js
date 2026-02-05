import {Button} from '@rneui/themed';
import React, {useCallback, useRef, useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import IMG from '../../assets/images/ic_logo.png';
import AppIcons from '../../component/AppIcons';
import CustomInputBox from '../../component/CustomInputBox';
import CustomLabel from '../../component/CustomLabel';
import PasswordInput from '../../component/PasswordInput';
import {login} from '../../redux/AuthSlice';
import Api from '../../service/Api';
import {
  API_LOGIN,
  API_POST_REGISTER_RESEND_OTP,
  API_VERIFY_OTP,
} from '../../service/apiEndPoint';
import {DefaultStyle} from '../../util/ConstVar';
import Loader from '../../util/Loader';
import {COLORS} from '../../util/Theme';
import TimerComponent from '../../util/Timer';
import {log} from '../../util/Toast';
import {styles} from './Styles';

import crashlytics from '@react-native-firebase/crashlytics';
import {useFocusEffect} from '@react-navigation/native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {useToast} from 'react-native-toast-notifications';
import {showToast} from '../../redux/toastSlice';

const LoginIndex = ({navigation}) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [loaderVisible, setLoaderVisible] = useState(false);
  const passRef = useRef();

  const [showVerifyOtp, setShowVerifyOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [isShowTimer, setIsShowTimer] = useState(true);
  const ref = useBlurOnFulfill({value: otp, cellCount: 6});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  // Callback function to receive password input changes
  const toast = useToast();
  const onForgot = () => {
    navigation.navigate('ForgotPassword');
  };
  const doLogin = async () => {
    if (!email) {
      dispatch(showToast('Please enter email address'));
      //showToast('Please enter email address');
    } else if (!password) {
      // showToast('Please enter your password');
      dispatch(showToast('Please enter your password'));
    } else {
      try {
        setLoaderVisible(true);

        const data = {email: email, password: password};

        const response = await Api.post(API_LOGIN, data);
        console.log(response.data);

        if (response.status == 'RC200') {
          crashlytics().setAttributes({
            email: response.data.email,
          });
          navigation.navigate('Main');
          dispatch(login({token: response.data.token}));
          setEmail('');
          setPassword('');
        }
        if (response.status === 'RC403') {
          setShowVerifyOtp(true);
          setLoaderVisible(false);
          sendOtp();
        }

        setLoaderVisible(false);
      } catch (error) {
        log(error);
        setLoaderVisible(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setShowVerifyOtp(false);
    }, []),
  );

  const onHandleResend = async () => {
    try {
      setLoaderVisible(true);
      const formData = {
        email: email,
      };
      const response = await Api.post(API_POST_REGISTER_RESEND_OTP, formData);
      log(response);
      setLoaderVisible(false);
      if (response.status === 'RC200') {
        setIsShowTimer(true);
      }
    } catch (error) {
      setLoaderVisible(false);
      console.log(error);
    }
  };

  const sendOtp = async () => {
    try {
      setLoaderVisible(true);
      const formData = {
        email: email,
      };
      const response = await Api.post(API_POST_REGISTER_RESEND_OTP, formData);
      log(response);
      setLoaderVisible(false);
      if (response.status === 'RC200') {
        setIsShowTimer(true);
      }
    } catch (error) {
      setLoaderVisible(false);
      console.log(error);
    }
  };

  const verifyOtp = async () => {
    if (
      otp.length !== 6 ||
      otp.length == 1 ||
      otp.length == 2 ||
      otp.length == 3 ||
      otp.length == 4 ||
      otp.length == 5 ||
      !otp
    ) {
      // showToast('Please enter a valid 6-digit OTP');
      dispatch(showToast('Please enter a valid 6-digit PIN Number'));
    } else {
      try {
        setLoaderVisible(true);
        const formData = {
          email: email,
          otp: otp,
        };
        const response = await Api.post(API_VERIFY_OTP, formData);
        log(response);
        setLoaderVisible(false);
        if (response.status === 'RC200') {
          dispatch(login({token: response.data.token}));
          navigation.reset({routes: [{name: 'Main'}]});
          setIsshow(!isshow);
        }
      } catch (error) {
        log(error);
        setLoaderVisible(false);
      }
    }
  };

  return (
    <SafeAreaView style={DefaultStyle.flexView}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

      <View style={styles.container}>
        {showVerifyOtp && (
          <View style={styles.backButton}>
            <Pressable
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
              onPress={() => setShowVerifyOtp(false)}>
              <AppIcons
                type={'Ionicons'}
                name={'arrow-back-circle'}
                size={26}
                color={COLORS.black}
              />
            </Pressable>
            <Text style={styles.back}>Back</Text>
          </View>
        )}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Image source={IMG} style={styles.img} resizeMode="contains" />

            {!showVerifyOtp ? (
              <View>
                <Text style={styles.login}>Login</Text>

                <CustomInputBox
                  inputPlaceHolder={'Email address'}
                  keyboardType="email-address"
                  autoComplete="email"
                  value={email}
                  setValue={setEmail}
                  onSubmitEditing={() => passRef.current.focus()}
                />
                <PasswordInput
                  password={password}
                  setPassword={setPassword}
                  passref={passRef}
                />

                <Text
                  style={{
                    color: COLORS.black,
                    fontSize: 12,
                    textAlign: 'right',
                    paddingVertical: 5,
                    fontWeight: 'bold',
                    alignSelf: 'flex-end',
                  }}
                  onPress={onForgot}>
                  Forgot password?
                </Text>

                <View style={{alignSelf: 'center'}}>
                  <Button
                    title="SIGN IN"
                    buttonStyle={DefaultStyle.btnLogin}
                    titleStyle={DefaultStyle.whiteBold}
                    onPress={doLogin}
                  />
                </View>

                <Text
                  style={[
                    styles.text,
                    {
                      padding: 10,
                      fontWeight: 'bold',
                      alignSelf: 'center',
                      color: COLORS.black,
                    },
                  ]}
                  onPress={() => {
                    navigation.navigate('Registarion');
                  }}>
                  Create Account
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.txt}>
                  Please fill the PIN Number you have received on your email to
                  proceed
                </Text>

                <View style={styles.otpContainer}>
                  {/* <OtpInput
                    handleTextChange={val => setOtp(val)}
                    numberOfInputs={6}
                    textContentType="oneTimeCode"
                    autoComplete="sms-otp"
                    keyboardType="number-pad"
                    tintColor={COLORS.primary}
                    containerStyle={{marginBottom: 10}}
                    textInputStyle={styles.otpTextInputStyle}
                    inputCount={6}
                    inputCellLength={1}
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
                    onComplete={() => setIsShowTimer(false)}
                  />
                ) : (
                  <CustomLabel
                    onpress={onHandleResend}
                    label1={"Didn't receive the PIN Number?"}
                    label2={'Resend Now'}
                    lbl1style={styles.Already}
                    lbl2style={styles.resend}
                  />
                )}

                <View style={{alignSelf: 'center'}}>
                  <Button
                    title="PROCEED"
                    buttonStyle={DefaultStyle.btnLogin}
                    onPress={verifyOtp}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <Loader
        loaderVisible={loaderVisible}
        setLoader
        Visible={setLoaderVisible}
      />
      {/* <BaseToast /> */}
    </SafeAreaView>
  );
};

export default LoginIndex;

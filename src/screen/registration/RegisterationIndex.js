import {useFocusEffect} from '@react-navigation/native';
import {Button} from '@rneui/themed';
import {getCountryCallingCode} from 'libphonenumber-js';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
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
import DropDownPicker from 'react-native-dropdown-picker';
import PhoneInput from 'react-native-phone-number-input';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useDispatch} from 'react-redux';
import IMG from '../../assets/images/ic_logo.png';
import AppIcons from '../../component/AppIcons';
import CustomInputBox from '../../component/CustomInputBox';
import CustomLabel from '../../component/CustomLabel';
import PasswordInput from '../../component/PasswordInput';
import {CustomSmsDialog} from '../../component/customDialog';
import {login} from '../../redux/AuthSlice';
import {showToast} from '../../redux/toastSlice';
import Api from '../../service/Api';
import {
  API_GET_REGION,
  API_POST_REGISTER,
  API_POST_REGISTER_RESEND_OTP,
  API_TIMEZONE,
  API_VERIFY_OTP,
} from '../../service/apiEndPoint';
import {DefaultStyle} from '../../util/ConstVar';
import Loader from '../../util/Loader';
import {COLORS} from '../../util/Theme';
import TimerComponent from '../../util/Timer';
import {log} from '../../util/Toast';
import {
  validatePassword,
  validatePasswordConfirm,
} from '../../util/ValidatePassword';
import {styles} from './styles';

const RegisterationIndex = ({navigation}) => {
  const dispatch = useDispatch();

  const [regionLoader, setRegionLoader] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryChar, setCountryChar] = useState('US');

  const [loaderVisible, setLoaderVisible] = useState(false);
  const [countryCode, setCountryCode] = useState('1');
  const [password, setPassword] = useState('');
  const [conformPass, setConformPass] = useState('');
  const [otp, setOtp] = useState('');
  const [isshow, setIsshow] = useState(false);
  const [isShowTimer, setIsShowTimer] = useState(false);
  // const [region, setRegion] = useState(RNLocalize.getCountry());
  const [isAgree, setIsAgree] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const ref = useBlurOnFulfill({value: otp, cellCount: 6});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });
  const [timeZone, setTimeZone] = useState(null);
  const [isTimeZone, setIsTimeZone] = useState(false);
  const [smsConsentDialogue, setSmsConsentDialogue] = useState(false);
  const [timeZoneList, setTimeZoneList] = useState([]);

  // useEffect(() => {
  //   const getCallingCode = countryCode => {
  //     try {
  //       const callingCode = getCountryCallingCode(countryCode);
  //       return `+${callingCode}`; // Add '+' sign to the calling code
  //     } catch (error) {
  //       return '+1';
  //     }
  //   };

  //   console.log(RNLocalize.getCountry());
  //   console.log(getCallingCode(region));
  //   setCountryCode(getCallingCode(region));
  // }, []);

  const getTimeZone = async () => {
    try {
      const response = await Api.get(API_TIMEZONE);

      //console.log(response);
      if (response.status === 'RC200') {
        const data = response.data.map((item, index) => ({
          label: item.name,
          value: item.value,
          selected: item.selected,
        }));
        setTimeZoneList(data);
        // return { label: item.name, value: item.id };
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCallingCode = countryCode => {
    try {
      return `+${getCountryCallingCode('IN')}`;
    } catch (error) {
      console.error('Invalid country code', error);
      return null;
    }
  };

  const getRegion = async () => {
    try {
      setRegionLoader(true);
      const response = await Api.get(API_GET_REGION);

      if (response.status == 'RC200') {
        let result = response.data;
        setCountryChar(result);

        let callingCode = getCallingCode(result);

        setCountryCode(callingCode);

        // setTimeZone(result['time_zone']);

        setRegionLoader(false);
      }
    } catch (error) {
      log(error);
      setRegionLoader(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getTimeZone();
      setCountryCode('1');
      setCountryChar('US');
    }, []),
  );

  const emailRef = useRef();
  const userNameRef = useRef();

  const goLogin = () => {
    navigation.navigate('Login');
    reset();
  };

  useEffect(() => {
    const backAction = () => {
      if (isshow) {
        setIsshow(false);
        setPhone('');
        return true; // Prevent default behavior (i.e., navigating back)
      }
      return false; // Allow default behavior (i.e., navigating back)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [isshow]);

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

  const reset = () => {
    setName('');
    setEmail('');
    setUserName('');
    setPhone('');
    setPassword('');
    setConformPass('');
  };
  const onRegistration = async () => {
    // const PassERR = validatePassword(password);
    // const ConfirmERR = validatePasswordConfirm(conformPass);

    console.log('countryCode', countryCode);
    console.log('countryChar', countryChar);

    if (!name) {
      // showToast('Please enter full name');
      dispatch(showToast('Please enter full name'));
    } else if (!userName) {
      // showToast('Please enter user name');
      dispatch(showToast('Please enter username'));
    } else if (!email) {
      // showToast('Please enter user name');
      dispatch(showToast('Please enter email address'));
    } else if (!phone) {
      //showToast('Please enter phone number');
      dispatch(showToast('Please enter phone number'));
    } else if (validatePassword(password)) {
      //showToast(PassERR);
      dispatch(showToast('Please enter password'));
    } else if (validatePasswordConfirm(conformPass)) {
      dispatch(showToast('Please re-enter password'));
    } else if (!timeZone) {
      dispatch(showToast('Please enter timezone'));
    } else if (!isAgree) {
      dispatch(
        showToast('Please agree to Privacy Policy and Terms of Service'),
      );
    } else if (!smsConsent) {
      setSmsConsentDialogue(true);
    } else {
      handleRegistrationSubmit();
    }
  };

  const handleRegistrationSubmit = async () => {
    try {
      setSmsConsentDialogue(false);
      setLoaderVisible(true);
      const formData = {
        fullname: name,
        email: email,
        username: userName,
        country_code: countryCode,
        country_region: countryChar,
        phone_number: phone,
        password: password,
        confirm_password: conformPass,
        timezone: timeZone,
        sms_consent: smsConsent ? 1 : 0,
      };
      console.log(formData);
      const response = await Api.post(API_POST_REGISTER, formData);
      log(response);
      setLoaderVisible(false);
      if (response.status === 'RC200') {
        setIsshow(!isshow);
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

  useEffect(() => {
    const selectedItem = timeZoneList.find(
      item => item.selected === true || item.selected === 'true',
    );
    if (selectedItem) {
      setTimeZone(selectedItem.value);
    }
  }, [timeZoneList]);

  return (
    <SafeAreaView style={DefaultStyle.flexView}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />

      {regionLoader ? (
        <View
          style={{
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator
            style={{alignSelf: 'center', marginTop: 20}}
            size={'large'}
            color={COLORS.primary}
          />
        </View>
      ) : (
        // <KeyboardAvoidingView
        //   behavior={Platform.OS === 'ios' ? 'padding' : null}
        //   keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}>
          <View style={DefaultStyle.flexDirection}>
            <Pressable
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
              onPress={() => {
                {
                  if (isshow) {
                    setIsshow(false);
                  } else {
                    navigation.goBack();
                  }
                }
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
          <View style={{paddingHorizontal: 20}}>
            <Image source={IMG} style={styles.img} resizeMode="contains" />

            <View>
              {!isshow ? (
                <View>
                  <CustomInputBox
                    inputPlaceHolder={'First & Last Name *'}
                    keyboardType="default"
                    value={name}
                    setValue={setName}
                    ref={userNameRef}
                    onSubmitEditing={() => emailRef.current.focus()}
                  />

                  <CustomInputBox
                    inputPlaceHolder={'Email Address *'}
                    keyboardType="email-address"
                    autoComplete="email"
                    value={email}
                    setValue={setEmail}
                    ref={emailRef}
                  />
                  <CustomInputBox
                    inputPlaceHolder={'Create Username *'}
                    keyboardType="default"
                    value={userName}
                    onSubmitEditing={() => userNameRef.current.focus()}
                    setValue={setUserName}
                  />

                  <Text style={styles.donotEnter}>
                    Please DO NOT enter temporary work/student email
                  </Text>

                  <View style={{flex: 1}}>
                    <PhoneInput
                      value={phone}
                      defaultCode={countryChar}
                      disableArrowIcon={false}
                      textSearchProps={{placeholder: 'Enter country name'}}
                      placeholder="Phone Number"
                      layout="first"
                      containerStyle={styles.phoneContainerStyle}
                      textContainerStyle={styles.phoneTextContainerStyle}
                      flagButtonStyle={styles.phoneFlagBtnStyle}
                      onChangeText={text => {
                        setPhone(text);
                      }}
                      textInputStyle={styles.phoneTextInputStyle}
                      onChangeCountry={txt => {
                        setCountryChar(txt.cca2);
                        setCountryCode(txt.callingCode[0]);
                        console.log(countryCode);
                      }}
                      withDarkTheme={false}
                      codeTextStyle={[styles.countrycodeStyle]}
                    />
                  </View>

                  <DropDownPicker
                    open={isTimeZone}
                    setOpen={setIsTimeZone}
                    value={timeZone}
                    items={timeZoneList}
                    onSelectItem={val => {
                      setTimeZone(val.value);
                    }}
                    searchable
                    listMode="MODAL"
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                    }}
                    searchPlaceholder="Search Timezone"
                    searchPlaceholderTextColor={COLORS.black}
                    searchTextInputStyle={[
                      styles.input,
                      {
                        fontSize: 15,
                      },
                    ]}
                    searchContainerStyle={{
                      borderBottomWidth: 0,
                      paddingBottom: 4,
                    }}
                    closeIconStyle={{
                      marginBottom: 15,
                    }}
                    labelStyle={styles.dropdownTitle}
                    listItemLabelStyle={styles.dropdownLabel}
                    arrowIconStyle={styles.dropdownicon}
                    autoScroll={false}
                    style={styles.dropdoenContainer}
                    placeholderStyle={{color: COLORS.gray}}
                    placeholder="Select Timezone"
                  />

                  <PasswordInput
                    password={password}
                    setPassword={setPassword}
                    placeholder={'Password *'}
                  />

                  <Text style={[styles.donotEnter]}>
                    Minimum 8 characters including one each of Uppercase,
                    Lowercase, Number & Special Character
                  </Text>

                  <PasswordInput
                    password={conformPass}
                    setPassword={setConformPass}
                    placeholder={'Re-enter Password *'}
                  />

                  <View
                    style={{
                      marginVertical: 10,
                      flexDirection: 'row',
                      flex: 1,
                    }}>
                    <Pressable
                      style={{padding: 4}}
                      onPress={() => {
                        setIsAgree(!isAgree);
                      }}>
                      <AppIcons
                        type={'MaterialIcons'}
                        name={isAgree ? 'check-box' : 'check-box-outline-blank'}
                        size={26}
                        color={isAgree ? COLORS.primary : COLORS.black}
                      />
                    </Pressable>
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        flex: 1,
                        alignItems: 'center',
                      }}>
                      <Text style={styles.txt1}>
                        I acknowledge and agree to the
                      </Text>
                      <Text
                        style={styles.privacy}
                        onPress={() => {
                          navigation.navigate('CustomWebview', {
                            Url: 'https://guidelinked.com/privacy-policy.html',
                            Title: 'Privacy Policy',
                          });
                        }}>
                        Privacy Policy
                      </Text>
                      <Text style={styles.txt1}>and </Text>
                      <Text
                        style={styles.term}
                        onPress={() => {
                          navigation.navigate('CustomWebview', {
                            Url: 'https://guidelinked.com/terms-of-use.html',
                            Title: 'Terms of Service',
                          });
                        }}>
                        Terms of Service.
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      marginVertical: 10,
                      flexDirection: 'row',
                      alignItems: 'center',
                      flex: 1,
                    }}>
                    <Pressable
                      style={{padding: 4}}
                      onPress={() => {
                        setSmsConsent(!smsConsent);
                      }}>
                      <AppIcons
                        type={'MaterialIcons'}
                        name={
                          smsConsent ? 'check-box' : 'check-box-outline-blank'
                        }
                        size={26}
                        color={smsConsent ? COLORS.primary : COLORS.black}
                      />
                    </Pressable>

                    <Text style={[styles.txt1, {flex: 1, flexWrap: 'wrap'}]}>
                      I consent to receive notifications about upcoming events
                      and special offers via text messages. Standard Msg rates
                      may apply based on your plan with the carrier.
                    </Text>
                  </View>

                  <View style={{width: '100%', paddingVertical: 10}}>
                    <Button
                      title="SIGN UP"
                      buttonStyle={[DefaultStyle.btnLogin, {marginTop: 10}]}
                      titleStyle={DefaultStyle.whiteBold}
                      onPress={onRegistration}
                    />

                    <TouchableOpacity
                      onPress={goLogin}
                      style={{
                        flexDirection: 'row',
                        alignSelf: 'center',
                        alignItems: 'center',
                        marginBottom: 10,
                      }}>
                      <Text style={styles.Already}>
                        Already have an account?{' '}
                      </Text>
                      <Text
                        style={[
                          styles.Already,
                          {color: COLORS.primary, fontWeight: 'bold'},
                        ]}>
                        Login
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* <Button
                      title="SIGN UP"
                      buttonStyle={[DefaultStyle.btnLogin, {marginTop: 20}]}
                      titleStyle={DefaultStyle.whiteBold}
                      onPress={onRegistration}
                    />

                    <CustomLabel
                      onpress={goLogin}
                      label1={'Already have an account?'}
                      label2={'Login'}
                      lbl1style={styles.Already}
                      lbl2style={[styles.Login, {marginTop: 0}]}
                    /> */}
                </View>
              ) : (
                <View>
                  <Text style={styles.txt}>
                    Please fill the PIN Number you have received on Your Email
                    to proceed ahead
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
                      onComplete={() => setIsShowTimer(false)} // Hide timer when it completes
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
                      buttonStyle={[DefaultStyle.btnLogin]}
                      onPress={verifyOtp}
                    />
                  </View>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
        // </KeyboardAvoidingView>
      )}

      {/* {(!regionLoader && !isshow)  && } */}

      {smsConsentDialogue && (
        <CustomSmsDialog
          visible={smsConsentDialogue}
          onClose={() => {
            setSmsConsentDialogue(false);
            setSmsConsent(true);
          }}
          onYes={() => {
            handleRegistrationSubmit();
          }}
        />
      )}

      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </SafeAreaView>
  );
};

export default RegisterationIndex;

import {useFocusEffect} from '@react-navigation/native';
import {Button} from '@rneui/themed';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import {FlatList} from 'react-native-gesture-handler';
import {useDispatch} from 'react-redux';
import AppHeader from '../../../component/AppHeader';
import AppIcons from '../../../component/AppIcons';
import BottomTab from '../../../component/BottomTab';
import IosStatusBar from '../../../component/IosStatusBar';
import {showToast} from '../../../redux/toastSlice';
import Api from '../../../service/Api';
import {
  API_ADD_EMAIL_VERIFY,
  API_DELETE_EMAIL_VERIFY,
  API_EMAIL_LIST,
  API_EMAIL_VERIFY,
  API_RESEND_WORK_EMAIL_OTP,
} from '../../../service/apiEndPoint';
import {DefaultStyle} from '../../../util/ConstVar';
import Loader from '../../../util/Loader';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import TimerComponent from '../../../util/Timer';
import {log, simpleToast} from '../../../util/Toast';
import {styles} from './style';

const EmailVerifyIndex = ({navigation, route}) => {
  const dispatch = useDispatch();
  const isFromGuide = route?.params?.guide === true;

  const [loaderVisible, setLoaderVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [emailList, setEmailList] = useState([]);
  const [isShowTimer, setIsShowTimer] = useState(false);

  const [isShow, setIsShow] = useState(false);
  const [otp, setOtp] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, SetShowDeleteDialog] = useState(false);
  const [resendId, setResendId] = useState('');
  const [isSmallLoader, setIsSmallLoader] = useState(false);

  const [deleteId, setDeleteId] = useState('');
  const ref = useBlurOnFulfill({value: otp, cellCount: 6});
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: otp,
    setValue: setOtp,
  });

  const bottomDialog = () => {
    setShowDialog(!showDialog);
  };
  const deleteDialog = () => {
    SetShowDeleteDialog(!showDeleteDialog);
  };
  const getList = async () => {
    try {
      setLoaderVisible(true);
      const response = await Api.get(API_EMAIL_LIST);

      setTimeout(() => {
        setLoaderVisible(false);
      }, 500);

      if (response.status == 'RC200') {
        setEmailList(response.data);
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  const addEmail = async email => {
    if (!email) {
      //showToast('please enter email address');
      if (Platform.OS == 'ios') {
        simpleToast('Please enter email address');
      } else {
        dispatch(showToast('Please enter email address'));
      }
    } else {
      try {
        const data = {email: email};
        setIsSmallLoader(true);
        const response = await Api.post(API_ADD_EMAIL_VERIFY, data);
        setIsSmallLoader(false);
        console.log('add email:-', response);

        if (response.status == 'RC200') {
          setResendId(response.data?.id);
          setIsShow(!isShow);
          setIsShowTimer(true);
          setEmail(email);
          getList();
        }
      } catch (error) {
        log(error);
        setIsSmallLoader(false);
        bottomDialog();
      }
    }
  };

  const verifyEmail = async () => {
    if (
      otp.length !== 6 ||
      otp.length == 1 ||
      otp.length == 2 ||
      otp.length == 3 ||
      otp.length == 4 ||
      otp.length == 5 ||
      !otp
    ) {
      //showToast('Please enter a valid 6 digit OTP');
      if (Platform.OS == 'ios') {
        simpleToast('Please enter a valid 6 digit PIN Number');
      } else {
        dispatch(showToast('Please enter a valid 6 digit PIN Number'));
      }
    } else {
      try {
        setIsSmallLoader(true);
        const data = {otp: otp, email: email};
        console.log(data);
        const response = await Api.post(API_EMAIL_VERIFY, data);
        console.log('verify ', response);
        setIsSmallLoader(false);

        if (response.status == 'RC200') {
          setIsShow(!isShow);
          bottomDialog();
          setEmail('');
          setOtp('');
          getList();
          if (isFromGuide) {
            navigation.goBack();
          }
        }
      } catch (error) {
        log(error);
        setIsSmallLoader(false);
        bottomDialog();
        setEmail('');
        setOtp('');
      }
    }
  };

  const onHandleVerifyNow = async id => {
    try {
      const data = {id: id};
      setIsSmallLoader(true);
      const response = await Api.post(API_RESEND_WORK_EMAIL_OTP, data);
      console.log(response);
      setIsShowTimer(true);

      if (response.status == 'RC200') {
        setIsSmallLoader(false);
      }
    } catch (error) {
      log(error);
      setIsSmallLoader(false);
      bottomDialog();
    }
  };

  const onDeleteEmail = async () => {
    try {
      setLoaderVisible(true);

      const response = await Api.get(API_DELETE_EMAIL_VERIFY + deleteId);
      console.log(response);

      if (response.status == 'RC200') {
        setLoaderVisible(false);
        setDeleteId('');
        deleteDialog();
        getList();
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
      bottomDialog();
    }
  };

  useFocusEffect(
    useCallback(() => {
      getList();
    }, []),
  );

  const renderData = ({item}) => {
    return (
      <>
        <View style={[DefaultStyle.flexDirection, {paddingHorizontal: 10}]}>
          <View
            style={[
              DefaultStyle.flexDirection,
              {justifyContent: 'flex-start'},
            ]}>
            <View style={[DefaultStyle.flexDirection, {flex: 3}]}>
              <View style={styles.iconStatus}>
                {item.is_verified == 1 ? (
                  <Image
                    source={require('../../../assets/images/ic_verify1.png')}
                    resizeMode="contain"
                    style={{width: 20, height: 20}}
                  />
                ) : (
                  <AppIcons
                    type={'AntDesign'}
                    name={'checkcircleo'}
                    size={20}
                    color={item.is_verified == 1 ? COLORS.green : COLORS.gray}
                  />
                )}
              </View>
              <Text style={styles.email}>{item.email}</Text>
            </View>
            <View style={[{alignItems: 'center', flexDirection: 'row'}]}>
              {item.is_verified == 0 && (
                <Text
                  style={[styles.unverify, {marginEnd: 10}]}
                  onPress={() => {
                    setEmail(item.email);
                    setResendId(item.id);
                    bottomDialog();
                    setIsShow(true);
                    onHandleVerifyNow(item.id);
                  }}>
                  Verify Now
                </Text>
              )}
              <Pressable
                style={{padding: 5}}
                onPress={() => {
                  //onDeleteEmail()

                  setDeleteId(item.id);
                  deleteDialog();
                }}>
                <AppIcons
                  name={'delete'}
                  type={'AntDesign'}
                  size={20}
                  color={COLORS.red}
                />
              </Pressable>
            </View>
          </View>
        </View>
        <View style={[DefaultStyle.devider, {width: SIZES.width}]} />
      </>
    );
  };
  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <ScreenStatusBar
        backgroundColor={COLORS.primary}
        barStyle="dark-content"
      />
      <View style={{flex: 1}}>
        {/* <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}> */}
        <AppHeader
          background={COLORS.primary}
          iconType={'Feather'}
          iconName={'menu'}
          iconColor={COLORS.white}
          navigation={navigation}
          tittle={'Verify Emails'}
          titleColor={COLORS.white}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {isFromGuide && (
            <View
              style={{
                top: 10,
                left: 0,
                right: 0,
                alignItems: 'center',
                zIndex: 999,
              }}>
              <View
                style={{
                  backgroundColor: '#E6F0FA',
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}>
                <Text
                  style={{
                    color: COLORS.primary,
                    fontWeight: '600',
                    fontSize: 13,
                  }}>
                  Step 4 of 4
                </Text>
              </View>
            </View>
          )}
          <View style={{padding: 20}}>
            <Text style={styles.text}>
              Validate your profile by verifying work or student emails.
              Verified emails are kept private from other users. For e.g.,
              *****@amzon.com, *****@ucla.edu
            </Text>
            <Text style={[styles.text, {marginTop: 10}]}>
              Once verified you get a badge in your profile & rank higher in
              search.
            </Text>
          </View>

          <View style={{flex: 1, marginTop: 10}}>
            {emailList.length != 0 ? (
              <View style={{flexDirection: 'column', flex: 1}}>
                <View style={[DefaultStyle.devider, {width: SIZES.width}]} />
                <FlatList
                  style={styles.container}
                  showsVerticalScrollIndicator={false}
                  data={emailList}
                  renderItem={renderData}
                />
              </View>
            ) : (
              <View>
                <Image
                  source={require('../../../assets/images/ic-mail.png')}
                  style={{
                    width: 100,
                    height: 100,
                    tintColor: COLORS.primary,
                    alignSelf: 'center',
                  }}
                  resizeMode="contain"
                />
                <Text style={styles.empty}>
                  You do not have any work / student email address
                </Text>
              </View>
            )}

            <View style={{paddingBottom: 80}}>
              <Pressable
                style={[styles.addBtn, {marginTop: 30, alignSelf: 'center'}]}
                onPress={() => {
                  bottomDialog();
                }}>
                <AppIcons
                  type={'MaterialCommunityIcons'}
                  name={'plus'}
                  color={COLORS.white}
                  size={22}
                />
                <Text style={[DefaultStyle.whiteBold]}> Add Email</Text>
              </Pressable>
              {/* <HelpVideoIcon
                  style={{marginTop: 20, alignSelf: 'center'}}
                  title="Help Video"
                  type={4}
                /> */}
            </View>
          </View>
        </ScrollView>
        {/* </KeyboardAvoidingView> */}
      </View>

      <View>
        <BottomTab />
      </View>

      {/* TODO: show bototm dialog show */}

      <Modal
        visible={showDialog}
        transparent={true}
        animationType="slide"
        onRequestClose={bottomDialog}>
        <View style={DefaultStyle.modalContentBottomDialog}>
          <KeyboardAvoidingView behavior={Platform.OS == 'ios' && 'padding'}>
            <View
              style={[DefaultStyle.modalContentDialog, {width: SIZES.width}]}>
              {isShow ? (
                <View>
                  <Text
                    style={[
                      DefaultStyle.textPrimaryheading,
                      {textAlign: 'center', marginBottom: 20},
                    ]}>
                    Verify Work / Student Email
                  </Text>
                  <Text style={[styles.empty, {marginVertical: 0}]}>
                    Please fill the PIN Number you have received to proceed
                    ahead
                  </Text>
                  <View style={styles.otpContainer}>
                    {/* <OtpInput
                        handleTextChange={val => {
                          console.log('asndboiansodnaionsdoinaiosn');
                          if (val.length === 6) {
                            setOtp(val);
                          }
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

                    {isSmallLoader && (
                      <View style={{paddingBottom: 15}}>
                        <ActivityIndicator
                          style={{alignSelf: 'center'}}
                          size={'small'}
                          color={COLORS.primary}
                        />
                      </View>
                    )}
                    {isShowTimer ? (
                      <TimerComponent
                        initialTime={120}
                        onComplete={() => setIsShowTimer(false)} // Hide timer when it completes
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          onHandleVerifyNow(resendId);
                        }}
                        style={{
                          justifyContent: 'center',
                          flexDirection: 'row',
                        }}>
                        <Text style={styles.lbl1}>
                          Didn't receive the PIN number?
                        </Text>
                        <Text style={[styles.lbl2]}>Resend Now</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={[DefaultStyle.flexSpaceCenter]}>
                    <Button
                      title="Cancel"
                      buttonStyle={[DefaultStyle.btnBorder, {borderRadius: 10}]}
                      titleStyle={{color: COLORS.black}}
                      onPress={() => {
                        bottomDialog();
                        setIsShow(!isShow);
                      }}
                    />

                    <Button
                      title="Proceed"
                      buttonStyle={[
                        DefaultStyle.btnLogin,
                        {
                          backgroundColor: COLORS.primary,
                          borderRadius: 10,
                        },
                      ]}
                      titleStyle={{color: COLORS.white}}
                      onPress={verifyEmail}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <Text
                    style={[
                      DefaultStyle.textPrimaryheading,
                      {textAlign: 'center', marginBottom: 20},
                    ]}>
                    Verify Work / Student Email
                  </Text>

                  <TextInput
                    placeholderTextColor={COLORS.gray}
                    value={email}
                    onChangeText={text => setEmail(text.trim())}
                    style={styles.input1}
                    placeholder="Enter Email Address"
                    keyboardType="email-address"
                  />
                  {isSmallLoader && (
                    <View style={{paddingVertical: 8}}>
                      <ActivityIndicator
                        style={{alignSelf: 'center'}}
                        size={'small'}
                        color={COLORS.primary}
                      />
                    </View>
                  )}

                  <View
                    style={[
                      DefaultStyle.flexSpaceCenter,
                      {marginVertical: 20},
                    ]}>
                    <Button
                      title="Cancel"
                      buttonStyle={[DefaultStyle.btnBorder, {borderRadius: 10}]}
                      titleStyle={{color: COLORS.black}}
                      onPress={() => {
                        bottomDialog();
                        setEmail('');
                      }}
                    />

                    <Button
                      title="Send PIN"
                      buttonStyle={[
                        DefaultStyle.btnLogin,
                        {
                          backgroundColor: COLORS.primary,
                          marginVertical: 0,
                          borderRadius: 10,
                          paddingHorizontal: 20,
                        },
                      ]}
                      titleStyle={{color: COLORS.white}}
                      onPress={() => {
                        addEmail(email);
                      }}
                    />
                  </View>
                </View>
              )}

              {/* </View> */}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        visible={showDeleteDialog}
        transparent={true}
        animationType="slide"
        onRequestClose={deleteDialog}>
        <View style={DefaultStyle.modalContentBottomDialog}>
          <KeyboardAvoidingView behavior={Platform.OS == 'ios' && 'padding'}>
            <View
              style={[DefaultStyle.modalContentDialog, {width: SIZES.width}]}>
              <Text
                style={[
                  DefaultStyle.textPrimaryheading,
                  {textAlign: 'center', marginBottom: 20},
                ]}>
                Delete Email
              </Text>

              <Text>Are you sure, Do you want to delete this email?</Text>

              <View
                style={[DefaultStyle.flexSpaceCenter, {marginVertical: 20}]}>
                <Button
                  title="Cancel"
                  buttonStyle={[DefaultStyle.btnBorder, {borderRadius: 10}]}
                  titleStyle={{color: COLORS.black}}
                  onPress={() => {
                    deleteDialog();
                    setEmail('');
                  }}
                />

                <Button
                  title="Yes, Delete"
                  buttonStyle={[
                    DefaultStyle.btnLogin,
                    {
                      backgroundColor: COLORS.primary,
                      marginVertical: 0,
                      borderRadius: 10,
                      paddingHorizontal: 20,
                    },
                  ]}
                  titleStyle={{color: COLORS.white}}
                  onPress={() => {
                    onDeleteEmail();
                  }}
                />
              </View>

              {/* </View> */}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </>
  );
};

export default EmailVerifyIndex;

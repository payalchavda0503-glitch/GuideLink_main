import {
  Pressable,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Linking,
  Modal,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import AppHeader from '../../../component/AppHeader';
import {SafeAreaView} from 'react-native';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import {styles} from './styles';
import Loader from '../../../util/Loader';
import Api from '../../../service/Api';
import {
  API_SCHEDULE_DELETE_SLOT,
  API_SCHEDULE_MY_TIMELINE,
  API_STRIPE_ONBOARDING_LINK,
} from '../../../service/apiEndPoint';
import TimeSlotRates from './TimeSlotRates';
import AddAvailability from './AddAvailability';
import {DrawerActions, useFocusEffect} from '@react-navigation/native';
import {FlatList} from 'react-native-gesture-handler';
import AppIcons from '../../../component/AppIcons';
import BottomTab from '../../../component/BottomTab';
import {Button} from '@rneui/themed';
import {DefaultStyle} from '../../../util/ConstVar';
import {CustomCancelTimeSlotDialog} from '../../../component/customDialog';
import ExpandCollapseView from './ExpandCollapseView';
import IosStatusBar from '../../../component/IosStatusBar';
import {FlashList} from '@shopify/flash-list';
import DayView from './DayView';
import DeviceInfo from 'react-native-device-info';
import HelpVideoIcon from '../HelpVideoIcon';

const Index = ({navigation, route}) => {
  const isFromGuide = route?.params?.guide === true;
  const [showDialog, setShowDialog] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);

  const [onboardingStatus, setOnboardingStatus] = useState(-2);
  const [rates, setRates] = useState('');
  const [paidAnswerRate, setPaidAnswerRate] = useState('');
  const [timeline, setTimeline] = useState([]);

  const [isCancelTimeSlot, setIsCanclelTimeSlot] = useState(false);

  const [deleteSlotTimeArr, setDeleteSlotTimeArr] = useState([]);
  const [isOldVersion, setIsOldVersion] = useState(false);

  const isCancelTimeSlotDialog = () => {
    setIsCanclelTimeSlot(!isCancelTimeSlot);
  };

  const getData = async () => {
    setOnboardingStatus(-2);
    setLoaderVisible(true);
    console.log('calling v');

    // static 1 is the page number
    const response = await Api.get(`${API_SCHEDULE_MY_TIMELINE}`);

    if (response.status == 'RC200') {
      let data = response.data;

      setRates(data.rates);
      setPaidAnswerRate(
        data?.paid_answer_rate ??
          data?.paidAnswerRate ??
          data?.answer_rate ??
          data?.answerRate ??
          '',
      );
      setOnboardingStatus(data.onboarding_status);

      setTimeline(data.timeline);
    }
    setTimeout(() => {
      setLoaderVisible(false);
    }, 500);
  };

  const getStripeOnboardingLink = async () => {
    setLoaderVisible(true);

    // static 1 is the page number
    const response = await Api.get(`${API_STRIPE_ONBOARDING_LINK}`);

    if (response.status == 'RC200') {
      let data = response.data;

      navigation.navigate('OnboardingProcess', {INIT_URL: data.url});

      //Linking.openURL(data.url)
    }

    setLoaderVisible(false);
  };

  const checkIosVersion = async () => {
    const model = DeviceInfo.getModel(); // e.g., 'iPhone 12'
    const systemVersion = DeviceInfo.getSystemVersion(); // e.g., '14.4'
    if (
      model.includes('iPhone SE') ||
      parseInt(systemVersion.split('.')[0]) < 13
    ) {
      setIsOldVersion(true);
    } else {
      setIsOldVersion(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkIosVersion();
      getData();
    }, []),
  );

  const Divider = () => {
    return (
      <View
        style={{
          height: 1,
          backgroundColor: '#e0e0e0',
        }}
      />
    );
  };

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.container}>
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="dark-content"
        />
        <AppHeader
          background={COLORS.primary}
          iconType={'Feather'}
          iconName={'menu'}
          iconColor={COLORS.white}
          navigation={navigation}
          tittle={'Time Slots / Rate ($)'}
          titleColor={COLORS.white}
        />

        <View style={{flexDirection: 'column', flex: 1}}>
          {onboardingStatus != -2 &&
            (onboardingStatus == -1 ? (
              <>
                {isFromGuide && (
                  <View
                    style={{
                      position: 'absolute',
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
                        Step 2 of 4
                      </Text>
                    </View>
                  </View>
                )}

                <View
                  style={{
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                  }}>
                  <AppIcons
                    type={'MaterialCommunityIcons'}
                    name={'account-cash'}
                    size={150}
                    color={COLORS.primary}
                  />
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: COLORS.primary,
                    }}>
                    Payout Account Setup
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      marginTop: 10,
                      textAlign: 'center',
                      fontWeight: 'normal',
                    }}>
                    So that we can pay you, please link your bank account with
                    Stripe. Stripe is one of the largest and most secure payment
                    gateway in the world. Only after this setup you will be able
                    to create time slots.
                  </Text>

                  <Button
                    title="Link your Bank Account"
                    buttonStyle={[
                      DefaultStyle.btnLogin,
                      {
                        backgroundColor: COLORS.primary,
                        borderRadius: 10,
                        marginLeft: 10,
                        marginVertical: 0,
                        marginTop: 30,
                      },
                    ]}
                    titleStyle={{color: COLORS.white}}
                    onPress={() => {
                      getStripeOnboardingLink();
                    }}
                  />

                  {/* <HelpVideoIcon
                    style={{marginTop: 20}}
                    title="Help Video"
                    type={2}
                  /> */}
                </View>
              </>
            ) : onboardingStatus == 0 ? (
              <>
                <View
                  style={{
                    flexDirection: 'column',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                  }}>
                  <AppIcons
                    type={'MaterialCommunityIcons'}
                    name={'bank-remove'}
                    size={150}
                    color={COLORS.primary}
                  />
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: 'bold',
                      color: COLORS.primary,
                    }}>
                    Account setup incomplete
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      marginTop: 10,
                      textAlign: 'center',
                      fontWeight: 'normal',
                    }}>
                    Please fill all the required details which Stripe needs to
                    complete the onboarding process.
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      marginTop: 6,
                      textAlign: 'center',
                      fontWeight: 'normal',
                    }}>
                    Only after the account setup is completed, you will be able
                    to set your slot rates and availability.
                  </Text>

                  <Button
                    title="Link your Bank Account"
                    buttonStyle={[
                      DefaultStyle.btnLogin,
                      {
                        backgroundColor: COLORS.primary,
                        borderRadius: 10,
                        marginLeft: 10,
                        marginVertical: 0,
                        marginTop: 30,
                      },
                    ]}
                    titleStyle={{color: COLORS.white}}
                    onPress={() => {
                      getStripeOnboardingLink();
                    }}
                  />

                  {/* <HelpVideoIcon
                    style={{marginTop: 20}}
                    title="Help Video"
                    type={2}
                  /> */}
                </View>
              </>
            ) : (
              <>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {isFromGuide && (
                    <View
                      style={{
                        // position: 'absolute',
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
                          Step 3 of 4
                        </Text>
                      </View>
                    </View>
                  )}
                  <TimeSlotRates
                    rates={rates}
                    setRates={setRates}
                    paidAnswerRate={paidAnswerRate}
                    setPaidAnswerRate={setPaidAnswerRate}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 10,
                      marginVertical: 10,
                    }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        color: COLORS.black,
                      }}>
                      Current Availability
                    </Text>
                    <Button
                      title="+ Create Slots"
                      buttonStyle={[
                        DefaultStyle.btnLogin,
                        {
                          backgroundColor: COLORS.primary,
                          borderRadius: 10,
                          padding: 0,
                          marginRight: 16,
                          marginVertical: 0,
                          paddingVertical: 5,
                          paddingHorizontal: 20,
                        },
                      ]}
                      titleStyle={{color: COLORS.white, fontSize: 14}}
                      onPress={() => {
                        setShowDialog(true);
                      }}
                      disabled={rates <= 0}
                    />
                  </View>

                  <FlatList
                    data={timeline}
                    style={{flex: 1}}
                    contentContainerStyle={{paddingBottom: SIZES.height * 0.25}}
                    keyExtractor={item => `level_1_${item.label}`}
                    //ItemSeparatorComponent={Divider}
                    nestedScrollEnabled={false}
                    renderItem={({item, index}) => (
                      <ExpandCollapseView
                        index={index}
                        level={0}
                        item={item}
                        onDelete={() => {
                          getData();
                        }}
                      />
                    )}
                  />
                </ScrollView>

                {/* <Pressable
                    style={styles.fabContent}
                    onPress={() => {
                      setShowDialog(true);
                    }}>
                    <Button
                      title="+  Create Slots"
                      buttonStyle={{
                        borderRadius: 10,
                      }}
                      onPress={() => {
                        setShowDialog(true);
                      }}
                    />
                  </Pressable> */}

                <AddAvailability
                  navigation={navigation}
                  show={showDialog}
                  isOldVersion={isOldVersion}
                  isFromGuide={isFromGuide}
                  onClose={isDataSaved => {
                    setShowDialog(false);
                    if (isDataSaved) {
                      getData();
                    }
                  }}
                />
              </>
            ))}
        </View>

        <View style={{position: 'absolute', bottom: 0}}>
          <BottomTab />
        </View>

        <Loader
          loaderVisible={loaderVisible}
          setLoaderVisible={setLoaderVisible}
        />
      </SafeAreaView>
    </>
  );
};

export default Index;

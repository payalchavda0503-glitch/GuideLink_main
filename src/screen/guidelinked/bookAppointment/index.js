import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Pressable,
  Modal,
  StyleSheet,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import {DefaultStyle} from '../../../util/ConstVar';
import Loader from '../../../util/Loader';
import AppIcons from '../../../component/AppIcons';
import {Button, Card} from '@rneui/themed';
import Api from '../../../service/Api';
import {
  API_BOOK_APPOINTMENT,
  API_BOOK_APPOINTMENT_VALIDATE,
  API_EXPERT_DETAILS,
  API_GET_STRIPE_CARD_SETUP_KEY,
  API_GET_STRIPE_PUB_KEY,
  API_SCHEDULE_TIMESLOTS_DATE,
  API_SCHEDULE_TIMESLOTS_TIME,
  API_REQUEST_SLOTS,
  WEB_URL,
} from '../../../service/apiEndPoint';
import {useFocusEffect} from '@react-navigation/native';
import {log, simpleToast} from '../../../util/Toast';
import {
  confirmPayment,
  initPaymentSheet,
  presentPaymentSheet,
  StripeProvider,
} from '@stripe/stripe-react-native';
import {useDispatch} from 'react-redux';
import {showToast} from '../../../redux/toastSlice';
import IosStatusBar from '../../../component/IosStatusBar';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BookAppointment = ({navigation, route}) => {
  let USER_ID = route.params.UID || -1;
  const dispatch = useDispatch();
  const [loaderVisible, setLoaderVisible] = useState(false);

  const [loaderTime, setLoaderTime] = useState(true);

  const [loggedInUserTimezone, setLoggedInUserTimezone] = useState([]);
  const [dateList, setDateList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotList, setSlotList] = useState([]);
  // const [selectedTimes, setSelectedTimes] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);

  const [details, setDetails] = useState([]);

  const [stripePublishableKey, setStripePublishableKey] = useState('');

  const [hasRequestedSlots, setHasRequestedSlots] = useState(false);

  // const { handleURLCallback } = useStripe();

  // const handleDeepLink = useCallback(
  //   async (url) => {
  //     if (url) {
  //       const stripeHandled = await handleURLCallback(url);
  //       if (stripeHandled) {
  //         console.log("__DATA__ stripe success")
  //         // This was a Stripe URL - you can return or add extra handling here as you see fit
  //       } else {
  //         // This was NOT a Stripe URL – handle as you normally would
  //         console.log("__DATA__ No stripe")
  //       }
  //     }
  //   },
  //   [handleURLCallback]
  // );

  // useEffect(() => {
  //   const getUrlAsync = async () => {
  //     const initialUrl = await Linking.getInitialURL();
  //     handleDeepLink(initialUrl);
  //   };

  //   getUrlAsync();

  //   const deepLinkListener = Linking.addEventListener(
  //     'url',
  //     (event) => {
  //       handleDeepLink(event.url);
  //     }
  //   );

  //   return () => deepLinkListener.remove();
  // }, [handleDeepLink]);

  const getDetails = async () => {
    try {
      setLoaderVisible(true);

      const response = await Api.get(API_EXPERT_DETAILS + USER_ID);

      if (response.status == 'RC200') {
        setDetails(response.data);
        getDates();
      }

      //setLoaderVisible(false);
    } catch (error) {
      log(error);
    }
  };

  const getDates = async () => {
    setLoaderVisible(true);

    const response = await Api.get(`${API_SCHEDULE_TIMESLOTS_DATE}/${USER_ID}`);

    if (response.status == 'RC200') {
      let data = response.data;
      if (data.dates && data.dates.length > 0) {
        data.dates[0].selected = true;
        OnDateSelected(data.dates[0]);
        setSelectedTime('');
      }

      setDateList(data.dates);
      setLoggedInUserTimezone(data.timzone);
      getPublishableKey();
    }

    //setLoaderVisible(false);
  };

  const getPublishableKey = async () => {
    const response = await Api.get(`${API_GET_STRIPE_PUB_KEY}`);

    if (response.status == 'RC200') {
      let data = response.data;

      setStripePublishableKey(data);
    }

    setLoaderVisible(false);
  };

  const getSlotsByDate = async () => {
    if (!selectedDate) {
      return;
    }

    setLoaderTime(true);

    const response = await Api.get(
      `${API_SCHEDULE_TIMESLOTS_TIME}/${USER_ID}/${selectedDate.id}/${selectedDate.date_local}`,
    );

    if (response.status == 'RC200') {
      let data = response.data;

      setSlotList(data);
    }

    setLoaderTime(false);
  };

  useFocusEffect(
    useCallback(() => {
      getDetails();
    }, []),
  );

  const OnDateSelected = obj => {
    const updatedData = dateList.map(item => ({
      ...item,
      selected: item.date_local === obj.date_local ? !item.selected : false,
    }));

    setDateList(updatedData);
    setSelectedDate(obj);
  };

  useEffect(() => {
    getSlotsByDate();
  }, [selectedDate]);

  const renderItem = ({item, index}) => {
    return (
      <View>
        <Pressable
          onPress={() => {
            OnDateSelected(item);
            // setSelectedTimes([]);
            setSelectedTime('');
          }}>
          <Text
            style={[
              styles.itemText,
              {
                textAlign: 'center',
                backgroundColor: item.selected
                  ? COLORS.lightGray
                  : COLORS.graySolid,
                paddingHorizontal: 20,
                paddingVertical: 10,
                fontWeight: item.selected ? 'bold' : 'normal',
                color: item.selected ? COLORS.blue : COLORS.black2,
              },
            ]}>
            {item.day}
          </Text>
          <View
            style={{
              backgroundColor: item.selected ? COLORS.lightGray : COLORS.white,
              paddingHorizontal: 20,
              paddingVertical: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={[
                styles.itemText,
                {
                  fontWeight: 'bold',
                  color: item.selected ? COLORS.blue : COLORS.black2,
                },
              ]}>
              {item.label.split(' ')[0] ?? ''}
            </Text>
            <Text
              style={[
                styles.itemText,
                {
                  fontWeight: item.selected ? 'bold' : 'normal',
                  color: item.selected ? COLORS.blue : COLORS.black2,
                },
              ]}>
              {item.label.split(' ')[1] ?? ''}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  /*const renderItem = ({item, index}) => (
    <View
      style={[
        styles.itemContainer,
        item.selected ? styles.itemContainerSelected : styles.blank,
        {marginLeft: index == 0 ? 0 : 10},
      ]}>
      <Pressable
        onPress={() => {
          OnDateSelected(item);
        }}>
        <Text
          style={[
            styles.itemText,
            item.selected ? styles.itemTextSelected : styles.blank,
          ]}>
          {item.day}, {item.label}
        </Text>
      </Pressable>
    </View>
  );*/

  const OnTimeSelected = obj => {
    // const isSelected = selectedTimes.some(time => time.label === obj.label);
    // let updatedSelectedTimes;

    // if (isSelected) {
    //   // Remove the time if it's already selected
    //   updatedSelectedTimes = selectedTimes.filter(
    //     time => time.label !== obj.label,
    //   );
    // } else {
    //   // Add the time if it's not selected
    //   updatedSelectedTimes = [...selectedTimes, obj];
    // }

    // setSelectedTime(updatedSelectedTimes);

    // Update slotList to reflect selected states
    const updatedSlot = slotList.map(item => ({
      ...item,
      selected: item.label === obj.label ? !item.selected : false,
      // selected: updatedSelectedTimes.some(time => time.label === item.label),
    }));

    setSlotList(updatedSlot);
    setSelectedTime(obj);
  };

  const [cardLoader, setCardLoader] = useState(false);

  const delay = ms => new Promise(res => setTimeout(res, ms));

  const getStripeKeys = async () => {
    //setCardLoader(true);

    const response = await Api.get(`${API_GET_STRIPE_CARD_SETUP_KEY}`);

    setCardLoader(false);
    await delay(500);

    if (response.status == 'RC200') {
      let data = response.data;

      const {error} = await initPaymentSheet({
        merchantDisplayName: data.display_name,
        customerId: data.cid,
        customerEphemeralKeySecret: data.ekey_secret,
        setupIntentClientSecret: data.sintent_secret,
        allowsDelayedPaymentMethods: true,
        ...(Platform.OS === 'ios'
          ? {returnURL: 'guidelinked://stripe-callback'}
          : {}),
      });
      console.log('__DATA__', error);

      if (error) {
        //simpleToast('Something want wrong, Please try again...');
        dispatch(showToast('Something want wrong, Please try again...'));
        return;
      }

      const {error: errorPS} = await presentPaymentSheet();

      if (errorPS) {
        //simpleToast(`${error.code}: ${error.message}`);
        dispatch(showToast(`${error.code}: ${error.message}`));
        return;
      }

      // simpleToast('Card setup completed successfully');
      dispatch(showToast('Card setup complete for payment processing...'));

      saveBookingFinal();
    }
  };

  const saveBookingFinal = async () => {
    if (!selectedDate) {
      //showToast('Please select Date');
      dispatch(showToast('Please select Date'));
      return;
    }

    if (!selectedTime) {
      // if (selectedTimes.length === 0) {
      //showToast('Please select Time');
      dispatch(showToast('Please select Time'));
      return;
    }

    const [year, month, day] = selectedDate.date_local.split('-');

    const formdata = new FormData();
    formdata.append('user_id', USER_ID);
    formdata.append('slot_id', selectedDate.id);
    formdata.append('start_time', selectedTime.start);
    formdata.append('end_time', selectedTime.end);
    formdata.append('date', `${day}-${month}-${year}`);

    // selectedTimes.forEach((slot, index) => {
    //   formdata.append(`slots[${index}][slot_id]`, slot.id);
    //   formdata.append(`slots[${index}][start_time]`, slot.start);
    //   formdata.append(`slots[${index}][end_time]`, slot.end);
    // });

    setCardLoader(true);

    const response = await Api.post(API_BOOK_APPOINTMENT, formdata);
    console.log(response);

    if (response.status == 'RC200') {
      //navigation.goBack();
      let name = response?.data?.booked_with;
      let date = response?.data?.when;
      navigation.navigate('BookingThankYou', {Name: name, When: date});

      // navigation.navigate('BookingThankYou', {
      //   data: response?.data,
      // });
    }

    setCardLoader(false);
  };

  const validateBooking = async () => {
    // console.log(selectedTimes);
    if (!selectedDate) {
      dispatch(showToast('Please select Date'));
      return;
    }
    if (!selectedTime) {
      // if (selectedTimes.length === 0) {
      dispatch(showToast('Please select Time'));
      return;
    }

    console.log(selectedDate);

    const [year, month, day] = selectedDate.date_local.split('-');

    const formdata = new FormData();
    formdata.append('user_id', USER_ID);
    formdata.append('date', `${day}-${month}-${year}`);
    // formdata.append('slots', selectedTimes);
    // selectedTimes.forEach((slot, index) => {
    //   formdata.append(`slots[${index}][slot_id]`, slot.id);
    //   formdata.append(`slots[${index}][start_time]`, slot.start);
    //   formdata.append(`slots[${index}][end_time]`, slot.end);
    // });
    formdata.append('slot_id', selectedDate.id);
    formdata.append('start_time', selectedTime.start);
    formdata.append('end_time', selectedTime.end);

    setCardLoader(true);
    console.log(formdata);

    const response = await Api.post(API_BOOK_APPOINTMENT_VALIDATE, formdata);

    if (response.status == 'RC200') {
      getStripeKeys();
    } else {
      setCardLoader(false);
    }
  };

  const renderItemTime = ({item, index}) => {
    const offsetString = item.offset;
    const offsetMatch = offsetString.match(/GMT([+-]\d{1,2}):(\d{2})/);

    const offsetHours = parseInt(offsetMatch[1], 10);
    const offsetMinutes = parseInt(offsetMatch[2], 10);

    // Convert UTC to offset-based time
    const adjustedTime = moment
      .utc(item.start_utc)
      .utcOffset(offsetHours * 60 + offsetMinutes);
    return (
      <View
        style={[
          styles.itemContainer,
          item.selected
            ? styles.itemContainerSelected
            : item.disabled ||
              moment()
                .utcOffset(offsetHours * 60 + offsetMinutes)
                .format('YYYY-MM-DD HH:mm:ss') >
                adjustedTime.format('YYYY-MM-DD HH:mm:ss')
            ? styles.itemContainerDisabled
            : styles.blank,
        ]}>
        <Pressable
          onPress={() => {
            if (item.disabled) {
              // simpleToast('This time slot is already booked.');
              dispatch(showToast('This time slot is already booked.'));
              return;
            }
            OnTimeSelected(item);
          }}
          disabled={moment.utc().isAfter(moment.utc(item.start_utc))}>
          <Text
            style={[
              styles.itemText,
              {
                color: item.selected ? COLORS.blue : COLORS.black,
                fontWeight: 'semibold',
              },
            ]}>
            {item.label}
          </Text>
        </Pressable>
      </View>
    );
  };

  const daysListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollToNext = () => {
    // daysListRef.current.scrollToIndex({ animated: true, index: 3 }); // Example: scroll to index 5

    if (currentIndex < dateList.length - 1) {
      const nextIndex = currentIndex + 3;
      // Ensure the nextIndex is within bounds (not out of range)
      const targetIndex =
        nextIndex < dateList.length ? nextIndex : dateList.length - 1;
      setCurrentIndex(targetIndex);
      daysListRef.current.scrollToIndex({index: targetIndex, animated: true});

      // const nextIndex = currentIndex + 3;
      // setCurrentIndex(nextIndex);
      // daysListRef.current.scrollToIndex({ index: nextIndex, animated: true });
    }
  };

  // Function to scroll to the previous item
  const scrollToPrevious = () => {
    // daysListRef.current.scrollToIndex({ animated: true, index: 0 }); // Example: scroll back to index 0

    if (currentIndex > 0) {
      let prevIndex = currentIndex - 3;
      prevIndex = prevIndex < 0 ? 0 : prevIndex;
      setCurrentIndex(prevIndex);
      daysListRef.current.scrollToIndex({index: prevIndex, animated: true});
    }
  };

  const onViewableItemsChanged = useRef(({viewableItems, changed}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  useEffect(() => {
    const checkRequestedSlots = async () => {
      const requested = await AsyncStorage.getItem(
        `requested_slots_${USER_ID}`,
      );
      if (requested === 'true') {
        setHasRequestedSlots(true);
      }
    };

    checkRequestedSlots();
  }, [USER_ID]);

  const request_more_slots = async () => {
    try {
      setLoaderVisible(true);
      const data = {
        user_id: USER_ID,
      };
      const response = await Api.post(API_REQUEST_SLOTS, data);

      setLoaderVisible(false);
      print(response.status);

      if (response.status == 'RC200') {
        await AsyncStorage.setItem(`requested_slots_${USER_ID}`, 'true');
        setHasRequestedSlots(true);
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await getDetails();
    setRefreshing(false);
  };

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />
      <SafeAreaView
        style={[DefaultStyle.flexView, {backgroundColor: COLORS.gray2}]}>
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="dark-content"
        />
        <View style={{flex: 1}}>
          {
            <StripeProvider
              publishableKey={stripePublishableKey}
              merchantIdentifier="merchant.com.guidelinked.app" // required for Apple Pay
              urlScheme={`${WEB_URL}stripe-secure-after-payment`} // required for 3D Secure and bank redirects
            >
              <View
                style={{
                  backgroundColor: COLORS.white,
                  flexDirection: 'row',
                  alignItems: 'center',
                  height: 52,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 10,
                }}>
                <TouchableOpacity
                  style={[
                    styles.ic_back,
                    {padding: 10, position: 'relative', zIndex: 999},
                  ]}
                  onPress={() => {
                    console.log('Clicked');
                    navigation.goBack();
                  }}>
                  <AppIcons
                    name={'arrow-back'}
                    type={'MaterialIcons'}
                    size={24}
                    color={COLORS.black}
                  />
                </TouchableOpacity>

                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                  }}>
                  <Text
                    style={{
                      alignSelf: 'center',
                      fontWeight: 'bold',
                      color: COLORS.black,
                      fontSize: 18,
                    }}>
                    Book Appointment
                  </Text>
                </View>
              </View>
              <View style={{flex: 1}}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }>
                  {
                    <View style={{padding: 15, flex: 1}}>
                      <Card
                        containerStyle={{
                          padding: 10,
                          margin: 0,
                          backgroundColor: COLORS.white,
                          borderRadius: 10,
                        }}>
                        <View style={{flexDirection: 'column'}}>
                          <Text
                            style={{
                              fontWeight: 'bold',
                              fontSize: 16,
                              color: COLORS.primary,
                            }}>
                            Booking with :{' '}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              color: COLORS.black,
                              fontWeight: 'bold',
                            }}>
                            {details.fullname || ''}
                            <Text style={{fontSize: 11}}>
                              {' '}
                              - {details.country_name}
                            </Text>
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: 'column',
                            marginTop: 5,
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              fontSize: 14,
                              color: COLORS.black,
                            }}>
                            ${details.slot_price} per 25 mins.
                          </Text>
                          <Text
                            style={{
                              fontSize: 14,
                              color: COLORS.black,
                            }}>
                            {details.timezone_offset}
                          </Text>
                        </View>
                      </Card>

                      <View style={{marginTop: 10}}>
                        {dateList.length == 0 ? (
                          <View>
                            <Text
                              style={{
                                color: COLORS.blue,
                                fontSize: 14,
                                textAlign: 'center',
                                paddingVertical: 10,
                              }}>
                              This guide has no available time slots.
                            </Text>
                            <Button
                              title="Request Slots"
                              buttonStyle={[
                                DefaultStyle.btnLogin,
                                {
                                  backgroundColor: COLORS.primary,
                                  borderRadius: 10,
                                  marginVertical: 20,
                                },
                              ]}
                              disabled={hasRequestedSlots}
                              titleStyle={{color: COLORS.white}}
                              onPress={() => {
                                request_more_slots();
                              }}
                            />
                          </View>
                        ) : (
                          <>
                            <Text
                              style={{
                                fontWeight: 'bold',
                                textAlign: 'center',
                                color: COLORS.black,
                                marginTop: 10,
                                fontSize: 16,
                              }}>
                              Select a Date
                            </Text>

                            <View style={{paddingHorizontal: 20}}>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  flex: 1,
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  margin: 20,
                                }}>
                                <TouchableOpacity
                                  onPress={() => {
                                    scrollToPrevious();
                                  }}>
                                  <Card
                                    containerStyle={{
                                      padding: 5,
                                      margin: 10,
                                      backgroundColor: COLORS.white,
                                      borderRadius: 10,
                                      elevation: 1,
                                      overflow: 'hidden',
                                    }}>
                                    <AppIcons
                                      name={'chevron-left'}
                                      type={'Entypo'}
                                      size={24}
                                      color={COLORS.black}
                                    />
                                  </Card>
                                </TouchableOpacity>

                                <Card
                                  containerStyle={{
                                    padding: 0,
                                    margin: 0,
                                    backgroundColor: COLORS.white,
                                    borderRadius: 20,
                                    elevation: 1,
                                    overflow: 'hidden',
                                  }}>
                                  <FlatList
                                    data={dateList}
                                    ref={daysListRef}
                                    renderItem={renderItem}
                                    keyExtractor={item => item.date}
                                    horizontal={true} // Enables horizontal scrolling
                                    showsHorizontalScrollIndicator={false} // Hides the scroll indicator
                                    onViewableItemsChanged={
                                      onViewableItemsChanged.current
                                    }
                                    extraData={currentIndex}
                                    contentContainerStyle={[
                                      styles.flatListContainer,
                                      styles.datesContainer,
                                    ]} // Optional styling for the FlatList container
                                  />
                                </Card>

                                <TouchableOpacity
                                  onPress={() => {
                                    scrollToNext();
                                  }}>
                                  <Card
                                    containerStyle={{
                                      padding: 5,
                                      margin: 10,
                                      backgroundColor: COLORS.white,
                                      borderRadius: 10,
                                      elevation: 1,
                                      overflow: 'hidden',
                                    }}>
                                    <AppIcons
                                      name={'chevron-right'}
                                      type={'Entypo'}
                                      size={24}
                                      color={COLORS.black}
                                    />
                                  </Card>
                                </TouchableOpacity>
                              </View>
                            </View>
                          </>
                        )}
                      </View>

                      {selectedDate && (
                        <View style={{marginTop: 10}}>
                          <Text
                            style={{
                              fontWeight: 'bold',
                              textAlign: 'center',
                              color: COLORS.black,
                              marginTop: 10,
                              fontSize: 16,
                            }}>
                            Select start time of 25 min slots
                          </Text>

                          <Text
                            style={{
                              textAlign: 'center',
                              color: COLORS.black2,
                              marginTop: 10,
                              fontSize: 16,
                            }}>
                            Below times are in&nbsp;
                            <Text
                              style={{
                                textAlign: 'center',
                                color: COLORS.black2,
                                fontSize: 16,
                                fontWeight: 'bold',
                              }}>
                              {loggedInUserTimezone}
                            </Text>{' '}
                            timezone
                          </Text>

                          {loaderTime ? (
                            <ActivityIndicator
                              style={{alignSelf: 'center', marginTop: 20}}
                              size={'large'}
                              color={COLORS.primary}
                            />
                          ) : slotList.length == 0 ? (
                            <Text
                              style={{
                                color: COLORS.darkRed,
                                fontSize: 14,
                                paddingVertical: 10,
                                textAlign: 'center',
                              }}>
                              Time slots not available
                            </Text>
                          ) : (
                            <FlatList
                              data={slotList}
                              renderItem={renderItemTime}
                              keyExtractor={item => item.label}
                              numColumns={3}
                              columnWrapperStyle={{
                                justifyContent: 'space-between',
                                paddingHorizontal: 15,
                                columnGap: 15,
                              }}
                              //horizontal={true} // Enables horizontal scrolling
                              showsHorizontalScrollIndicator={false} // Hides the scroll indicator
                              contentContainerStyle={{marginTop: 20}} // Optional styling for the FlatList container
                            />
                          )}
                        </View>
                      )}

                      {selectedTime && (
                        // selectedTimes.length != 0
                        <>
                          <Text style={{marginTop: 20}}>
                            Now you will be asked to setup a credit card. There
                            won't be any charges to your card today, payment is
                            made only when the Guide arrives at the date and
                            time slot you are booking.
                          </Text>

                          <Button
                            title="Book Appointment"
                            buttonStyle={[
                              DefaultStyle.btnLogin,
                              {
                                backgroundColor: COLORS.primary,
                                borderRadius: 10,
                                marginVertical: 20,
                              },
                            ]}
                            titleStyle={{color: COLORS.white}}
                            onPress={() => {
                              // validateBooking()
                              setModalVisible(true);
                            }}
                          />
                        </>
                      )}
                    </View>
                  }
                </ScrollView>
              </View>
            </StripeProvider>
          }
        </View>

        {modalVisible && (
          <View style={[DefaultStyle.modalContentCenterDialog]}>
            <View style={[DefaultStyle.modalContent]}>
              <Text
                style={[
                  DefaultStyle.txt14bold,
                  {textAlign: 'center', fontSize: 18},
                ]}>
                Important Notes
              </Text>

              <Pressable
                onPress={() => {
                  setModalVisible(false);
                }}
                style={{position: 'absolute', right: 12, top: 10}}>
                <AppIcons
                  type={'Entypo'}
                  name={'cross'}
                  size={26}
                  color={COLORS.black}
                />
              </Pressable>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{padding: 10, marginTop: 0}}>
                  <View
                    style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                    <Text
                      style={[
                        {color: COLORS.gray, fontSize: 14, fontWeight: 'bold'},
                      ]}>
                      Here are the rules for the 25 min meeting slot you are
                      booking.
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginTop: 15,
                    }}>
                    <AppIcons
                      type={'FontAwesome'}
                      name={'minus'}
                      size={10}
                      color={'gray'}
                    />
                    <Text
                      style={[
                        {
                          color: 'gray',
                          marginTop: -6,
                          marginLeft: 6,
                          fontSize: 14,
                        },
                      ]}>
                      The clock starts on time. Both you and the guide are
                      expected to join on time. Only when the Guide joins you
                      will be prompted to make a payment. The time you take to
                      make the payment is from within the 25 min slot.{' '}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginTop: 15,
                    }}>
                    <AppIcons
                      type={'FontAwesome'}
                      name={'minus'}
                      size={10}
                      color={'gray'}
                    />
                    <Text
                      style={[
                        {
                          color: 'gray',
                          marginTop: -6,
                          marginLeft: 6,
                          fontSize: 14,
                        },
                      ]}>
                      If the Guide joins late you have the right to not pay and
                      the meeting gets canceled.
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginTop: 15,
                    }}>
                    <AppIcons
                      type={'FontAwesome'}
                      name={'minus'}
                      size={10}
                      color={'gray'}
                    />
                    <Text
                      style={[
                        {
                          color: 'gray',
                          marginTop: -6,
                          marginLeft: 6,
                          fontSize: 14,
                        },
                      ]}>
                      At 20 mins into the call there will be an alert, that is 5
                      mins before the call is automatically disconnected.
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginTop: 15,
                    }}>
                    <AppIcons
                      type={'FontAwesome'}
                      name={'minus'}
                      size={10}
                      color={'gray'}
                    />
                    <Text
                      style={[
                        {
                          color: 'gray',
                          marginTop: -6,
                          marginLeft: 6,
                          fontSize: 14,
                        },
                      ]}>
                      Please have a professional and respectful conversation.
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      marginTop: 15,
                    }}>
                    <AppIcons
                      type={'FontAwesome'}
                      name={'minus'}
                      size={10}
                      color={'gray'}
                    />
                    <Text
                      style={[
                        {
                          color: 'gray',
                          marginTop: -6,
                          marginLeft: 6,
                          fontSize: 14,
                        },
                      ]}>
                      For security and privacy we recommend not to share
                      personal information with the other party.
                    </Text>
                  </View>

                  <View
                    style={[
                      DefaultStyle.flexAround,
                      {marginTop: 30, justifyContent: 'space-evenly'},
                    ]}>
                    <Button
                      title="Cancel"
                      buttonStyle={[
                        DefaultStyle.btnBorder,
                        {
                          marginVertical: 0,
                          minWidth: 130,
                          borderRadius: 20,
                          overflow: 'hidden',
                        },
                      ]}
                      titleStyle={[
                        DefaultStyle.whiteBold,
                        {color: COLORS.primary},
                      ]}
                      onPress={() => {
                        setModalVisible(false);
                      }}
                    />

                    <Button
                      title="Book Now"
                      buttonStyle={[
                        DefaultStyle.btnLogin,
                        {marginVertical: 0, minWidth: 130},
                      ]}
                      titleStyle={DefaultStyle.whiteBold}
                      onPress={() => {
                        validateBooking();
                      }}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        )}

        <Loader
          loaderVisible={loaderVisible || cardLoader}
          setLoaderVisible={setLoaderVisible}
        />
      </SafeAreaView>
    </>
  );
};

export const styles = StyleSheet.create({
  ic_back: {},
  flatListContainer: {
    backgroundColor: COLORS.white,
  },
  blank: {},
  datesContainer: {
    shadowColor: '#000',
  },
  itemContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 1,
    marginHorizontal: 2,
    marginVertical: 4,
  },
  itemText: {
    fontSize: 14,
  },
  itemContainerSelected: {
    backgroundColor: COLORS.lightGray,
  },
  itemContainerDisabled: {
    backgroundColor: COLORS.darkgray,
  },
  itemTextSelected: {
    color: '#FFF',
  },
});

export default BookAppointment;

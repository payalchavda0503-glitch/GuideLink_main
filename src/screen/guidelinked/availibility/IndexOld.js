import {
  Pressable,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Linking,
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

const IndexOld = ({navigation}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);

  const [onboardingStatus, setOnboardingStatus] = useState(-2);
  const [rates, setRates] = useState('');
  const [timeline, setTimeline] = useState([]);

  const [isCancelTimeSlot, setIsCanclelTimeSlot] = useState(false);

  const [deleteSlotTimeArr, setDeleteSlotTimeArr] = useState([]);

  const isCancelTimeSlotDialog = () => {
    setIsCanclelTimeSlot(!isCancelTimeSlot);
  };

  const onCandleTimeSlot = () => {
    // cancel time slot api call
    isCancelTimeSlotDialog();
  };

  const getData = async () => {
    setOnboardingStatus(-2);
    setLoaderVisible(true);
    console.log('calling v');

    // static 1 is the page number
    const response = await Api.get(`${API_SCHEDULE_MY_TIMELINE}/1`);

    if (response.status == 'RC200') {
      let data = response.data;

      setRates(data.rates);
      setOnboardingStatus(data.onboarding_status);
      setTimeline(data.timeline);
    }

    setLoaderVisible(false);
  };

  const deleteSlotAPICall = async () => {
    setLoaderVisible(true);

    const formdata = new FormData();

    deleteSlotTimeArr.map((val, index) => {
      formdata.append(`time[${index}][id]`, val.id);
      formdata.append(`time[${index}][date]`, val.date);
      formdata.append(`time[${index}][start]`, val.start);
      formdata.append(`time[${index}][end]`, val.end);
    });

    const response = await Api.post(API_SCHEDULE_DELETE_SLOT, formdata);

    setLoaderVisible(false);

    if (response.status == 'RC200') {
      setTimeline([]);
      deleteSlotTimeArr([]);
      console.log('calling');
      getData();
      console.log('after calling');
    }
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

  useFocusEffect(
    useCallback(() => {
      getData();
    }, []),
  );

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

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

  const singleDayOrMonth = ({item, index}) => (
    <View
      style={[
        styles.listItemContainer,
        {
          backgroundColor:
            expandedIndex === index ? COLORS.gray2 : COLORS.white,
        },
      ]}>
      <TouchableOpacity
        onPress={() => toggleExpand(index)}
        style={{padding: 10}}>
        <Text style={styles.listItemHeading}>
          {item.label}{' '}
          {item.total_slots != 0 && <>({item.total_slots} slots)</>}
        </Text>
      </TouchableOpacity>
      {expandedIndex === index && (
        <View style={[styles.listItemSlotContainer, {marginTop: 10}]}>
          {item.slots.length != 0 && (
            <FlatList
              data={item.slots}
              keyExtractor={itm => item.label + '_' + itm.id + '_' + itm.start}
              ItemSeparatorComponent={Divider}
              nestedScrollEnabled={true}
              renderItem={singleSlot}
            />
          )}

          {item.days.length != 0 && (
            <FlatList
              data={item.days}
              keyExtractor={itm => item.label + '_' + itm.id + '_' + itm.start}
              ItemSeparatorComponent={Divider}
              nestedScrollEnabled={true}
              renderItem={singleMonth}
            />
          )}

          {item.slots.length == 0 && item.days.length == 0 && (
            <Text
              style={[
                styles.listItemHeading,
                {
                  color: COLORS.black,
                  fontWeight: 'normal',
                  textAlign: 'center',
                  flex: 1,
                  paddingBottom: 10,
                  fontSize: 14,
                },
              ]}>
              Time slot has not been set up yet
            </Text>
          )}
        </View>
      )}
    </View>
  );

  const singleMonth = ({item, index}) => (
    <View
      style={[
        styles.listItemContainer,
        {
          paddingHorizontal: 30,
        },
      ]}>
      <TouchableOpacity
        onPress={() => toggleExpand(index)}
        style={{padding: 10}}>
        <Text style={styles.listItemHeading}>
          {item.label}{' '}
          {item.total_slots != 0 && <>({item.total_slots} slots)</>}
        </Text>
      </TouchableOpacity>
      {item.slots.length != 0 && (
        <View style={[styles.listItemSlotContainer, {marginTop: 10}]}>
          <FlatList
            data={item.slots}
            keyExtractor={itm => item.label + '_' + itm.id}
            ItemSeparatorComponent={Divider}
            nestedScrollEnabled={true}
            renderItem={singleSlot}
          />
        </View>
      )}
    </View>
  );

  const singleSlot = ({item, index}) => (
    <View
      style={[
        {
          padding: 5,
          paddingHorizontal: 30,
          flexDirection: 'row',
          alignItems: 'center',
        },
      ]}>
      <Text style={styles.listItemSlotHeading}>{item.label_mytimeline}</Text>
      <TouchableOpacity
        style={{padding: 3}}
        onPress={() => {
          setDeleteSlotTimeArr([
            {
              id: item.id,
              date: item.date,
              start: item.start,
              end: item.end,
            },
          ]);

          isCancelTimeSlotDialog();
          //  navigation.dispatch(DrawerActions.openDrawer())
        }}>
        <AppIcons
          type={'AntDesign'}
          name={'closesquareo'}
          size={28}
          color={COLORS.red}
        />
      </TouchableOpacity>
    </View>
  );

  return (
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
        tittle={'My Availability Rates'}
        titleColor={COLORS.white}
      />

      <View style={{flexDirection: 'column', flex: 1}}>
        {onboardingStatus != -2 &&
          (onboardingStatus == -1 ? (
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
                  Please setup stripe account for automatic payout after your
                  appointments completed.
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    marginTop: 6,
                    textAlign: 'center',
                    fontWeight: 'normal',
                  }}>
                  After account setup completed, You will be able to set your
                  slot rates and availability.
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
                  name={'account-alert'}
                  size={150}
                  color={COLORS.primary}
                />
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: COLORS.primary,
                  }}>
                  Details Submission Pending
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    marginTop: 10,
                    textAlign: 'center',
                    fontWeight: 'normal',
                  }}>
                  Please fill all required details which stripe needs to
                  complete the onboarding process.
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    marginTop: 6,
                    textAlign: 'center',
                    fontWeight: 'normal',
                  }}>
                  After account setup completed, You will be able to set your
                  slot rates and availability.
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
              </View>
            </>
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TimeSlotRates rates={rates} />

                <Text
                  style={{
                    padding: 15,
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: COLORS.black,
                  }}>
                  Current Availability
                </Text>

                <FlatList
                  data={timeline}
                  contentContainerStyle={{paddingBottom: 35}}
                  keyExtractor={item => item.label}
                  ItemSeparatorComponent={Divider}
                  nestedScrollEnabled={true}
                  renderItem={singleDayOrMonth}
                />
              </ScrollView>

              <Pressable
                style={styles.fabContent}
                onPress={() => {
                  setShowDialog(true);
                }}>
                {/* <Image
                      source={images.ic_plus}
                      style={styles.fabImg}
                      tintColor={COLORS.primary}
                      resizeMode="contain"
                    /> */}
                <Button
                  title="+  Create Slots"
                  buttonStyle={{
                    borderRadius: 10,
                  }}
                  onPress={() => {
                    setShowDialog(true);
                  }}
                />
              </Pressable>

              <AddAvailability
                show={showDialog}
                onClose={isDataSaved => {
                  setShowDialog(false);
                  if (isDataSaved) {
                    getData();
                  }
                }}
              />

              <CustomCancelTimeSlotDialog
                visible={isCancelTimeSlot}
                onClose={isCancelTimeSlotDialog}
                onCanelTimeSlot={() => {
                  isCancelTimeSlotDialog();
                  deleteSlotAPICall();
                }}
              />
            </>
          ))}
      </View>

      <BottomTab />

      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </SafeAreaView>
  );
};

export default IndexOld;

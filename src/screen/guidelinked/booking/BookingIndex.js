import {Button} from '@rneui/themed';
import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  API_ADD,
  API_APPOINTMENT,
  API_BOOK_APPOINTMENT_PAY_STATUS,
  API_CANCEL_APPOINTMENT,
  API_COMPIANT,
  API_DETAILS,
  API_GET_BOOKING,
  API_RATING,
  API_ZOOM_JOINING_STATUS,
} from '../../../service/apiEndPoint';
import {DefaultStyle} from '../../../util/ConstVar';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import {styles} from './styles';

import {useFocusEffect} from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import {useDispatch} from 'react-redux';
import AppIcons from '../../../component/AppIcons';
import BottomTab from '../../../component/BottomTab';
import CustomRating from '../../../component/CustomRating ';
import {Header} from '../../../component/Header';
import IosStatusBar from '../../../component/IosStatusBar';
import {
  CustomApptDialogCancel,
  CustomApptDialogRaisComplaint,
  CustomDialogRating,
} from '../../../component/customDialog';
import {showToast} from '../../../redux/toastSlice';
import Api from '../../../service/Api';
import images from '../../../util/IMGLIST';
import Loader from '../../../util/Loader';
import {simpleToast} from '../../../util/Toast';
import BookingHistory from './BookingHistory';

const BookingIndex = ({navigation}) => {
  const [list, setList] = useState([]);

  const [search, setSearch] = useState('');
  const [select, setselect] = useState(0);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [id, setId] = useState('');
  const [isCancelDialog, setISDialog] = useState(false);
  const [isComplaint, setIsComplaint] = useState(false);
  const [isVisibleRating, setIsVisibleRating] = useState(false);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [otherUserName, setUserName] = useState('');
  const [statusId, setStatusId] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState('');
  const [isOldVersion, setIsOldVersion] = useState(false);
  const dispatch = useDispatch();

  const [selectedApptId, setSelectedApptId] = useState(-1);
  const [modalVisible, setModalVisible] = useState(false);

  const CancelApptDialogBox = () => {
    setTimeout(() => {
      setISDialog(!isCancelDialog);
    }, 500);
  };

  const ComplaintDailogBox = () => {
    setTimeout(() => {
      setIsComplaint(!isComplaint);
    }, 500);
  };

  const showComplaindilaog = () => {
    setTimeout(() => {
      setIsComplaint(true);
    }, 500);
  };
  const closeComplaintDilaog = () => {
    setIsComplaint(false);
    setId('');
    setSubject('');
    setMessage('');
  };
  const onCloseRating = () => {
    setTimeout(() => {
      console.log('__DATA__onCloseRating call');
      setRating(0);
      setMessage('');
      setUserName('');
      setIsVisibleRating(false);
    }, 500);
  };

  // get booking history default select = 0
  const getBookingHistroyData = async () => {
    try {
      setLoaderVisible(true);
      setList([]);
      const res = await Api.get(
        `${API_APPOINTMENT}/${API_GET_BOOKING}/${select}`,
      );

      if (res.status == 'RC200') {
        setList(res?.data);
        setLoaderVisible(false);
      }
    } catch (error) {
      console.log(error);
      setLoaderVisible(false);
    }
  };

  //select 2  tab CANCELL
  const onCancelAppointment = async () => {
    try {
      setLoaderVisible(true);

      const res = await Api.get(
        `${API_APPOINTMENT}/${API_CANCEL_APPOINTMENT}/${id}`,
      );
      console.log('__DATA __ CANCEL:-', res);
      CancelApptDialogBox();
      getBookingHistroyData();
      // if (res.status == 'RC200') {
      //   setLoaderVisible(false);
      // }
    } catch (error) {
      console.log(error);
      CancelApptDialogBox();
      setLoaderVisible(false);
    }
  };

  // RAIS  COMPAINT ADD
  const onAddRaisCompaint = async () => {
    if (!subject) {
      if (Platform.OS == 'ios') {
        simpleToast('Please enter your subject');
      } else {
        dispatch(showToast('Please enter your subject'));
      }
    } else if (!message) {
      if (Platform.OS == 'ios') {
        simpleToast('Please enter your messaage.');
      } else {
        dispatch(showToast('Please enter your messaage.'));
      }
    } else {
      try {
        setLoaderVisible(true);
        const formdata = new FormData();
        formdata.append('booking_id', id);
        formdata.append('subject', subject);
        formdata.append('message', message);
        const res = await Api.post(
          `${API_APPOINTMENT}/${API_COMPIANT}/${API_ADD}`,
          formdata,
        );

        closeComplaintDilaog();
        getBookingHistroyData();
        if (res.status == 'RC200') {
          setSubject('');
          setMessage('');
          setId('');
          setLoaderVisible(false);
        }
      } catch (error) {
        console.log(error);
        closeComplaintDilaog();
        setLoaderVisible(false);
      } finally {
        console.log(res);
      }
    }
  };

  const onViewRaisCompalint = async id => {
    try {
      setLoaderVisible(true);
      const res = await Api.get(
        `${API_APPOINTMENT}/${API_COMPIANT}/${API_DETAILS}/${id}`,
      );
      showComplaindilaog();

      if (res.status == 'RC200') {
        setSubject(res.data.subject);
        setMessage(res.data.message);
        setStatus(res.data.status);

        setLoaderVisible(false);
      }
    } catch (error) {
      console.log(error);
      showComplaindilaog();
      setLoaderVisible(false);
    } finally {
      console.log(res);
    }
  };

  //ADD RATING
  const onAddRating = async () => {
    try {
      const formdata = new FormData();
      formdata.append('booking_id', id);
      formdata.append('rating', rating);
      formdata.append('comment', message);
      const res = await Api.post(
        `${API_APPOINTMENT}/${API_RATING}/${API_ADD}`,
        formdata,
      );
      if (res.status == 'RC200') {
        onCloseRating();
        setLoaderVisible(false);
        getBookingHistroyData(false);
        reset();
      }
      //response RC100 it means return false
      if (!res) {
        onCloseRating();
        setLoaderVisible(false);
        getBookingHistroyData(false);
        reset();
      }
    } catch (error) {
      console.log(error);
      setLoaderVisible(false);
      onCloseRating();
    } finally {
      console.log(res);
    }
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
      setselect(0);
      getBookingHistroyData();
      return () => {
        setselect(0);
      };
    }, []),
  );

  useEffect(() => {
    getBookingHistroyData();
  }, [select]);

  const reset = () => {
    setId('');
    setMessage('');
    setSubject('');
    setRating(0);
    setUserName('');
    setStatus('');
    setStatusId('');
    setStatus('');
  };

  const checkJoiningStatus = async aptId => {
    setLoaderVisible(true);

    const response = await Api.get(`${API_ZOOM_JOINING_STATUS}/${aptId}`);

    setLoaderVisible(false);

    if (response.status == 'RC200') {
      let data = response.data;

      if (data.can_join) {
        //TODO

        if (data.is_expert == 1) {
          setModalVisible(true);
        } else {
          checkPaymentStatus(aptId);
        }
      } else {
        dispatch(showToast(data.message));
      }
    }
  };

  const checkPaymentStatus = async aptId => {
    setLoaderVisible(true);

    const response = await Api.get(
      `${API_BOOK_APPOINTMENT_PAY_STATUS}/${aptId}`,
    );

    setLoaderVisible(false);

    if (response.status == 'RC200') {
      let data = response.data;
      console.log(data);

      if (data == 1) {
        navigation.navigate('VideoCall', {ID: aptId, FROM: 0});
      } else {
        navigation.navigate('ChargePayment', {ID: aptId, FROM: 0});
      }
    }
  };

  const RenderUpcomming = ({item}) => {
    return (
      <View
        style={{
          backgroundColor: COLORS.white,
          marginTop: 5,
          borderRadius: 10,
        }}>
        <BookingHistory item={item} />

        <View style={[DefaultStyle.flexDirection, {marginTop: 10}]}>
          <View
            style={{
              // flex: 1,
              paddingStart: 10,
            }}>
            <Pressable
              style={[styles.cancelBtn1, {backgroundColor: COLORS.primary}]}
              onPress={() => {
                setSelectedApptId(item.id);
                checkJoiningStatus(item.id);
              }}>
              <AppIcons
                name={'videocam-outline'}
                type={'Ionicons'}
                size={22}
                color={COLORS.white}
              />
              <Text
                style={[
                  DefaultStyle.whiteBold,
                  {textAlign: 'center', marginStart: 6},
                ]}>
                Start Call
              </Text>
            </Pressable>
          </View>
          <View
            style={{
              //   flex: 1,
              marginLeft: 20,
            }}>
            <Pressable
              style={styles.cancelBtn1}
              onPress={() => {
                CancelApptDialogBox();
                setId(item.id);
                setStatusId(item.status);
              }}>
              <AppIcons
                type={'Ionicons'}
                name={'close'}
                color={COLORS.white}
                size={22}
              />
              <Text style={DefaultStyle.whiteBold}>Cancel</Text>
            </Pressable>
          </View>
        </View>
        <View style={[DefaultStyle.devider, {marginTop: 15}]} />
      </View>
    );
  };

  const RenderPast = ({item}) => {
    return (
      <View
        style={{
          backgroundColor: COLORS.white,
          marginTop: 5,
          borderRadius: 10,
        }}>
        <BookingHistory item={item} />

        <View
          style={[
            DefaultStyle.row,
            {
              marginTop: 10,
              paddingHorizontal: 15,
            },
          ]}>
          {item.rating_status == 0 ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
                paddingHorizontal: 0,
              }}>
              <Pressable
                style={[
                  styles.rateNowBtn,
                  {backgroundColor: COLORS.primary},
                  item.rating_given_by_other === 0
                    ? {width: '68%'}
                    : {width: '48%'},
                ]}
                onPress={() => {
                  setStatusId(item.rating_status);
                  setIsVisibleRating(true);
                  if (item.rating_status == 0) {
                    setId(item.id);
                  } else {
                    setRating(item.rating);
                  }
                }}>
                <AppIcons
                  type={'Ionicons'}
                  name={'star-outline'}
                  color={COLORS.white}
                  size={22}
                />
                <Text style={[DefaultStyle.whiteBold, {marginStart: 10}]}>
                  Rate Now
                </Text>
              </Pressable>
              {item.rating_given_by_other !== 0 ? (
                <Pressable
                  style={{width: '48%'}}
                  onPress={() => {
                    setStatusId(1);
                    setIsVisibleRating(true);
                    setMessage(item.comment_given_by_other);
                    setRating(item.rating_given_by_other);
                    setUserName(item.name);
                  }}>
                  <CustomRating
                    ratingSize={15}
                    initialRating={item.rating_given_by_other}
                    isshow={true}
                  />
                  <Text style={styles.underLine}>{item.name}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
                paddingHorizontal: 0,
              }}>
              {/* Self Rating */}
              <Pressable
                style={
                  item.rating_given_by_other === 0
                    ? {width: '68%'}
                    : {width: '48%'}
                }
                onPress={() => {
                  setStatusId(item.rating_status);
                  setIsVisibleRating(true);
                  if (item.rating_status === 0) {
                    setId(item.id);
                  } else {
                    setMessage(item.self_comment);
                    setRating(item.self_rating);
                  }
                }}>
                <CustomRating
                  ratingSize={15}
                  initialRating={item.self_rating}
                  isshow={true}
                />
                <Text style={styles.underLine}>Your Review</Text>
              </Pressable>

              {item.rating_given_by_other !== 0 ? (
                <Pressable
                  style={{width: '48%'}}
                  onPress={() => {
                    setStatusId(1);
                    setIsVisibleRating(true);
                    setMessage(item.comment_given_by_other);
                    setRating(item.rating_given_by_other);
                    setUserName(item.name);
                  }}>
                  <CustomRating
                    ratingSize={15}
                    initialRating={item.rating_given_by_other}
                    isshow={true}
                  />
                  <Text style={styles.underLine}>{item.name}</Text>
                </Pressable>
              ) : (
                <></>
              )}
            </View>
          )}

          {/* {item.allow_complaint == 1 && (
            <Pressable
              style={[styles.cancelBtn, {marginLeft: 20}]}
              onPress={() => {
                setId(item?.id);
                setStatusId(item.complaint_status);

                if (item.complaint_status == 0) {
                  ComplaintDailogBox();
                } else {
                  onViewRaisCompalint(item?.id);
                }
              }}>
              <AppIcons
                type={'Ionicons'}
                name={'shield-checkmark-outline'}
                color={COLORS.white}
                size={22}
              />
              <Text style={[DefaultStyle.whiteBold, {marginLeft: 10}]}>
                {item.complaint_status == 0 ? 'Your Feedback' : 'View Feedfack'}
              </Text>
            </Pressable>
          )} */}
        </View>
        <View style={[DefaultStyle.devider, {marginTop: 15}]} />
      </View>
    );
  };

  const RenderCancel = ({item}) => {
    return (
      <View
        style={{
          marginTop: 5,
          borderRadius: 10,
        }}>
        <BookingHistory item={item} />
        <View style={{paddingHorizontal: 15}}>
          <View style={DefaultStyle.flexDirectionSpace}>
            <View style={{flex: 1}}>
              <Text style={DefaultStyle.txtblack13}>Status :</Text>
              <Text
                style={[
                  DefaultStyle.txtblack12,
                  {
                    color: COLORS.primary,
                    // item.status == 2
                    //   ? COLORS.green
                    //   : item.status >= 3
                    //   ? COLORS.red
                    //   : COLORS.black,
                  },
                ]}>
                {item.status_str ?? ''}
              </Text>
            </View>

            {/* <View style={{flex: 1}}>
              <Text style={[DefaultStyle.txtblack13, {textAlign: 'left'}]}>
                Payment Status :
              </Text>
              <Text
                style={[
                  DefaultStyle.txtblack12,
                  {
                    textAlign: 'left',
                    color:
                      item.payment_status == 0
                        ? COLORS.orange
                        : item.payment_status == 1
                        ? COLORS.green
                        : item.payment_status == 2
                        ? COLORS.red
                        : COLORS.black,
                  },
                ]}>
                {item.payment_status == 0
                  ? 'Pending'
                  : item.payment_status == 1
                  ? 'Paid'
                  : item.payment_status == 2
                  ? 'Failed '
                  : '-'}
              </Text>
            </View> */}
          </View>
        </View>

        {/* {item.allow_complaint == 1 && (
          <View style={{paddingHorizontal: 15}}>
            <Pressable
              style={[styles.cancelBtn, {marginTop: 10}]}
              onPress={() => {
                setId(item?.id);
                setStatusId(item.complaint_status);

                if (item.complaint_status == 1) {
                  onViewRaisCompalint(item?.id);
                } else {
                  ComplaintDailogBox();
                }
              }}>
              <AppIcons
                type={'Ionicons'}
                name={'shield-checkmark-outline'}
                color={COLORS.white}
                size={22}
              />
              <Text style={[DefaultStyle.whiteBold, {marginLeft: 10}]}>
                {item.complaint_status == 0 ? 'Your Feedback' : 'View Feedback'}
              </Text>
            </Pressable>
          </View>
        )} */}
        <View style={[DefaultStyle.devider, {marginTop: 15}]} />
      </View>
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
        <Header
          search={search}
          setSearch={setSearch}
          menuiconColor={COLORS.white}
          iconColor={COLORS.black}
          navigation={navigation}
          background={COLORS.primary}
        />
        {/* tab  select 0 =upcoming, 1=past, 2=canceled   */}
        <View style={{paddingHorizontal: 15, paddingVertical: 10}}>
          <View style={DefaultStyle.flexDirection}>
            <Text
              style={
                select == 0 ? styles.textTabSelect : styles.textTabUnSelect
              }
              onPress={() => {
                // setLoaderVisible(true);
                if (select == 0) {
                  getBookingHistroyData();
                } else {
                  setselect(0);
                }
              }}>
              Upcoming
            </Text>
            <Text style={DefaultStyle.txt14bold}> | </Text>
            <Text
              style={
                select == 1 ? styles.textTabSelect : styles.textTabUnSelect
              }
              onPress={() => {
                // setLoaderVisible(true);
                // setselect(1);
                // setList([]);
                if (select == 1) {
                  getBookingHistroyData();
                } else {
                  setselect(1);
                }
              }}>
              Past
            </Text>
            <Text style={DefaultStyle.txt14bold}> | </Text>

            <Text
              style={
                select == 2 ? styles.textTabSelect : styles.textTabUnSelect
              }
              onPress={() => {
                // setLoaderVisible(true);
                if (select == 2) {
                  getBookingHistroyData();
                } else {
                  setselect(2);
                }
              }}>
              Cancelled
            </Text>
          </View>
        </View>
        {/* devider  */}
        <View style={DefaultStyle.devider} />

        {list.length != 0 && (
          <View
            style={{
              //flex: 1,
              paddingHorizontal: SIZES.width * 0.03,
            }}>
            <FlatList
              data={list}
              contentContainerStyle={{paddingBottom: SIZES.height * 0.25}}
              showsVerticalScrollIndicator={false}
              renderItem={
                select == 0
                  ? RenderUpcomming
                  : select == 1
                  ? RenderPast
                  : RenderCancel
              }
            />
          </View>
        )}

        {!loaderVisible && (
          <>
            {list.length == 0 && (
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 0.8,
                }}>
                <Image
                  source={images.ic_my_bookings}
                  style={{
                    width: 150,
                    height: 150,
                    tintColor: COLORS.primary,
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: 'center',
                  }}>
                  {select == 0 && 'No Upcoming Meetings found'}
                  {select == 1 && 'No Past Meetings found'}
                  {select == 2 && 'No Cancelled Meetings found'}
                </Text>
              </View>
            )}
          </>
        )}

        {/* cancel complaint */}
        <CustomApptDialogCancel
          visible={isCancelDialog}
          onClose={CancelApptDialogBox}
          onConfirm={() => {
            onCancelAppointment(); // cancel complaint api call
          }}
        />

        {/* //Rais Complaint */}
        <CustomApptDialogRaisComplaint
          visible={isComplaint}
          onClose={() => {
            closeComplaintDilaog();
          }}
          onAddComplaint={() => {
            onAddRaisCompaint();
          }}
          setId={setId}
          statusID={statusId}
          subject={subject}
          setSubject={setSubject}
          setMessage={setMessage}
          message={message}
          status={status}
          setStatus={setStatus}
          isOldVersion={isOldVersion}
        />

        <CustomDialogRating
          visible={isVisibleRating}
          onClose={onCloseRating}
          onSubmit={onAddRating}
          message={message}
          userName={otherUserName}
          setRating={setRating}
          rating={rating}
          setMessage={setMessage}
          statusId={statusId}
          isOldVersion={isOldVersion}
        />
      </View>
      <View>
        <BottomTab />
      </View>
      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />

      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={[DefaultStyle.modalContentCenterDialog]}>
          <View style={[DefaultStyle.modalContent]}>
            <Pressable
              onPress={() => {
                setModalVisible(false);
              }}
              style={{
                position: 'absolute',
                right: 12,
                top: 10,
                padding: 10,
                zIndex: 9999,
              }}>
              <AppIcons
                type={'Entypo'}
                name={'cross'}
                size={26}
                color={COLORS.black}
              />
            </Pressable>
            <Text
              style={[
                DefaultStyle.txt14bold,
                {textAlign: 'center', fontSize: 18, marginTop: 10},
              ]}>
              Important Notes
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{padding: 10, marginTop: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
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
                    If as a Guide you are not present on the expected start time
                    of the booked slot the other party has the right to cancel
                    the meeting and not make the payment.
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
                    Please have a professional, honest and respectful
                    conversation.
                  </Text>
                </View>

                <View
                  style={[
                    DefaultStyle.flexAround,
                    {marginTop: 30, justifyContent: 'space-evenly'},
                  ]}>
                  <Button
                    title="Agree & Start Call"
                    buttonStyle={[
                      DefaultStyle.btnLogin,
                      {marginVertical: 0, minWidth: 130},
                    ]}
                    titleStyle={DefaultStyle.whiteBold}
                    onPress={() => {
                      setModalVisible(false);
                      checkPaymentStatus(selectedApptId);
                    }}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default BookingIndex;

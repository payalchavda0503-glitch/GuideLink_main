import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, ScrollView, Text, View} from 'react-native';
import {useDispatch} from 'react-redux';
import BottomTab from '../../../component/BottomTab';
import {Header} from '../../../component/Header';
import IosStatusBar from '../../../component/IosStatusBar';
import Api from '../../../service/Api';
import {
  API_GET_DASHBOARD,
  API_LATEST_USER,
  API_NOTIFICATION,
  API_UPDATE_FCB,
} from '../../../service/apiEndPoint';
import Loader from '../../../util/Loader';
import {getFcmToken} from '../../../util/Pref';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import {log} from '../../../util/Toast';
import List from '../expert/List';
import VideoBanners from './VideoBanners';
import {styles} from './styles';

const HomeIndex = ({navigation}) => {
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [recentList, setRecentList] = useState([]);
  const [search, setSearch] = useState('');
  const [upcomingAppt, setUpcomingAppt] = useState('');
  // const [hasConnectAccount, setHasConnectAccount] = useState(false);
  // const [currentBalance, setCurrentBalance] = useState(0);
  // const [pendingBalance, setPendingBalance] = useState(0);

  const [list, setList] = useState([]);
  const [emailList, setEmailList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState('');
  const [loader, setLoader] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isEmpty, setIsEmpty] = useState(false);
  const [expertType, setExpertType] = useState('student_expert');

  const dispatch = useDispatch();
  const [isEmailDialog, setEmailDialog] = useState(false);

  const expert = ['student_expert', 'other_expert'];

  const EmailVerifyDialog = () => {
    setEmailDialog(!isEmailDialog);
  };

  const getGuideData = async () => {
    try {
      if (currentPage == 1) setLoaderVisible(true);
      if (currentPage > 1) setLoader(true);

      const response = await Api.get(
        `${API_LATEST_USER}?search=${search}&page=${currentPage}&expert_type=${expertType}`,
      );

      setLoaderVisible(false);
      setLoader(false);

      if (response.status == 'RC200') {
        const result = response.data;
        setTotalRecords(result.total);
        setLastPage(result?.last_page);

        if (result.total == 0) {
          setIsEmpty(true);
        } else {
          setIsEmpty(false);
        }

        if (result?.current_page == 1) {
          setList(result.data);
        } else {
          setList([...list, ...result.data]);
        }
      }
    } catch (error) {
      setLoaderVisible(false);
    }
  };

  const getData = async () => {
    try {
      setLoaderVisible(true);
      const response = await Api.get(API_GET_DASHBOARD);

      if (response.status == 'RC200') {
        const data = response.data;

        setRecentList(data.recent_users);
        setUpcomingAppt(data.upcoming_appt);

        // setHasConnectAccount(data.balance.has_connect_account);
        // setCurrentBalance(data.balance.available);
        // setPendingBalance(data.balance.pending);
      }

      setTimeout(() => {
        setLoaderVisible(false);
      }, 500);
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  const updateFcm = () => {
    try {
      getFcmToken().then(async FCMID => {
        const formData = {
          token: FCMID,
        };
        console.log(FCMID);
        const response = await Api.post(
          `${API_NOTIFICATION}/${API_UPDATE_FCB}`,
          formData,
        );
        if (response.status === 'RC200') {
          console.log('fcm token updated');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      updateFcm();
      getData();
    }, []),
  );

  const fetchMore = () => {
    if (currentPage < lastPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    if (currentPage !== 1) {
      getGuideData();
    }
  }, [currentPage]);

  useEffect(() => {
    reset();
    getGuideData();
  }, [expertType]);

  const reset = () => {
    setList([]);
    setCurrentPage(1);
    setTotalRecords(0);
    setIsEmpty(false);
  };

  const onHandleDeatils = id => {
    navigation.navigate('ExpertDetail', {ID: id});
  };

  const onHandleBook = (id, fullname) => {
    navigation.navigate('BookAppointment', {UID: id});
  };

  const RenderData = ({item}) => (
    <List
      item={item}
      onHandleDeatils={onHandleDeatils}
      onHandleBook={onHandleBook}
      onVerifiedEmailClick={eList => {
        setEmailList(eList);
        EmailVerifyDialog();
      }}
    />
  );

  const renderHeader = () => {
    if (totalRecords === 0) return null;

    return (
      <View
        style={{
          paddingVertical: 10,
          paddingHorizontal: 16,
          backgroundColor: '#fff',
          borderBottomWidth: 1,
          borderBottomColor: '#eee',
        }}>
        <Text
          style={{
            color: COLORS.gray,
            fontSize: 13,
            fontWeight: '500',
          }}>
          {totalRecords} result{totalRecords > 1 ? 's' : ''} found
        </Text>
      </View>
    );
  };

  const renderFooter = () =>
    loader ? (
      <View style={{marginBottom: 20, marginTop: 20}}>
        <ActivityIndicator size={'large'} color={COLORS.primary} />
      </View>
    ) : null;

  const Divider = () => (
    <View style={{height: 1, backgroundColor: '#e0e0e0'}} />
  );

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <ScreenStatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
      />
      <View style={styles.container}>
        <Header
          menuiconColor={COLORS.black}
          iconColor={COLORS.gray}
          navigation={navigation}
          background={COLORS.white}
          isDasboard={true}
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          <VideoBanners />

          <View style={{paddingBottom: 150}}>
            <View style={{backgroundColor: COLORS.gray2}}>
              {upcomingAppt && (
                <View style={{padding: 5}}>
                  <Text style={styles.nextApt}>
                    Your Next Appointment is on
                  </Text>
                  <Text style={styles.date}>{upcomingAppt}</Text>
                </View>
              )}
            </View>

            {/* Expert Type Tabs as Tab Bar */}
            <View
              style={{
                flexDirection: 'row',
                marginTop: 10,
                borderBottomWidth: 1,
                borderBottomColor: '#ccc',
              }}>
              {expert.map(type => (
                <View
                  key={type}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: 2,
                    borderBottomColor:
                      expertType === type ? COLORS.primary : 'transparent',
                  }}>
                  <Text
                    onPress={() => setExpertType(type)}
                    style={{
                      color: expertType === type ? COLORS.primary : COLORS.gray,
                      fontWeight: expertType === type ? 'bold' : 'normal',
                    }}>
                    {type === 'student_expert'
                      ? 'College Guides'
                      : 'Other Guides'}
                  </Text>
                </View>
              ))}
            </View>

            <View style={[styles.flatlistContainer]}>
              {list.length !== 0 && (
                <FlatList
                  keyExtractor={item => item.id.toString()}
                  data={list}
                  contentContainerStyle={{paddingBottom: SIZES.height * 0.25}}
                  showsVerticalScrollIndicator={false}
                  renderItem={RenderData}
                  ItemSeparatorComponent={Divider}
                  initialNumToRender={5}
                  onEndReached={fetchMore}
                  onEndReachedThreshold={0.5}
                  ListHeaderComponent={renderHeader}
                  ListFooterComponent={renderFooter}
                />
              )}

              {isEmpty && list.length === 0 && (
                <View
                  style={{
                    height: SIZES.height * 0.7,
                    justifyContent: 'center',
                    paddingHorizontal: 20,
                    alignSelf: 'center',
                  }}>
                  <Text style={{fontSize: 18, color: COLORS.gray}}>
                    Sorry, no user found matching your search. Please try with
                    other options.
                  </Text>
                </View>
              )}

              {emailList.length !== 0 && (
                <CustomDialogVerifyEmail
                  visible={isEmailDialog}
                  emailList={emailList}
                  onClose={EmailVerifyDialog}
                  onConfirm={EmailVerifyDialog}
                />
              )}
            </View>

            {/* <Text style={styles.join}>Who has joined us recently</Text>

              <RecentjointList
                data={recentList}
                onUserClick={id => {
                  navigation.navigate('ExpertDetail', {ID: id});
                }}
                onViewDetails={() => {
                  navigation.navigate('AllExpertList', {ID: -1});
                }}
              /> */}
            {/* <LatestList /> */}
          </View>
        </ScrollView>
      </View>

      <View>
        <BottomTab />
      </View>
      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </>
  );
};

export default HomeIndex;

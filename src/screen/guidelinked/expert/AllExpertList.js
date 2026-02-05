import React, {useEffect, useState} from 'react';
import {ActivityIndicator, FlatList, Text} from 'react-native';

import {useDispatch} from 'react-redux';
import IosStatusBar from '../../../component/IosStatusBar';
import {CustomDialogVerifyEmail} from '../../../component/customDialog';
import {showToast} from '../../../redux/toastSlice';
import Api from '../../../service/Api';
import {API_EXPERT_LIST, API_LATEST_USER} from '../../../service/apiEndPoint';
import Loader from '../../../util/Loader';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import List from './List';
import {styles} from './styles';

const AllExpertList = ({navigation}) => {
  const [search, setSearch] = useState('');
  const [loaderVisible, setLoaderVisible] = useState(false);
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

  const getData = async () => {
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

  const onSearchClick = () => {
    if (search.trim() !== '' && search !== null) {
      setList([]);
      setTotalRecords(0);
      setCurrentPage(1);
      SearchGetData();
    } else {
      dispatch(showToast('Search is empty, please enter a value.'));
    }
  };

  const SearchGetData = async () => {
    try {
      if (currentPage == 1) setLoaderVisible(true);
      if (currentPage > 1) setLoader(true);

      const response = await Api.get(
        `${API_EXPERT_LIST}?search=${search}&page=${currentPage}&expert_type=${expertType}`,
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

  const fetchMore = () => {
    if (currentPage < lastPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  useEffect(() => {
    if (currentPage !== 1) {
      getData();
    }
  }, [currentPage]);

  useEffect(() => {
    reset();
    getData();
  }, [expertType]);

  const reset = () => {
    setList([]);
    setSearch('');
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
        barStyle="dark-content"
      />
      <View style={{flex: 1}}>
        {/* <HeaderIconSearch
            search={search}
            setSearch={setSearch}
            menuiconColor={COLORS.black}
            iconColor={COLORS.gray}
            navigation={navigation}
            onSearchClick={onSearchClick}
          /> */}

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
                {type === 'student_expert' ? 'College Guides' : 'Other Guides'}
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
              <Text style={{fontSize: 16, color: COLORS.gray}}>
                Sorry, no user found matching your search. Please try with other
                options.
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
      </View>

      {/* <View style={{position: 'absolute', bottom: 0}}>
          <BottomTab />
        </View> */}

      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </>
  );
};

export default AllExpertList;

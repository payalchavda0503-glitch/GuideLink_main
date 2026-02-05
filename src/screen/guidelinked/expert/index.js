import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, FlatList, Text, View} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';
import debounce from 'lodash.debounce';
import {useDispatch} from 'react-redux';
import BottomTab from '../../../component/BottomTab';
import {HeaderSearch} from '../../../component/HeaderSearch';
import IosStatusBar from '../../../component/IosStatusBar';
import {CustomDialogVerifyEmail} from '../../../component/customDialog';
import Api from '../../../service/Api';
import {API_EXPERT_LIST} from '../../../service/apiEndPoint';
import {DefaultStyle} from '../../../util/ConstVar';
import Loader from '../../../util/Loader';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import List from './List';
import {styles} from './styles';

const ExpertIndex = ({navigation}) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');

  const [loaderVisible, setLoaderVisible] = useState(false);

  const [list, setList] = useState([]);
  const [emailList, setEmailList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState('');
  const [loader, setLoader] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isEmpty, setIsEmpty] = useState(false);

  const [isEmailDialog, setEmailDialog] = useState(false);
  const EmailVerifyDialog = () => {
    setEmailDialog(!isEmailDialog);
  };

  const getData = async () => {
    try {
      if (currentPage == 1) setLoaderVisible(true);
      if (currentPage > 1) {
        setLoader(true);
      }

      const response = await Api.get(
        `${API_EXPERT_LIST}?search=${search}&page=${currentPage}`,
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
          setList(prev => [...prev, ...result.data]);
        }
      }
    } catch (error) {
      setLoaderVisible(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce(() => {
        setList([]);
        setTotalRecords(0);
        setCurrentPage(1);
        getData();
      }, 500),
    [search],
  );

  useEffect(() => {
    if (search.trim() === '') {
      setList([]);
      setTotalRecords(0);
      setCurrentPage(1);
      return;
    }
    debouncedSearch();
    return debouncedSearch.cancel;
  }, [search]);

  const fetchMore = () => {
    if (currentPage < lastPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (currentPage != 1) {
      getData();
    }
  }, [currentPage]);

  useFocusEffect(
    useCallback(() => {
      //reset();
    }, []),
  );

  const reset = () => {
    setList([]);
    setSearch('');
    setCurrentPage(1);
    setTotalRecords(0);
  };

  const onHandleDeatils = id => {
    navigation.navigate('ExpertDetail', {ID: id});
  };

  const onHandleBook = (id, fullname) => {
    navigation.navigate('BookAppointment', {UID: id});
  };

  const RenderData = ({item}) => {
    return (
      <List
        item={item}
        searchText={search}
        onHandleDeatils={onHandleDeatils}
        onHandleBook={onHandleBook}
        onVerifiedEmailClick={eList => {
          setEmailList(eList);
          EmailVerifyDialog();
        }}
      />
    );
  };

  const renderFooter = () => {
    return (
      <View>
        {loader ? (
          <View style={{marginBottom: 20, marginTop: 20}}>
            <ActivityIndicator size={'large'} color={COLORS.primary} />
          </View>
        ) : null}
      </View>
    );
  };

  const Divider = () => {
    return <View style={{height: 1, backgroundColor: '#e0e0e0'}} />;
  };

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <ScreenStatusBar
        backgroundColor={COLORS.primary}
        barStyle="dark-content"
      />
      <View style={{flex: 1}}>
        <HeaderSearch
          search={search}
          setSearch={setSearch}
          menuiconColor={COLORS.white}
          iconColor={COLORS.black}
          background={COLORS.primary}
          navigation={navigation}
          onSearchClick={() => {}}
        />
        {totalRecords != 0 && (
          <Text style={[DefaultStyle.txtgray12, {padding: 10}]}>
            {totalRecords} result(s) found
          </Text>
        )}
        <View style={[DefaultStyle.devider, {marginBottom: 0}]} />

        <View style={[styles.flatlistContainer, {flex: 1}]}>
          {list.length != 0 && (
            <FlatList
              keyExtractor={item => item.id.toString()}
              data={list}
              contentContainerStyle={{paddingBottom: SIZES.height * 0.1}}
              showsVerticalScrollIndicator={false}
              renderItem={RenderData}
              ItemSeparatorComponent={Divider}
              initialNumToRender={5}
              onEndReached={fetchMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          )}
          {search.trim() === '' ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: COLORS.gray,
                  textAlign: 'center',
                }}>
                Start typing to search.
              </Text>
            </View>
          ) : isEmpty && list.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 20,
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: COLORS.gray,
                  textAlign: 'center',
                }}>
                Sorry, no user found matching your search. Please try with some
                other options.
              </Text>
            </View>
          ) : null}

          {emailList.length != 0 && (
            <CustomDialogVerifyEmail
              visible={isEmailDialog}
              emailList={emailList}
              onClose={EmailVerifyDialog}
              onConfirm={() => {
                EmailVerifyDialog();
              }}
            />
          )}
        </View>
      </View>

      <View style={{position: 'absolute', bottom: 0}}>
        <BottomTab />
      </View>
      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </>
  );
};

export default ExpertIndex;

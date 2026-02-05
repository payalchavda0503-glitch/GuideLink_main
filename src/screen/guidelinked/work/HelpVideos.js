import {
  SafeAreaView,
  Text,
  View,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
  TouchableOpacity,
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
  API_GET_VIDEOS_LIST,
  API_SCHEDULE_TIMESLOTS_DATE,
  API_SCHEDULE_TIMESLOTS_TIME,
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
import LoaderV2 from '../../../component/LoaderV2';
import ImageLoader from '../ImageLoader';

const HelpVideos = ({navigation, route}) => {
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [list, setList] = useState([]);

  const getData = async () => {
    try {
      setLoaderVisible(true);

      const response = await Api.get(
        `${API_GET_VIDEOS_LIST}?type=${route.params.type}`,
      );

      if (response.status == 'RC200') {
        const data = response.data;

        setList(data);
      }

      setLoaderVisible(false);
    } catch (error) {}
  };

  useFocusEffect(
    useCallback(() => {
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

  const RenderData = ({item}) => {
    return (
      <View style={stylesx.container}>
        <ImageLoader
          vid={item.link}
          imageHeight={200}
          url={item.thumbnail}
          title={item.title}
        />
        <Text style={stylesx.header}>{item.title}</Text>
      </View>
    );
  };

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />
      <SafeAreaView
        style={[DefaultStyle.flexView, {backgroundColor: COLORS.gray2}]}>
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="dark-content"
        />
        <View style={{flex: 1, backgroundColor: COLORS.white}}>
          <View
            style={{
              backgroundColor: COLORS.white,
              flexDirection: 'row',
              alignItems: 'center',
              height: 52,
              hadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 7,
            }}>
            <TouchableOpacity
              style={[{padding: 10, position: 'relative', zIndex: 999}]}
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

            {/* <View style={{position: 'absolute', left:0, right:0, zIndex:100}}>
                  <Text
                    style={{
                      alignSelf: 'center',
                      fontWeight: 'bold',
                      color: COLORS.black,
                      fontSize: 18,
                    }}>
                    Help Videos
                  </Text>
                </View> */}
          </View>

          <View style={{flex: 1}}>
            <FlatList
              style={{}}
              data={list}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={Divider}
              renderItem={RenderData}
            />
          </View>

          <Loader
            loaderVisible={loaderVisible}
            setLoaderVisible={setLoaderVisible}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const stylesx = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    shadowColor: '#000',
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 10,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    elevation: 6,
  },
  header: {
    color: '#222',
    backgroundColor: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
  },
});

export default HelpVideos;

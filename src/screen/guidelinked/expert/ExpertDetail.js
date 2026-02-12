import {
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Pressable,
} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS} from '../../../util/Theme';
import ic_flag from '../../../assets/images/ic_flag.png';
import {DefaultStyle} from '../../../util/ConstVar';
import {useFocusEffect} from '@react-navigation/native';
import RatinTab from './stickyHeader/RatinTab';
import HeaderSection from './stickyHeader/HeaderSection';
import {TabList} from './stickyHeader/TabList';
import {
  API_EXPERT_DETAILS,
  API_EXPERT_DETAILS_RATING,
  API_USER,
} from '../../../service/apiEndPoint';
import Api from '../../../service/Api';
import {log} from '../../../util/Toast';
import Loader from '../../../util/Loader';
import IosStatusBar from '../../../component/IosStatusBar';
import {styles} from './styles';
import AppIcons from '../../../component/AppIcons';

const HEADER_BAR_HEIGHT = 92;

const ExpertDetail = ({navigation, route}) => {
  let USER_ID = route.params.ID;

  const [loaderVisible, setLoaderVisible] = useState(false);

  const scrollViewRef = useRef(null);
  const [tabContentPosition, setTabContentPosition] = useState(0);

  const handleScrollToTabs = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({y: tabContentPosition, animated: true});
    }
  };

  const onTabContentLayout = event => {
    const {y} = event.nativeEvent.layout;
    setTabContentPosition(y);
  };

  const [details, setDetails] = useState([]);

  const [ratingList, setRatingList] = useState([]);

  const getDetails = async () => {
    try {
      setLoaderVisible(true);

      const response = await Api.get(API_EXPERT_DETAILS + USER_ID);

      if (response.status == 'RC200') {
        setDetails(response.data);
        console.log('Expert detail API (categories):', {
          categories: response.data.categories,
          raw: response.data,
        });
      }

      setLoaderVisible(false);
    } catch (error) {
      log(error);
    }
  };

  const getRating = async () => {
    try {
      setLoaderVisible(true);
      const res = await Api.get(
        `${API_USER}/${USER_ID}/${API_EXPERT_DETAILS_RATING}`,
      );
      if ((res.status = 'RC200')) {
        setRatingList(res.data);
        setLoaderVisible(false);
      }
    } catch (error) {
      setLoaderVisible(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getDetails();
      getRating();
    }, []),
  );
  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <ScreenStatusBar
        backgroundColor={COLORS.primary}
        barStyle="dark-content"
      />

      {loaderVisible ? (
        <Loader
          loaderVisible={loaderVisible}
          setLoaderVisible={setLoaderVisible}
        />
      ) : (
        <View style={DefaultStyle.flexView}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <HeaderSection
              dataList={details}
              onScrollDown={handleScrollToTabs}
              onBookAppointment={() => {
                navigation.navigate('BookAppointment', {
                  UID: USER_ID,
                });
              }}
            />

            {/* {
              <RatinTab
                ratingList={ratingList}
                totalReviews={details.total_rating_users}
                totalAvgRating={details.avg_rating}
              />
            } */}
          </ScrollView>

          <Pressable
            style={styles.ic_back}
            onPress={() => {
              navigation.goBack();
            }}>
            <View
              style={{
                backgroundColor: COLORS.primary,
                padding: 8,
                borderRadius: 50,
                marginLeft: 8,
                marginTop: 8,
              }}>
              <AppIcons
                name={'arrow-back'}
                type={'MaterialIcons'}
                size={20}
                color={COLORS.white}
              />
            </View>
          </Pressable>
        </View>
      )}
    </>
  );
};

const style = StyleSheet.create({
  content: {
    alignSelf: 'stretch',
  },

  tabContainer: {
    paddingTop: HEADER_BAR_HEIGHT,
  },

  selectedTabText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default ExpertDetail;

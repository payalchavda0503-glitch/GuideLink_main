import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {ActivityIndicator, Dimensions, StyleSheet, View} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import Api from '../../../service/Api';
import {API_GET_VIDEOS_LIST} from '../../../service/apiEndPoint';
import {COLORS} from '../../../util/Theme';
import ImageLoader from '../ImageLoader';

const SLIDER_WIDTH = Math.round(Dimensions.get('window').width);
const ITEM_WIDTH = SLIDER_WIDTH;

const VideoBanners = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const isLoadedRef = useRef(false); // Prevent refetch on every focus

  const getData = async () => {
    if (isLoadedRef.current) return;
    try {
      const response = await Api.get(`${API_GET_VIDEOS_LIST}?type=7`);
      if (response.status === 'RC200') {
        setList(response.data || []);
        isLoadedRef.current = true;
      }
    } catch (error) {
      console.log('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getData();
    }, []),
  );

  const renderItem = ({item}) => (
    <View style={styles.container}>
      <ImageLoader vid={item.link} url={item.thumbnail} title={item.title} />
    </View>
  );

  if (loading) {
    return (
      <View style={{paddingVertical: 20}}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!list || list.length === 0) return null;

  return (
    <View style={{flex: 1, backgroundColor: COLORS.white}}>
      <Carousel
        layout="default"
        data={list}
        autoplay
        autoplayInterval={5000}
        renderItem={renderItem}
        sliderWidth={SLIDER_WIDTH}
        itemWidth={ITEM_WIDTH}
        inactiveSlideShift={0}
        removeClippedSubviews={false}
        useScrollView
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
});

export default React.memo(VideoBanners);

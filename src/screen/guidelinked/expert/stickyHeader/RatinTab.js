import {FlatList, Image, Text, View} from 'react-native';
import React from 'react';
import {styles} from '../styles';
import {DefaultStyle} from '../../../../util/ConstVar';
import CustomRating from '../../../../component/CustomRating ';
import FastImage from 'react-native-fast-image';

const RatinTab = ({ratingList, totalAvgRating, totalReviews}) => {
  const handleUpdateRating = () => {};

  const renderRatingItem = ({item}) => {
    return (
      <View style={styles.ratingItem}>
        <View style={styles.leftRightConatent}>
          {/* <Image source={{uri: item.image_url}} style={styles.image} /> */}
          <FastImage
            style={styles.image}
            source={{
              uri: item.image_url,
              priority: FastImage.priority.high,
            }}
           // defaultSource={require('../../../../assets/images/ic_empty.jpg')} // Placeholder while loading
            resizeMode={FastImage.resizeMode.contain}
            fallback
          />
          <Text style={[styles.name, {marginHorizontal: 15}]}>
            {item.username}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.leftRightConatent}>
            <CustomRating
              initialRating={item.rating}
              onUpdateRating={handleUpdateRating}
              isshow={true}
            />
            <Text style={[DefaultStyle.txt14, {marginStart: 10}]}>
              {item.created_at}
            </Text>
          </View>
          {item.msg !== null && item.msg !== '' && (
            <Text style={DefaultStyle.text}>
              {item.comment ? item.comment : '-'}
            </Text>
          )}
        </View>
      </View>
    );
  };
  return (
    <View>
      {/* devider */}
      <View style={[styles.devider, {marginTop: 0}]} />
      {/* rating view */}
      <View>
        <View style={styles.flexSpaceCenter}>
          <View>
            <Text style={DefaultStyle.txt14}>Rating & Reviews</Text>
            <Text style={[DefaultStyle.txtgray12]}>{totalReviews} Reviews</Text>
          </View>

          <View>
            <Text style={styles.rate}>{totalAvgRating}</Text>
          </View>
        </View>

        <FlatList
          style={{marginVertical: 10}}
          data={ratingList}
          showsVerticalScrollIndicator={false}
          renderItem={renderRatingItem}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  );
};

export default RatinTab;

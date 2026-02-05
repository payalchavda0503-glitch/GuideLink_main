import {View, Text, StyleSheet, FlatList, Image} from 'react-native';
import React, {useState} from 'react';
import {DefaultStyle} from '../../../util/ConstVar';
import {COLORS, SIZES} from '../../../util/Theme';
import {Button} from '@rneui/themed';
import FastImage from 'react-native-fast-image';
import ic_flag from '../../../assets/images/ic_flag.png';
import ic_avl from '../../../assets/images/ic_avl.jpg';

const LatestList = () => {
  const [list, setList] = useState([
    {
      id: 0,
      countryImg: ic_flag,
      title: 'U.S. Newa & Word Report',
      description:
        "how Does Brook University-SUNY Rank Among America's Best College?",
      time: '1 day ago',
      image: ic_avl,
    },
    {
      id: 1,
      countryImg: ic_flag,
      title: 'The Economic times',
      description:
        'Mumbai Rains Highlight News Update: Mumbai school and collges to open tomorrow:ignore runmore, says BMC',
      time: '1 day ago',
      image: ic_avl,
    },
    {
      id: 2,
      countryImg: ic_flag,
      title: 'U.S. Newa & Word Report',
      description:
        "how Does Brook University-SUNY Rank Among America's Best College?",
      time: '4 day ago',
      image: ic_avl,
    },
    {
      id: 3,
      countryImg: ic_flag,
      title: 'Tribune India',
      description:
        "how Does Brook University-SUNY Rank Among America's Best College?",
      time: '17 hour  ago',
      image: ic_avl,
    },
  ]);
  const onViewMore = () => {};
  const renderdata = ({item}) => {
    return (
      <>
        <View style={{marginHorizontal: 15}}>
          <View style={DefaultStyle.flexSpaceCenter}>
            <View style={{flex: 1}}>
              <View style={DefaultStyle.flexDirection}>
                <Image
                  source={item.countryImg}
                  style={styles.countryIcon}
                  resizeMode="contain"
                />
                <Text style={styles.title}>{item.title}</Text>
              </View>
              <Text style={styles.desc} numberOfLines={3}>
                {item.description}
              </Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>

            <View style={{flex: 0}}>
              <Image
                source={item.image_url}
                style={styles.image}
                resizeMode="contain"
              />
              {/* <FastImage
                style={styles.image}
                source={{
                  uri: item.image_url,
                  priority: FastImage.priority.high,
                }}
                defaultSource={require('../../../assets/images/ic_empty.jpg')} // Placeholder while loading
                resizeMode={FastImage.resizeMode.contain}
                fallback
              /> */}
            </View>
          </View>
        </View>
        <View style={styles.devider} />
      </>
    );
  };
  return (
    <View>
      <FlatList
        data={list}
        renderItem={renderdata}
        ListHeaderComponent={
          <>
            <View style={styles.devider} />
            <Text style={styles.latest}>What's Latest</Text>
          </>
        }
      />
      <View style={DefaultStyle.devider} />

      <Button
        title="VIEW MORE"
        buttonStyle={styles.viewMore}
        titleStyle={DefaultStyle.whiteBold}
        onPress={onViewMore}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  latest: {
    textAlign: 'center',
    fontSize: 16,
    color: COLORS.black,
    fontWeight: 'bold',
  },
  devider: {
    marginVertical: 10,
    backgroundColor: COLORS.lightGray,
    height: 6,
  },
  image: {
    width: 80,
    height: 100,
    marginStart: 10,
    borderRadius: 10,
    //backgroundColor: COLORS.lightGray,
  },
  countryIcon: {height: 20, width: 20},
  title: {fontSize: 14, color: COLORS.gray, marginHorizontal: 5},
  desc: {fontSize: 14, color: COLORS.blue, marginVertical: 5},
  time: {fontSize: 12, color: COLORS.gray},
  viewMore: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    backgroundColor: COLORS.red,
    minWidth: SIZES.width * 0.3,
    paddingHorizontal: 35,
  },
});

export default LatestList;

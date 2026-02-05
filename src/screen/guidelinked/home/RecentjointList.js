import {
  FlatList,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {DefaultStyle} from '../../../util/ConstVar';
import {COLORS, SIZES} from '../../../util/Theme';
import Rating from '../../../../src/component/Rating';
import AppIcons from '../../../component/AppIcons';
import {Button} from '@rneui/themed';
import {CustomDialogVerifyEmail} from '../../../component/customDialog';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';

const RecentjointList = ({data, onUserClick, onViewDetails}) => {
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

  const [emailList, setEmailList] = useState([]);
  const [isEmailDialog, setEmailDialog] = useState(false);

  const EmailVerifyDialog = () => {
    setEmailDialog(!isEmailDialog);
  };

  const RenderData = ({item}) => {
    return (
      <View style={{padding: 10}}>
        <View style={[DefaultStyle.row]}>
          <View style={[styles.imageContent]}>
            {/* <Image
              source={{uri: item.image_url}}
              style={styles.limage}
              resizeMode="cover"
            /> */}
            <FastImage
              style={styles.limage}
              source={{
                uri: item.image_url,
                priority: FastImage.priority.high,
              }}
              //  defaultSource={require('../../../assets/images/ic_empty.jpg')} // Placeholder while loading
              resizeMode={FastImage.resizeMode.cover}
              fallback
            />

            <Text style={styles.price}>${item.slot_price}</Text>
            <Text style={DefaultStyle.txtPrimary14}>25 mins</Text>
          </View>

          <Pressable
            onPress={() => {
              onUserClick(item.id);
            }}
            style={styles.nameContent}>
            <View style={DefaultStyle.flexDirection}>
              <Text style={styles.name}>
                {item.fullname == 'null' || !item.fullname
                  ? '-'
                  : item.fullname}
              </Text>
              {item.is_education_email_verified && (
                <Pressable
                  onPress={() => {
                    setEmailList(item.education_email_verified_hidden);
                    EmailVerifyDialog();
                  }}>
                  <Image
                    source={require('../../../assets/images/ic_verify1.png')}
                    resizeMode="contain"
                    style={styles.imgVerify}
                  />
                </Pressable>
              )}
            </View>
            {/* <Pressable
              onPress={() => {
                onUserClick(item.id);
              }}> */}
            <>
              <View style={DefaultStyle.flexDirection}>
                <Rating initialRating={item.avg_rating} />
                {/* <CustomRating
                  ratingSize={12}
                  initialRating={item.avg_rating}
                  isshow={true}
                /> */}
                <Text style={[DefaultStyle.text, {marginStart: 4}]}>
                  ({item.total_rating_users})
                </Text>
              </View>

              <View style={[{marginVertical: 5, flexDirection: 'row'}]}>
                <Pressable
                  style={[
                    styles.circlelinkedin,
                    {
                      backgroundColor: item.linked_in
                        ? COLORS.primary
                        : COLORS.grayed,
                      marginStart: 0,
                      width: 25,
                      height: 25,
                    },
                  ]}
                  onPress={() => {
                    if (item.linked_in) {
                      Linking.openURL(item.linked_in);
                    }
                  }}>
                  <AppIcons
                    type={'FontAwesome'}
                    name={'linkedin'}
                    size={14}
                    color={COLORS.white}
                  />
                </Pressable>

                <Pressable
                  style={[
                    styles.circlefb,
                    {
                      backgroundColor: item.facebook
                        ? COLORS.blue
                        : COLORS.grayed,
                      width: 25,
                      height: 25,
                    },
                  ]}
                  onPress={() => {
                    if (item.facebook) {
                      Linking.openURL(item.facebook);
                    }
                  }}>
                  <AppIcons
                    type={'FontAwesome'}
                    name={'facebook'}
                    size={14}
                    color={COLORS.white}
                  />
                </Pressable>

                <Pressable
                  onPress={() => {
                    if (item.instagram) {
                      Linking.openURL(item.instagram);
                    }
                  }}>
                  <LinearGradient
                    colors={[
                      item.instagram ? COLORS.Yellow : COLORS.grayed,
                      item.instagram ? COLORS.darkpink : COLORS.grayed,
                      item.instagram ? COLORS.pink : COLORS.grayed,
                    ]}
                    style={[
                      styles.circleInsta,
                      {
                        backgroundColor: item.instagram
                          ? COLORS.pink
                          : COLORS.grayed,
                        width: 25,
                        height: 25,
                      },
                    ]}>
                    <AppIcons
                      type={'FontAwesome'}
                      name={'instagram'}
                      size={14}
                      color={COLORS.white}
                    />
                  </LinearGradient>
                </Pressable>

                <Pressable
                  style={[
                    styles.circlelinkedin,
                    {
                      backgroundColor: item.tiktok_link
                        ? COLORS.black
                        : COLORS.grayed,
                      width: 25,
                      height: 25,
                    },
                  ]}
                  onPress={() => {
                    if (item.tiktok_link) {
                      Linking.openURL(item.tiktok_link);
                    }
                  }}>
                  <AppIcons
                    type={'Ionicons'}
                    name={'logo-tiktok'}
                    size={14}
                    color={COLORS.white}
                  />
                </Pressable>

                <Pressable
                  style={[
                    styles.circlelinkedin,
                    {
                      backgroundColor: item.youtube_link
                        ? COLORS.red
                        : COLORS.grayed,
                      marginRight: 0,
                      width: 25,
                      height: 25,
                    },
                  ]}
                  onPress={() => {
                    if (item.youtube_link) {
                      Linking.openURL(item.youtube_link);
                    }
                  }}>
                  <AppIcons
                    type={'Feather'}
                    name={'youtube'}
                    size={14}
                    color={COLORS.white}
                  />
                </Pressable>
              </View>

              <Text style={DefaultStyle.text} numberOfLines={2}>
                {item.introduction == 'null' || !item.introduction
                  ? '-'
                  : item.introduction}
              </Text>

              {item.help_with && item.help_with.length > 0 && (
                <>
                  <Text style={styles.whatHelp}>What can I help with ?</Text>

                  {item.help_with.map(val => (
                    <View style={DefaultStyle.flexDirection}>
                      <AppIcons
                        name={'chevron-right'}
                        type={'Entypo'}
                        size={12}
                        color={COLORS.gray}
                      />
                      <Text style={DefaultStyle.txtgray12} numberOfLines={1}>
                        {val.question}
                      </Text>
                    </View>
                  ))}
                </>
              )}
            </>
            {/* </Pressable> */}
          </Pressable>
        </View>
        <Pressable
          onPress={() => {
            onUserClick(item.id);
          }}>
          <Text style={[styles.viewDetails, {marginTop: 5}]}>View Details</Text>
        </Pressable>
      </View>
    );
  };
  return (
    <View>
      <FlatList
        style={{}}
        data={data}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={Divider}
        renderItem={RenderData}
      />
      <Button
        title="VIEW MORE"
        buttonStyle={[styles.viewMore, {marginBottom: 20}]}
        titleStyle={DefaultStyle.whiteBold}
        onPress={() => {
          onViewDetails();
        }}
      />

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
  );
};

export default RecentjointList;

const styles = StyleSheet.create({
  imageContent: {alignItems: 'center', width: SIZES.width * 0.2},
  nameContent: {
    marginStart: 15,
    width: SIZES.width * 0.68,
  },
  limage: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
  price: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: 'bold',
  },
  imgVerify: {width: 20, height: 20, marginStart: 4},
  name: {color: COLORS.black, fontSize: 16, fontWeight: 'bold'},
  whatHelp: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 2,
  },
  recentImg: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
  viewDetails: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  viewMore: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    minWidth: SIZES.width * 0.3,
    paddingHorizontal: 35,
  },
  circlelinkedin: {
    width: 30,
    height: 30,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circlefb: {
    width: 30,
    height: 30,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: COLORS.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleInsta: {
    width: 30,
    height: 30,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: COLORS.pink,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

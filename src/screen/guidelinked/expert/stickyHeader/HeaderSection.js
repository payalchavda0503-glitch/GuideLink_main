import {useNavigation} from '@react-navigation/native';
import {Button} from '@rneui/themed';
import React, {useState} from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import AppIcons from '../../../../component/AppIcons';
import Rating from '../../../../component/Rating';
import {CustomDialogVerifyEmail} from '../../../../component/customDialog';
import {DefaultStyle} from '../../../../util/ConstVar';
import {COLORS} from '../../../../util/Theme';
import {styles} from '../styles';

const HeaderSection = ({dataList, onScrollDown, onBookAppointment}) => {
  const navigation = useNavigation();

  const [emailList, setEmailList] = useState([]);
  const [isEmailDialog, setEmailDialog] = useState(false);
  const EmailVerifyDialog = () => {
    setEmailDialog(!isEmailDialog);
  };

  const categories = Array.isArray(dataList?.categories)
    ? dataList.categories
    : [];

  const primaryCategoryTitle =
    categories.length > 0
      ? categories[0]?.title || categories[0]?.name || null
      : null;
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

  const renderWhatCanHelp = ({item, index}) => {
    return (
      <View style={{flexDirection: 'column', padding: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
          <View style={{marginTop: 7}}>
            <AppIcons
              type={'FontAwesome'}
              name={'circle'}
              size={8}
              color={COLORS.black}
            />
          </View>
          <Text
            style={{
              fontWeight: 'bold',
              color: COLORS.black,
              marginLeft: 8,
              flexShrink: 1,
            }}>
            {item.question}
          </Text>
        </View>
        <Text style={{paddingLeft: 16, color: COLORS.black}}>
          {item.answer}
        </Text>
      </View>
    );
  };

  return (
    <View>
      <FastImage
        style={styles.icon}
        source={{
          uri: dataList.image_url,
          priority: FastImage.priority.high,
        }}
        // defaultSource={require('../../../../assets/images/ic_empty.jpg')} // Placeholder while loading
        resizeMode={FastImage.resizeMode.cover}
        fallback
      />
      {/* <Image
        source={{uri: dataList.image_url}}
        style={styles.icon}
        resizeMode="cover"
      /> */}

      <View style={{marginTop: 5, marginLeft: 15, marginRight: 15}}>
        {/* Name & Country */}
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {dataList.stripe_onboarding_status == 1 && (
            <View style={{marginEnd: 4, marginTop: 2}}>
              <AppIcons
                type={'FontAwesome'}
                name={'graduation-cap'}
                size={15}
                color={COLORS.black}
              />
            </View>
          )}
          <View style={{flexDirection: 'row', alignItems: 'center', flexShrink: 1}}>
            <Text style={[styles.name, {fontSize: 18}]}>
              {dataList.fullname == 'null' || !dataList.fullname
                ? '-'
                : dataList.fullname}
            </Text>
            {dataList.is_education_email_verified == 1 && (
              <Pressable
                onPress={() => {
                  setEmailList(dataList.education_email_verified_hidden);
                  EmailVerifyDialog();
                }}
                style={{marginLeft: 6}}>
                <AppIcons
                  type={'MaterialCommunityIcons'}
                  name={'check-decagram'}
                  size={19}
                  color={COLORS.primary}
                />
              </Pressable>
            )}
            {(dataList.is_featured === 1 || dataList.is_featured === '1') && (
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: COLORS.orange,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 6,
                  elevation: 3,
                  shadowColor: COLORS.black,
                  shadowOffset: {width: 0, height: 1},
                  shadowOpacity: 0.3,
                  shadowRadius: 2,
                }}>
                <View
                  style={{
                    opacity: 0.9,
                    elevation: 2,
                    shadowColor: COLORS.Yellow,
                    shadowOffset: {width: 0, height: 0},
                    shadowOpacity: 0.5,
                    shadowRadius: 1,
                  }}>
                  <FontAwesome5
                    name="star"
                    size={11}
                    color={COLORS.Yellow}
                    solid
                  />
                </View>
              </View>
            )}
            <Text style={[styles.name, {fontSize: 11, marginLeft: 5}]}>
              {` - ${dataList.country_name}`}
            </Text>
          </View>
        </View>

        <View style={{marginTop: 4}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={styles.metaRow}>
              {categories.map(cat => {
                const label =
                  cat?.title || cat?.name || cat?.category_name || '';
                if (!label) return null;
                const key = String(cat.id ?? cat.slug ?? label);
                return (
                  <View key={key} style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{label}</Text>
                  </View>
                );
              })}
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={styles.dolar}>
                ${dataList.slot_price === '' ? '0' : dataList.slot_price}
              </Text>
              <Text style={[DefaultStyle.txtblack12, {marginStart: 3}]}>
                per 25 mins
              </Text>
            </View>
          </View>

          {Number(dataList?.total_aura) > 0 && (
            <View
              style={{
                marginTop: 4,
                alignItems: 'flex-end',
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={require('../../../../assets/images/image.png')}
                  style={styles.auraIcon}
                  resizeMode="contain"
                />
                <Text style={styles.auraText}>
                  (
                  {dataList.total_aura}{' '}
                  {Number(dataList.total_aura) === 1 ? 'Aura' : 'Auras'}
                  )
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 2nd row: Rating (left, only if reviews > 0), Social icons (right) */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
          }}>
          {/* Left: Rating – only show when there is at least 1 review */}
          {Number(dataList?.total_rating_users) > 0 && (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                style={[DefaultStyle.flexDirection, {alignItems: 'center'}]}
                onPress={onScrollDown}>
                <Rating initialRating={dataList.avg_rating} />
                <Text style={styles.counting}>
                  {'(' + dataList.total_rating_users + ')'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right: Social + Verified icon row */}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {/* LinkedIn */}
            <Pressable
              style={[
                styles.circlelinkedin,
                {
                  backgroundColor: dataList.linked_in
                    ? COLORS.primary
                    : COLORS.grayed,
                  marginRight: 4,
                },
              ]}
              onPress={() =>
                dataList.linked_in && Linking.openURL(dataList.linked_in)
              }>
              <AppIcons
                type="FontAwesome"
                name="linkedin"
                size={20}
                color={COLORS.white}
              />
            </Pressable>

            {/* Facebook */}
            <Pressable
              style={[
                styles.circlefb,
                {
                  backgroundColor: dataList.facebook
                    ? COLORS.blue
                    : COLORS.grayed,
                  marginRight: 4,
                },
              ]}
              onPress={() =>
                dataList.facebook && Linking.openURL(dataList.facebook)
              }>
              <AppIcons
                type="FontAwesome"
                name="facebook"
                size={20}
                color={COLORS.white}
              />
            </Pressable>

            {/* Instagram */}
            <Pressable
              onPress={() =>
                dataList.instagram && Linking.openURL(dataList.instagram)
              }
              style={{marginRight: 0}}>
              <LinearGradient
                colors={[
                  dataList.instagram ? COLORS.Yellow : COLORS.grayed,
                  dataList.instagram ? COLORS.darkpink : COLORS.grayed,
                  dataList.instagram ? COLORS.pink : COLORS.grayed,
                ]}
                style={[
                  styles.circleInsta,
                  {
                    backgroundColor: dataList.instagram
                      ? COLORS.pink
                      : COLORS.grayed,
                  },
                ]}>
                <AppIcons
                  type="FontAwesome"
                  name="instagram"
                  size={20}
                  color={COLORS.white}
                />
              </LinearGradient>
            </Pressable>

            {/* TikTok */}
            <Pressable
              style={[
                styles.circlelinkedin,
                {
                  backgroundColor: dataList.tiktok_link
                    ? COLORS.black
                    : COLORS.grayed,
                  marginRight: 4,
                },
              ]}
              onPress={() =>
                dataList.tiktok_link && Linking.openURL(dataList.tiktok_link)
              }>
              <AppIcons
                type="Ionicons"
                name="logo-tiktok"
                size={20}
                color={COLORS.white}
              />
            </Pressable>

            {/* YouTube */}
            <Pressable
              style={[
                styles.circlelinkedin,
                {
                  backgroundColor: dataList.youtube_link
                    ? COLORS.red
                    : COLORS.grayed,
                },
              ]}
              onPress={() =>
                dataList.youtube_link && Linking.openURL(dataList.youtube_link)
              }>
              <AppIcons
                type="Feather"
                name="youtube"
                size={20}
                color={COLORS.white}
              />
            </Pressable>
          </View>
        </View>
      </View>
    
      <View style={{marginHorizontal: 15}}>
        <Text style={styles.desc}>
          {dataList.introduction == 'null' || !dataList.introduction
            ? '-'
            : dataList.introduction}
        </Text>

        {dataList.help_with && dataList.help_with.length > 0 && (
          <>
            <Text style={styles.whatHelp}>
              What can I help with / What am I looking for?
            </Text>

            <FlatList
              keyExtractor={item => item.question.toString()}
              data={dataList.help_with}
              showsVerticalScrollIndicator={false}
              renderItem={renderWhatCanHelp}
            />
          </>
        )}

        {/* {dataList?.looking_for && (
          <>
            <Text style={styles.whatHelp}>What am I looking for?</Text>
            <Text
              style={{
                paddingLeft: 16,
                marginTop: 5,
                marginBottom: 10,
                color: COLORS.black,
              }}>
              {dataList.looking_for}
            </Text>
          </>
        )} */}
        {dataList?.can_book_appointment == 1 && (
          <Button
            title="Book Appointment"
            buttonStyle={[DefaultStyle.btnDanger, {marginVertical: 30}]}
            onPress={() => {
              onBookAppointment();
            }}
          />
        )}
      </View>
      <View>
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
  );
};

export default HeaderSection;

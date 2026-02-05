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
} from 'react-native';
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
          <Text style={[styles.name, {fontSize: 18, flexShrink: 1}]}>
            {dataList.fullname == 'null' || !dataList.fullname
              ? '-'
              : dataList.fullname}
            <Text style={[styles.name, {fontSize: 11, marginLeft: 5}]}>
              {` - ${dataList.country_name}`}
            </Text>
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-end',
          }}>
          <Text style={styles.dolar}>
            ${dataList.slot_price === '' ? '0' : dataList.slot_price}
          </Text>
          <Text style={[DefaultStyle.txtblack12, {marginStart: 5}]}>
            per 25 mins
          </Text>
        </View>

        {/* 2nd row: Rating (left), Social icons (right) */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
          }}>
          {/* Left: Rating */}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              style={[DefaultStyle.flexDirection, {alignItems: 'center'}]}
              onPress={onScrollDown}>
              <Rating initialRating={dataList.avg_rating} />
              <Text style={styles.counting}>
                {'(' + dataList.total_rating_users + ')'}
              </Text>
            </TouchableOpacity>
            {dataList.is_education_email_verified == 1 && (
              <Pressable
                onPress={() => {
                  setEmailList(dataList.education_email_verified_hidden);
                  EmailVerifyDialog();
                }}
                style={{marginRight: 8}}>
                <AppIcons
                  type={'MaterialCommunityIcons'}
                  name={'check-decagram'}
                  size={19}
                  color={COLORS.primary}
                />
              </Pressable>
            )}
          </View>

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
            <Text style={styles.whatHelp}>What can I help with?</Text>

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

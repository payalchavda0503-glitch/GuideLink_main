import React from 'react';
import {Image, Linking, Pressable, Text, View} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import LinearGradient from 'react-native-linear-gradient';
import AppIcons from '../../../component/AppIcons';
import CustomRating from '../../../component/CustomRating ';
import {DefaultStyle} from '../../../util/ConstVar';
import {COLORS} from '../../../util/Theme';
import {styles} from './styles';

const List = ({
  item,
  onHandleDeatils,
  onHandleBook,
  onVerifiedEmailClick,
  searchText = '',
}) => {
  const categories = Array.isArray(item?.categories)
    ? item.categories
    : [];

  const primaryCategoryTitleRaw =
    item.category_name ||
    (categories.length > 0
      ? categories[0]?.title || categories[0]?.name || null
      : null);

  const primaryCategoryTitle = primaryCategoryTitleRaw;

  const renderHighlightedText = (text, searchText, textStyle = {}) => {
    if (!text || text === 'null') {
      return <Text style={[DefaultStyle.text, {color: COLORS.black}]}>-</Text>;
    }

    if (!searchText || !text.toLowerCase().includes(searchText.toLowerCase())) {
      return <Text style={textStyle}>{text}</Text>;
    }

    const regex = new RegExp(`(${searchText})`, 'gi');
    const parts = text.split(regex);

    return (
      <Text style={[textStyle, {flexWrap: 'wrap'}]}>
        {parts.map((part, index) => {
          const isMatch = part.toLowerCase() === searchText.toLowerCase();
          return (
            <Text
              key={index}
              style={
                isMatch
                  ? {backgroundColor: COLORS.Yellow, color: COLORS.black}
                  : {}
              }>
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <Pressable
      onPress={() => {
        onHandleDeatils(item.id);
      }}>
      <View style={[DefaultStyle.row, {padding: 10}]}>
        <View style={styles.imageContent}>
          <Image
            source={{uri: item.image_url}}
            style={styles.limage}
            resizeMode="cover"
          />
          {item.slot_price !== 0 && (
            <>
              <Text style={styles.price}>${item.slot_price}</Text>
              <Text style={DefaultStyle.txtPrimary14}>25 mins</Text>
            </>
          )}
        </View>

        <View style={styles.nameContent}>
          <View
            style={[
              DefaultStyle.flexDirection,
              {alignItems: 'center', flexWrap: 'wrap', marginBottom: 5},
            ]}>
            {item.stripe_onboarding_status == 1 && (
              <View style={{marginEnd: 4, marginTop: 2}}>
                <AppIcons
                  type={'FontAwesome'}
                  name={'graduation-cap'}
                  size={15}
                  color={COLORS.black}
                />
              </View>
            )}
            {renderHighlightedText(
              item.fullname || '',
              searchText,
              styles.name,
            )}
            {item.is_education_email_verified && (
              <Pressable
                onPress={() => {
                  onVerifiedEmailClick(item.education_email_verified_hidden);
                }}>
                <Image
                  source={require('../../../assets/images/ic_verify1.png')}
                  resizeMode="contain"
                  style={styles.imgVerify}
                />
              </Pressable>
            )}
            {(item.is_featured === 1 || item.is_featured === '1') && (
              <View
                style={{
                  width: 18,
                  height: 18,
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
                    elevation: 12,
                    shadowColor: COLORS.Yellow,
                    shadowOffset: {width: 0, height: 0},
                    shadowOpacity: 1,
                    shadowRadius: 1,
                  }}>
                  <FontAwesome5
                    name="star"
                    size={10}
                    color={COLORS.Yellow}
                    style={{elevation:10}}
                    solid
                  />
                </View>
              </View>
            )}
          </View>

          {primaryCategoryTitle ? (
            <View style={[styles.categoryPill, {marginTop: 2, marginBottom: 4, alignSelf: 'flex-start'}]}>
              <Text style={styles.categoryPillText}>{primaryCategoryTitle}</Text>
            </View>
          ) : null}

          {item.avg_rating > 0 && (
            <View style={DefaultStyle.flexDirection}>
              <CustomRating
                ratingSize={12}
                initialRating={item.avg_rating}
                isshow={true}
              />
              <Text style={[DefaultStyle.text, {marginStart: 4}]}>
                ({item.total_rating_users})
              </Text>
            </View>
          )}

          <View style={[styles.row, {marginVertical: 5}]}>
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
                  backgroundColor: item.facebook ? COLORS.blue : COLORS.grayed,
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

          <Text
            numberOfLines={searchText ? undefined : 15}
            ellipsizeMode="tail">
            {renderHighlightedText(
              item.introduction == 'null' || !item.introduction
                ? '-'
                : item.introduction,
              searchText,
              [DefaultStyle.text, {color: COLORS.black}],
            )}
          </Text>

          {item.help_with.length > 0 && (
            <>
              <Text style={styles.whatHelp}>What can I help with ?</Text>
              {item.help_with.map((val, index) => (
                <View key={index} style={DefaultStyle.flexDirection}>
                  <AppIcons
                    name={'circle'}
                    type={'FontAwesome'}
                    size={8}
                    color={COLORS.black}
                  />
                  <Text
                    style={[
                      DefaultStyle.txtgray12,
                      {marginLeft: 5, color: COLORS.black},
                    ]}
                    numberOfLines={1}>
                    {val.question}
                  </Text>
                </View>
              ))}
            </>
          )}

          {item.can_book_appointment == 1 && (
            <Pressable
              style={styles.lBtn}
              onPress={() => {
                onHandleBook(item.id);
              }}>
              <Text style={DefaultStyle.txt14bold}>BOOK NOW</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
};

export default List;

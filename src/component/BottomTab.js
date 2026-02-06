import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ic_home from '../assets/images/ic_home.png';
import {COLORS, SIZES} from '../util/Theme';
import Icon from 'react-native-vector-icons/Feather';

const BottomTab = ({onHomePress}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.shadowContainer}>
      <View style={styles.container}>
        {/* Home Section */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            onHomePress?.();
            navigation.navigate('HomeTabIndex');
          }}>
          <View style={styles.iconBox}>
            <Image source={ic_home} style={styles.tabIcon} resizeMode="contain" />
          </View>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            Home
          </Text>
        </TouchableOpacity>

        {/* Posts Section */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            onHomePress?.();
            navigation.navigate('ShowPost', {initialTab: 'post'});
          }}>
          <View style={styles.iconBox}>
            <Icon name="file-text" size={26} color={COLORS.white} />
          </View>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            Post
          </Text>
        </TouchableOpacity>

        {/* Questions Section */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            onHomePress?.();
            navigation.navigate('QuestionAnswers');
          }}>
          <View style={styles.iconBox}>
            <Icon name="message-circle" size={26} color={COLORS.white} />
          </View>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            Questions
          </Text>
        </TouchableOpacity>

        {/* Add (create post) Section */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            onHomePress?.();
            navigation.navigate('AddQuestion', {startTab: 'post'});
          }}>
          <View style={styles.iconBox}>
            <Icon name="plus-circle" size={26} color={COLORS.white} />
          </View>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            Add
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.itemContainer]}
          onPress={() => {
            navigation.navigate('NotificationTabIndex');
          }}>
          <View style={styles.iconBox}>
            <Image
              source={require('../assets/images/notifications.png')}
              style={[styles.tabIcon, {width: 26, height: 26}]}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[styles.text, {fontSize: 11,marginRight:1.5}]}
            numberOfLines={2}
            ellipsizeMode="tail">
            Notifications
          </Text>
        </TouchableOpacity>
      </View>
      <SafeAreaView
        edges={Platform.OS === 'ios' ? [] : ['bottom']}
        style={{backgroundColor: COLORS.primary}}
      />
    </View>
  );
};

export default BottomTab;

const styles = StyleSheet.create({
  shadowContainer: {
    position: 'relative',
    bottom: 0,
    width: '100%',
    alignSelf: 'center',
    //  borderRadius: 100,
    shadowColor: COLORS.black,
    backgroundColor: 'transparent',
  },

  container: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 0,
    paddingBottom: Platform.OS == 'ios' && 25,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 4,
  },

  itemContainer: {
    width: '20%', // 5 tabs => exact equal widths, no extra gaps
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tabIcon: {
    width: 28,
    height: 28,
    tintColor: COLORS.white,
  },
  text: {
    minWidth: 0,
    paddingHorizontal: 4,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.white,
  },
});

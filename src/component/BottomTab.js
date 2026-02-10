import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {Image, Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ic_home from '../assets/images/ic_home.png';
import {COLORS, SIZES} from '../util/Theme';
import Icon from 'react-native-vector-icons/Feather';

const BottomTab = ({onHomePress}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.shadowContainer}>
      <View style={styles.container}>
        {/* Home */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            onHomePress?.();
            navigation.navigate('HomeTabIndex');
          }}>
          <Image source={ic_home} style={styles.tabIcon} resizeMode="contain" />
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            Home
          </Text>
        </TouchableOpacity>

        {/* Feed */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            onHomePress?.();
            navigation.navigate('ShowPost');
          }}>
          <Icon name="layers" size={24} color={COLORS.white} />
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            Feed
          </Text>
        </TouchableOpacity>

        {/* Post (+) - Center create button - LinkedIn style */}
        <TouchableOpacity
          style={styles.centerButton}
          onPress={() => {
            onHomePress?.();
            navigation.navigate('AddQuestion', {startTab: 'post'});
          }}
          activeOpacity={0.8}>
          <View style={styles.centerIconWrapper}>
            <Icon name="plus" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.centerText} numberOfLines={1} ellipsizeMode="tail">
            Post
          </Text>
        </TouchableOpacity>

        {/* Questions */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => {
            onHomePress?.();
            navigation.navigate('QuestionAnswers');
          }}>
          <Icon name="message-circle" size={24} color={COLORS.white} />
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            Questions
          </Text>
        </TouchableOpacity>

        {/* Notifications */}
        <TouchableOpacity
          style={styles.itemContainer}
          onPress={() => navigation.navigate('NotificationTabIndex')}>
          <Image
            source={require('../assets/images/notifications.png')}
            style={[styles.tabIcon, {width: 24, height: 24}]}
            resizeMode="contain"
          />
          <Text style={[styles.text, {fontSize: 10}]} numberOfLines={2}>
            Notifications
          </Text>
        </TouchableOpacity>
      </View>
      <SafeAreaView
        edges={Platform.OS === 'ios' ? [] : ['bottom']}
        style={styles.safeArea}
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
    backgroundColor: 'transparent',
  },

  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.primary,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  itemContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 0,
  },

  tabIcon: {
    width: 24,
    height: 24,
    tintColor: COLORS.white,
    marginBottom: 2,
  },

  text: {
    fontSize: 11,
    color: COLORS.white,
    textAlign: 'center',
  },

  /* Center Post (+) button - LinkedIn-style elevated */
  centerButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    minWidth: 0,
  },

  centerIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  centerText: {
    fontSize: 11,
    color: COLORS.white,
    textAlign: 'center',
  },

  safeArea: {
    backgroundColor: COLORS.primary,
  },
});

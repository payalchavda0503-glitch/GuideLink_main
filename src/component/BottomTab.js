import {useNavigation} from '@react-navigation/native';
import React, {useRef} from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import {SafeAreaView} from 'react-native-safe-area-context';
import Share from 'react-native-share';
import ic_home from '../assets/images/ic_home.png';
import ic_share from '../assets/images/ic_share.png';
import {COLORS, SIZES} from '../util/Theme';
import Icon from 'react-native-vector-icons/Feather';

const BottomTab = ({onHomePress}) => {
  const navigation = useNavigation();
  const base64Ref = useRef(null);

  const onShare = async () => {
    const message =
      'Hey, Download this app and create an account! You can make money by sharing your experiences/ expertise with someone and vice versa.\n\nInstagram: https://shorturl.at/Ke5ED \n\nApple: https://shorturl.at/a5UmR \nAndroid: https://shorturl.at/xSRjQ';

    const imageUrl = 'https://guidelinked.com/logo.jpg';
    const localPath = `${RNFS.CachesDirectoryPath}/app_invite_logo.jpg`;

    try {
      let base64Data = base64Ref.current;

      if (!base64Data) {
        // Download image if not cached
        await RNFS.downloadFile({
          fromUrl: imageUrl,
          toFile: localPath,
        }).promise;

        // Convert image to base64
        base64Data = await RNFS.readFile(localPath, 'base64');
        base64Ref.current = base64Data; // cache it for future shares
      }

      const shareOptions = {
        title: 'Invite Friends',
        message: message,
        url: `data:image/jpeg;base64,${base64Data}`,
        type: 'image/jpeg',
      };

      await Share.open(shareOptions);
    } catch (err) {
      console.log('Sharing failed:', err);
    }
  };

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

        <TouchableOpacity style={styles.itemContainer} onPress={onShare}>
          <View style={styles.iconBox}>
            <Image
              source={ic_share}
              style={[styles.tabIcon, {width: 27, height: 27}]}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            Invite Friends
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.itemContainer}
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

          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
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
    minWidth: 0, // allow ellipsize + equal-width tabs
    maxWidth: 64, // keep labels visually consistent; prevents “tight” look on long labels
    paddingHorizontal: 0,
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.white,
  },
});

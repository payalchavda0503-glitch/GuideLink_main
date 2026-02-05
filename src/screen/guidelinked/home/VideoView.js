import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Platform,
} from 'react-native';
import WebView from 'react-native-webview';
import {COLORS, SIZES} from '../../../util/Theme';
import AppIcons from '../../../component/AppIcons';

const HEADER_HEIGHT = 52;

const VideoView = ({visible, title, onClose, vid}) => {
  const [loading, setLoading] = useState(true);

  return (
    <Modal visible={visible} transparent={false} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onClose}>
            <AppIcons
              name={'arrow-back'}
              type={'MaterialIcons'}
              size={24}
              color={COLORS.black}
            />
          </Pressable>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* WebView */}
        <View style={styles.webViewContainer}>
          <WebView
            source={{
              uri: `https://player.vimeo.com/video/${vid}?autoplay=1&muted=0&title=0&byline=0&portrait=0`,
            }}
            allowsFullscreenVideo
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            style={{flex: 1}}
          />
        </View>

        {/* Activity Indicator */}
        {loading && (
          <ActivityIndicator
            style={styles.loader}
            size={'large'}
            color={COLORS.primary}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    paddingRight: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    color: COLORS.black,
    flex: 1,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    position: 'absolute',
    top: HEADER_HEIGHT + (Platform.OS === 'ios' ? 44 : 0),
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});

export default VideoView;

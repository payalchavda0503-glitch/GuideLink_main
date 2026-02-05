import {
  EmitterSubscription,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  LogBox,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  EventType,
  useZoom,
  VideoAspect,
  ZoomVideoSdkUser,
  ZoomView,
} from '@zoom/react-native-videosdk';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SIZES } from '../../../util/Theme';
import { Button, Card } from '@rneui/themed';
import AppIcons from '../../../component/AppIcons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { DefaultStyle } from '../../../util/ConstVar';
import RemainingTime from './RemainingTime';
import Api from '../../../service/Api';
import {
  API_ZOOM_START_MEETIING,
  API_ZOOM_UPDATE_STATUS,
} from '../../../service/apiEndPoint';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const Call = ({
  FROM,
  videoToken,
  sessionName,
  userName,
  idleTimeout,
  navigation,
  endTime,
  apptId,
}) => {
  const zoom = useZoom();
  const listeners = useRef([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsersInSession] = useState([]);
  const [isInSession, setIsInSession] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const insets = useSafeAreaInsets();


  const sessionJoin = zoom.addListener(EventType.onSessionJoin, async () => {
    try {
      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      console.log('------------onSessionJoin------------');
      const remoteUsers = await zoom.session.getRemoteUsers();
      console.log(remoteUsers);
      //setUsersInSession(remoteUsers);
      //setIsInSession(true);
      setCurrentUser(mySelf);
    } catch (error) {
      console.log('Error during session join:', error);
    }
  });

  const userJoin = zoom.addListener(EventType.onUserJoin, async event => {
    try {
      const { remoteUsers } = event;
      const mySelf = await zoom.session.getMySelf();
      const remote = remoteUsers.map(user => new ZoomVideoSdkUser(user));
      console.log('------------onUserJoin------------');
      console.log(remote);
      setUsersInSession(remote);
      setCurrentUser(mySelf);
      if (remote) {
        setIsInSession(true);
      }
    } catch (error) {
      console.log('Error during user join:', error);
    }
  });

  const userLeave = zoom.addListener(EventType.onUserLeave, async event => {
    try {
      const { remoteUsers } = event;
      const mySelf = await zoom.session.getMySelf();
      const remote = remoteUsers.map(user => new ZoomVideoSdkUser(user));
      setUsersInSession(remote);
      setCurrentUser(mySelf);
      console.log('------------onUserLeave------------');
      console.log(remote);

      if (remote.length == 0) {
        setIsInSession(false);
      }

      console.log('USER LEAVED');
    } catch (error) {
      console.log('Error during user leave:', error);
    }
  });

  const userVideo = zoom.addListener(
    EventType.onUserVideoStatusChanged,
    async event => {
      try {
        const { changedUsers } = event;
        const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
        if (changedUsers.find(user => user.userId === mySelf.userId)) {
          const isVideoOn = await mySelf.videoStatus.isOn();
          setIsVideoMuted(!isVideoOn);
        }
        console.log('VIDEO STATE CHANGE OF USER');
      } catch (error) {
        console.log('Error during video status change:', error);
      }
    },
  );

  const userAudio = zoom.addListener(
    EventType.onUserAudioStatusChanged,
    async event => {
      try {
        const { changedUsers } = event;
        const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
        if (changedUsers.find(user => user.userId === mySelf.userId)) {
          const isMuted = await mySelf.audioStatus.isMuted();
          setIsAudioMuted(isMuted);
        }
        console.log('AUDIO STATE CHANGE OF USER');
      } catch (error) {
        console.log('Error during audio status change:', error);
      }
    },
  );

  listeners.current.push(
    sessionJoin,
    userJoin,
    userLeave,
    userVideo,
    userAudio,
  );

  const sessionLeave = zoom.addListener(EventType.onSessionLeave, () => {
    console.log('onSessionLeave');
    setIsInSession(false);
    setUsersInSession([]);
    sessionLeave.remove();
    listeners.current.forEach(listener => listener.remove());
    listeners.current = [];
  });

  const updateJoinStatus = async () => {
    const response = await Api.get(`${API_ZOOM_UPDATE_STATUS}/${apptId}`);
  };

  const join = async () => {
    console.log('join');

    try {
      await zoom.joinSession({
        sessionName: sessionName,
        sessionPassword: '',
        userName: userName,
        sessionIdleTimeoutMins: idleTimeout,
        token: videoToken,
        audioOptions: {
          connect: true,
          mute: true,
          autoAdjustSpeakerVolume: false,
        },
        videoOptions: { localVideoOn: true },
      });

      const mySelf = new ZoomVideoSdkUser(await zoom.session.getMySelf());
      // console.log("JOINING------------", mySelf)
      // setUsersInSession([mySelf]);

      console.log('------------join------------');

      setCurrentUser(mySelf);

      updateJoinStatus();
      //setIsInSession(true);
    } catch (e) {
      console.error('Error joining session:', e);
    }
  };

  const leaveSession = () => {
    console.log('leaveSession');
    try {
      zoom.leaveSession(false);
      setIsInSession(false);
      listeners.current.forEach(listener => listener.remove());
      listeners.current = [];
      zoom.cleanup();

      if (FROM == 0) {
        navigation.goBack();
      } else {
        navigation.pop(2);
      }
    } catch (e) {
      console.error('Error leaving session:', e);
    }
  };

  const { height, width } = Dimensions.get('window');

  useFocusEffect(
    useCallback(() => {
      join();

      return () => {
        console.log('Leave Session called');

        leaveSession();
      };
    }, []),
  );

  useEffect(() => {
    return () => {
      listeners.current.forEach(listener => listener.remove());
      listeners.current = [];
    };
  }, []);

  return (
    <View
      style={{ flexDirection: 'row', flex: 1, backgroundColor: COLORS.white }}>
      <View
        style={[
          styles.container,
          { flex: 1, height: SIZES.height, backgroundColor: COLORS.white },
        ]}>
        <View style={{ position: 'relative', zIndex: 9999 }}>
          <RemainingTime
            targetTime={endTime}
            onTimeUp={() => {
              leaveSession();
            }}
          />
        </View>

        <View
          style={[
            styles.container,
            {
              backgroundColor: COLORS.white,
              width: SIZES.width,
              flex: 1,
              position: 'relative',
              zIndex: 9998,
            },
          ]}
          key={'user_remote'}>
          {isInSession ? (
            users.map(user => (
              <ZoomView
                style={[
                  styles.container,
                  {
                    width: SIZES.width,
                    height: SIZES.height,
                    backgroundColor: COLORS.black,
                  },
                ]}
                userId={user.userId}
                fullScreen
                videoAspect={VideoAspect.PanAndScan}
              />
            ))
          ) : (
            <View
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                backgroundColor: COLORS.white,
              }}>
              <ActivityIndicator
                style={{ alignSelf: 'center' }}
                size={'large'}
                color={COLORS.primary}
              />
              <Text style={{ marginTop: 0, fontSize: 16 }}>
                Waiting for other user to join
              </Text>
            </View>
          )}

          {/* {users.map((user) => (
                    <ZoomView
                      style={[styles.container, {width: SIZES.width, height: SIZES.height}]}
                      userId={user.userId}
                      fullScreen
                      videoAspect={VideoAspect.PanAndScan}
                    />
                ))} */}
        </View>

        <Card
          overflow={'hidden'}
          containerStyle={[
            styles.container,
            {
              height: SIZES.height / 4,
              width: SIZES.width / 3,
              position: 'absolute',
              backgroundColor: COLORS.black2,
              zIndex: 9999,
              right: 0,
              bottom: 130,
              borderRadius: 10,
              elevation: 1,
              overflow: 'hidden',
            },
          ]}
          key={'user_current'}>
          {currentUser && (
            <>
              <ZoomView
                style={[
                  styles.container,
                  {
                    height: SIZES.height / 4,
                    width: SIZES.width / 3,
                    borderRadius: 10,
                  },
                ]}
                userId={currentUser.userId}
                fullScreen={false}
                videoAspect={VideoAspect.PanAndScan}
              />
            </>
          )}
        </Card>

        <SafeAreaView
          style={[
            styles.container,
            {
              width: SIZES.width,
              flex: 1,
              position: 'absolute',
              zIndex: 9999,
              left: 0,
              minHeight: 100,
              bottom: insets.bottom > 0 ? insets.bottom : 20,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 30,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}>
          <MuteButtons isAudioMuted={isAudioMuted} isVideoMuted={isVideoMuted}>
            {/* <Button title="Leave Session" color={"#f01040"} onPress={leaveSession} /> */}
            <ViewsIcon
              iconColor={COLORS.gray2}
              padding={20}
              size={42}
              color={COLORS.red}
              name={'call-end'}
              onCLick={() => {
                leaveSession();
              }}
              type={'MaterialIcons'}
            />
          </MuteButtons>
        </SafeAreaView>
      </View>
    </View>
  );
};

export default Call;

const ViewsIcon = ({ name, type, size, padding, color, iconColor, onCLick }) => {
  return (
    <Pressable
      onPress={() => {
        onCLick && onCLick();
      }}>
      <Card
        containerStyle={{
          padding: padding || 15,
          marginHorizontal: 15,
          borderRadius: 100,
          elevation: 5,
          backgroundColor: color || COLORS.white,
          borderColor: color || COLORS.white,
          overflow: 'hidden',
        }}>
        <AppIcons
          name={name}
          type={type}
          size={size || 28}
          color={iconColor || COLORS.black}
        />
      </Card>
    </Pressable>
  );
};

const MuteButtons = ({ isAudioMuted, isVideoMuted, children }) => {
  const zoom = useZoom();
  const onPressAudio = async () => {
    try {
      const mySelf = await zoom.session.getMySelf();
      const audioHelper = zoom.audioHelper;
      if (!audioHelper || !mySelf) return;

      const muted = await mySelf.audioStatus.isMuted();
      muted
        ? await audioHelper.unmuteAudio(mySelf.userId)
        : await audioHelper.muteAudio(mySelf.userId);
    } catch (error) {
      console.log('Error toggling audio:', error);
    }
  };

  const onPressVideo = async () => {
    try {
      const mySelf = await zoom.session.getMySelf();
      const videoHelper = zoom.videoHelper;
      if (!videoHelper || !mySelf) return;

      const videoOn = await mySelf.videoStatus.isOn();
      videoOn ? await videoHelper.stopVideo() : await videoHelper.startVideo();
    } catch (error) {
      console.log('Error toggling video:', error);
    }
  };

  return (
    <View style={styles.buttonHolder}>
      {/* <Button title={isAudioMuted ? "Unmute Audio" : "Mute Audio"} onPress={onPressAudio} /> */}

      <ViewsIcon
        name={isAudioMuted ? 'volume-mute-outline' : 'volume-high-outline'}
        onCLick={onPressAudio}
        type={'Ionicons'}
      />

      {children}

      <ViewsIcon
        name={isVideoMuted ? 'video-off' : 'video'}
        onCLick={onPressVideo}
        type={'Feather'}
      />

      {/* <Button title={isVideoMuted ? "Unmute Video" : "Mute Video"} onPress={onPressVideo} /> */}
    </View>
  );
};

export const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    justifyContent: 'center',
  },
  spacer: {
    height: 16,
    width: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
  },
  buttonHolder: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    margin: 8,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});

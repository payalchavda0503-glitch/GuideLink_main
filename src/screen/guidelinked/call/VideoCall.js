import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS} from '../../../util/Theme';
import {DefaultStyle} from '../../../util/ConstVar';
import {useFocusEffect} from '@react-navigation/native';
import {API_ZOOM_START_MEETIING} from '../../../service/apiEndPoint';
import Api from '../../../service/Api';
import {ZoomVideoSdkProvider} from '@zoom/react-native-videosdk';
import Call from './Call';
import {usePermission} from '../../../util/AskPermission';
import IosStatusBar from '../../../component/IosStatusBar';
import {SafeAreaView} from 'react-native-safe-area-context';

const HEADER_BAR_HEIGHT = 92;

const VideoCall = ({navigation, route}) => {
  let APPT_ID = route.params.ID;
  let FROM = route.params.FROM;

  const [videoToken, setVideoToken] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [userName, setUserName] = useState('');
  const [endTime, setEndTime] = useState('');

  const [idleTimeout, setIdleTimeout] = useState(20);

  const [loader, setLoader] = useState(true);

  const joinMeeting = async () => {
    setLoader(true);

    const response = await Api.get(`${API_ZOOM_START_MEETIING}/${APPT_ID}`);

    if (response.status == 'RC200') {
      let data = response.data;
      console.log(data);

      setVideoToken(data.token);
      setSessionName(data.session_name);
      setUserName(data.username);
      setIdleTimeout(data.idle_timeout);
      setEndTime(data.end_time);
    }

    setLoader(false);
  };

  useFocusEffect(
    useCallback(() => {
      joinMeeting();
    }, []),
  );

  usePermission();

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />
      <SafeAreaView
        style={[DefaultStyle.flexView, {backgroundColor: COLORS.gray2}]}>
        <ZoomVideoSdkProvider
          config={{
            appGroupId: 'group.test.sdk1',
            domain: 'zoom.us',
            enableLog: false,
          }}>
          <ScreenStatusBar
            backgroundColor={COLORS.primary}
            barStyle="dark-content"
          />

          <View
            style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
            {loader ? (
              <ActivityIndicator
                style={{alignSelf: 'center', marginTop: 20}}
                size={'large'}
                color={COLORS.primary}
              />
            ) : (
              <Call
                FROM={FROM}
                apptId={APPT_ID}
                endTime={endTime}
                videoToken={videoToken}
                sessionName={sessionName}
                userName={userName}
                idleTimeout={idleTimeout}
                navigation={navigation}
              />
            )}
          </View>
        </ZoomVideoSdkProvider>
      </SafeAreaView>
    </>
  );
};

const style = StyleSheet.create({
  content: {},
});
export default VideoCall;

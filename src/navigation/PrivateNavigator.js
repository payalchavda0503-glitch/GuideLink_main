import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet} from 'react-native';
import IosStatusBar from '../component/IosStatusBar';
import Mainscreen from '../screen/guidelinked/Main/MainIndex';
import OnboardingProcess from '../screen/guidelinked/availibility/OnboardingProcess';
import BookAppointment from '../screen/guidelinked/bookAppointment';
import BookingThankYou from '../screen/guidelinked/bookAppointment/BookingThankYou';
import CallScreen from '../screen/guidelinked/call/CallScreen';
import ChargePayment from '../screen/guidelinked/call/ChargePayment';
import VideoCall from '../screen/guidelinked/call/VideoCall';
import AllExpertList from '../screen/guidelinked/expert/AllExpertList';
import ExpertDetail from '../screen/guidelinked/expert/ExpertDetail';
import NotificationIndex from '../screen/guidelinked/notification/NotificationIndex';
import AddQuestion from '../screen/guidelinked/home/AddQuestion';
import ShowPost from '../screen/guidelinked/home/ShowPost';
import SampleProfiles from '../screen/guidelinked/profile/SampleProfiles';
import HelpVideos from '../screen/guidelinked/work/HelpVideos';
import NetworkError from '../screen/internet/NetworkError';
import {ScreenStatusBar} from '../util/ScreenStatusBar';
import {COLORS} from '../util/Theme';

const PrivateNavigator = () => {
  const Stack = createNativeStackNavigator();

  return (
    <>
      <ScreenStatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Mainscreen" component={Mainscreen} />
        <Stack.Screen name="ExpertDetail" component={ExpertDetail} />
        <Stack.Screen name="OnboardingProcess" component={OnboardingProcess} />
        <Stack.Screen name="ChargePayment" component={ChargePayment} />
        <Stack.Screen name="CallScreen" component={CallScreen} />

        <Stack.Screen name="BookAppointment" component={BookAppointment} />
        <Stack.Screen name="BookingThankYou" component={BookingThankYou} />

        <Stack.Screen name="SampleProfiles" component={SampleProfiles} />
        <Stack.Screen name="HelpVideos" component={HelpVideos} />

        <Stack.Screen name="NotificationIndex" component={NotificationIndex} />
        <Stack.Screen name="AllExpertList" component={AllExpertList} />
        <Stack.Screen name="NetworkError" component={NetworkError} />
        <Stack.Screen name="VideoCall" component={VideoCall} />
        <Stack.Screen name="AddQuestion" component={AddQuestion} />
        <Stack.Screen name="ShowPost" component={ShowPost} />

        <Stack.Screen name="IosStatusBar" component={IosStatusBar} />

        {/* <Stack.Screen name="Login" component={LoginIndex} /> */}
      </Stack.Navigator>
    </>
  );
};

export default PrivateNavigator;

const styles = StyleSheet.create({});

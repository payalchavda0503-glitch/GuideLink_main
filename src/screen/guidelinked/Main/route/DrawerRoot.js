import {createDrawerNavigator} from '@react-navigation/drawer';
import React from 'react';
import {COLORS, SIZES} from '../../../../util/Theme';
import ChangePasswordIndex from '../../../changePassword/ChangePasswordIndex';
import AboutUsIndex from '../../aboutus/AboutUsIndex';
import AccountSetting from '../../account/AccountSetting';
import AvailibilityIndex from '../../availibility/Index';
import BookingIndex from '../../booking/BookingIndex';
import Contactndex from '../../contactus/Contactndex';
import EarningIndex from '../../earning/EarningIndex';
import ExpertIndex from '../../expert';
import FAQScreen from '../../faq/faq';
import RequestGuidanceScreen from '../../home/BrowseRequest';
import HomeIndex from '../../home/HomeIndex';
import ShowPost from '../../home/ShowPost';
import QuestionAnswers from '../../home/QuestionAnswers';
import MyTimeline from '../../home/MyTimeline';
import NotificationIndex from '../../notification/NotificationIndex';
import ProfileIndex from '../../profile/ProfileIndex';
import LinkSocialProfileIndex from '../../socialProfile/LinkSocialProfileIndex';
import TermConditionIndex from '../../termCondition/TermConditionIndex';
import EmailVerifyIndex from '../../verify/Index';
import HowWorkIndex from '../../work/HowWorkIndex';
import CustomDrawer from './CustomDrawer';

const Drawer = createDrawerNavigator();
const DrawerRoot = () => {
  return (
    <>
      <Drawer.Navigator
        screenOptions={{
          headerShown: false,
          overlayColor: 'rgba(0,0,0,0.5)',
          drawerStyle: {
            backgroundColor: COLORS.white,
            width: SIZES.width * 0.85,
            shadowColor: COLORS.black,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.85,
            shadowRadius: 3.84,
            elevation: 1,
          },
        }}
        drawerContent={props => <CustomDrawer {...props} />}>
        <Drawer.Screen name="HomeTabIndex" component={HomeIndex} />
        <Drawer.Screen name="ShowPost" component={ShowPost} />
        <Drawer.Screen name="QuestionAnswers" component={QuestionAnswers} />
        <Drawer.Screen name="MyTimeline" component={MyTimeline} />
        <Drawer.Screen name="ProfileTabIndex" component={ProfileIndex} />
        <Drawer.Screen name="BookingTabIndex" component={BookingIndex} />
        <Drawer.Screen
          name="AvailibilityTabIndex"
          component={AvailibilityIndex}
        />
        <Drawer.Screen
          name="EmailVerifyTabIndex"
          component={EmailVerifyIndex}
        />
        <Drawer.Screen
          name="NotificationTabIndex"
          component={NotificationIndex}
        />
        <Drawer.Screen name="AboutUsTabIndex" component={AboutUsIndex} />
        <Drawer.Screen name="ContactTabIndex" component={Contactndex} />
        <Drawer.Screen
          name="ChangePasswordIndex"
          component={ChangePasswordIndex}
        />
        <Drawer.Screen name="ExpertIndex" component={ExpertIndex} />
        <Drawer.Screen
          name="RequestGuidanceScreen"
          component={RequestGuidanceScreen}
        />
        <Drawer.Screen name="AccountSetting" component={AccountSetting} />
        <Drawer.Screen name="FAQScreen" component={FAQScreen} />
        <Drawer.Screen name="EarningIndex" component={EarningIndex} />
        <Drawer.Screen name="HowWorkIndex" component={HowWorkIndex} />
        <Drawer.Screen
          name="LinkSocialProfileIndex"
          component={LinkSocialProfileIndex}
        />

        <Drawer.Screen
          name="TermConditionIndex"
          component={TermConditionIndex}
        />
      </Drawer.Navigator>
    </>
  );
};

export default DrawerRoot;

import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Registarion from '../screen/registration/RegisterationIndex';
import ForgotPassword from '../screen/forgot/ForgotPasswordIndex';
import Mainscreen from '../screen/guidelinked/Main/MainIndex';
import ResetPasswordIndex from '../screen/forgot/ResetPasswordIndex';
import LoginIndex from '../screen/login/LoginIndex';
import NetworkError from '../screen/internet/NetworkError';
import CustomWebview from '../component/CustomWebview';

const PublicNaviagtion = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginIndex} />
      <Stack.Screen name="Registarion" component={Registarion} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="ResetPasswordIndex" component={ResetPasswordIndex} />
      <Stack.Screen name="Main" component={Mainscreen} />
      <Stack.Screen name="NetworkError" component={NetworkError} />
      <Stack.Screen name="CustomWebview" component={CustomWebview} />
    </Stack.Navigator>
  );
};

export default PublicNaviagtion;

import {Button} from '@rneui/themed';
import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import PasswordInput from '../../component/PasswordInput';
import {DefaultStyle} from '../../util/ConstVar';
import {COLORS} from '../../util/Theme';
import {styles} from './styles';

import Api from '../../service/Api';
import Loader from '../../util/Loader';
import {log} from '../../util/Toast';

import {ScrollView} from 'react-native';
import {useDispatch} from 'react-redux';
import AppIcons from '../../component/AppIcons';
import {showToast} from '../../redux/toastSlice';
import {API_POST_RESET_PASSWORD} from '../../service/apiEndPoint';

const ResetPasswordIndex = ({navigation, route}) => {
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loaderVisible, setLoaderVisible] = useState(false);
  const dispatch = useDispatch();
  const onChangePassword = async () => {
    if (!password) {
      dispatch(showToast('Please enter new password'));
    } else if (!confirmPass) {
      dispatch(showToast('Please re-enter password'));
    } else {
      try {
        setLoaderVisible(true);
        const data = {
          password: password,
          confirm_password: confirmPass,
          email: route.params.email,
          otp: route.params.otp,
        };
        console.log(API_POST_RESET_PASSWORD, data);
        const response = await Api.post(API_POST_RESET_PASSWORD, data);
        setLoaderVisible(false);

        if (response.status == 'RC200') {
          navigation.reset({routes: [{name: 'Login'}]});
        }
      } catch (error) {
        log(error);
        setLoaderVisible(false);
      }
    }
  };

  return (
    <SafeAreaView style={DefaultStyle.flexView}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={DefaultStyle.flexDirection}>
            <Pressable
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
              onPress={() => {
                navigation.goBack();
              }}>
              <AppIcons
                type={'Ionicons'}
                name={'arrow-back-circle'}
                size={26}
                color={COLORS.black}
              />
            </Pressable>
            <Text style={styles.back}>Back</Text>
          </View>
          <View style={styles.container}>
            <Text style={[styles.forgotPass, {marginTop: 50}]}>
              Reset Password
            </Text>

            <View style={{marginHorizontal: 15}}>
              <Text
                style={{
                  fontSize: 14,
                  marginBottom: 20,
                  color: COLORS.black,
                  textAlign: 'center',
                }}>
                Minimum 8 characters including one each of Uppercase, Lowercase,
                Number & Special Character
              </Text>

              <PasswordInput password={password} setPassword={setPassword} />
              <PasswordInput
                placeholder={'Re-enter Password'}
                password={confirmPass}
                setPassword={setConfirmPass}
              />

              <Button
                title="SUBMIT"
                buttonStyle={[DefaultStyle.btnLogin, {marginTop: 20}]}
                onPress={onChangePassword}
              />
            </View>
          </View>
          <Loader
            loaderVisible={loaderVisible}
            setLoaderVisible={setLoaderVisible}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordIndex;

import {Button} from '@rneui/themed';
import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, View} from 'react-native';
import AppHeader from '../../component/AppHeader';
import PasswordInput from '../../component/PasswordInput';
import Api from '../../service/Api';
import {DefaultStyle} from '../../util/ConstVar';
import Loader from '../../util/Loader';
import {COLORS, SIZES} from '../../util/Theme';
import {styles} from './styles';
//import {showToast} from '../../util/Toast';

import {ScrollView} from 'react-native';
import {useDispatch} from 'react-redux';
import BottomTab from '../../component/BottomTab';
import IosStatusBar from '../../component/IosStatusBar';
import {showToast} from '../../redux/toastSlice';
import {API_POST_CHANGE_PASSWORD} from '../../service/apiEndPoint';
import {log} from '../../util/Toast';

const ChangePasswordIndex = ({navigation}) => {
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const dispatch = useDispatch();

  const onChangePassword = async () => {
    if (!currentPassword) {
      dispatch(showToast('Please enter current password'));
    } else if (!password) {
      //showToast('please enter new password');
      dispatch(showToast('Please enter new password'));
    } else if (!confirmPass) {
      //showToast('Please enter confirm password');
      dispatch(showToast('Please enter re-enter password'));
    } else {
      try {
        setLoaderVisible(true);
        const data = {
          password: password,
          confirm_password: confirmPass,
          current_password: currentPassword,
        };
        const response = await Api.post(API_POST_CHANGE_PASSWORD, data);
        setLoaderVisible(false);

        if (response.status == 'RC200') {
          setPassword('');
          setConfirmPass('');
          setCurrentPassword('');
          navigation.goBack();
        }
      } catch (error) {
        log(error);
        setLoaderVisible(false);
      }
    }
  };

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <View style={{flex: 1}}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <AppHeader
              background={COLORS.primary}
              iconType={'Feather'}
              iconName={'menu'}
              iconColor={COLORS.white}
              navigation={navigation}
              tittle={'Change Password'}
              titleColor={COLORS.white}
            />
            <View style={styles.container}>
              <View style={{paddingBottom: SIZES.height * 0.1}}>
                <PasswordInput
                  password={currentPassword}
                  setPassword={setCurrentPassword}
                  placeholder="Current Password"
                />

                <PasswordInput
                  password={password}
                  setPassword={setPassword}
                  placeholder="New Password"
                />
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
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <View style={{position: 'absolute', bottom: 0}}>
        <BottomTab />
      </View>
      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </>
  );
};

export default ChangePasswordIndex;

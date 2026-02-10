import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import PhoneInput from 'react-native-phone-number-input';
import {useDispatch} from 'react-redux';
import {logout, profile} from '../../../redux/AuthSlice';
import Api from '../../../service/Api';
import {DefaultStyle} from '../../../util/ConstVar';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import {log} from '../../../util/Toast';
import {styles} from './styles';

import {
  API_DELETE,
  API_GET_PROFILE,
  API_TIMEZONE,
  API_UPDATE_PERSONAL_PROFILE,
} from '../../../service/apiEndPoint';

import AppHeader from '../../../component/AppHeader';
import BottomTab from '../../../component/BottomTab';
import IosStatusBar from '../../../component/IosStatusBar';
import LoaderV2 from '../../../component/LoaderV2';
import {CustomDeleteDialog} from '../../../component/customDialog';
import {showToast} from '../../../redux/toastSlice';

const AccountSetting = ({navigation}) => {
  const dispatch = useDispatch();
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const isDeleteDialog = () => {
    setIsDelete(!isDelete);
  };

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [countryChar, setCountryChar] = useState('IN');
  const [timeZone, setTimeZone] = useState(null);
  const [isTimeZone, setIsTimeZone] = useState(false);
  const [timeZoneList, setTimeZoneList] = useState([]);

  const profieSave = async () => {
    if (!name) {
      dispatch(showToast('Please enter full name'));
    } else if (!userName) {
      dispatch(showToast('Please enter username'));
    } else if (!phone) {
      dispatch(showToast('Please enter phone number'));
    } else {
      try {
        const formdata = new FormData();
        formdata.append('name', name);
        formdata.append('username', userName);
        formdata.append('emaail', email);
        formdata.append('country_code', countryCode);
        formdata.append('country_region', countryChar);
        formdata.append('phone_number', phone);
        formdata.append('timezone', timeZone);

        setLoaderVisible(true);
        const response = await Api.post(API_UPDATE_PERSONAL_PROFILE, formdata);

        dispatch(profile({name: name, email: email, phone: phone}));

        setLoaderVisible(false);
        if (response.status == 'RC200') {
        }
      } catch (error) {
        log(error);
        setLoaderVisible(false);
      }
    }
  };
  const getTimeZone = async () => {
    try {
      const response = await Api.get(API_TIMEZONE);

      //console.log(response);
      if (response.status === 'RC200') {
        const data = response.data.map((item, index) => ({
          label: item.name,
          value: item.value,
        }));
        setTimeZoneList(data);
        // return { label: item.name, value: item.id };
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getProfile = async () => {
    try {
      setLoaderVisible(true);
      const response = await Api.get(API_GET_PROFILE);

      if (response.status == 'RC200') {
        let result = response.data;

        if (result.email == 'null' || result.email == null) {
        } else {
          setEmail(result.email);
        }

        if (result.username == 'null' || result.username == null) {
        } else {
          setUserName(result.username);
        }

        if (result.fullname == 'null' || result.fullname == null) {
        } else {
          setName(result.fullname);
        }

        if (!result.phone_number || result.phone_number == 'null') {
        } else {
          setPhone(result.phone_number);
        }

        if (result.timezone != 'null' && result.timezone != null) {
          setTimeZone(result.timezone);
        }

        if (result.country_region != null && result.country_region != 'null') {
          setCountryChar(result.country_region);
        }

        if (result.country_code != null && result.country_code != 'null') {
          setCountryCode(result?.country_code);
        }
        setLoaderVisible(false);
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  const onDeleteAccount = async () => {
    try {
      setLoaderVisible(true);
      const res = await Api.get(`${API_DELETE}`);
      isDeleteDialog();

      console.log(res);
      if (res.status == 'RC200') {
        setLoaderVisible(false);
        dispatch(logout());
        clearStorage();
        navigation.navigate('Login');
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getTimeZone();
      getProfile();
    }, []),
  );

  const safeDefaultCode =
    typeof countryChar === 'string' && countryChar.length === 2
      ? countryChar.toUpperCase()
      : 'IN';

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <AppHeader
        background={COLORS.primary}
        iconType={'Feather'}
        iconName={'menu'}
        iconColor={COLORS.white}
        navigation={navigation}
        tittle={'Account Details'}
        titleColor={COLORS.white}
      />
      <ScreenStatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
      />
      <View style={{flex: 1}}>
        <ScrollView
          automaticallyAdjustKeyboardInsets={true}
          showsVerticalScrollIndicator={false}>
          <LoaderV2 loaderVisible={loaderVisible}>
            <View style={{padding: 20}}>
              <Text style={styles.label}>First & Last Name</Text>
              <TextInput
                style={[styles.input]}
                keyboardType="default"
                placeholder={'First & Last Name'}
                value={name}
                onChangeText={setName}
                placeholderTextColor={COLORS.gray}
              />

              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, {backgroundColor: COLORS.disabled}]}
                keyboardType="default"
                placeholder={
                  'Username' // Multiline string directly specified
                }
                value={userName}
                onChangeText={setUserName}
                placeholderTextColor={COLORS.gray}
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={[styles.input, {backgroundColor: COLORS.disabled}]}
                keyboardType="default"
                placeholder={'Email Address'}
                value={email}
                editable={false}
                onChangeText={setEmail}
                placeholderTextColor={COLORS.gray}
              />

              <Text style={styles.label}>Phone Number</Text>
              <View>
                <PhoneInput
                  value={phone}
                  defaultCode={safeDefaultCode}
                  disableArrowIcon={false}
                  textSearchProps={{placeholder: 'Enter country name'}}
                  placeholder="Phone Number"
                  layout="first"
                  containerStyle={styles.phoneContainerStyle}
                  textContainerStyle={styles.phoneTextContainerStyle}
                  flagButtonStyle={styles.phoneFlagBtnStyle}
                  onChangeText={text => {
                    setPhone(text);
                  }}
                  textInputStyle={styles.phoneTextInputStyle}
                  onChangeCountry={txt => {
                    if (txt?.cca2) {
                      setCountryChar(txt.cca2);
                    }
                    if (Array.isArray(txt?.callingCode) && txt.callingCode.length > 0) {
                      setCountryCode(txt.callingCode[0] ?? '');
                    }
                  }}
                  withDarkTheme={false}
                  codeTextStyle={[styles.countrycodeStyle]}
                />
              </View>

              <Text style={styles.label}>Timezone</Text>
              <DropDownPicker
                open={isTimeZone}
                setOpen={setIsTimeZone}
                value={timeZone}
                items={timeZoneList}
                onSelectItem={val => {
                  setTimeZone(val.value);
                }}
                searchable
                listMode="MODAL"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
                searchPlaceholder="Search Timezone"
                searchPlaceholderTextColor={COLORS.black}
                searchTextInputStyle={[
                  styles.input,
                  {
                    fontSize: 15,
                  },
                ]}
                searchContainerStyle={{
                  borderBottomWidth: 0,
                  paddingBottom: 4,
                }}
                closeIconStyle={{
                  marginBottom: 15,
                }}
                labelStyle={styles.dropdownTitle}
                listItemLabelStyle={styles.dropdownLabel}
                arrowIconStyle={styles.dropdownicon}
                autoScroll={false}
                style={styles.dropdoenContainer}
                placeholderStyle={{color: COLORS.gray}}
                placeholder="Select Timezone"
              />
              <View>
                <TouchableOpacity
                  onPress={profieSave}
                  style={[
                    DefaultStyle.btnDanger,
                    {paddingVertical: 10, backgroundColor: COLORS.primary},
                  ]}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontWeight: 'bold',
                      fontSize: 14,
                    }}>
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={[
                styles.card,
                {alignSelf: 'center', marginBottom: SIZES.height * 0.2},
              ]}>
              <View style={{paddingHorizontal: 15}}>
                <Text
                  style={[
                    DefaultStyle.textH1,
                    {marginTop: 8, color: COLORS.black},
                  ]}>
                  Delete Your Account
                </Text>
                <Text
                  style={[
                    DefaultStyle.txt14,
                    {marginTop: 15, color: COLORS.gray},
                  ]}>
                  All your data will be permanently deleted from our server.
                </Text>

                <TouchableOpacity
                  onPress={isDeleteDialog}
                  style={[
                    DefaultStyle.btnDanger,
                    {paddingVertical: 10, backgroundColor: COLORS.primary},
                  ]}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontWeight: 'bold',
                      fontSize: 14,
                    }}>
                    Delete Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LoaderV2>

          <CustomDeleteDialog
            visible={isDelete}
            onClose={isDeleteDialog}
            onDelete={() => {
              onDeleteAccount();
            }}
          />
        </ScrollView>
      </View>
      <View>
        <BottomTab />
      </View>
    </>
  );
};

export default AccountSetting;

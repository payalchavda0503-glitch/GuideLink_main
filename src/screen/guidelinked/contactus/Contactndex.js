import {Button} from '@rneui/themed';
import React, {useCallback, useRef, useState} from 'react';
import {Platform, ScrollView, Text, TextInput, View} from 'react-native';
import AppHeader from '../../../component/AppHeader';
import BottomTab from '../../../component/BottomTab';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS} from '../../../util/Theme';
import {styles} from './styles';
//import {showToast} from '../../../util/Toast';
import {useFocusEffect} from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import PhoneInput from 'react-native-phone-number-input';
import {useDispatch} from 'react-redux';
import IosStatusBar from '../../../component/IosStatusBar';
import LoaderV2 from '../../../component/LoaderV2';
import {showToast} from '../../../redux/toastSlice';
import Api from '../../../service/Api';
import {API_CONTACTUS, API_GET_PROFILE} from '../../../service/apiEndPoint';

const Contactndex = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState(null);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [region, setRegion] = useState('US');
  const dispatch = useDispatch();
  const emailRef = useRef();

  const [isContact, setIsContact] = useState(false);
  const contactList = [
    {label: 'Complaint', value: 0},
    {label: 'General feedback', value: 1},
    {label: 'Facing issue in the App', value: 2},
    {label: 'Other', value: 3},
  ];

  const getProfile = async () => {
    try {
      setLoaderVisible(true);
      const response = await Api.get(API_GET_PROFILE);

      if (response.status == 'RC200') {
        let result = response.data;

        setName(result?.fullname);
        setEmail(result?.email);
        setPhone(result?.phone_number);
        setRegion(result?.country_region);
        setCountryCode(result.country_code);
        setLoaderVisible(false);
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  const onContactUs = async () => {
    if (!name.trim()) {
      dispatch(showToast('Please enter name'));
    } else if (!email.trim()) {
      dispatch(showToast('Please enter email address'));
    } else if (!phone.trim()) {
      dispatch(showToast('Please enter phone number'));
    } else if (contact == null) {
      dispatch(showToast('Please select a reason to contact us'));
    } else if (!message.trim()) {
      dispatch(showToast('Please enter message'));
    } else {
      try {
        setLoaderVisible(true);
        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('country_code', countryCode);
        data.append('phone', phone);
        data.append('reason', contact);
        data.append('message', message);

        console.log(data);
        const res = await Api.post(API_CONTACTUS, data);
        setLoaderVisible(false);

        if (res.status == 'RC200') {
          reset();
        }
      } catch (error) {
        console.log(error);
        setLoaderVisible(false);
      }
    }
  };

  const reset = () => {
    setMessage('');
    setContact(null);
    setCountryCode('');
  };

  useFocusEffect(
    useCallback(() => {
      getProfile();
    }, []),
  );

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <ScreenStatusBar
        backgroundColor={COLORS.primary}
        barStyle="dark-content"
      />
      <AppHeader
        background={COLORS.primary}
        iconType={'Feather'}
        iconName={'menu'}
        iconColor={COLORS.white}
        navigation={navigation}
        tittle={'Contact Us / Feedback'}
        titleColor={COLORS.white}
      />

      <View style={{flex: 1}}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
          scrollEnabled={true}>
          {/* <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          > */}
          <LoaderV2 loaderVisible={loaderVisible}>
            <View
              style={{
                marginVertical: 10,
                marginHorizontal: 20,
                alignSelf: 'center',
              }}>
              <Text style={styles.title}>
                Please fill the form below and our team will respond to you.
              </Text>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                keyboardType="default"
                placeholder="Enter Name*"
                value={name}
                onChangeText={setName}
                placeholderTextColor={COLORS.gray}
              />
              {/* onSubmitEditing={() => emailRef.current.focus()} */}

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                placeholder="Enter Eamil"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={COLORS.gray}
              />
              {/* ref={emailRef} */}

              <Text style={styles.label}>Phone</Text>
              <PhoneInput
                value={phone}
                defaultCode={region}
                disableArrowIcon={false}
                textSearchProps={{placeholder: 'Enter country name'}}
                placeholder="Phone Number"
                layout="first"
                onChangeText={text => {
                  setPhone(text);
                }}
                onChangeCountry={txt => {
                  setRegion(txt.cca2);
                  setCountryCode(txt.callingCode[0]);
                }}
                textInputStyle={styles.phoneTextInputStyle}
                containerStyle={[styles.phoneContainerStyle]}
                textContainerStyle={[styles.phoneTextContainerStyle]}
                flagButtonStyle={[styles.phoneFlugBtnStyle, {}]}
                withDarkTheme={false}
                codeTextStyle={[styles.countrycodeStyle, {}]}
              />

              <Text style={styles.label}>Reason to Contact</Text>
              <View style={{flex: 1}}>
                <DropDownPicker
                  open={isContact}
                  setOpen={setIsContact}
                  value={contact}
                  items={contactList}
                  onSelectItem={val => {
                    setContact(val.value);
                  }}
                  searchable
                  listMode="MODAL"
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                  searchPlaceholder="Search Reason"
                  placeholder="Reason to Contact"
                  labelStyle={styles.dropdownLabel}
                  arrowIconStyle={styles.dropdownicon}
                  autoScroll={false}
                  placeholderStyle={{color: COLORS.gray}}
                  style={styles.dropdoenContainer}
                  listItemLabelStyle={styles.dropdownLabel}
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
                />
              </View>

              <Text style={styles.label}>Message</Text>
              <TextInput
                keyboardType="default"
                textAlignVertical="top"
                numberOfLines={4}
                maxLength={150}
                multiline={true}
                placeholder="Enter Message"
                style={styles.Message}
                value={message}
                onChangeText={setMessage}
                placeholderTextColor={COLORS.gray}
              />
            </View>
          </LoaderV2>
        </ScrollView>
      </View>

      <View
        style={{
          alignSelf: 'center',
          paddingBottom: Platform.OS == 'ios' ? 50 : 90,
        }}>
        <Button
          title="Submit"
          buttonStyle={[styles.btn, {marginVertical: 10}]}
          onPress={onContactUs}
        />
      </View>

      <View style={{position: 'absolute', bottom: 0}}>
        <BottomTab />
      </View>
    </>
  );
};

export default Contactndex;

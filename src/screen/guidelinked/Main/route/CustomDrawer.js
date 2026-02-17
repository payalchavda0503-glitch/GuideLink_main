import {
  DrawerActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import React, {useCallback, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SvgUri} from 'react-native-svg';
import {useDispatch, useSelector} from 'react-redux';
import imgProfile from '../../../../assets/images/ic_logo.png';
import AppIcons from '../../../../component/AppIcons';
import {styles} from '../Styles';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import RNFS from 'react-native-fs';
import ImageCropPicker from 'react-native-image-crop-picker';
import Share from 'react-native-share';
import ic_earning from '../../../../assets/images/ic_earning.png';
import ic_verify from '../../../../assets/images/ic_verify.png';
import ic_logout from '../../../../assets/images/logout.png';
import ic_my_bookings from '../../../../assets/images/my-bookings.png';
import profile from '../../../../assets/images/profile.png';
import {
  CustomeImagePicker,
  customCameraPicker,
} from '../../../../component/ICustomIMGPicker';
import {
  CustomLogoutDialog,
  UploadPhotoDialog,
} from '../../../../component/customDialog';
import {logout} from '../../../../redux/AuthSlice';
import {showToast} from '../../../../redux/toastSlice';
import Api from '../../../../service/Api';
import {
  API_GET_PROFILE,
  API_LOGOUT,
  API_UPATE_PROFILE_IMAGE,
  BASE_URL,
} from '../../../../service/apiEndPoint';
import {
  requestCameraPermission,
  requestGalleryPermission,
} from '../../../../util/AskPermission';
import {DefaultStyle} from '../../../../util/ConstVar';
import Loader from '../../../../util/Loader';
import {clearStorage} from '../../../../util/Pref';
import {COLORS} from '../../../../util/Theme';
import {log} from '../../../../util/Toast';

const CustomDrawer = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector(s => s.AuthSlice.token);
  const [logo, setLogo] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState(-1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isGuide, setGuideStatus] = useState('');

  const nm = useSelector(s => s.AuthSlice.name);
  const phoneNumber = useSelector(s => s.AuthSlice.phone);
  const emailAddress = useSelector(s => s.AuthSlice.email);

  const [loaderVisible, setLoaderVisible] = useState(false);
  const [becomeExpand, setBecomeExpand] = useState(false);

  const base64Ref = useRef(null);

  let gradleVersion = DeviceInfo.getVersion();
  const [logoutDialog, setLogoutDialog] = useState(false);
  const DialogBox = () => {
    setLogoutDialog(!logoutDialog);
  };

  const [imgDialog, setImgDialog] = useState(false);
  const IMGPickerDialog = () => {
    setImgDialog(!imgDialog);
  };

  //logout user
  const onHandleLogout = async () => {
    try {
      setLoaderVisible(true);
      const response = await Api.get(API_LOGOUT);

      if (response.status == 'RC200') {
        setLoaderVisible(false);
        dispatch(logout());
        DialogBox();
        clearStorage();
        navigation.navigate('Login');
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  const DATA = [
    {
      id: '0',
      img: 'home',
      title: 'Home',
      navigate: 'HomeTabIndex',
      type: 'Feather',
      isVector: true,
    },
    {
      id: 'my-timeline',
      img: 'history',
      title: 'My Timeline',
      navigate: 'MyTimeline',
      type: 'MaterialCommunityIcons',
      isVector: true,
    },
    {
      id: '4',
      img: 'setting',
      type: 'AntDesign',
      title: 'My Profile',
      navigate: 'AccountSetting',
      isVector: true,
    },
    {
      id: '18',
      isBecome: isGuide == '-1' ? false : true,
      title: isGuide == '-1' ? 'Become a Guide' : 'Guide',
      isVector: true,
      navigate: 'ProfileTabIndex',
      type: 'MaterialCommunityIcons',
      img: 'text-box-multiple-outline',
      become: [
        {
          id: '11',
          img: profile,
          title: 'Edit Profile',
          navigate: 'ProfileTabIndex',
          isVector: false,
        },
        {
          id: '12',
          img: 'clock',
          type: 'Feather',
          title: 'Time Slots / Rate ($)',
          navigate: 'AvailibilityTabIndex',
          isVector: true,
        },

        {
          id: '13',
          img: ic_verify,
          title: 'Verify Work / Student Email',
          navigate: 'EmailVerifyTabIndex',
          isVector: false,
        },
        {
          id: '14',
          img: ic_earning,
          title: 'Earnings Report',
          navigate: 'EarningIndex',
          isVector: false,
        },
      ],
    },
    {
      id: 'all-bookings',
      img: 'calendar',
      title: 'Bookings',
      navigate: 'BookingTabIndex',
      type: 'Feather',
      isVector: true,
    },
    {
      id: '2',
      img: 'sharealt',
      title: 'Share Public URL',
      navigate: 'Share',
      type: 'AntDesign',
      isVector: true,
    },
    {
      id: '3',
      title: 'Link Social Profiles',
      img: 'link',
      type: 'AntDesign',
      navigate: 'LinkSocialProfileIndex',
      isVector: true,
    },
   
    {
      id: '5',
      img: 'password',
      type: 'MaterialIcons',
      title: 'Change Password',
      navigate: 'ChangePasswordIndex',
      isVector: true,
    },
    {
      id: '9',
      img: ic_logout,
      title: 'Logout',
      navigate: 'Logout',
      isVector: false,
    },
  ];

  if (isGuide == '-1') {
    DATA.splice(2, 0, {
      id: '20',
      img: ic_verify,
      title: 'Verify Work / Student Email',
      navigate: 'EmailVerifyTabIndex',
      isVector: false,
    });
  }

  // ImagePicker gallery
  const ImagePicker = () => {
    CustomeImagePicker()
      .then(async img => {
        setTimeout(async () => {
          await detectAndCropFace(img).then(res => {
            log(`Returned Image URI: ${img} response is :- ${res}`);
          });
          IMGPickerDialog();
        }, 500);

        // setLogo(img);
        // updateProfile(img);
      })
      .catch(error => {
        log(`gallery picker  Error:${error}`);
      });
  };

  const CameraPicker = () => {
    customCameraPicker()
      .then(async img => {
        log(`__DATA__Captured Image URI: ${img}`);

        await detectAndCropFace(img);
        //  setLogo(img);
        //  updateProfile(img);
        IMGPickerDialog();
      })
      .catch(error => {
        log(`camera picker  Error:${error}`);
        IMGPickerDialog();
      });
  };
  //crop image
  const detectAndCropFace = async imageUri => {
    try {
      const croppedImage = await ImageCropPicker.openCropper({
        path: imageUri,
        width: 500,
        height: 500,
        cropping: true,
        cropperCircleOverlay: true,
        freeStyleCropEnabled: false,
        mediaType: 'photo',
        compressImageMaxWidth: 500, // Maximum width before cropping
        compressImageMaxHeight: 500, // Maximum height before cropping
        compressImageQuality: 1,
      });

      console.log('Cropped image path:', croppedImage.path);

      setLogo(croppedImage.path);
      updateProfile(croppedImage.path);
    } catch (error) {
      console.log('Error cropping image:', error);
    }
  };
  const updateProfile = async img => {
    if (logo.length != 0) {
      try {
        setLoaderVisible(true);
        const myHeaders = new Headers();
        myHeaders.append('Authorization', `Bearer ${token}`);
        const formdata = new FormData();
        formdata.append('image', {
          uri: img,
          name: img,
          type: 'image/jpeg',
        });

        const requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: formdata,
          redirect: 'follow',
        };

        fetch(BASE_URL + API_UPATE_PROFILE_IMAGE, requestOptions)
          .then(response => response.json())
          .then(result => {
            log(result, result.status);
            if (result.status === 'RC200') {
              //showToast(result.message);
              dispatch(showToast(result.message));
            }
            setLoaderVisible(false);
          })
          .catch(error => console.error(error));
      } catch (error) {
        log(`Error uploading image: ${error}`);

        setLoaderVisible(false);
        // Handle error
      }
    }
  };

  const getProfile = async () => {
    try {
      ///setLoaderVisible(true);
      const response = await Api.get(API_GET_PROFILE);

      if (response.status == 'RC200') {
        // setLoaderVisible(false);
        let result = response.data;
        await AsyncStorage.setItem('timezone', result.timezone);
        await AsyncStorage.setItem('userId', String(result.id));
        await AsyncStorage.setItem(
          'isGuide',
          String(result.stripe_onboarding_status),
        );
        setUserId(result.id);
        setGuideStatus(result.stripe_onboarding_status);
        setName(result.fullname);
        setUsername(result.username != null && result.username !== 'null' ? String(result.username) : '');
        setEmail(result.email);
        setPhone(result.phone_number);
        setLogo(result.image_url);
      }
    } catch (error) {
      log(error);
      // setLoaderVisible(false);
    }
  };

  const onShare = async () => {
    const profileUrl =
      username && username.trim()
        ? `https://guidelinked.com/expert/${encodeURIComponent(username.trim())}`
        : 'https://guidelinked.com';
    const message =
      ' Hey, download the GuideLinked app and create an account! You can make money by sharing your experiences / expertise with someone and vice versa.\n\n' +
      'Website: https://guidelinked.com\n' +
      `My profile: ${profileUrl}\n\n` +
      'Android: https://play.google.com/store/apps/details?id=com.guidelinked\n' +
      'Apple: https://apps.apple.com';

    try {
      const shareOptions = {
        title: 'Share Public URL',
        message,
      };

      await Share.open(shareOptions);
    } catch (err) {
      // User cancelled or share failed – just log, don’t crash
      console.log('Sharing failed:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setName(nm);
      setPhone(phoneNumber);
      setEmail(emailAddress);
      getProfile();
    }, [nm, phoneNumber, emailAddress]),
  );

  const renderHeader = () => {
    return (
      <>
        <View style={styles.headerView}>
          <View
            style={[
              styles.headerSubContainer,
              {flex: 0.9, paddingHorizontal: 10},
            ]}>
            <Pressable onPress={IMGPickerDialog}>
              <View
                style={[
                  styles.profileLogo,
                  {
                    overflow: 'hidden',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}>
                {logo.split('.').pop() === 'svg' ? (
                  <SvgUri width={60} height={60} uri={logo} />
                ) : (
                  <Image
                    source={logo ? {uri: logo} : imgProfile}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                )}
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                navigation.navigate('ExpertDetail', {ID: userId});
              }}>
              <View
                style={{
                  paddingStart: 10,
                  marginVertical: 2,
                  flex: 1,
                  //    width: SIZES.width * 0.5,
                }}>
                <Text style={[styles.profileName, {fontSize: 18}]}>{name}</Text>
                <Text
                  style={[
                    DefaultStyle.textblack,
                    {marginBottom: 2, fontSize: 11},
                  ]}>
                  {phone}
                </Text>
                <Text style={[DefaultStyle.textblack, {fontSize: 11}]}>
                  {email}
                </Text>
              </View>
            </Pressable>
          </View>

          <Pressable
            style={{
              paddingVertical: 8,
              paddingEnd: 10,
              paddingStart: 5,
              //  paddingEnd: 8,
              flex: 0.1,
            }}
            onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}>
            <AppIcons
              type={'AntDesign'}
              name={'leftcircleo'}
              size={26}
              color={COLORS.primary}
            />
          </Pressable>
        </View>
      </>
    );
  };
  const renderItem = ({item}) => (
    <>
      <Pressable
        onPress={() => {
          if (item.id === '18' && isGuide != '-1') {
            // setBecomeExpand(prevState => !prevState);
          } else {
            if (item.id === '18') {
              navigation.navigate(item.navigate, {guide: true});
            } else {
              item.navigate === 'Logout'
                ? DialogBox()
                : item.navigate === 'Share'
                ? onShare()
                : item.openUrl
                ? Linking.openURL(item.openUrl)
                : navigation.navigate(item.navigate, item.params || {});
            }
            setBecomeExpand(false);
          }
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={styles.renderView}>
            {item.isVector ? (
              <AppIcons
                name={item.img}
                type={item.type ?? ''}
                color={COLORS.primary}
                size={22}
              />
            ) : (
              <Image
                source={item.img}
                style={styles.icon}
                resizeMode="contain"
              />
            )}
            <Text style={styles.label}>{item.title}</Text>
          </View>
          {/* Conditionally show the arrow icon for expand/collapse */}
          {item.id === '18' && isGuide === '-1' ? (
            <View
              style={{
                paddingHorizontal: 15,
              }}>
              <AppIcons
                type={'Feather'}
                name={becomeExpand ? 'chevron-up' : 'chevron-down'}
                size={28}
                color={COLORS.primary}
              />
            </View>
          ) : null}
        </View>

        {/* Conditionally render submenu if 'Become a guide' is expanded */}
        {item.isBecome && item.become && (
          <View style={styles.subMenuContainer}>
            {item.become.map(subItem => (
              <Pressable
                key={subItem.id}
                onPress={() => {
                  navigation.navigate(subItem.navigate);
                  setBecomeExpand(false);
                }}>
                <View style={styles.subMenuItem}>
                  {subItem.isVector ? (
                    <AppIcons
                      name={subItem.img}
                      type={subItem.type ?? ''}
                      color={COLORS.primary}
                      size={22}
                    />
                  ) : (
                    <Image
                      source={subItem.img}
                      style={styles.icon}
                      resizeMode="contain"
                    />
                  )}

                  <Text style={styles.subMenuLabel}>{subItem.title}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </Pressable>
    </>
  );

  const Divider = () => {
    return (
      <View
        style={{
          height: 1,
          backgroundColor: '#e0e0e0',
        }}
      />
    );
  };

  const linkStyle = {
    color: COLORS.primary,
    fontSize: 14,
  };

  const renderFooter = () => (
    <>
      <View
        style={{
          paddingVertical: 16,
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: 8}}>
          <Pressable
            onPress={() => navigation.navigate('FAQScreen')}
            style={{paddingVertical: 4, paddingEnd: 4}}>
            <Text style={linkStyle}>FAQs</Text>
          </Pressable>
          <Text style={[linkStyle, {marginHorizontal: 4}]}>|</Text>
          <Pressable
            onPress={() => navigation.navigate('ContactTabIndex')}
            style={{paddingVertical: 4, paddingEnd: 4}}>
            <Text style={linkStyle}>Contact Us</Text>
          </Pressable>
        </View>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center'}}>
          <Pressable
            onPress={() => Linking.openURL('https://guidelinked.com/terms-of-use')}
            style={{paddingVertical: 4, paddingEnd: 4}}>
            <Text style={linkStyle}>Terms of Use</Text>
          </Pressable>
          <Text style={[linkStyle, {marginHorizontal: 4}]}>|</Text>
          <Pressable
            onPress={() => Linking.openURL('https://guidelinked.com/privacy-policy')}
            style={{paddingVertical: 4, paddingEnd: 4}}>
            <Text style={linkStyle}>Privacy Policy</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.version}>Version {gradleVersion}</Text>
    </>
  );

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FlatList
          data={DATA}
          renderItem={renderItem}
          ItemSeparatorComponent={Divider}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          keyExtractor={item => item.id}
        />
      </ScrollView>

      <CustomLogoutDialog
        visible={logoutDialog}
        onClose={DialogBox}
        onLogout={() => {
          onHandleLogout();
        }}
      />
      <UploadPhotoDialog
        visible={imgDialog}
        onClose={IMGPickerDialog}
        onChooseLibrary={async () => {
          // isCamrarGalleryPermission().then(val => {
          //   if (!val) {
          //     reqCameraGalleyPer();
          //   } else {
          //     ImagePicker();
          //   }
          // });

          const hasPermission = await requestGalleryPermission();
          if (hasPermission) {
            ImagePicker();
          }
        }}
        onTakePhoto={async () => {
          // isCamrarGalleryPermission().then(val => {
          //   if (!val) {
          //     reqCameraGalleyPer();
          //   } else {
          //     CameraPicker();
          //   }
          // });

          const hasPermission = await requestCameraPermission();
          if (hasPermission) {
            CameraPicker();
          }
        }}
      />

      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </SafeAreaView>
  );
};

export default CustomDrawer;

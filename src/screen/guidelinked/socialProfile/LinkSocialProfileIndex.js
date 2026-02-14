import {useFocusEffect} from '@react-navigation/native';
import {Button} from '@rneui/themed';
import React, {useCallback, useState} from 'react';
import {ScrollView, Text, TextInput, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AppHeader from '../../../component/AppHeader';
import AppIcons from '../../../component/AppIcons';
import BottomTab from '../../../component/BottomTab';
import IosStatusBar from '../../../component/IosStatusBar';
import LoaderV2 from '../../../component/LoaderV2';
import Api from '../../../service/Api';
import {
  API_GET_PROFILE,
  API_UPDATE_SOCIAL_PROFILE,
} from '../../../service/apiEndPoint';
import {DefaultStyle} from '../../../util/ConstVar';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS} from '../../../util/Theme';
import {log} from '../../../util/Toast';
import {styles} from './styles';

const LinkSocialProfileIndex = ({navigation}) => {
  const [loaderVisible, setLoaderVisible] = useState(false);

  const [insta, setInsta] = useState('');
  const [fb, setFb] = useState('');
  const [Linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [xLink, setXLink] = useState('');

  const profieSave = async () => {
    try {
      const formdata = new FormData();
      formdata.append('linked_in', Linkedin);
      formdata.append('facebook', fb);
      formdata.append('instagram', insta);
      formdata.append('youtube', youtube);
      formdata.append('tiktok', tiktok);
      formdata.append('x_link', xLink ?? '');
      //console.log(formdata);

      setLoaderVisible(true);
      const response = await Api.post(API_UPDATE_SOCIAL_PROFILE, formdata);

      setLoaderVisible(false);
      if (response.status == 'RC200') {
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  const getProfile = async () => {
    try {
      setLoaderVisible(true);
      const response = await Api.get(API_GET_PROFILE);

      if (response.status == 'RC200') {
        let result = response.data;

        if (result.instagram == 'null' || result.instagram == null) {
        } else {
          if (result.instagram) {
            setInsta(result.instagram);
          }
        }

        if (result.facebook == 'null' || result.facebook == null) {
        } else {
          if (result.facebook) {
            setFb(result.facebook);
          }
        }

        if (result.linked_in == 'null' || result.linked_in == null) {
        } else {
          if (result.linked_in) {
            setLinkedin(result.linked_in);
          }
        }

        if (result.youtube_link == 'null' || result.youtube_link == null) {
        } else {
          if (result.youtube_link) {
            setYoutube(result.youtube_link);
          }
        }

        if (result.tiktok_link == 'null' || result.tiktok_link == null) {
        } else {
          if (result.tiktok_link) {
            setTiktok(result.tiktok_link);
          }
        }

        setXLink(result.x_link != null && result.x_link !== 'null' ? String(result.x_link) : '');
        setLoaderVisible(false);
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
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
        barStyle="light-content"
      />
      <View style={{flex: 1, backgroundColor: COLORS.white}}>
        <AppHeader
          background={COLORS.primary}
          iconType={'Feather'}
          iconName={'menu'}
          iconColor={COLORS.white}
          navigation={navigation}
          tittle={'Link Social Profiles'}
          titleColor={COLORS.white}
        />
        <View style={{flex: 1}}>
          <ScrollView
            automaticallyAdjustKeyboardInsets={true}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 24}}>
          <LoaderV2 loaderVisible={loaderVisible}>
            <View style={{paddingHorizontal: 15, marginVertical: 10}}>
              <View style={{alignContent: 'center'}}>
                <View style={styles.input}>
                  <LinearGradient
                    colors={[COLORS.Yellow, COLORS.darkpink, COLORS.pink]}
                    style={[
                      styles.circleInsta,
                      {
                        backgroundColor: COLORS.pink,
                        width: 25,
                        height: 25,
                      },
                    ]}>
                    <AppIcons
                      type={'FontAwesome'}
                      name={'instagram'}
                      size={18}
                      color={COLORS.white}
                    />
                  </LinearGradient>

                  <View style={{flex: 1, alignSelf: 'stretch',paddingTop:2}}>
                    <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600', marginLeft: 33}}>Instagram</Text>
                  
                  </View>
                </View>
                <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://instagram.com/yourusername</Text>
                    <TextInput
                      style={[styles.socialInput1, {borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, paddingVertical: 8, backgroundColor: COLORS.white2 || '#F5F5F5', width: '100%', alignSelf: 'stretch'}]}
                      placeholderTextColor={COLORS.gray}
                      value={insta}
                      onChangeText={text => setInsta(text)}
                      keyboardType="default"
                      placeholder="Enter URL"
                    />

                <View style={styles.input}>
                  <View
                    style={[
                      styles.circlefb,
                      {
                        backgroundColor: COLORS.blue,
                        width: 25,
                        height: 25,
                      },
                    ]}>
                    <AppIcons
                      type={'FontAwesome'}
                      name={'facebook'}
                      size={18}
                      color={COLORS.white}
                    />
                  </View>
                  <View style={{flex: 1, alignSelf: 'stretch',paddingTop:2}}>
                    <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600',  marginLeft: 33}}>Facebook</Text>
                  
                  </View>
                </View>
                <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://facebook.com/yourusername</Text>
                    <TextInput
                      style={[styles.socialInput1, {borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, paddingVertical: 8, backgroundColor: COLORS.white2 || '#F5F5F5', width: '100%', alignSelf: 'stretch'}]}
                      placeholderTextColor={COLORS.gray}
                      value={fb}
                      onChangeText={text => setFb(text)}
                      keyboardType="default"
                      placeholder="Enter URL"
                    />
                <View style={styles.input}>
                  <View
                    style={[
                      styles.circlelinkedin,
                      {
                        backgroundColor: COLORS.primary,
                        marginStart: 0,
                        width: 25,
                        height: 25,
                      },
                    ]}>
                    <AppIcons
                      type={'FontAwesome'}
                      name={'linkedin'}
                      size={18}
                      color={COLORS.white}
                    />
                  </View>
                  <View style={{flex: 1, alignSelf: 'stretch',paddingTop:2}}>
                    <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600', marginLeft: 33}}>LinkedIn</Text>
                   
                  </View>
                </View>
                <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://linkedin.com/in/yourusername</Text>
                    <TextInput
                      style={[styles.socialInput1, {borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, paddingVertical: 8, backgroundColor: COLORS.white2 || '#F5F5F5', width: '100%', alignSelf: 'stretch'}]}
                      placeholderTextColor={COLORS.gray}
                      value={Linkedin}
                      onChangeText={text => setLinkedin(text)}
                      keyboardType="default"
                      placeholder="Enter URL"
                    />
                <View style={styles.input}>
                  <View
                    style={[
                      styles.circlelinkedin,
                      {
                        backgroundColor: COLORS.black,
                        marginStart: 0,
                        width: 25,
                        height: 25,
                      },
                    ]}>
                    <AppIcons
                      type={'MaterialIcons'}
                      name={'tiktok'}
                      size={18}
                      color={COLORS.white}
                    />
                  </View>
                  <View style={{flex: 1, alignSelf: 'stretch',paddingTop:2}}>
                    <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600',  marginLeft: 33}}>TikTok</Text>
                  
                  </View>
                </View>
                <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://tiktok.com/@yourusername</Text>
                    <TextInput
                      style={[styles.socialInput1, {borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, paddingVertical: 8, backgroundColor: COLORS.white2 || '#F5F5F5', width: '100%', alignSelf: 'stretch'}]}
                      placeholderTextColor={COLORS.gray}
                      value={tiktok}
                      onChangeText={text => setTiktok(text)}
                      keyboardType="default"
                      placeholder="Enter URL"
                    />
              </View>

              <View style={styles.input}>
                <View
                  style={[
                    styles.circlelinkedin,
                    {
                      backgroundColor: COLORS.red,
                      marginStart: 0,
                      width: 25,
                      height: 25,
                    },
                  ]}>
                  <AppIcons
                    type={'Entypo'}
                    name={'youtube'}
                    size={18}
                    color={COLORS.white}
                  />
                </View>
                <View style={{flex: 1, alignSelf: 'stretch',paddingTop:2}}>
                  <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600',  marginLeft: 33}}>YouTube</Text>
                  
                </View>
              </View>
              <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://youtube.com/@yourusername</Text>
                  <TextInput
                    style={[styles.socialInput1, {borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, paddingVertical: 8, backgroundColor: COLORS.white2 || '#F5F5F5', width: '100%', alignSelf: 'stretch'}]}
                    placeholderTextColor={COLORS.gray}
                    value={youtube}
                    onChangeText={text => setYoutube(text)}
                    keyboardType="default"
                    placeholder="Enter URL"
                  />
              <View style={styles.input}>
                <View
                  style={[
                    styles.circlelinkedin,
                    {
                      backgroundColor: COLORS.black,
                      marginStart: 0,
                      width: 25,
                      height: 25,
                    },
                  ]}>
                  <AppIcons
                    type={'FontAwesome'}
                    name={'twitter'}
                    size={18}
                    color={COLORS.white}
                  />
                </View>
                <View style={{flex: 1, alignSelf: 'stretch', paddingTop: 2}}>
                  <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600', marginLeft: 33}}>X (Twitter)</Text>
                </View>
              </View>
              <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://twitter.com/yourusername</Text>
              <TextInput
                style={[styles.socialInput1, {borderWidth: 1, borderColor: COLORS.gray, borderRadius: 8, paddingVertical: 8, backgroundColor: COLORS.white2 || '#F5F5F5', width: '100%', alignSelf: 'stretch'}]}
                placeholderTextColor={COLORS.gray}
                value={xLink ?? ''}
                onChangeText={text => setXLink(text)}
                keyboardType="default"
                placeholder="Enter URL"
              />
              <Button
                title="Save"
                buttonStyle={[
                  DefaultStyle.btnDanger,
                  {
                    marginTop: 20,
                    marginBottom: 10,
                    backgroundColor: COLORS.primary,
                    paddingHorizontal: 56,
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignSelf: 'center',
                  },
                ]}
                onPress={profieSave}
              />

              {/* <HelpVideoIcon style={{marginTop:10, alignSelf: 'center'}} title="Help Video" type={3} /> */}
            </View>
          </LoaderV2>
        </ScrollView>
        </View>
        <BottomTab />
      </View>
    </>
  );
};

export default LinkSocialProfileIndex;

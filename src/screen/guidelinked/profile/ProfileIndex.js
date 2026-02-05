import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {Button} from '@rneui/themed';
import React, {useCallback, useEffect, useState} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch} from 'react-redux';
import AppIcons from '../../../component/AppIcons';
import {Header} from '../../../component/Header';
import IosStatusBar from '../../../component/IosStatusBar';
import LoaderV2 from '../../../component/LoaderV2';
import {profile} from '../../../redux/AuthSlice';
import {showToast} from '../../../redux/toastSlice';
import Api from '../../../service/Api';
import {
  API_GET_PROFILE,
  API_UPDATE_PROFILE,
} from '../../../service/apiEndPoint';
import {DefaultStyle} from '../../../util/ConstVar';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS} from '../../../util/Theme';
import {log} from '../../../util/Toast';
import {styles} from './styles';

const ProfileIndex = ({navigation, route}) => {
  const dispatch = useDispatch();
  const isFromGuide = route?.params?.guide === true;
  const [intro, setIntro] = useState('');
  const [expert_type, setExpertType] = useState([]);
  const [lookingFor, setLookingFor] = useState('');
  const [search, setSearch] = useState('');
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [fetchProfile, setFetchProfile] = useState(true);
  const [insta, setInsta] = useState('');
  const [fb, setFb] = useState('');
  const [Linkedin, setLinkedin] = useState('');
  const [help, setHelp] = useState([{id: -1, question: '', answer: ''}]);
  const [youtube, setYoutube] = useState('');
  const [tiktok, setTiktok] = useState('');
  const STORAGE_KEY = 'PROFILE_AUTOSAVE';

  const expert = ['student_expert', 'other_expert'];

  const addHelp = () => {
    setHelp([...help, {id: -1, question: '', answer: ''}]);
  };
  const removeHelp = id => {
    let arr = help
      .filter((item, index) => index !== id)
      .map((item, index) => ({...item, index}));

    setHelp(arr);

    //setHelp(help.filter(item => item.id !== id));
  };
  const handleHelp = (text, index) => {
    const rr = [...help];
    rr[index].question = text;
    setHelp(rr);
  };

  const handleHelpanswer = (text, index) => {
    const rr = [...help];
    rr[index].answer = text;
    setHelp(rr);
  };

  const [isGuide, setIsGuide] = useState(false);

  const profieSave = async () => {
    const isNullOrEmpty = value =>
      value === null || value === undefined || value === '';

    const helpEmptyFields = help.some(
      item => isNullOrEmpty(item.question) || isNullOrEmpty(item.answer),
    );

    if (!intro) {
      // showToast('Please enter introduction');
      dispatch(showToast('Please enter introduction'));
    } else if (helpEmptyFields) {
      // showToast('Complete the empty sections.');
      dispatch(showToast('Complete the empty sections.'));
    } else {
      try {
        const formdata = new FormData();
        formdata.append('introduction', intro);
        formdata.append('expert_type', JSON.stringify(expert_type));
        formdata.append('looking_for', lookingFor);
        formdata.append('linked_in', Linkedin);
        formdata.append('facebook', fb);
        formdata.append('instagram', insta);
        formdata.append('youtube', youtube);
        formdata.append('tiktok', tiktok);

        help.map((s, i) => {
          formdata.append(`help_with[${i}][question]`, s.question);
          formdata.append(`help_with[${i}][answer]`, s.answer);
          formdata.append(`help_with[${i}][id]`, s.id);
        });

        //console.log(formdata);

        setLoaderVisible(true);
        const response = await Api.post(API_UPDATE_PROFILE, formdata);

        setLoaderVisible(false);
        if (response.status == 'RC200') {
          if (!isGuide) {
            navigation.navigate('AvailibilityTabIndex', {guide: true});
          }
        }
      } catch (error) {
        log(error);
        setLoaderVisible(false);
      }
    }
  };

  const getProfile = async () => {
    try {
      setLoaderVisible(true);
      setFetchProfile(true);
      const response = await Api.get(API_GET_PROFILE);

      if (response.status == 'RC200') {
        let result = response.data;

        setIsGuide(result.is_guide);

        if (result.introduction == 'null' || result.introduction == null) {
        } else {
          setIntro(result.introduction);
        }
        if (result.expert_type == 'null' || result.expert_type == null) {
        } else {
          setExpertType(result.expert_type);
        }

        if (result.looking_for == 'null' || result.looking_for == null) {
        } else {
          setLookingFor(result.looking_for);
        }

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

        setHelp(
          result.help_with.length > 0
            ? result.help_with
            : [{id: -1, question: '', answer: ''}],
        );

        dispatch(
          profile({
            name: result.fullname,
            email: result.email,
            phone: result.phone_number,
          }),
        );
        setLoaderVisible(false);
        loadSavedData();
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

  const toggleExpertType = type => {
    if (expert_type.includes(type)) {
      setExpertType(prev => prev.filter(t => t !== type));
    } else {
      setExpertType(prev => [...prev, type]);
    }
  };

  const loadSavedData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);

      if (jsonValue != null) {
        const savedData = JSON.parse(jsonValue);
        setIntro(savedData.intro || '');
        setExpertType(savedData.expert_type || []);
        setLookingFor(savedData.lookingFor || '');
        setInsta(savedData.insta || '');
        setFb(savedData.fb || '');
        setLinkedin(savedData.Linkedin || '');
        setYoutube(savedData.youtube || '');
        setTiktok(savedData.tiktok || '');
        setHelp(savedData.help || [{id: -1, question: '', answer: ''}]);
      }
      setFetchProfile(false);
    } catch (e) {
      console.log('Error loading autosave:', e);
    }
  };

  const saveData = async () => {
    try {
      const data = {
        intro,
        expert_type,
        lookingFor,
        insta,
        fb,
        Linkedin,
        youtube,
        tiktok,
        help,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('Profile auto-saved');
    } catch (e) {
      console.log('Error saving autosave:', e);
    }
  };

  useEffect(() => {
    if (!fetchProfile) {
      console.log(fetchProfile);
      saveData();
    }
  }, [
    intro,
    expert_type,
    lookingFor,
    insta,
    fb,
    Linkedin,
    youtube,
    tiktok,
    help,
  ]);

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <ScreenStatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
      />
      <View style={{flex: 1}}>
        <Header
          search={search}
          setSearch={setSearch}
          menuiconColor={COLORS.white}
          iconColor={COLORS.black}
          navigation={navigation}
          background={COLORS.primary}
        />

        <View style={{flex: 1, flexDirection: 'column'}}>
          <View style={{flex: 1}}>
            <ScrollView
              automaticallyAdjustKeyboardInsets={true}
              showsVerticalScrollIndicator={false}>
              <View style={{marginBottom: 30, paddingHorizontal: 15}}>
                {isFromGuide && (
                  <View
                    style={{
                      alignSelf: 'center',
                      backgroundColor: '#E6F0FA', // light blue background
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontWeight: '600',
                        fontSize: 13,
                      }}>
                      Step 1 of 4
                    </Text>
                  </View>
                )}

                <View style={{alignItems: 'center', position: 'relative'}}>
                  <Text style={styles.myProfile}>Profile Details</Text>

                  {/* <HelpVideoIcon
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        zIndex: 1,
                      }}
                      title="Help"
                      type={0}
                    /> */}
                </View>
              </View>

              <LoaderV2 loaderVisible={loaderVisible}>
                <View style={{paddingHorizontal: 15}}>
                  <View>
                    <View
                      style={[
                        DefaultStyle.flexDirectionSpace,
                        {marginEnd: 4, marginTop: 10},
                      ]}>
                      <Text
                        style={[
                          DefaultStyle.blackBold,
                          {color: COLORS.primary},
                        ]}>
                        Introduction
                      </Text>
                    </View>
                    {/* This will be used to verify when you setup your bank account
                    show make sure to enter correct details. */}
                    <Text style={[DefaultStyle.txtgray12, {marginVertical: 5}]}>
                      Tell us about yourself in brief.{' '}
                      <Text
                        onPress={() => {
                          navigation.navigate('SampleProfiles');
                        }}
                        style={[
                          DefaultStyle.txtgray12bold,
                          {textDecorationLine: 'underline'},
                        ]}>
                        View Sample Profiles
                      </Text>
                    </Text>

                    <TextInput
                      style={styles.inputMSg}
                      keyboardType="default"
                      numberOfLines={6}
                      placeholder={
                        'College Degree\nWork Experience' // Multiline string directly specified
                      }
                      textAlignVertical="top"
                      multiline={true}
                      maxLength={10000}
                      value={intro}
                      onChangeText={setIntro}
                      placeholderTextColor={COLORS.gray}
                    />

                    <View style={{marginTop: 15}}>
                      <Text
                        style={[
                          DefaultStyle.blackBold,
                          {color: COLORS.primary, marginBottom: 8},
                        ]}>
                        Select Expert Type
                      </Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          gap: 20,
                        }}>
                        {expert.map(type => (
                          <TouchableOpacity
                            key={type}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginRight: 20,
                              marginBottom: 10,
                            }}
                            onPress={() => toggleExpertType(type)}>
                            <View
                              style={{
                                height: 18,
                                width: 18,
                                borderRadius: 4, // More like a square checkbox
                                borderWidth: 2,
                                borderColor: COLORS.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: 8,
                              }}>
                              {expert_type.includes(type) && (
                                <View
                                  style={{
                                    height: 10,
                                    width: 10,
                                    backgroundColor: COLORS.primary,
                                  }}
                                />
                              )}
                            </View>
                            <Text style={{fontSize: 14}}>
                              {type === 'student_expert'
                                ? 'College Guides'
                                : 'Other Guides'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View
                      style={[
                        DefaultStyle.flexDirectionSpace,
                        {marginEnd: 4, marginTop: 10},
                      ]}>
                      <Text
                        style={[
                          DefaultStyle.blackBold,
                          {color: COLORS.primary},
                        ]}>
                        What can I help with?
                      </Text>
                      {/* <AppIcons
                      type={'AntDesign'}
                      name={'infocirlceo'}
                      size={20}
                      color={COLORS.black}
                    /> */}
                    </View>
                    {/* Please create your wisdom areas and expain why Users should contact you. */}

                    <View
                      style={{
                        marginBottom: 15,
                        marginTop: 5,
                        flexDirection: 'row',
                      }}>
                      <Text style={DefaultStyle.txtgray12}>
                        Please create your wisdom areas.
                        {/* <Text style={DefaultStyle.txtgray12bold}>
                            (Refer to questions listed under
                              <Text onPress={()=>{
                                navigation.navigate('HelpVideos', {type:6})
                              }} style={[DefaultStyle.txtgray12bold,{textDecorationLine:'underline'}]}> guidance categories</Text>)
                          </Text> */}
                      </Text>
                    </View>

                    {help.map((value, index) => (
                      <View key={value.id}>
                        <View style={DefaultStyle.row}>
                          <TextInput
                            style={[
                              styles.inputCollege,
                              {flex: 1, marginEnd: 2},
                            ]}
                            placeholder="Enter the wisdom you have.."
                            placeholderTextColor={COLORS.gray}
                            value={value.question}
                            onChangeText={text => handleHelp(text, index)}
                          />
                          <Pressable
                            onPress={() => removeHelp(index)}
                            // disabled={help.length === 1} // Disable the button if there's only one input
                            style={styles.removeBtn}>
                            <AppIcons
                              type={'AntDesign'}
                              name={'delete'}
                              size={20}
                              color={COLORS.red}
                            />
                          </Pressable>
                        </View>

                        <TextInput
                          style={styles.inputCollege}
                          numberOfLines={4}
                          maxLength={10000}
                          multiline={true}
                          placeholder="Explain why.."
                          textAlignVertical="top"
                          placeholderTextColor={COLORS.gray}
                          value={value.answer}
                          onChangeText={text => handleHelpanswer(text, index)}
                        />
                      </View>
                    ))}

                    <Pressable
                      onPress={() => addHelp()}
                      style={{
                        alignSelf: 'flex-end',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                      }}>
                      <AppIcons
                        type={'AntDesign'}
                        name={'pluscircleo'}
                        size={20}
                        color={COLORS.black}
                      />
                    </Pressable>
                  </View>

                  <View style={{marginTop: 15, alignContent: 'center'}}>
                    <Text
                      style={[
                        DefaultStyle.blackBold,
                        {color: COLORS.primary, marginBottom: 10},
                      ]}>
                      Social Profile Links
                    </Text>

                    <View style={styles.socialInput}>
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
                      <TextInput
                        style={styles.socialInput1}
                        placeholderTextColor={COLORS.gray}
                        value={insta}
                        onChangeText={text => setInsta(text)}
                        keyboardType="default"
                        placeholder="Instagram (Type URL)"
                      />
                    </View>

                    <View style={styles.socialInput}>
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
                      <TextInput
                        style={styles.socialInput1}
                        placeholderTextColor={COLORS.gray}
                        value={fb}
                        onChangeText={text => setFb(text)}
                        keyboardType="default"
                        placeholder="Facebook (Type URL)"
                      />
                    </View>

                    <View style={styles.socialInput}>
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
                      <TextInput
                        style={styles.socialInput1}
                        placeholderTextColor={COLORS.gray}
                        value={Linkedin}
                        onChangeText={text => setLinkedin(text)}
                        keyboardType="default"
                        placeholder="Linkedin (Type URL)"
                      />
                    </View>

                    <View style={styles.socialInput}>
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
                      <TextInput
                        style={styles.socialInput1}
                        placeholderTextColor={COLORS.gray}
                        value={tiktok}
                        onChangeText={text => setTiktok(text)}
                        keyboardType="default"
                        placeholder="Tiktok (Type URL)"
                      />
                    </View>
                  </View>

                  <View style={styles.socialInput}>
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
                    <TextInput
                      style={styles.socialInput1}
                      placeholderTextColor={COLORS.gray}
                      value={youtube}
                      onChangeText={text => setYoutube(text)}
                      keyboardType="default"
                      placeholder="Youtube (Type URL)"
                    />
                  </View>
                </View>
              </LoaderV2>
            </ScrollView>
          </View>
          <Button
            title={isGuide ? 'Save Changes' : 'Save & Next'}
            buttonStyle={[
              DefaultStyle.btnDanger,
              {
                marginTop: 10,
                marginBottom: Platform.OS == 'ios' ? 20 : 20,
                paddingHorizontal: 40,
              },
            ]}
            onPress={profieSave}
          />
        </View>
      </View>
      {/* <View style={{position:'absolute',bottom:0}}>
        <BottomTab />
     </View> */}
    </>
  );
};

export default ProfileIndex;

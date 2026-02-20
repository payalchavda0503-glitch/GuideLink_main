import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {Button} from '@rneui/themed';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {MultiSelect} from 'react-native-element-dropdown';
import DropDownPicker from 'react-native-dropdown-picker';
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
  API_CATEGORY_LIST,
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
  const [primaryCategoryId, setPrimaryCategoryId] = useState(null);
  const [primaryCategoryOpen, setPrimaryCategoryOpen] = useState(false);
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
  const [xLink, setXLink] = useState('');
  const STORAGE_KEY = 'PROFILE_AUTOSAVE';

  const defaultExpertTypes = [
    {value: 'student_expert', label: 'College Guides'},
    {value: 'other_expert', label: 'Other Guides'},
  ];
  const [expertTypeOptions, setExpertTypeOptions] = useState(defaultExpertTypes);

  const primaryCategoryOptions = useMemo(() => {
    return expertTypeOptions
      .filter(opt => expert_type.includes(opt.value))
      .map(opt => ({label: opt.label, value: opt.value}));
  }, [expertTypeOptions, expert_type]);

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
    } else if (expert_type.length > 0 && !primaryCategoryId) {
      dispatch(showToast('Please select a primary category.'));
    } else if (helpEmptyFields) {
      // showToast('Complete the empty sections.');
      dispatch(showToast('Complete the empty sections.'));
    } else {
      try {
        const formdata = new FormData();
        formdata.append('introduction', intro);
        const guideCategoryIds = expert_type
          .map(t => {
            const n = Number(t);
            if (!isNaN(n)) return String(n);
            const opt = expertTypeOptions.find(
              o => o.slug === t || o.value === t || String(o.id) === t,
            );
            return opt ? String(opt.id) : null;
          })
          .filter(Boolean);
        guideCategoryIds.forEach(id => {
          formdata.append('guide_category_id[]', id);
        });
        if (primaryCategoryId) {
          formdata.append('guide_primary_category_id', primaryCategoryId);
        }
        formdata.append('looking_for', lookingFor);
        formdata.append('linked_in', Linkedin);
        formdata.append('facebook', fb);
        formdata.append('instagram', insta);
        formdata.append('youtube', youtube);
        formdata.append('tiktok', tiktok);
        formdata.append('x_link', xLink ?? '');

        help.map((s, i) => {
          formdata.append(`help_with[${i}][question]`, s.question);
          formdata.append(`help_with[${i}][answer]`, s.answer);
          formdata.append(`help_with[${i}][id]`, s.id);
        });

        console.log("formdata",formdata);

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
         console.log("getprofile",result)
        setIsGuide(result.is_guide);

        if (result.introduction == 'null' || result.introduction == null) {
        } else {
          setIntro(result.introduction);
        }
        const rawInterests =
          result.guide_category_id ??
          result.guide_category_ids ??
          result.expert_type ??
          result.category_ids ??
          (Array.isArray(result.categories)
            ? result.categories.map(c => c?.id ?? c?.category_id ?? c)
            : null) ??
          (Array.isArray(result.guide_categories)
            ? result.guide_categories.map(c => c?.id ?? c?.category_id ?? c)
            : null) ??
          [];
        if (rawInterests != null && rawInterests !== 'null') {
          let arr = [];
          if (Array.isArray(rawInterests)) {
            arr = rawInterests
              .map(v => {
                if (v == null) return null;
                if (typeof v === 'object') {
                  const id = v.id ?? v.category_id ?? v.guide_category_id;
                  return id != null ? String(id) : null;
                }
                if (typeof v === 'number') return String(v);
                return String(v);
              })
              .filter(Boolean);
          } else if (typeof rawInterests === 'string') {
            arr = rawInterests
              .split(',')
              .map(s => s.trim())
              .filter(Boolean);
          } else {
            arr = [String(rawInterests)];
          }
          if (arr.length > 0) setExpertType(arr);
        }

        const rawPrimary =
          result.guide_primary_category_id ??
          result.primary_category_id ??
          null;
        if (rawPrimary != null && rawPrimary !== 'null' && rawPrimary !== '') {
          const primaryStr =
            typeof rawPrimary === 'number' ? String(rawPrimary) : String(rawPrimary);
          setPrimaryCategoryId(primaryStr);
        } else {
          setPrimaryCategoryId(null);
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

        setXLink(result.x_link != null && result.x_link !== 'null' ? String(result.x_link) : '');

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
        setFetchProfile(false);
      }
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  const fetchExpertTypeOptions = useCallback(async () => {
    try {
      const res = await Api.get(`${API_CATEGORY_LIST}`);
      if (res?.status === 'RC200' && Array.isArray(res?.data) && res.data.length > 0) {
        const options = res.data
          .filter(item => {
            const id = item.id;
            return id != null && String(item.slug || item.category_slug || '') !== 'all_guides';
          })
          .map(item => {
            const label = item.name || item.title || item.category_name || String(item.id);
            const id = item.id;
            const value = String(id);
            const slug = item.slug || item.category_slug || null;
            return { id, value, label, slug };
          });
        if (options.length > 0) {
          setExpertTypeOptions(options);
        }
      }
    } catch (e) {
      // keep defaultExpertTypes on failure
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      getProfile();
      fetchExpertTypeOptions();
    }, [fetchExpertTypeOptions]),
  );

  // When category options load from API, normalize expert_type from slugs to ids
  useEffect(() => {
    if (expertTypeOptions.length === 0 || expertTypeOptions[0].id == null) return;
    setExpertType(prev =>
      prev.map(t => {
        const n = Number(t);
        if (!isNaN(n)) return String(t);
        const opt = expertTypeOptions.find(
          o => o.slug === t || o.value === t || String(o.id) === t,
        );
        return opt ? String(opt.id) : t;
      }),
    );
  }, [expertTypeOptions]);

  // Clear primary category if it is no longer in selected interests
  useEffect(() => {
    if (
      primaryCategoryId &&
      !expert_type.includes(primaryCategoryId)
    ) {
      setPrimaryCategoryId(null);
    }
  }, [expert_type, primaryCategoryId]);

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
        setPrimaryCategoryId(savedData.primaryCategoryId ?? null);
        setLookingFor(savedData.lookingFor || '');
        setInsta(savedData.insta || '');
        setFb(savedData.fb || '');
        setLinkedin(savedData.Linkedin || '');
        setYoutube(savedData.youtube || '');
        setTiktok(savedData.tiktok || '');
        setXLink(savedData.xLink || '');
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
        primaryCategoryId,
        lookingFor,
        insta,
        fb,
        Linkedin,
        youtube,
        tiktok,
        xLink,
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
    primaryCategoryId,
    lookingFor,
    insta,
    fb,
    Linkedin,
    youtube,
    tiktok,
    xLink,
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
              <View style={{marginBottom: 12, paddingHorizontal: 15}}>
                {isFromGuide && (
                  <View
                    style={{
                      alignSelf: 'center',
                      backgroundColor: '#E6F0FA', // light blue background
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      marginBottom: 6,
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
                        {marginEnd: 4, marginTop: 4},
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

                    <View style={{marginTop: 10}}>
                      <Text
                        style={[
                          DefaultStyle.blackBold,
                          {color: COLORS.primary, marginBottom: 8},
                        ]}>
                        Select your Category(s)
                      </Text>

                      <MultiSelect
                        data={expertTypeOptions}
                        labelField="label"
                        valueField="value"
                        placeholder="Select your Category(s)"
                        value={expert_type}
                        onChange={item => setExpertType(item)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: COLORS.gray,
                          minHeight: 48,
                        }}
                        containerStyle={{marginBottom: 4}}
                        placeholderStyle={{color: COLORS.gray, fontSize: 14}}
                        selectedStyle={{
                          borderRadius: 6,
                          backgroundColor: COLORS.primary,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          marginRight: 6,
                          marginBottom: 6,
                        }}
                        selectedTextStyle={{color: COLORS.white, fontSize: 13}}
                        inputSearchStyle={{
                          height: 44,
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          borderColor: COLORS.gray,
                        }}
                        search
                        searchPlaceholder="Search categories..."
                      />
                    </View>

                    <View style={{marginTop: 15, zIndex: 1000}}>
                      <Text
                        style={[
                          DefaultStyle.blackBold,
                          {color: COLORS.primary, marginBottom: 8},
                        ]}>
                        Primary category
                      </Text>
                      <DropDownPicker
                        open={primaryCategoryOpen}
                        value={primaryCategoryId}
                        items={primaryCategoryOptions}
                        setOpen={setPrimaryCategoryOpen}
                        setValue={setPrimaryCategoryId}
                        placeholder={
                          primaryCategoryOptions.length === 0
                            ? 'Select interests first'
                            : 'Select primary category'
                        }
                        disabled={primaryCategoryOptions.length === 0}
                        style={styles.primaryCategoryDropdown}
                        dropDownContainerStyle={styles.primaryCategoryDropdownContainer}
                        textStyle={styles.primaryCategoryDropdownText}
                        placeholderStyle={styles.primaryCategoryDropdownPlaceholder}
                        listItemContainerStyle={styles.primaryCategoryListItem}
                        zIndex={1000}
                        zIndexInverse={999}
                        listMode="MODAL"
                        modalTitle="Select primary category"
                        modalAnimationType="slide"
                      />
                    </View>

                    <View
                      style={[
                        DefaultStyle.flexDirectionSpace,
                        {marginEnd: 4, marginTop: 10},
                      ]}>
                      <Text
                        style={[
                          DefaultStyle.blackBold,
                          {color: COLORS.primary,paddingBottom:5},
                        ]}>
                       What can I help with/ What am I looking for?
                      </Text>
                      {/* <AppIcons
                      type={'AntDesign'}
                      name={'infocirlceo'}
                      size={20}
                      color={COLORS.black}
                    /> */}
                    </View>
                    {/* Please create your wisdom areas and expain why Users should contact you. */}

                    {/* <View
                      style={{
                        marginBottom: 15,
                        marginTop: 5,
                        flexDirection: 'row',
                      }}> */}
                      {/* <Text style={DefaultStyle.txtgray12}>
                        Please create your wisdom areas. */}
                        {/* <Text style={DefaultStyle.txtgray12bold}>
                            (Refer to questions listed under
                              <Text onPress={()=>{
                                navigation.navigate('HelpVideos', {type:6})
                              }} style={[DefaultStyle.txtgray12bold,{textDecorationLine:'underline'}]}> guidance categories</Text>)
                          </Text> */}
                      {/* </Text> */}
                    {/* </View> */}

                    {help.map((value, index) => (
                      <View key={value.id}>
                        <View style={DefaultStyle.row}>
                          <TextInput
                            style={[
                              styles.inputCollege,
                              {flex: 1, marginEnd: 2},
                            ]}
                            placeholder="Enter your title"
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
                          placeholder="Enter your explanation"
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

                    <View style={styles.socialRow}>
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
                      <View style={{flex: 1, alignSelf: 'stretch', paddingTop: 2}}>
                        <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600', marginLeft: 33}}>Instagram</Text>
                      </View>
                    </View>
                    <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://instagram.com/yourusername</Text>
                    <TextInput
                      style={[styles.socialInput1, styles.socialInputField]}
                      placeholderTextColor={COLORS.gray}
                      value={insta}
                      onChangeText={text => setInsta(text)}
                      keyboardType="default"
                      placeholder="Enter URL"
                    />

                    <View style={styles.socialRow}>
                      <View
                        style={[
                          styles.circlefb,
                          {backgroundColor: COLORS.blue, width: 25, height: 25},
                        ]}>
                        <AppIcons
                          type={'FontAwesome'}
                          name={'facebook'}
                          size={18}
                          color={COLORS.white}
                        />
                      </View>
                      <View style={{flex: 1, alignSelf: 'stretch', paddingTop: 2}}>
                        <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600', marginLeft: 33}}>Facebook</Text>
                      </View>
                    </View>
                    <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://facebook.com/yourusername</Text>
                    <TextInput
                      style={[styles.socialInput1, styles.socialInputField]}
                      placeholderTextColor={COLORS.gray}
                      value={fb}
                      onChangeText={text => setFb(text)}
                      keyboardType="default"
                      placeholder="Enter URL"
                    />

                    <View style={styles.socialRow}>
                      <View
                        style={[
                          styles.circlelinkedin,
                          {backgroundColor: COLORS.primary, marginStart: 0, width: 25, height: 25},
                        ]}>
                        <AppIcons
                          type={'FontAwesome'}
                          name={'linkedin'}
                          size={18}
                          color={COLORS.white}
                        />
                      </View>
                      <View style={{flex: 1, alignSelf: 'stretch', paddingTop: 2}}>
                        <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600', marginLeft: 33}}>LinkedIn</Text>
                      </View>
                    </View>
                    <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://linkedin.com/in/yourusername</Text>
                    <TextInput
                      style={[styles.socialInput1, styles.socialInputField]}
                      placeholderTextColor={COLORS.gray}
                      value={Linkedin}
                      onChangeText={text => setLinkedin(text)}
                      keyboardType="default"
                      placeholder="Enter URL"
                    />

                    <View style={styles.socialRow}>
                      <View
                        style={[
                          styles.circlelinkedin,
                          {backgroundColor: COLORS.black, marginStart: 0, width: 25, height: 25},
                        ]}>
                        <AppIcons
                          type={'MaterialIcons'}
                          name={'tiktok'}
                          size={18}
                          color={COLORS.white}
                        />
                      </View>
                      <View style={{flex: 1, alignSelf: 'stretch', paddingTop: 2}}>
                        <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600', marginLeft: 33}}>TikTok</Text>
                      </View>
                    </View>
                    <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://tiktok.com/@yourusername</Text>
                    <TextInput
                      style={[styles.socialInput1, styles.socialInputField]}
                      placeholderTextColor={COLORS.gray}
                      value={tiktok}
                      onChangeText={text => setTiktok(text)}
                      keyboardType="default"
                      placeholder="Enter URL"
                    />

                    <View style={styles.socialRow}>
                      <View
                        style={[
                          styles.circlelinkedin,
                          {backgroundColor: COLORS.red, marginStart: 0, width: 25, height: 25},
                        ]}>
                        <AppIcons
                          type={'Entypo'}
                          name={'youtube'}
                          size={18}
                          color={COLORS.white}
                        />
                      </View>
                      <View style={{flex: 1, alignSelf: 'stretch', paddingTop: 2}}>
                        <Text style={{fontSize: 15, color: COLORS.black, fontWeight: '600', marginLeft: 33}}>YouTube</Text>
                      </View>
                    </View>
                    <Text style={{fontSize: 12, color: COLORS.gray, marginBottom: 4, alignSelf: 'stretch'}}>ex. - https://youtube.com/@yourusername</Text>
                    <TextInput
                      style={[styles.socialInput1, styles.socialInputField]}
                      placeholderTextColor={COLORS.gray}
                      value={youtube}
                      onChangeText={text => setYoutube(text)}
                      keyboardType="default"
                      placeholder="Enter URL"
                    />

                    <View style={styles.socialRow}>
                      <View
                        style={[
                          styles.circlelinkedin,
                          {backgroundColor: COLORS.black, marginStart: 0, width: 25, height: 25},
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
                      style={[styles.socialInput1, styles.socialInputField]}
                      placeholderTextColor={COLORS.gray}
                      value={xLink ?? ''}
                      onChangeText={text => setXLink(text)}
                      keyboardType="default"
                      placeholder="Enter URL"
                    />
                  </View>
                </View>
              </LoaderV2>
            </ScrollView>
          </View>
          <Button
            title={isGuide ? 'Save ' : 'Save & Next'}
            buttonStyle={[
              DefaultStyle.btnDanger,
              {
                marginTop: 10,
                marginBottom: Platform.OS == 'ios' ? 20 : 30,
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

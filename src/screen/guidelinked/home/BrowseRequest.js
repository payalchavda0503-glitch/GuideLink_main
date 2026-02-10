import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import {Button} from '@rneui/themed';
import debounce from 'lodash.debounce';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AppIcons from '../../../component/AppIcons';
import BottomTab from '../../../component/BottomTab';
import CustomRating from '../../../component/CustomRating ';
import {HeaderSearch} from '../../../component/HeaderSearch';
import IosStatusBar from '../../../component/IosStatusBar';
import Api from '../../../service/Api';
import {
  API_GET_GUIDANCE_DATA,
  API_POKE_USER,
} from '../../../service/apiEndPoint';
import {DefaultStyle} from '../../../util/ConstVar';
import Loader from '../../../util/Loader';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import {log, simpleToast} from '../../../util/Toast';
const PAGE_SIZE = 15; // adjust as per API

const RequestGuidanceScreen = ({navigation}) => {
  const [guidanceRequests, setGuidanceRequests] = useState([]);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [savingId, setSavingId] = useState(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pokePopup, setPokePopup] = useState(false);
  const [userId, setUserId] = useState(0);
  const [isGuide, setIsGuide] = useState(0);
  const [editingText, setEditingText] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const STORAGE_KEY = 'answer';

  useFocusEffect(
    useCallback(() => {
      setGuidanceRequests([]);
      setSearch('');
      setHasMore(true);
      setPage(1);
      fetchGuidanceRequests(1);
      const fetchUserId = async () => {
        const id = await AsyncStorage.getItem('userId');
        const is_guide = await AsyncStorage.getItem('isGuide');
        setUserId(id);
        setIsGuide(is_guide);
      };
      fetchUserId();

      loadSavedData();
    }, []),
  );

  const fetchGuidanceRequests = async (pageNo = 1) => {
    try {
      if (pageNo === 1) setLoadingGuidance(true);
      else setLoadingMore(true);

      let url = `${API_GET_GUIDANCE_DATA}?page=${pageNo}&limit=${PAGE_SIZE}`;

      if (search && search.trim() !== '') {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await Api.get(url);

      if (response.status === 'RC200') {
        const newData = response.data.data || [];
        setLastPage(response.data.last_page);

        if (pageNo === 1) {
          setGuidanceRequests(newData);
        } else {
          setGuidanceRequests(prev => [...prev, ...newData]);
        }

        if (newData.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      log('Failed to load guidance requests');
    } finally {
      setLoadingGuidance(false);
      setLoadingMore(false);
    }
  };

  const onHandleDeatils = id => {
    navigation.navigate('ExpertDetail', {ID: id});
  };

  const pokeUser = async ({to_user_id, answer, question_id}) => {
    if (!answer.trim()) return;
    setSavingId(selectedItem.guidance_id);
    try {
      const payload = {
        to_user_id: to_user_id,
        answer: answer,
        question_id: question_id,
      };
      const response = await Api.post(`${API_POKE_USER}`, payload);
      setEditingText('');
      if (response.status === 'RC200') {
        fetchGuidanceRequests();
        setNewQuestion('');
      }
    } catch (err) {
      setSavingId(false);
      log('Failed to post guidance');
    } finally {
      setSavingId(false);
    }
  };

  const fetchMore = () => {
    if (!loadingMore && hasMore && page < lastPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchGuidanceRequests(nextPage);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce(() => {
        setGuidanceRequests([]);
        setHasMore(true);
        setPage(1);
        fetchGuidanceRequests(1);
      }, 500),
    [search],
  );

  // Load saved answer from AsyncStorage
  const loadSavedData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const savedData = JSON.parse(jsonValue);
        setEditingText(savedData.answer || '');
        console.log('Draft loaded:', savedData.answer);
      }
    } catch (e) {
      console.log('Error loading autosave:', e);
    }
  };

  // Save draft to AsyncStorage
  const saveData = async text => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({answer: text}));
      console.log('Draft auto-saved:', text);
    } catch (e) {
      console.log('Error saving autosave:', e);
    }
  };

  // Debounce saving so it doesn't run on every keystroke
  const debouncedSave = useMemo(
    () => debounce(text => saveData(text), 500),
    [],
  );

  // Whenever editingText changes, trigger autosave
  useEffect(() => {
    if (editingText.trim() !== '') {
      debouncedSave(editingText);
    }
    return () => {
      debouncedSave.cancel();
    };
  }, [editingText]);
  useEffect(() => {
    if (search.trim() === '') {
      setGuidanceRequests([]);
      setHasMore(true);
      setPage(1);
      fetchGuidanceRequests(1);
      return;
    }
    debouncedSearch();
    return debouncedSearch.cancel;
  }, [search]);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <ActivityIndicator
        size={40}
        color={COLORS.primary}
        style={{margin: 16}}
      />
    );
  };

  const toggleExpand = id => {
    setExpandedId(prev => (prev === id ? null : id));
  };
  const ProfileTab = ({user}) => {
    return (
      <Pressable
        onPress={() => {
          onHandleDeatils(user.id);
        }}>
        <View
          style={{
            alignItems: 'center',
            padding: 5,
            flexDirection: 'row',
          }}>
          <View style={profileStyles.imageContent}>
            <Image
              source={{uri: user.profile_image}}
              style={profileStyles.limage}
              resizeMode="cover"
            />
          </View>

          <View style={profileStyles.nameContent}>
            <View
              style={{
                alignItems: 'center',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text style={profileStyles.name}>{user.name}</Text>
              {user.is_email_verified && (
                <Image
                  source={require('../../../assets/images/ic_verify1.png')}
                  resizeMode="contain"
                  style={profileStyles.imgVerify}
                />
              )}
            </View>

            {user.total_rating > 0 && (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <CustomRating
                  ratingSize={12}
                  initialRating={user.total_rating}
                  isshow={true}
                />
                <Text style={[DefaultStyle.text, {marginStart: 4}]}>
                  ({user.total_rating_users})
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderHighlightedText = (text, searchText, textStyle = {}) => {
    if (!text || text === 'null') {
      return <Text style={[DefaultStyle.text, {color: COLORS.black}]}>-</Text>;
    }

    if (!searchText || !text.toLowerCase().includes(searchText.toLowerCase())) {
      return <Text style={textStyle}>{text}</Text>;
    }

    const regex = new RegExp(`(${searchText})`, 'gi');
    const parts = text.split(regex);

    return (
      <Text style={[textStyle]}>
        {parts.map((part, index) => {
          const isMatch = part.toLowerCase() === searchText.toLowerCase();
          return (
            <Text
              key={index}
              style={
                isMatch
                  ? {backgroundColor: COLORS.Yellow, color: COLORS.black}
                  : {}
              }>
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  const renderItem = ({item, index}) => {
    const isExpanded = expandedId === item.guidance_id;
    return (
      <View style={styles.card}>
        <>
          {/* Question Row */}
          <View style={{flexDirection: 'row'}}>
            {/* Left Content */}
            <View style={{flex: 1, flexDirection: 'column'}}>
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <View style={{marginTop: 7}}>
                  <AppIcons
                    type={'FontAwesome'}
                    name={'circle'}
                    size={8}
                    color={COLORS.black}
                  />
                </View>
                {renderHighlightedText(item.question.question || '', search, {
                  fontWeight: 'bold',
                  color: COLORS.black,
                  marginLeft: 8,
                  flexShrink: 1,
                })}
              </View>
              {renderHighlightedText(item.question.questionDesc || '', search, {
                paddingLeft: 16,
                color: COLORS.black,
              })}
            </View>

            {/* Right Icon */}
            <View style={{alignSelf: 'flex-start', marginTop: 5}}>
              <TouchableOpacity onPress={() => toggleExpand(item.guidance_id)}>
                <Icon
                  name={isExpanded ? 'remove' : 'add'}
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile aligned right, below question row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignContent: 'center',
              marginTop: 8,
              marginBottom: 8,
            }}>
            <View>
              <ProfileTab user={item.user} />
              <Text style={{fontSize: 11, color: '#888', marginLeft: 3}}>
                {new Date(item.created_at).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            {item.user_id != userId && (
              <Button
                title={'Poke'}
                buttonStyle={[styles.btnDanger]}
                loading={savingId === item?.guidance_id} // only active button loads
                disabled={savingId === item?.guidance_id}
                onPress={() => {
                  if (isGuide != 1) {
                    simpleToast('Become a guide to allow this function');
                  } else {
                    setPokePopup(true);
                    setSelectedItem(item);
                  }
                }}
              />
            )}
          </View>

          {/* Expandable Answers */}
          {isExpanded && (
            <View style={{marginTop: 8}}>
              {item.answers.length > 0 &&
                item.answers.map((ans, idx) => (
                  <View key={idx} style={styles.answerBox}>
                    {renderHighlightedText(
                      ans.answer || '',
                      search,
                      styles.answerText,
                    )}
                    <View style={{alignItems: 'flex-end'}}>
                      <ProfileTab user={ans.user} />
                      <Text
                        style={{fontSize: 11, color: '#888', marginLeft: 15}}>
                        {new Date(ans.answer_created_at).toLocaleDateString(
                          'en-GB',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          },
                        )}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          )}
        </>
        {/* Separator */}
        {index < guidanceRequests.length - 1 && (
          <View style={styles.separator} />
        )}
      </View>
    );
  };

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <ScreenStatusBar
        backgroundColor={COLORS.primary}
        barStyle="dark-content"
      />
      <View style={{flex: 1}}>
        <HeaderSearch
          search={search}
          setSearch={setSearch}
          placeholder={'Search within all questions'}
          menuiconColor={COLORS.white}
          iconColor={COLORS.black}
          background={COLORS.primary}
          navigation={navigation}
          onSearchClick={() => {}}
        />
        <View style={[DefaultStyle.devider, {marginBottom: 0}]} />

        <View style={styles.container}>
          {loadingGuidance && page === 1 ? (
            <ActivityIndicator
              size={40}
              color={COLORS.primary}
              style={{marginVertical: 10}}
            />
          ) : (
            <FlatList
              data={guidanceRequests}
              renderItem={renderItem}
              keyExtractor={item => item.guidance_id}
              contentContainerStyle={{paddingBottom: 80}}
              showsVerticalScrollIndicator={false}
              onEndReached={fetchMore}
              onEndReachedThreshold={0}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No questions found.</Text>
              }
            />
          )}
        </View>
      </View>

      <Modal
        visible={pokePopup}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPokePopup(false)}>
        <View style={styles.modalContentCenterDialog}>
          <ScrollView
            contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
            keyboardShouldPersistTaps="handled">
            <View style={styles.modalContent}>
              <TextInput
                style={styles.inputMSg}
                keyboardType="default"
                numberOfLines={12}
                textAlignVertical="top"
                placeholder={
                  "Write your reply explaining why you're the best guide to answer this question. You can also review other guide's responses by tapping +"
                }
                multiline={true}
                maxLength={10000}
                value={editingText}
                onChangeText={setEditingText}
              />

              <View
                style={[
                  DefaultStyle.flexAround,
                  {marginVertical: 16, justifyContent: 'space-evenly'},
                ]}>
                <Button
                  title="Cancel"
                  containerStyle={{borderRadius: 20, overflow: 'hidden'}}
                  buttonStyle={[
                    DefaultStyle.btnBorder,
                    {marginVertical: 0, minWidth: 130, borderRadius: 20},
                  ]}
                  titleStyle={[DefaultStyle.whiteBold, {color: COLORS.primary}]}
                  onPress={() => {
                    setPokePopup(false);
                  }}
                />

                <Button
                  title="Post"
                  containerStyle={{borderRadius: 20, overflow: 'hidden'}}
                  buttonStyle={[
                    DefaultStyle.btnLogin,
                    {marginVertical: 0, minWidth: 130},
                  ]}
                  titleStyle={DefaultStyle.whiteBold}
                  onPress={() => {
                    pokeUser({
                      to_user_id: selectedItem.user_id,
                      answer: editingText,
                      question_id: selectedItem.guidance_id,
                    });
                    setPokePopup(false);
                  }}
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <View>
        <BottomTab />
      </View>
      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </>
  );
};

export default RequestGuidanceScreen;

const profileStyles = StyleSheet.create({
  imageContent: {
    alignItems: 'center',
    marginRight: 6, // add some space between image and name
  },
  name: {
    fontSize: 14,
    color: '#8C8C8C',
    fontWeight: 'bold',
    marginEnd: 2,
  },
  nameContent: {
    marginStart: 2,
    flexShrink: 1, // allow text to shrink instead of overflowing
  },
  limage: {
    width: 20,
    height: 20,
    borderRadius: 100,
  },
  imgVerify: {
    width: 10,
    height: 10,
    marginStart: 4,
  },
});

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    width: SIZES.width * 0.9,
    borderRadius: 10,
    padding: 10,
    elevation: 1,
  },
  modalContentCenterDialog: {
    position: 'absolute', // Ensure it stacks on top
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    elevation: 0,
  },
  card: {
    backgroundColor: '#fff',
    paddingLeft: 5,
    paddingRight: 5,
    marginVertical: 6,
  },
  btnDanger: {
    paddingHorizontal: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 10,
  },
  inputMSg: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    minHeight: 80,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  answerBox: {
    backgroundColor: '#f2f2f2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  answerText: {
    color: '#000',
    fontSize: 15,
    marginBottom: 5,
  },
  container: {flex: 1, backgroundColor: '#fff', padding: 15},
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  emptyText: {color: COLORS.gray, textAlign: 'center', marginVertical: 20},
});

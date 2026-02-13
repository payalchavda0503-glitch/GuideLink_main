import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import AppIcons from '../../../component/AppIcons';
import BottomTab from '../../../component/BottomTab';
import {Header} from '../../../component/Header';
import IosStatusBar from '../../../component/IosStatusBar';
import {CustomDialogVerifyEmail} from '../../../component/customDialog';
import Api from '../../../service/Api';
import {
  API_CATEGORY_LIST,
  API_GET_DASHBOARD,
  API_LATEST_USER,
  API_NOTIFICATION,
  API_UPDATE_FCB,
} from '../../../service/apiEndPoint';
import {BASE_URL, WEB_URL} from '../../../service/apiEndPoint';
import Loader from '../../../util/Loader';
import {getFcmToken} from '../../../util/Pref';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import {log} from '../../../util/Toast';
import List from '../expert/List';
import RequestGuidanceScreen from './RequestGuidance';
import VideoBanners from './VideoBanners';
import {styles} from './styles';

const HomeIndex = ({navigation}) => {
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [recentList, setRecentList] = useState([]);
  const [search, setSearch] = useState('');
  const [upcomingAppt, setUpcomingAppt] = useState('');

  const [list, setList] = useState([]);
  const [emailList, setEmailList] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState('');
  const [loader, setLoader] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isEmpty, setIsEmpty] = useState(false);
  const [expertType, setExpertType] = useState('all_guides');

  const [isEmailDialog, setEmailDialog] = useState(false);
  const [hasLoadedFirstPage, setHasLoadedFirstPage] = useState(false);
  const requestTokenRef = useRef(0);

  const flatListRef = useRef(null);
  const flatListDataLengthRef = useRef(0);
  const [isGuide, setIsGuide] = useState(0);

  const [isFilterVisible, setFilterVisible] = useState(false);

  const [value, setValue] = useState(expertType);
  const [tab, setSelectedTab] = useState('guides');
  const defaultCategories = [{label: 'All Guides', value: 'all_guides', image: null}];
  const [items, setItems] = useState(defaultCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [shouldScrollGuides, setShouldScrollGuides] = useState(false);

  const getCategoryImageUrl = img => {
    if (!img || typeof img !== 'string') return null;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    const base = WEB_URL.replace(/\/$/, '');
    return img.startsWith('/') ? base + img : base + '/' + img;
  };

  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const res = await Api.get(`${API_CATEGORY_LIST}?show=all`);
      if (res?.status === 'RC200' && Array.isArray(res?.data)) {
        const apiList = res.data.map(item => {
          const label = item.name || item.title || item.category_name || String(item.id);
          const rawValue = item.expert_type || item.type || item.slug || item.id;
          const value = rawValue != null ? String(rawValue) : String(item.id);
          const img = item.thumbnail || item.image || item.image_url || item.icon || null;
          return {
            label,
            value,
            image: img ? getCategoryImageUrl(img) : null,
          };
        });
        setItems([{label: 'All Guides', value: 'all_guides', image: null}, ...apiList]);
      }
    } catch (e) {
      console.warn('Home categories fetch failed, using defaults:', e);
      setItems([{label: 'All Guides', value: 'all_guides', image: null}]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  useEffect(() => {
    if (shouldScrollGuides && list.length > 0) {
      setTimeout(() => {
        scrollToGuides();
        setShouldScrollGuides(false);
      }, 10);
    }
  }, [shouldScrollGuides, list]);

  useEffect(() => {
    const valueInItems = items.some(it => String(it.value) === String(value));
    if (items.length > 0 && !valueInItems) {
      setValue('all_guides');
    }
  }, [items]);

  const EmailVerifyDialog = () => {
    setEmailDialog(!isEmailDialog);
  };

  const getGuideData = async () => {
    const currentRequestToken = ++requestTokenRef.current;

    try {
      if (currentPage === 1) setLoaderVisible(true);
      if (currentPage > 1) setLoader(true);

      const guideCategory =
        expertType === 'all_guides' ? 'all-guides' : String(expertType || '');
      const response = await Api.get(
        `${API_LATEST_USER}?page=${currentPage}&search=${encodeURIComponent(search || '')}&guide_category=${encodeURIComponent(guideCategory)}`,
      );

      // After API responds: check if this call is still the latest
      if (currentRequestToken !== requestTokenRef.current) {
        // If not latest, ignore this response to prevent overwriting new tab data
        return;
      }

      setLoaderVisible(false);
      setLoader(false);

      if (response.status === 'RC200') {
        const result = response.data;
        setTotalRecords(result.total);
        setLastPage(result?.last_page);

        setIsEmpty(result.total === 0);

        if (Number(result?.current_page) === 1) {
          setList(result.data || []);
        } else {
          setList(prev => [...prev, ...(result.data || [])]);
        }
        return true;
      }
    } catch (error) {
      if (currentRequestToken !== requestTokenRef.current) {
        // Ignore outdated errors
        return;
      }
      setLoaderVisible(false);
      setLoader(false);
    }
  };

  // Dashboard data (side info, not affected by expertType/page)
  const getData = async () => {
    try {
      setLoaderVisible(true);
      const response = await Api.get(API_GET_DASHBOARD);

      if (response.status == 'RC200') {
        const data = response.data;
        setRecentList(data.recent_users);
        setUpcomingAppt(data.upcoming_appt);
      }

      setTimeout(() => {
        setLoaderVisible(false);
      }, 500);
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  const updateFcm = () => {
    try {
      getFcmToken().then(async FCMID => {
        const formData = {
          token: FCMID,
        };
        const response = await Api.post(
          `${API_NOTIFICATION}/${API_UPDATE_FCB}`,
          formData,
        );
        if (response.status === 'RC200') {
          console.log('fcm token updated');
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    reset();
  }, [expertType]);

  useEffect(() => {
    if (value) {
      setExpertType(value);
      setCurrentPage(1);
    }
  }, [value]);

  useEffect(() => {
    let isFirst = currentPage === 1 || !hasLoadedFirstPage;
    getGuideData().then(() => {
      if (isFirst) setHasLoadedFirstPage(true);
    });
    // eslint-disable-next-line
  }, [currentPage, expertType]);

  useFocusEffect(
    useCallback(() => {
      updateFcm();
      getData();
      fetchCategories();
      const fetchUserId = async () => {
        setTimeout(async () => {
          const guideFlag = await AsyncStorage.getItem('isGuide');
          setIsGuide(guideFlag);
        }, 2000);
      };
      fetchUserId();
    }, [fetchCategories]),
  );

  const fetchMore = () => {
    if (
      hasLoadedFirstPage &&
      Number(currentPage) < Number(lastPage) &&
      !loader &&
      !loaderVisible
    ) {
      setCurrentPage(prev => Number(prev) + 1);
    }
  };

  const reset = () => {
    requestTokenRef.current++;
    setCurrentPage(1);
    setList([]);
    setTotalRecords(0);
    setIsEmpty(false);
    setHasLoadedFirstPage(false);
  };

  // Navigation handlers
  const onHandleDeatils = id => {
    navigation.navigate('ExpertDetail', {ID: id});
  };

  const onHandleBook = (id, fullname) => {
    navigation.navigate('BookAppointment', {UID: id});
  };

  const scrollToGuides = () => {
    const index = flatListData.findIndex(item => item.type === 'listHeader');
    if (index === -1 || !flatListRef.current) return;
    requestAnimationFrame(() => {
      const maxIndex = flatListDataLengthRef.current - 1;
      if (maxIndex < 0 || index > maxIndex) return;
      flatListRef.current?.scrollToIndex({index, animated: true});
    });
  };

  // Build combined flatList data
  const flatListData = useMemo(() => {
    let data = [];
    // All guides list at top (horizontal scroll) + search + Become a Guide
    data.push({id: 'allGuidesHeader', type: 'allGuidesHeader'});
    // Commented out: video banner and 4 boxes – do not delete, restore by uncommenting below
    // data.push({id: 'banner', type: 'banner'});
    // data.push({id: 'quickActions', type: 'quickActions'});
    data.push({id: 'tabs', type: 'tabs'});
    if (isEmpty) {
      data.push({id: 'empty', type: 'empty'});
    } else {
      if (totalRecords > 0) {
        // 🔹 Insert our four buttons row here

        data.push({id: 'listHeader', type: 'listHeader'});
      }
      if (tab == 'guides') {
        (list || []).forEach(item => {
          data.push({...item, type: 'guide'});
        });
      } else {
        data.push({id: 'request_guidance', type: 'request_guidance'});
      }
    }
    return data;
  }, [isEmpty, list, totalRecords]);

  flatListDataLengthRef.current = flatListData.length;

  // Render different list items
  const renderItem = ({item}) => {
    switch (item.type) {
      case 'allGuidesHeader':
        return (
          <View style={newStyles.allGuidesHeaderContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={newStyles.allGuidesCategoriesScroll}
              style={newStyles.allGuidesCategoriesScrollView}>
              {items.map(filterItem => {
                const isActive = value === filterItem.value;
                const imageUri = filterItem.image || null;
                const isAllGuides = filterItem.value === 'all_guides';
                const showImage = imageUri || isAllGuides;
                const imageSource = isAllGuides
                  ? require('../../../assets/images/gudiecategory.jpg')
                  : {uri: imageUri};
                return (
                  <TouchableOpacity
                    key={filterItem.value}
                    onPress={() => {
                      setValue(filterItem.value);
                      setSelectedTab('guides');
                      setShouldScrollGuides(true);
                    }}
                    activeOpacity={0.8}
                    style={newStyles.allGuidesCategoryChipWrap}>
                    <View
                      style={[
                        newStyles.allGuidesCategoryChip,
                        isActive && newStyles.allGuidesCategoryChipActive,
                      ]}>
                      {showImage ? (
                        <Image
                          source={imageSource}
                          style={newStyles.allGuidesCategoryChipImage}
                          resizeMode="cover"
                        />
                      ) : null}
                    </View>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={[
                        newStyles.allGuidesCategoryLabelBelow,
                        isActive && newStyles.allGuidesCategoryLabelBelowActive,
                      ]}>
                      {filterItem.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {(() => {
              const isGuideUser = Number(isGuide) >= 1 || isGuide === '1' || isGuide === '2';
              if (isGuideUser) return null;
              return (
                <View style={newStyles.allGuidesSearchRow}>
                  <TouchableOpacity
                    style={newStyles.allGuidesBecomeButton}
                    onPress={() => navigation.navigate('ProfileTabIndex', {guide: true})}>
                    <Text style={newStyles.allGuidesBecomeButtonText}>
                      Become a Guide
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        );

      /* ----- COMMENTED OUT: video banner – restore by uncommenting below ----- */
      case 'banner':
        return null;
        // return (
        //   <>
        //     <VideoBanners />
        //     {upcomingAppt && (
        //       <View style={{backgroundColor: COLORS.gray2}}>
        //         <View style={{padding: 5}}>
        //           <Text style={styles.nextApt}>
        //             Your Next Appointment is on
        //           </Text>
        //           <Text style={styles.date}>{upcomingAppt}</Text>
        //         </View>
        //       </View>
        //     )}
        //   </>
        // );

      /* ----- COMMENTED OUT: 4 boxes (Browse Guides, Become a Guide, Ask a Question, Browse Questions) – restore by uncommenting below ----- */
      case 'quickActions':
        return null;
        // return (
        //   <View style={newStyles.quickActionsContainer}>
        //     <TouchableOpacity
        //       style={[newStyles.quickButton, {backgroundColor: COLORS.primary}]}
        //       onPress={async () => {
        //         setSelectedTab('guides');
        //         reset();
        //         let isFirst = currentPage === 1 || !hasLoadedFirstPage;
        //         const success = await getGuideData().then(() => {
        //           if (isFirst) setHasLoadedFirstPage(true);
        //           return true;
        //         });
        //         if (success) {
        //           setShouldScrollGuides(true);
        //         }
        //       }}>
        //       <View style={newStyles.quickButtonTopRow}>
        //         <AppIcons
        //           type={'FontAwesome'}
        //           name={'graduation-cap'}
        //           size={29}
        //           color={COLORS.white}
        //         />
        //         <Icon name="chevron-right" size={20} color="#fff" />
        //       </View>
        //       <Text style={newStyles.quickButtonText}>Browse Guides</Text>
        //     </TouchableOpacity>
        //
        //     <TouchableOpacity
        //       style={[newStyles.quickButton, {backgroundColor: COLORS.primary}]}
        //       onPress={() =>
        //         isGuide == 1
        //           ? navigation.navigate('AvailibilityTabIndex', {guide: true})
        //           : navigation.navigate('ProfileTabIndex', {guide: true})
        //       }>
        //       <View style={newStyles.quickButtonTopRow}>
        //         {isGuide == 1 ? (
        //           <AppIcons
        //             name="calendar"
        //             type={'Feather'}
        //             size={30}
        //             color={COLORS.white}
        //           />
        //         ) : (
        //           <Icon name="user-plus" size={30} color="#fff" />
        //         )}
        //         <Icon name="chevron-right" size={20} color="#fff" />
        //       </View>
        //       <Text style={newStyles.quickButtonText}>
        //         {isGuide == 1 ? 'Time Slots' : 'Become a Guide'}
        //       </Text>
        //     </TouchableOpacity>
        //
        //     <TouchableOpacity
        //       style={[newStyles.quickButton, {backgroundColor: COLORS.primary}]}
        //       onPress={() => {
        //         setSelectedTab('request_guidance');
        //         setList([]);
        //         if (tab == 'request_guidance') {
        //           scrollToGuides();
        //         } else {
        //           setTimeout(() => {
        //             scrollToGuides();
        //           }, 1000);
        //         }
        //       }}>
        //       <View style={newStyles.quickButtonTopRow}>
        //         <Icon name="help-circle" size={30} color="#fff" />
        //         <Icon name="chevron-right" size={20} color="#fff" />
        //       </View>
        //       <Text style={newStyles.quickButtonText}>Ask a Question</Text>
        //     </TouchableOpacity>
        //
        //     <TouchableOpacity
        //       style={[newStyles.quickButton, {backgroundColor: COLORS.primary}]}
        //       onPress={() => navigation.navigate('RequestGuidanceScreen')}>
        //       <View style={newStyles.quickButtonTopRow}>
        //         <Icon name="list" size={30} color="#fff" />
        //         <Icon name="chevron-right" size={20} color="#fff" />
        //       </View>
        //       <Text style={newStyles.quickButtonText}>Browse Questions</Text>
        //     </TouchableOpacity>
        //   </View>
        // );

      case 'tabs':
        return (
          <></>
          // <View
          //   style={{
          //     flexDirection: 'row',
          //     marginTop: 0,
          //     borderBottomWidth: 1,
          //     borderBottomColor: '#ccc',
          //     backgroundColor: 'white',
          //   }}>
          //   {expert.map(type => (
          //     <View
          //       key={type}
          //       style={{
          //         flex: 1,
          //         alignItems: 'center',
          //         paddingVertical: 10,
          //         borderBottomWidth: 2,
          //         borderBottomColor:
          //           tab === type ? COLORS.primary : 'transparent',
          //       }}>
          //       <Text
          //         onPress={() => {
          //           setSelectedTab(type);
          //           if (type == 'guides') {
          //             getGuideData();
          //           } else {
          //             reset();
          //           }
          //         }}
          //         style={{
          //           color: tab === type ? COLORS.primary : COLORS.gray,
          //           fontWeight: tab === type ? 'bold' : 'normal',
          //         }}>
          //         {type === 'guides' ? 'Guides' : 'Request Guidance'}
          //       </Text>
          //     </View>
          //   ))}
          // </View>
        );

      case 'listHeader':
        return (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'flex-end',
              backgroundColor: '#fff',
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}>
            {/* ----- COMMENTED OUT: All guides / filter button (shown after Become a Guide) – restore by uncommenting below ----- */}
            {tab == 'guides' ? null : null}
            {/* {tab == 'guides' ? (
              <>
                <TouchableOpacity
                  onPress={() => setFilterVisible(true)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#ccc',
                    backgroundColor: '#fff',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Icon name="filter" size={15} color="#8C8C8C" />
                    <Text style={{color: COLORS.gray, marginLeft: 5}}>
                      {value === 'all_guides'
                        ? 'All Guides'
                        : value === 'student_expert'
                        ? 'College Guides'
                        : value === 'edu_verified_guides'
                        ? '.edu Verified Guides'
                        : 'Other Guides'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <></>
            )} */}
          </View>
        );

      case 'empty':
        return (
          <View style={newStyles.emptyContainer}>
            <Text style={newStyles.emptyText}>
              Sorry, no user found matching your search. Please try with other
              options.
            </Text>
          </View>
        );
      case 'guide':
        return (
          <List
            item={item}
            onHandleDeatils={onHandleDeatils}
            onHandleBook={onHandleBook}
            onVerifiedEmailClick={eList => {
              setEmailList(eList);
              EmailVerifyDialog();
            }}
          />
        );

      case 'request_guidance':
        return (
          <RequestGuidanceScreen
            onHandleDeatils={onHandleDeatils}></RequestGuidanceScreen>
        );

      default:
    }
  };

  const keyExtractor = item => {
    if (item.type === 'banner') return 'banner';
    if (item.type === 'tabs') return 'tabs';
    if (item.type === 'listHeader') return 'listHeader';
    if (item.type === 'empty') return 'empty';
    return `guide-${item.id}`;
  };

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="light-content"
        />
        <View style={styles.container}>
          <Header
            menuiconColor={COLORS.white}
            iconColor={COLORS.black}
            navigation={navigation}
            background={COLORS.primary}
            isDasboard={true}
          />
          {tab == 'guides' ? (
            <FlatList
              ref={flatListRef}
              data={flatListData}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              stickyHeaderIndices={[1]}
              onEndReached={fetchMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                loader ? (
                  <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                    style={{marginVertical: 20}}
                  />
                ) : null
              }
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              contentContainerStyle={{paddingBottom: 150}}
            />
          ) : (
            <FlatList
              ref={flatListRef}
              data={flatListData}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              stickyHeaderIndices={[1]}
              onEndReachedThreshold={0.01}
              ListFooterComponent={
                loader ? (
                  <ActivityIndicator
                    size="large"
                    color={COLORS.primary}
                    style={{marginVertical: 20}}
                  />
                ) : null
              }
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              contentContainerStyle={{paddingBottom: 150}}
            />
          )}

          {emailList.length !== 0 && (
            <CustomDialogVerifyEmail
              visible={isEmailDialog}
              emailList={emailList}
              onClose={EmailVerifyDialog}
              onConfirm={EmailVerifyDialog}
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <View>
        <BottomTab onHomePress={scrollToTop} />
      </View>
      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />

      <Modal
        transparent
        visible={isFilterVisible}
        animationType="fade"
        onRequestClose={() => setFilterVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '80%',
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 20,
            }}>
            <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 16}}>
              Select Guide Type
            </Text>

            {items.map(option => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setValue(option.value);
                  setFilterVisible(false);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                }}>
                <View
                  style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: COLORS.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 10,
                  }}>
                  {value === option.value && (
                    <View
                      style={{
                        height: 10,
                        width: 10,
                        borderRadius: 5,
                        backgroundColor: COLORS.primary,
                      }}
                    />
                  )}
                </View>
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Cancel button */}
            <TouchableOpacity
              onPress={() => setFilterVisible(false)}
              style={{
                marginTop: 10,
                alignSelf: 'flex-end',
                padding: 5,
              }}>
              <Text style={{color: COLORS.primary}}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Add new styles to existing styles
const newStyles = StyleSheet.create({
  allGuidesHeaderContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  allGuidesCategoriesScrollView: {
    marginBottom: 14,
  },
  allGuidesCategoriesScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    paddingRight: 16,
  },
  allGuidesCategoryChipWrap: {
    alignItems: 'center',
    width: 84,
  },
  allGuidesCategoryChip: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#e0e0e0',
    overflow: 'hidden',
  },
  allGuidesCategoryChipImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  allGuidesCategoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    borderWidth: 0,
  },
  allGuidesCategoryLabelBelow: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.black2 || '#333',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  allGuidesCategoryLabelBelowActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  allGuidesSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  allGuidesSearchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background || '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray || '#e0e0e0',
  },
  allGuidesSearchIcon: {
    marginRight: 8,
  },
  allGuidesSearchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.black,
  },
  allGuidesBecomeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  allGuidesBecomeButtonDisabled: {
    backgroundColor: COLORS.primary,
  },
  allGuidesBecomeButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  allGuidesBecomeButtonTextDisabled: {
    color: COLORS.white,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  quickButton: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 4,
  },
  quickButtonTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'start',
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    color: COLORS.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  listHeader: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listHeaderText: {
    color: COLORS.gray,
    fontSize: 13,
    fontWeight: '500',
  },
  emptyContainer: {
    height: SIZES.height * 0.5,
    justifyContent: 'center',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

const combinedStyles = {
  ...styles,
  ...newStyles,
};

export default HomeIndex;

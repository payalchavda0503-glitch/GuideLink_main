import {
    Pressable,
    Image,
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    Linking,
    Modal,
  } from 'react-native';
  import React, {useCallback, useEffect, useState} from 'react';
  import AppHeader from '../../../component/AppHeader';
  import {SafeAreaView} from 'react-native';
  import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
  import {COLORS, SIZES} from '../../../util/Theme';
  import {styles} from './styles';
  import Loader from '../../../util/Loader';
  import Api from '../../../service/Api';
  import {API_SCHEDULE_DELETE_SLOT, API_SCHEDULE_MY_TIMELINE, API_STRIPE_ONBOARDING_LINK} from '../../../service/apiEndPoint';
  import TimeSlotRates from './TimeSlotRates';
  import AddAvailability from './AddAvailability';
  import {DrawerActions, useFocusEffect} from '@react-navigation/native';
  import {FlatList} from 'react-native-gesture-handler';
  import AppIcons from '../../../component/AppIcons';
  import BottomTab from '../../../component/BottomTab';
  import {Button} from '@rneui/themed';
  import {DefaultStyle} from '../../../util/ConstVar';
  import {CustomCancelTimeSlotDialog} from '../../../component/customDialog';
  import ExpandCollapseView from './ExpandCollapseView';
  import IosStatusBar from '../../../component/IosStatusBar'
  
  const IndexV1 = ({navigation}) => {
    const [showDialog, setShowDialog] = useState(false);
    const [loaderVisible, setLoaderVisible] = useState(true);
  
    const [onboardingStatus, setOnboardingStatus] = useState(-2);
    const [rates, setRates] = useState('');
    const [timeline, setTimeline] = useState([]);
  
    const [isCancelTimeSlot, setIsCanclelTimeSlot] = useState(false);
  
    const [deleteSlotTimeArr, setDeleteSlotTimeArr] = useState([])
  
    const isCancelTimeSlotDialog = () => {
      setIsCanclelTimeSlot(!isCancelTimeSlot);
    };
  
    const getData = async () => {
      setOnboardingStatus(-2)
      setLoaderVisible(true);
      console.log("calling v")
  
      // static 1 is the page number
      const response = await Api.get(`${API_SCHEDULE_MY_TIMELINE}/1`);
  
      if (response.status == 'RC200') {
        let data = response.data;
  
        setRates(data.rates);
        setOnboardingStatus(data.onboarding_status)
        setTimeline(data.timeline);
      }
  
      setLoaderVisible(false);
    };
  
    const deleteSlotAPICall = async () => {
  
      const formdata = new FormData();
  
      deleteSlotTimeArr.map((val, index) => {
        formdata.append(`time[${index}][id]`, val.id);
        formdata.append(`time[${index}][date]`, val.date);
        formdata.append(`time[${index}][start]`, val.start);
        formdata.append(`time[${index}][end]`, val.end);
      });
  
      setLoaderVisible(true);
  
      const response = await Api.post(API_SCHEDULE_DELETE_SLOT, formdata);
      console.log("calling", response.status == 'RC200')
      setLoaderVisible(false);
  
      if (response.status == 'RC200') {
        console.log("calling")
        setTimeline([])
        setDeleteSlotTimeArr([])
        console.log("calling")
        getData()
        console.log("after calling")
      }
  
    }
  
    
    const getStripeOnboardingLink = async () => {
  
      setLoaderVisible(true);
  
      // static 1 is the page number
      const response = await Api.get(`${API_STRIPE_ONBOARDING_LINK}`);
  
      if (response.status == 'RC200') {
        let data = response.data;
  
        navigation.navigate('OnboardingProcess', {INIT_URL: data.url});
  
        //Linking.openURL(data.url)
        
      }
  
      setLoaderVisible(false);
    };
  
    useFocusEffect(
      useCallback(() => {
        getData();
      }, []),
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
  
    return (
      <>
      <IosStatusBar backgroundColor={COLORS.primary}/>
      {/* <SafeAreaView style={styles.container}> */}
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
          tittle={'My Availability Rates'}
          titleColor={COLORS.white}
        />
  
        <View style={{flexDirection: 'column', flex:1}}>
            
            {onboardingStatus!=-2 && (
              onboardingStatus==-1 ? (
                <>
                  <View style={{flexDirection: 'column', flex:1, justifyContent: 'center', alignItems : 'center', paddingHorizontal: 20}}>
                    <AppIcons
                      type={'MaterialCommunityIcons'}
                      name={'account-cash'}
                      size={150}
                      color={COLORS.primary}
                    />
                      <Text
                          style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: COLORS.primary,
                          }}>
                         Bank account linking with Strip
                      </Text>
                      <Text
                          style={{
                            fontSize: 16,
                            marginTop: 10,
                            textAlign: 'center',
                            fontWeight: 'normal',
                          }}>
                          Please setup stripe account for automatic payout after your appointments completed.
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            marginTop: 6,
                            textAlign: 'center',
                            fontWeight: 'normal',
                          }}>
                          After account setup completed, You will be able to set your slot rates and availability.
                        </Text>
    
                        <Button
                            title="Link your Bank Account"
                            buttonStyle={[
                              DefaultStyle.btnLogin,
                              {
                                backgroundColor: COLORS.primary,
                                borderRadius: 10,
                                marginLeft: 10,
                                marginVertical: 0,
                                marginTop: 30,
                              },
                            ]}
                            titleStyle={{color: COLORS.white}}
                            onPress={() => {
                              getStripeOnboardingLink()
                            }}
                          />
                        
                  </View>
                </>
              ) : (onboardingStatus==0 ? (
                <>
                  <View style={{flexDirection: 'column', flex:1, justifyContent: 'center', alignItems : 'center', paddingHorizontal: 20}}>
                    <AppIcons
                      type={'MaterialCommunityIcons'}
                      name={'account-alert'}
                      size={150}
                      color={COLORS.primary}
                    />
                      <Text
                          style={{
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: COLORS.primary,
                          }}>
                          Details Submission Pending
                      </Text>
                      <Text
                          style={{
                            fontSize: 16,
                            marginTop: 10,
                            textAlign: 'center',
                            fontWeight: 'normal',
                          }}>
                          Please fill all required details which stripe needs to complete the onboarding process.
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            marginTop: 6,
                            textAlign: 'center',
                            fontWeight: 'normal',
                          }}>
                          After account setup completed, You will be able to set your slot rates and availability.
                        </Text>
    
                        <Button
                            title="Link your Bank Account"
                            buttonStyle={[
                              DefaultStyle.btnLogin,
                              {
                                backgroundColor: COLORS.primary,
                                borderRadius: 10,
                                marginLeft: 10,
                                marginVertical: 0,
                                marginTop: 30,
                              },
                            ]}
                            titleStyle={{color: COLORS.white}}
                            onPress={() => {
                              getStripeOnboardingLink()
                            }}
                          />
                        
                  </View>
                </>
              ) : (
                <>
                    <ScrollView showsVerticalScrollIndicator={false}>
                      <TimeSlotRates rates={rates} />
    
                      <Text
                        style={{
                          padding: 10,
                          fontSize: 18,
                          fontWeight: 'bold',
                          color: COLORS.black,
                        }}>
                        Current Availability
                      </Text>
  
                      <FlatList
                        data={timeline}
                        contentContainerStyle={{paddingBottom: 35}}
                        keyExtractor={item => `level_1_${item.label}`}
                        ItemSeparatorComponent={Divider}
                        nestedScrollEnabled={false}
                        renderItem={({item, index})=> (
                          <ExpandCollapseView 
                            index={index}
                            heading={(
                                <Text style={styles.listItemHeading}>
                                  {item.label}{' '}
                                  {item.total_slots != 0 && <>({item.total_slots} slots)</>}
                                </Text>
                            )}
                            contents={
                              <View style={[styles.listItemSlotContainer, {backgroundColor: COLORS.gray2}]}>
  
                                {item.slots.length>0 &&
                                <>
                                    {item.total_slots>0 &&(
                                        <TouchableOpacity
                                          style={{
                                            padding: 10
                                          }}
                                          onPress={(event) => {
                                            event.stopPropagation()
                                            
                                            setDeleteSlotTimeArr(item.slots)
                                            
                                            isCancelTimeSlotDialog();
                                          }}>
                                              <Text style={{color: COLORS.red}}>Delete All Slots of this day</Text>
                                          </TouchableOpacity>
                                      )}
  
                                      <FlatList
                                          data={item.slots}
                                          keyExtractor={itm => `level_2_${itm.label}`}
                                          ItemSeparatorComponent={Divider}
                                          nestedScrollEnabled={false}
                                          renderItem={({item:subItem})=>(
                                            <View
                                              style={[
                                                {
                                                  padding: 5,
                                                  paddingHorizontal: 20,
                                                  flexDirection: 'row',
                                                  alignItems: 'center',
                                                },
                                              ]}>
                                                <Text style={styles.listItemSlotHeading}>{subItem.label_mytimeline}</Text>
                                                <TouchableOpacity
                                                  style={{padding: 3}}
                                                  onPress={() => {
                                                    
                                                    setDeleteSlotTimeArr([
                                                      {
                                                        id: subItem.id,
                                                        date: subItem.date,
                                                        start: subItem.start,
                                                        end: subItem.end,
                                                      }
                                                    ])
                                                    
                                                    isCancelTimeSlotDialog();
                                                  }}>
                                                  <AppIcons
                                                    type={'AntDesign'}
                                                    name={'closesquareo'}
                                                    size={28}
                                                    color={COLORS.red}
                                                  />
                                                </TouchableOpacity>
                                              </View>
                                          )}
                                      />
                                   </>
                                  }
  
                                {item.days.length>0 && (
                                  <FlatList
                                    data={item.days}
                                    keyExtractor={itm => `level_2_${itm.label}`}
                                    ItemSeparatorComponent={Divider}
                                    contentContainerStyle={{paddingLeft: 10}}
                                    nestedScrollEnabled={true}
                                    
                                    renderItem={({item:subItem, index:subIndex})=>(
                                      <ExpandCollapseView
                                          index={subIndex}
                                          heading={(
                                            <Text style={styles.listItemHeading}>
                                              {subItem.label}{' '}
                                              {subItem.total_slots != 0 && <>({subItem.total_slots} slots)</>}
                                            </Text>
                                          )}
                                          contents={
                                            <>
                                              {subItem.total_slots>0 &&(
                                                <TouchableOpacity
                                                  style={{
                                                    padding: 10
                                                  }}
                                                  onPress={(event) => {
                                                    event.stopPropagation()
                                                    
                                                    setDeleteSlotTimeArr(subItem.slots)
                                                    
                                                    isCancelTimeSlotDialog();
                                                  }}>
                                                      <Text style={{color: COLORS.red}}>Delete All Slots of this day</Text>
                                                  </TouchableOpacity>
                                              )}
                                              <FlatList
                                                data={subItem.slots}
                                                keyExtractor={itm => `level_2_${itm.label}`}
                                                ItemSeparatorComponent={Divider}
                                                nestedScrollEnabled={true}
                                                renderItem={({item:subItem2})=>(
                                                  <View
                                                    style={[
                                                      {
                                                        padding: 5,
                                                        paddingHorizontal: 30,
                                                        flexDirection: 'row',
                                                        alignItems: 'center',
                                                      },
                                                    ]}>
                                                      <Text style={styles.listItemSlotHeading}>{subItem2.label_mytimeline}</Text>
                                                      <TouchableOpacity
                                                        style={{padding: 3}}
                                                        onPress={() => {
                                                          
                                                          setDeleteSlotTimeArr([
                                                            {
                                                              id: subItem2.id,
                                                              date: subItem2.date,
                                                              start: subItem2.start,
                                                              end: subItem2.end,
                                                            }
                                                          ])
                                                          
                                                          isCancelTimeSlotDialog();
                                                        }}>
                                                        <AppIcons
                                                          type={'AntDesign'}
                                                          name={'closesquareo'}
                                                          size={28}
                                                          color={COLORS.red}
                                                        />
                                                      </TouchableOpacity>
                                                    </View>
                                                )}
                                            />
                                            </>
                                          }
                                        />
                                    )}
                                />)}
  
                                {(item.slots.length==0 && item.days.length==0) && (
                                  <Text
                                    style={[
                                      {
                                        color: COLORS.black,
                                        fontWeight: 'normal',
                                        textAlign: 'center',
                                        flex: 1,
                                        paddingVertical: 10,
                                        fontSize: 14,
                                      }
                                    ]}>
                                    Time slot has not been set up yet
                                  </Text>
                                )}
  
                              </View>
                            }
                          />
                        )}
                      />
  
                      
  
                    </ScrollView>
    
                    <Pressable
                      style={styles.fabContent}
                      onPress={() => {
                        setShowDialog(true);
                      }}>
                      {/* <Image
                        source={images.ic_plus}
                        style={styles.fabImg}
                        tintColor={COLORS.primary}
                        resizeMode="contain"
                      /> */}
                      <Button
                        title="+  Create Slots"
                        buttonStyle={{
                          borderRadius: 10,
                        }}
                        onPress={() => {
                          setShowDialog(true);
                        }}
                      />
                    </Pressable>
    
                    <AddAvailability
                      show={showDialog}
                      onClose={isDataSaved => {
                        setShowDialog(false);
                        if (isDataSaved) {
                          getData();
                        }
                      }}
                    />
  
                  <Modal
                      visible={isCancelTimeSlot}
                      transparent={true}
                      animationType="slide"
                      onRequestClose={()=>{
                        isCancelTimeSlotDialog()
                      }}>
                      <View style={[DefaultStyle.modalContentCenterDialog]}>
                        <View style={[DefaultStyle.modalContent]}>
                          <Text
                            style={[
                              DefaultStyle.blackBold,
                              {
                                textAlign: 'center',
                                marginVertical: 5,
                                marginTop: 10,
                                fontSize: 18,
                                marginHorizontal: 20,
                              },
                            ]}>
                            Remove Slot
                          </Text>
                          <Text
                            style={[
                              DefaultStyle.textblack,
                              {textAlign: 'center', marginTop: 5},
                            ]}>
                            Are you sure, do you want to remove slot ?
                          </Text>
  
                          <Text
                            style={[
                              DefaultStyle.textblack,
                              {textAlign: 'center', marginTop: 10},
                            ]}>
                            This action will not effect on already booked appointments.
                          </Text>
                          <View style={[DefaultStyle.flexAround, {marginVertical: 16}]}>
                            <Pressable style={DefaultStyle.btnBorder} onPress={()=>{
                              isCancelTimeSlotDialog()
                            }}>
                              <Text
                                style={{
                                  textAlign: 'center',
                                  color: COLORS.black,
                                  fontSize: 14,
                                }}>
                                Cancel
                              </Text>
                            </Pressable>
  
                            <Button
                              title="Yes, Remove"
                              buttonStyle={[DefaultStyle.btnLogin, {marginVertical: 0}]}
                              titleStyle={DefaultStyle.whiteBold}
                              onPress={()=>{
                                isCancelTimeSlotDialog()
                                deleteSlotAPICall()
                              }}
                            />
                          </View>
                        </View>
                      </View>
                    </Modal>
                </>
              ))
            )}
  
        </View>
  
        <BottomTab />
  
        <Loader
          loaderVisible={loaderVisible}
          setLoaderVisible={setLoaderVisible}
        />
      {/* </SafeAreaView> */}
      </>
    );
  };
  
  export default IndexV1;
  
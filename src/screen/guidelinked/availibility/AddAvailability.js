import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button, CheckBox} from '@rneui/themed';
import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import AppIcons from '../../../component/AppIcons';
import CustomDatePicker from '../../../component/CustomDatePicker';
import CustomDatePickerIos from '../../../component/CustomDatePickerIos';
import CustomTimePicker from '../../../component/CustomTimePicker';
import {to24HourTime, toDMY} from '../../../component/libs';
import {showToast} from '../../../redux/toastSlice';
import Api from '../../../service/Api';
import {API_SCHEDULE_UPDATE} from '../../../service/apiEndPoint';
import {DefaultStyle} from '../../../util/ConstVar';
import {COLORS, SIZES} from '../../../util/Theme';
import {simpleToast} from '../../../util/Toast';
import ReapatDays from './ReapatDays';
import {styles} from './styles';

const AddAvailability = ({
  navigation,
  show,
  onClose,
  isOldVersion,
  isFromGuide,
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setShowDialog(show);
    resetSetAvailability();
    getTimeZone();
  }, [show]);

  const hideDialog = isDataSaved => {
    setShowDialog(false);
    onClose && onClose(isDataSaved);
  };
  const [timezone, setTimezone] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isRepeatDays, setIsRepeatDays] = useState(true);
  const [selectedRepeatDays, setSelectedRepeatDays] = useState([]);

  const [timeArr, setTimeArr] = useState([{id: -1, start: '', end: ''}]);

  const startTimeChange = (val, clickedIndex) => {
    let arr = timeArr.map((item, index) =>
      index === clickedIndex ? {...item, start: val} : item,
    );

    setTimeArr(arr);
  };

  const endTimeChange = (val, clickedIndex) => {
    let arr = timeArr.map((item, index) =>
      index === clickedIndex ? {...item, end: val} : item,
    );

    setTimeArr(arr);
  };

  const getTimeZone = async () => {
    storedTimezone = await AsyncStorage.getItem('timezone');
    setTimezone(storedTimezone || '');
  };

  const onAdd = () => {
    setTimeArr([...timeArr, {id: -1, start: '', end: ''}]);
  };

  const onRemove = clickedIndex => {
    let arr = timeArr
      .filter((_, index) => index !== clickedIndex)
      .map((item, index) => ({...item, index}));

    setTimeArr(arr);
  };

  const resetSetAvailability = () => {
    setStartDate(null);
    setEndDate(null);
    setIsRepeatDays(true);
    setSelectedRepeatDays([]);
    setTimeArr([{id: -1, start: '', end: ''}]);
  };

  const hasOverlapsOrDuplicates = timeArray => {
    const timeMap = new Map();

    // Helper function to reset seconds and milliseconds
    const normalizeDate = date => {
      const normalized = new Date(date);
      normalized.setSeconds(0, 0); // Set seconds and milliseconds to zero
      return normalized;
    };

    const MIN_GAP = 20 * 60 * 1000;

    for (let i = 0; i < timeArray.length; i++) {
      const slot = timeArray[i];

      // Normalize start and end dates
      const startTime = normalizeDate(slot.start).getTime();
      const endTime = normalizeDate(slot.end).getTime();

      if (Math.abs(endTime - startTime) < MIN_GAP) {
        return 'Start & End time duration must be atleast 20 min'; // Not enough gap within the same slot
      }

      // Check for duplicates of start and end times
      if (timeMap.has(startTime) || timeMap.has(endTime)) {
        return 'Time slots are duplicate'; // Duplicate found
      }

      // Check for overlaps with previously added slots
      for (let j = 0; j < i; j++) {
        const previousSlot = timeArray[j];
        const prevStart = normalizeDate(previousSlot.start).getTime();
        const prevEnd = normalizeDate(previousSlot.end).getTime();

        // Check if current slot overlaps with previous slot
        if (startTime < prevEnd && endTime > prevStart) {
          return 'Start and end time of slots are overlaping'; // Overlap detected
        }
      }

      // Store start and end times in the map to check for future duplicates
      timeMap.set(startTime, true);
      timeMap.set(endTime, true);
    }

    return false; // No overlaps or duplicates found
  };

  const updateAvailability = async () => {
    let error = hasOverlapsOrDuplicates(timeArr);

    if (error !== false) {
      if (Platform.OS == 'ios') {
        simpleToast(error);
      } else {
        dispatch(showToast(error));
      }
      return;
    }

    if (!startDate) {
      if (Platform.OS == 'ios') {
        simpleToast('Please select start date');
      } else {
        dispatch(showToast('Please select start date'));
      }
      return;
    }

    if (timeArr.length == 0) {
      if (Platform.OS == 'ios') {
        simpleToast('Please select atleast one time');
      } else {
        dispatch(showToast('Please select atleast one time'));
      }
    }

    if (timeArr.filter(item => !item.start || !item.end).length != 0) {
      if (Platform.OS == 'ios') {
        simpleToast('Please select start and end time');
      } else {
        dispatch(showToast('Please select start and end time'));
      }

      return;
    }

    let repeat_till = -1;

    if (isRepeatDays) {
      /*if (!endDate) {
        repeat_till = 0;
      } else {
        repeat_till = 1;
      }*/
      repeat_till = 1;
    }

    const formdata = new FormData();
    formdata.append('start_date', toDMY(startDate));
    formdata.append('repeat_till', repeat_till);
    formdata.append('repeat_till_date', toDMY(endDate));

    timeArr.map((val, index) => {
      formdata.append(`time[${index}][start]`, to24HourTime(val.start));
      formdata.append(`time[${index}][end]`, to24HourTime(val.end));
    });

    selectedRepeatDays.map((val, index) => {
      formdata.append(`repeat_days[${index}]`, val.val);
    });
    console.log(formdata);

    setLoaderVisible(true);

    const response = await Api.post(API_SCHEDULE_UPDATE, formdata);

    if (response.status == 'RC200') {
      hideDialog(true);
      resetSetAvailability();
      if (isFromGuide) {
        navigation.navigate('EmailVerifyTabIndex', {guide: true});
      }
    }

    setLoaderVisible(false);
  };

  return (
    showDialog && (
      <View
        style={[
          DefaultStyle.modalContentBottomDialog,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        ]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <SafeAreaView
            style={[DefaultStyle.modalContentDialog, {width: SIZES.width}]}>
            <View
            // style={{
            //   paddingTop: Platform.OS == 'ios' && 20,
            //   paddingHorizontal:
            //     Platform.OS === 'ios' && (isOldVersion ? 0 : 30),
            // }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <View>
                  <Text
                    style={[
                      DefaultStyle.textPrimaryheading,
                      {textAlign: 'center', marginBottom: 10},
                    ]}>
                    Set Your Availability
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      marginBottom: 20,
                      textAlign: 'center',
                    }}>
                    We automatically create 25 mins time slot with a gap of 5
                    mins between two slots. Earliest start time must be 2 hrs
                    from current time.
                  </Text>

                  <View>
                    <Text style={styles.label}>Start Date</Text>
                    {Platform.OS === 'android' ? (
                      <CustomDatePicker
                        onChange={setStartDate}
                        disablePastDates
                        startDate={startDate}
                        placeholder={'Select Start Date'}
                      />
                    ) : (
                      <CustomDatePickerIos
                        onChange={setStartDate}
                        disablePastDates
                        startDate={startDate}
                        placeholder={'Select Start Date'}
                      />
                    )}
                  </View>

                  <View style={{width: '100%', flexDirection: 'column'}}>
                    <View
                      style={[
                        DefaultStyle.flexDirection,
                        {paddingVertical: 15, marginTop: 5, width: '100%'},
                      ]}>
                      <Text style={[styles.stime, {width: '43%'}]}>
                        Start Time
                      </Text>
                      <Text style={[styles.stime, {width: '43%'}]}>
                        End Time
                      </Text>
                      <Text
                        style={[
                          styles.stime,
                          {width: '10%', textAlign: 'right'},
                        ]}>
                        {' '}
                      </Text>
                    </View>

                    <View
                      style={{
                        height: 1,
                        backgroundColor: '#e0e0e0',
                        marginBottom: 15,
                      }}
                    />

                    <View style={{marginBottom: 15}}>
                      {timeArr.map((item, index) => (
                        <View
                          key={index}
                          style={[
                            DefaultStyle.flexDirection,
                            {marginBottom: 15, width: '100%'},
                          ]}>
                          <CustomTimePicker
                            onChange={val => startTimeChange(val, index)}
                            StartTime={item.start}
                            styles={{width: '38%', marginEnd: '5%'}}
                            placeholder={'Select Time'}
                          />
                          <CustomTimePicker
                            onChange={val => endTimeChange(val, index)}
                            StartTime={item.end}
                            styles={{width: '38%', marginEnd: '5%'}}
                            placeholder={'Select Time'}
                          />

                          <Pressable
                            style={[styles.iconCancel]}
                            onPress={() => onRemove(index)}>
                            <AppIcons
                              type={'AntDesign'}
                              name={'minus'}
                              size={24}
                              color={COLORS.red}
                            />
                          </Pressable>
                        </View>
                      ))}
                    </View>

                    <Button
                      title="+ Add"
                      buttonStyle={[
                        DefaultStyle.btnSmall,
                        {
                          backgroundColor: COLORS.primary,
                          alignSelf: 'flex-end',
                        },
                      ]}
                      titleStyle={{color: COLORS.white}}
                      onPress={onAdd}
                    />

                    <View
                      style={{
                        padding: 0,
                        marginLeft: -10,
                        marginTop: 20,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                      }}>
                      <CheckBox
                        iconType="material-community"
                        checkedIcon="checkbox-marked"
                        uncheckedIcon="checkbox-blank-outline"
                        wrapperStyle={{padding: 0, margin: 0}}
                        containerStyle={{padding: 0, margin: 0}}
                        textStyle={{fontSize: 16, color: COLORS.black}}
                        checkedColor={COLORS.primary}
                        checked={isRepeatDays}
                        title="Set Recurring Slots"
                        onPress={() => {
                          setEndDate(null);
                          setIsRepeatDays(!isRepeatDays);
                        }}
                      />
                    </View>

                    {isRepeatDays && (
                      <View style={{paddingVertical: 20}}>
                        <Text style={styles.label}>Repeat Days</Text>

                        <View style={DefaultStyle.flexDirection}>
                          <ReapatDays
                            selected={selectedRepeatDays}
                            onSelect={setSelectedRepeatDays}
                          />
                        </View>

                        <View style={{marginTop: 10}}>
                          <Text style={styles.label}>End Date (Inclusive)</Text>
                          {Platform.OS === 'android' ? (
                            <CustomDatePicker
                              onChange={setEndDate}
                              disablePastDates
                              disableToday
                              startDate={endDate}
                              placeholder={'Select End Date'}
                              disableStartDate={startDate}
                            />
                          ) : (
                            <CustomDatePickerIos
                              onChange={setEndDate}
                              disablePastDates
                              disableToday
                              startDate={endDate}
                              placeholder={'Select End Date'}
                              disableStartDate={startDate}
                            />
                          )}
                        </View>
                      </View>
                    )}
                  </View>

                  <View
                    style={[DefaultStyle.flexDirectionSpace, {marginTop: 20}]}>
                    <Button
                      title="Cancel"
                      buttonStyle={[DefaultStyle.btnClose, {borderRadius: 10}]}
                      titleStyle={{color: COLORS.black}}
                      onPress={() => hideDialog(false)}
                    />

                    <Button
                      title="Save Availability"
                      buttonStyle={[styles.btnSave]}
                      titleStyle={{color: COLORS.white}}
                      onPress={updateAvailability}
                    />
                  </View>
                </View>
              </ScrollView>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    )
  );
};

export default AddAvailability;

// CustomDatePicker.js

import React, {useState, useEffect, useCallback} from 'react';
import {TouchableOpacity, Platform, Text} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {COLORS, SIZES} from '../util/Theme';
import {useFocusEffect} from '@react-navigation/native';

const CustomDatePicker = ({
  placeholder,
  onChange,
  startDate,
  disablePastDates,
  disableToday,
  disableStartDate,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = startDate => {
    const day = String(startDate.getDate()).padStart(2, '0');
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const year = startDate.getFullYear();
    return `${month}-${day}-${year}`;
  };

  useEffect(() => {
    if (startDate) {
      setSelectedDate(new Date(startDate));
    } else {
      setSelectedDate(null);
    }
  }, [startDate]);

  const showDatepicker = () => {
    setShowPicker(true);
  };

  const handleDateChange = (event, date) => {
    setShowPicker(Platform.OS === 'ios');
    if (event.type == 'set') {
      if (date) {
        setSelectedDate(date);
        onChange(date);
      }
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={showDatepicker}
        style={[
          {
            color: 'white',
            borderRadius: 10,
            backgroundColor: COLORS.white,
            height: 40,
            paddingHorizontal: 15,
            paddingVertical: 8,
            borderColor: COLORS.darkgray, //COLORS.black,
            borderWidth: 1,
          },
        ]}>
        <Text style={{color: COLORS.black, fontSize: 14}}>
          {selectedDate ? formatDate(selectedDate) : placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          // minimumDate={
          //   disablePastDates !== undefined && disablePastDates
          //     ? disableToday !== undefined && disableToday
          //       ? new Date().setDate(new Date().getDate() + 1)
          //       : new Date()
          //     : null
          // }
          minimumDate={
            disablePastDates !== undefined && disablePastDates
              ? disableStartDate && new Date(disableStartDate) > new Date()
                ? new Date(
                    disableStartDate.setDate(disableStartDate.getDate()) + 1,
                  )
                : disableToday !== undefined && disableToday
                ? new Date(new Date().setDate(new Date().getDate() + 1))
                : new Date()
              : null
          }
          onChange={handleDateChange}
        />
      )}
    </>
  );
};

export default CustomDatePicker;

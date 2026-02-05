import React, {useState, useEffect, useCallback} from 'react';
import {TouchableOpacity, Platform, Text} from 'react-native';
import DatePicker from 'react-native-date-picker';
import {COLORS, SIZES} from '../util/Theme';

const CustomDatePickerIos = ({
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

  const handleDateChangeIos = date => {
    setShowPicker(false);
    setSelectedDate(date);
    onChange(date);
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
        <DatePicker
          modal
          mode="date"
          open={showPicker}
          date={selectedDate || new Date()}
          onConfirm={date => {
            handleDateChangeIos(date);
          }}
          onCancel={() => {
            setShowPicker(false);
          }}
          minimumDate={
            disablePastDates !== undefined && disablePastDates
              ? disableStartDate && new Date(disableStartDate) > new Date()
                ? new Date(
                    disableStartDate.setDate(disableStartDate.getDate() + 1),
                  )
                : disableToday !== undefined && disableToday
                ? new Date(new Date().setDate(new Date().getDate() + 1))
                : new Date()
              : null
          }
        />
      )}
    </>
  );
};

export default CustomDatePickerIos;

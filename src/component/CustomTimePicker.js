import React, {useState, useEffect} from 'react';
import {TouchableOpacity, Platform, Text} from 'react-native';
//import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from 'react-native-date-picker';
import {COLORS, SIZES} from '../util/Theme';

const CustomTimePicker = ({placeholder, onChange, StartTime, styles}) => {
  const [selectedTime, setSelectedTime] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = time => {
    if (!time) return ''; // Handle null or undefined time
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle 0 as 12
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (StartTime) {
      const parsedTime = new Date(StartTime);
      if (!isNaN(parsedTime.getTime())) {
        setSelectedTime(parsedTime);
      } else {
        setSelectedTime(null);
      }
    }
  }, [StartTime]);

  const showDatepicker = () => {
    setShowPicker(true);
  };

  const handleDateChange = (event, date) => {
    setShowPicker(false);

    if (event.type == 'set' && date) {
      setSelectedTime(date);
      onChange(date);
    }
  };

  //TODO :  select time round number like 00,10,20..etc
  const roundTime = (date, interval) => {
    const minutes = Math.round(date.getMinutes() / interval) * interval;
    date.setMinutes(minutes);
    //date.setSeconds(0);
    return date;
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          showDatepicker();
        }}
        style={[
          styles,
          {
            borderRadius: 10,
            backgroundColor: COLORS.white,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderColor: COLORS.darkgray,
            borderWidth: 1,
          },
        ]}>
        <Text style={{color: COLORS.black, fontSize: 14}}>
          {selectedTime ? formatTime(selectedTime) : placeholder}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        // <DateTimePicker
        //   value={selectedTime || new Date()}
        //   mode="time"
        //   minuteInterval={10}
        //   timeZoneOffsetInMinutes={0}
        //   is24Hour={false}
        //   display="default"
        //   onChange={handleDateChange}
        // />

        <DatePicker
          modal
          open={showPicker}
          date={selectedTime || roundTime(new Date(), 10)}
          onConfirm={date => {
            setShowPicker(false);
            setSelectedTime(date);
            onChange(date);
          }}
          onCancel={() => {
            setShowPicker(false);
          }}
          is24hourSource="locale"
          minuteInterval={10}
          mode="time" // Set mode to "time" to hide the day
          buttonColor={COLORS.primary}
          dividerColor={COLORS.primary}
          title={'Select Time'}
          //  minimumDate={new Date(new Date().setDate(new Date().getDate() + 1))}
          // mode="date"
        />
      )}
    </>
  );
};

export default CustomTimePicker;

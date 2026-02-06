import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {styles} from './styles';
import {COLORS} from '../../../util/Theme';
import AppIcons from '../../../component/AppIcons';
import Api from '../../../service/Api';
import {API_SCHEDULE_MY_TIMELINE} from '../../../service/apiEndPoint';
import DayView from './DayView';

const CalendarAvailabilityView = ({timeline, navigation, onReload}) => {
  // Only keep entries that represent a day block
  const dayItems = useMemo(
    () =>
      Array.isArray(timeline) ? timeline.filter(d => d?.is_day == 1) : [],
    [timeline],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsEmpty, setSlotsEmpty] = useState(false);

  const loadSlotsForDay = async day => {
    if (!day) {
      setSlots([]);
      setSlotsEmpty(true);
      return;
    }
    setLoadingSlots(true);
    setSlotsEmpty(false);
    try {
      const formdata = new FormData();
      formdata.append('is_day', day.is_day);
      formdata.append('start_time', day.start_time_utc);
      formdata.append('end_time', day.end_time_utc);
      const response = await Api.post(API_SCHEDULE_MY_TIMELINE, formdata);
      if (response.status == 'RC200') {
        const data = Array.isArray(response.data) ? response.data : [];
        setSlots(data);
        setSlotsEmpty(data.length === 0);
      } else {
        setSlots([]);
        setSlotsEmpty(true);
      }
    } catch (e) {
      setSlots([]);
      setSlotsEmpty(true);
    }
    setLoadingSlots(false);
  };

  useEffect(() => {
    if (dayItems.length === 0) {
      setSlots([]);
      setSlotsEmpty(true);
      return;
    }
    // Ensure selected index is in range
    const idx = Math.min(selectedIndex, dayItems.length - 1);
    if (idx !== selectedIndex) {
      setSelectedIndex(idx);
      return;
    }
    loadSlotsForDay(dayItems[idx]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayItems, selectedIndex]);

  const changeDay = direction => {
    if (dayItems.length === 0) return;
    setSelectedIndex(prev => {
      const next = prev + direction;
      if (next < 0 || next >= dayItems.length) return prev;
      return next;
    });
  };

  const renderDayLabelParts = label => {
    if (!label || typeof label !== 'string') {
      return {top: '', middle: '', bottom: ''};
    }
    let clean = label.trim();

    // Special-case Today / Tomorrow so they don't repeat on two lines
    if (/^today$/i.test(clean) || /^tomorrow$/i.test(clean)) {
      return {top: '', middle: clean, bottom: ''};
    }

    // Labels like "Sat, 07 Feb"
    if (clean.includes(',')) {
      clean = clean.replace(',', '');
    }
    const parts = clean.split(/\s+/);

    if (parts.length >= 3) {
      return {
        top: parts[0] || '',
        middle: parts[1] || '',
        bottom: parts[2] || '',
      };
    }

    if (parts.length === 2) {
      return {
        top: parts[0] || '',
        middle: parts[1] || '',
        bottom: '',
      };
    }

    return {top: '', middle: parts[0] || '', bottom: ''};
  };

  const handleDeleteComplete = () => {
    // Refresh parent timeline and reload current day's slots
    if (typeof onReload === 'function') {
      onReload();
    }
    const day = dayItems[Math.min(selectedIndex, dayItems.length - 1)];
    if (day) {
      loadSlotsForDay(day);
    }
  };

  if (dayItems.length === 0) {
    return (
      <Text
        style={{
          textAlign: 'center',
          marginTop: 8,
          marginBottom: 16,
          color: COLORS.black,
        }}>
        No availability created yet. Tap "+ Create Slots" to add your first
        slots.
      </Text>
    );
  }

  return (
    <>
      <Text style={styles.availabilityTitle}>Select a Date</Text>
      <View style={styles.availabilityDateStrip}>
        <TouchableOpacity
          style={styles.availabilityArrowButton}
          onPress={() => changeDay(-1)}
          disabled={selectedIndex === 0}>
          <AppIcons
            type="Feather"
            name="chevron-left"
            size={18}
            color={selectedIndex === 0 ? COLORS.gray : COLORS.primary}
          />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.availabilityDateList}>
          {dayItems.map((day, idx) => {
            const isSelected = idx === selectedIndex;
            const {top, middle, bottom} = renderDayLabelParts(day.label);
            return (
              <TouchableOpacity
                key={day.label + idx}
                style={[
                  styles.availabilityDayItem,
                  isSelected && styles.availabilityDayItemSelected,
                ]}
                onPress={() => setSelectedIndex(idx)}>
                <Text style={styles.availabilityDayTextTop}>{top}</Text>
                <Text style={styles.availabilityDayTextMiddle}>{middle}</Text>
                <Text style={styles.availabilityDayTextBottom}>{bottom}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          style={styles.availabilityArrowButton}
          onPress={() => changeDay(1)}
          disabled={selectedIndex === dayItems.length - 1}>
          <AppIcons
            type="Feather"
            name="chevron-right"
            size={18}
            color={
              selectedIndex === dayItems.length - 1
                ? COLORS.gray
                : COLORS.primary
            }
          />
        </TouchableOpacity>
      </View>

      <View style={styles.availabilityTimeContainer}>
        {loadingSlots ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : slotsEmpty ? (
          <Text style={styles.availabilitySlotsMessage}>
            No time slots for this day.
          </Text>
        ) : (
          <DayView
            navigation={navigation}
            data={slots}
            index={selectedIndex}
            onDeleteComplete={handleDeleteComplete}
          />
        )}
      </View>
    </>
  );
};

export default CalendarAvailabilityView;


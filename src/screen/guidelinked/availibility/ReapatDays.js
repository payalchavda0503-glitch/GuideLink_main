import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SIZES } from '../../../util/Theme';

const ReapatDays = ({ selected, onSelect }) => {

    const [repeatDays, setRepeatDays] = useState([
        {val:0, label: 'Sun', isSelected: false},
        {val:1, label: 'Mon', isSelected: false},
        {val:2, label: 'Tue', isSelected: false},
        {val:3, label: 'Wed', isSelected: false},
        {val:4, label: 'Thu', isSelected: false},
        {val:5, label: 'Fri', isSelected: false},
        {val:6, label: 'Sat', isSelected: false}
    ])

    const toggleDaySelection = (val) => {
      
        setRepeatDays(prevDays =>
            prevDays.map(day =>
              day.val === val
                ? { ...day, isSelected: !day.isSelected }
                : day
            )
          );
          
    };

    useEffect(()=>{
        onSelect && onSelect( repeatDays.filter(day => day.isSelected) )
    }, [repeatDays])
  
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipContainer}>
                {repeatDays.map((day) => (
                <TouchableOpacity
                    key={day.val}
                    onPress={() => toggleDaySelection(day.val)}
                    style={[
                    styles.chip,
                    day.isSelected && styles.selectedChip,
                    ]}
                >
                    <Text style={[
                    styles.chipText,
                    day.isSelected && styles.selectedChipText,
                    ]}>
                    {day.label}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>
            </ScrollView>
    );
  };

  const styles = StyleSheet.create({
    chipContainer: {
      flexDirection: 'row',
      paddingBottom: 10,
    },
    chip: {
      paddingHorizontal: 20,
      paddingVertical:10,
      marginRight: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#ddd',
    },
    selectedChip: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    chipText: {
      color: '#000',
    },
    selectedChipText: {
      color: '#fff',
    },
  });

  export default ReapatDays;
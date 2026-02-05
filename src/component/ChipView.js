import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ChipView = ({ label, selected, onSelect }) => {
    return (
      <TouchableOpacity
        style={[
          styles.chip,
          selected ? styles.selectedChip : styles.unselectedChip,
        ]}
        onPress={onSelect}
      >
        <Text
          style={[
            styles.chipText,
            selected ? styles.selectedChipText : styles.unselectedChipText,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  export default ChipView;
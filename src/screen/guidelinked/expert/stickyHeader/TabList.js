import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {COLORS} from '../../../../util/Theme';

export const TabList = ({selectedTab, setSelectedTab}) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={() => setSelectedTab(0)} style={styles.tab}>
      <Text style={selectedTab === 0 ? styles.selectedTabText : styles.tabText}>
        Rating & Review
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    // justifyContent: 'space-around',
    backgroundColor: 'white',
  },
  tab: {
    padding: 16,
  },
  tabText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  selectedTabText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: 'bold',
  },
});

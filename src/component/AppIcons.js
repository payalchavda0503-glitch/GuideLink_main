import React from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Foundation from 'react-native-vector-icons/Foundation';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Zocial from 'react-native-vector-icons/Zocial';
import Entypo from 'react-native-vector-icons/Entypo';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const iconComponents = {
  AntDesign,
  MaterialCommunityIcons,
  Ionicons,
  EvilIcons,
  Feather,
  FontAwesome,
  Fontisto,
  Foundation,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
  Entypo,
  FontAwesome6,
  FontAwesome5,
};

const AppIcons = ({type, name, color, size}) => {
  const IconComponent = iconComponents[type];

  if (!IconComponent) {
    return null; // or you could return a default icon or an error icon
  }

  return <IconComponent name={name} color={color} size={size} />;
};

export default AppIcons;

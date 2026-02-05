import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CustomRating = ({
  initialRating,
  onUpdateRating,
  isshow,
  ratingSize = 19,
}) => {
  const [rating, setRating] = useState(initialRating);

  const handleRating = selectedRating => {
    if (!isshow) {
      // Check if isshow is false
      setRating(selectedRating);
      onUpdateRating(selectedRating);
    }
  };

  // Number of stars to display
  const totalStars = 5;

  // Array to hold the stars
  let stars = [];

  for (let i = 1; i <= totalStars; i++) {
    stars.push(
      <Pressable
        key={i}
        onPress={() => handleRating(i)}
        style={{paddingTop: 2, marginEnd: 2}}>
        <Icon
          name={i <= rating ? 'star' : 'star-o'}
          size={ratingSize}
          color={i <= rating ? '#FFD700' : '#808080'}
        />
      </Pressable>,
    );
  }

  return <View style={{flexDirection: 'row'}}>{stars}</View>;
};

export default CustomRating;

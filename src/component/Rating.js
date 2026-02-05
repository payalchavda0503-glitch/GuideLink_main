import React from 'react';
import {View, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Rating = ({initialRating, ratingSize = 19}) => {
  // Number of stars to display
  const totalStars = 5;

  // Array to hold the stars
  let stars = [];

  const fullStars = Math.floor(initialRating);

  let halfStar = initialRating % 1 !== 0 ? 1 : 0;

  let emptyStars = totalStars - (fullStars + halfStar);

  for (let x = 0; x < fullStars; x++) {
    stars.push(
      <Pressable key={x} style={{marginEnd: 2}}>
        <Icon name={'star'} size={ratingSize} color={'#FFD700'} />
      </Pressable>,
    );
  }

  if (halfStar) {
    stars.push(
      <Pressable key={'h'} style={{marginEnd: 2}}>
        <Icon name={'star-half-o'} size={ratingSize} color={'#FFD700'} />
      </Pressable>,
    );
  }

  for (let i = 1; i <= emptyStars; i++) {
    stars.push(
      <Pressable key={`e_${i}`} style={{marginEnd: 2}}>
        <Icon name={'star-o'} size={ratingSize} color={'#808080'} />
      </Pressable>,
    );
  }

  return <View style={{flexDirection: 'row'}}>{stars}</View>;
};

export default Rating;

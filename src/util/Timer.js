import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {DefaultStyle} from './ConstVar';

const TimerComponent = ({initialTime = 120, onComplete}) => {
  const [seconds, setSeconds] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      clearInterval(interval);
      setIsActive(false); // Stop the timer when it reaches 0
      if (onComplete) {
        onComplete(); // Call the onComplete function to hide the timer
      }
    }

    return () => clearInterval(interval);
  }, [isActive, seconds]);

  return (
    <View style={{padding: 0, alignItems: 'center'}}>
      {seconds > 0 ? (
        <Text style={[DefaultStyle.txt14, {fontSize: 16}]}>
          You can resend PIN in{' '}
          {String(Math.floor(seconds / 60)).padStart(2, '0')}:
          {String(seconds % 60).padStart(2, '0')}
        </Text>
      ) : null}
    </View>
  );
};

export default TimerComponent;

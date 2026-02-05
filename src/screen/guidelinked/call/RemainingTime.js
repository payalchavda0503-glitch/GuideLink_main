import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../../../util/Theme';

const RemainingTime = ({ targetTime, onTimeUp, textStyle }) => {
  

  // Function to calculate remaining time in minutes and seconds
  const calculateTimeLeft = (targetTime) => {
    const currentTime = new Date();
    const difference = targetTime - currentTime;
    
    const minutesDigit = Math.floor((difference % (1000 * 3600)) / (1000 * 60));
    const secondsDigit = Math.floor((difference % (1000 * 60)) / 1000);

    const minutes = String(minutesDigit).padStart(2, '0');
    const seconds = String(secondsDigit).padStart(2, '0');
    
    return { minutes, seconds, minutesDigit };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetTime*1000);
      setTimeLeft(newTimeLeft);
      
      // Execute the callback when time is up
      if (newTimeLeft.minutes <= 0 && newTimeLeft.seconds <= 0) {
        clearInterval(timer);  // Stop the timer
        onTimeUp();  // Execute the callback
      }
    }, 1000);

    return () => clearInterval(timer); // Cleanup the timer on component unmount
  }, [targetTime]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetTime*1000));

  return (
    <View>
      <Text style={{fontWeight: '500', textAlign: 'center', padding:10, backgroundColor: timeLeft.minutesDigit<1 ? '#000000CC' : '#000000CC', color: timeLeft.minutesDigit<5 ? COLORS.white2 : COLORS.white2}} >
        Remaining Time : {timeLeft.minutes}:{timeLeft.seconds}
      </Text>
      {timeLeft.minutesDigit<=5 && (
        <Text style={{fontWeight: '500', textAlign: 'center', padding:5, backgroundColor: COLORS.red, color: COLORS.white, width: 200, alignSelf: 'center'}} >
          The call will end soon.
        </Text>
      )}
    </View>
  );
};

export default RemainingTime;

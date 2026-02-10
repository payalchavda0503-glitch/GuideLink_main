import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import AppHeader from '../../../component/AppHeader';
import BottomTab from '../../../component/BottomTab';
import IosStatusBar from '../../../component/IosStatusBar';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS} from '../../../util/Theme';
import {styles} from './styles';

const AboutUsIndex = ({navigation}) => {
  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <ScreenStatusBar
        backgroundColor={COLORS.primary}
        barStyle="dark-content"
      />
      <AppHeader
        background={COLORS.primary}
        iconType={'Feather'}
        iconName={'menu'}
        iconColor={COLORS.white}
        navigation={navigation}
        tittle={'About Us'}
        titleColor={COLORS.white}
      />

      <View style={{flex: 1}}>
        <ScrollView style={styles.container}>
          <Text
            style={{
              fontSize: 18,
              textAlign: 'center',
              color: COLORS.black,
              fontWeight: 'bold',
            }}>
            Our Mission
          </Text>
          <Text style={[styles.txt, {marginTop: 10}]}>
            Our mission is to provide and expand access to the ‘know-how’ that
            in the past had been restricted by who you know within your network
            and hard to seek otherwise. At the same time we allow you all to
            monetize on your wisdom.
          </Text>
          <Text
            style={{
              fontSize: 18,
              marginVertical: 10,
              textAlign: 'center',
              color: COLORS.black,
              fontWeight: 'bold',
            }}>
            Our Vision
          </Text>
          <Text style={[styles.txt, {marginTop: 0}]}>
            We believe that everyone has accumulated experiences in life and
            learned from them. There are several people who will take on the
            same path and have the same questions/ doubts. By sharing the wisdom
            you learned during your journey we believe that you can help someone
            not make the same mistakes or just do it right or perhaps do it even
            better.
          </Text>
          <Text style={[styles.txt, {marginTop: 10}]}>
            We are committed to make the world better with our small
            contribution/ service!{' '}
          </Text>
        </ScrollView>
      </View>

      <View>
        <BottomTab />
      </View>
    </>
  );
};

export default AboutUsIndex;

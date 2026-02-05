import {
  Pressable,
  Image,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Linking,
  StyleSheet,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import AppHeaderNormal from '../../../component/AppHeaderNormal';
import IosStatusBar from '../../../component/IosStatusBar';
import {DefaultStyle} from '../../../util/ConstVar';
import {Button, Card} from '@rneui/themed';
import AppIcons from '../../../component/AppIcons';

const BookingThankYou = ({navigation, route}) => {
  // const data = route.params?.data;
  const name = route.params?.Name;
  const when = route.params?.When;

  // let APPT_ID = route.params.ID;
  const viewDetails = () => {
    navigation.navigate('BookingTabIndex');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('BookingTabIndex');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <SafeAreaView style={styles.container}>
        <ScreenStatusBar
          backgroundColor={COLORS.primary}
          barStyle="dark-content"
        />
        <View
          style={{
            backgroundColor: COLORS.white,
            flexDirection: 'row',
            alignItems: 'center',
            height: 52,
            padding: 10,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 10,
          }}>
          <View style={{flex: 1}}>
            <Text
              style={{
                alignSelf: 'center',
                fontWeight: 'bold',
                color: COLORS.black,
                fontSize: 18,
              }}>
              Booking Confirmed
            </Text>
          </View>
        </View>
        <View style={{padding: 10}}>
          {/* <Image
            source={require('../../../assets/images/like.png')}
            style={styles.iamgeLike}
            resizeMode="contain"
          /> */}
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <AppIcons
              type={'Entypo'}
              name={'thumbs-up'}
              size={130}
              color={COLORS.primary}
            />
          </View>

          <Card
            containerStyle={{
              backgroundColor: COLORS.graySolid,
              borderWidth: 0,
              borderRadius: 10,
              marginVertical: 20,
            }}>
            <Text
              style={{
                color: COLORS.green,
                textAlign: 'center',
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 15,
              }}>
              Congratulations.
            </Text>
            <Text
              style={{
                textAlign: 'left',
                fontSize: 15,
                color: COLORS.gray,
                marginBottom: 10,
              }}>
              Your appointment with
              <Text
                style={{color: COLORS.black, fontWeight: 'bold', fontSize: 15}}>
                {' '}
                {name}{' '}
              </Text>
              has been successfully booked.
            </Text>

            <View style={{flexDirection: 'row', marginBottom: 2}}>
              <Text
                style={{
                  textAlign: 'left',
                  fontSize: 15,
                  color: COLORS.black,
                  fontWeight: 'bold',
                }}>
                When : <Text style={styles.text15}>{when}</Text>{' '}
              </Text>
            </View>

            {/* {data?.map((item, index) => (
              <View key={index} style={{marginBottom: 15}}>
                <Text
                  style={{
                    textAlign: 'left',
                    fontSize: 15,
                    color: COLORS.gray,
                    marginBottom: 5,
                  }}>
                  Your appointment with
                  <Text
                    style={{
                      color: COLORS.black,
                      fontWeight: 'bold',
                      fontSize: 15,
                    }}>
                    {' '}
                    {item.booked_with}{' '}
                  </Text>
                  has been successfully booked.
                </Text>

                <View style={{flexDirection: 'row', marginBottom: 2}}>
                  <Text
                    style={{
                      textAlign: 'left',
                      fontSize: 15,
                      color: COLORS.black,
                      fontWeight: 'bold',
                    }}>
                    When: <Text style={styles.text15}>{item.when}</Text>
                  </Text>
                </View>

                {index !== data.length - 1 && (
                  <View
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: COLORS.borderGray,
                      marginVertical: 10,
                    }}
                  />
                )}
              </View>
            ))} */}

            <Button
              title="VIEW DETAILS"
              buttonStyle={[
                DefaultStyle.btnLogin,
                {
                  borderRadius: 20,
                  marginLeft: 10,
                  marginTop: 20,
                  paddingVertical: 5,
                  marginBottom: 0,
                },
              ]}
              titleStyle={{color: COLORS.white}}
              onPress={() => {
                viewDetails();
              }}
            />
          </Card>
        </View>
      </SafeAreaView>
    </>
  );
};

export default BookingThankYou;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: SIZES.font30,
    color: COLORS.green,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    // marginVertical:20,
    textTransform: 'uppercase',
  },
  iamgeLike: {
    //width: 180,
    height: 100,
    marginVertical: 40,
    alignSelf: 'center',
  },
  text15: {
    fontSize: SIZES.font15,
    color: COLORS.gray,
  },
});

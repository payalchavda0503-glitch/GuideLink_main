import {
  SafeAreaView,
  StyleSheet,
  Text,
  ScrollView,
  View,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {COLORS} from '../../../util/Theme';
import FastImage from 'react-native-fast-image';
import {Card} from '@rneui/themed';
import AppIcons from '../../../component/AppIcons';
import Loader from '../../../util/Loader';
import Api from '../../../service/Api';
import {API_BOOK_APPOINTMENT_PAY_STATUS} from '../../../service/apiEndPoint';

const CallScreen = ({navigation, route}) => {
  let image = route.params.callerImage;
  let name = route.params.callerName;
  let aptId = route.params.apptId;
  let uType = route.params.uType;
  let payStatus = route.params.payStatus;

  const [loaderVisible, setLoaderVisible] = useState(false);

  useFocusEffect(useCallback(() => {}, []));

  const checkPaymentStatus = async () => {
    setLoaderVisible(true);

    const response = await Api.get(
      `${API_BOOK_APPOINTMENT_PAY_STATUS}/${aptId}`,
    );

    setLoaderVisible(false);

    if (response.status == 'RC200') {
      let data = response.data;
      console.log(data);

      if (data == 1) {
        navigation.navigate('VideoCall', {ID: aptId, FROM: 0});
      } else {
        navigation.navigate('ChargePayment', {ID: aptId, FROM: 0});
      }
    }
  };

  return (
    <>
      <View style={style.container}>
        <View
          style={{
            marginTop: 50,
            width: '100%',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
          }}>
          <FastImage
            style={style.image}
            source={{
              uri: image,
              priority: FastImage.priority.high,
            }}
            defaultSource={require('../../../assets/images/ic_empty.jpg')} // Placeholder while loading
            resizeMode={FastImage.resizeMode.cover}
            fallback
          />

          <Text style={style.callerName}>{name}</Text>

          {uType == 'B' && payStatus == 0 && (
            <Text style={{marginTop: 20, textAlign: 'center'}}>
              Your payment is pending and once you accept the call it will ask
              for a payment before video call start
            </Text>
          )}
        </View>

        <View style={style.buttons}>
          <Pressable
            onPress={() => {
              navigation.goBack();
            }}>
            <Card
              containerStyle={{
                padding: 17,
                borderRadius: 100,
                elevation: 5,
                backgroundColor: COLORS.red,
                borderColor: COLORS.red,
                overflow: 'hidden',
              }}>
              <AppIcons
                name={'call-end'}
                type={'MaterialIcons'}
                size={36}
                color={COLORS.white}
              />
            </Card>
          </Pressable>

          <Pressable
            onPress={() => {
              checkPaymentStatus();
            }}>
            <Card
              containerStyle={{
                padding: 17,
                borderRadius: 100,
                elevation: 5,
                backgroundColor: COLORS.green,
                borderColor: COLORS.green,
                overflow: 'hidden',
              }}>
              <AppIcons
                name={'call-sharp'}
                type={'Ionicons'}
                size={34}
                color={COLORS.white}
              />
            </Card>
          </Pressable>
        </View>

        <Loader
          loaderVisible={loaderVisible}
          setLoaderVisible={setLoaderVisible}
        />
      </View>
    </>
  );
};

const style = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  callerName: {
    textAlign: 'center',
    fontSize: 30,
    marginTop: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  buttons: {
    position: 'relative',
    marginTop: '40%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
});
export default CallScreen;

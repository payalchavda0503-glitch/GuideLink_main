import {Button, Card} from '@rneui/themed';
import React, {useEffect, useState} from 'react';
import {Alert, Text, View} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import Api from '../../../service/Api';
import {
  API_GUIDANCE_UPDATE_ANSWER_RATE,
  API_SCHEDULE_UPDATE_RATE,
  WEB_URL,
} from '../../../service/apiEndPoint';
import {DefaultStyle} from '../../../util/ConstVar';
import Loader from '../../../util/Loader';
import {COLORS} from '../../../util/Theme';
import HelpVideoIcon from '../HelpVideoIcon';

const TimeSlotRates = ({
  rates,
  setRates,
  paidAnswerRate,
  setPaidAnswerRate,
}) => {
  const [loaderVisible, setLoaderVisible] = useState(false);
  const [currentRates, setCurrentRates] = useState('');
  const [currentPaidAnswerRate, setCurrentPaidAnswerRate] = useState('');

  const handleRateChange = newRate => {
    if (typeof setRates === 'function') setRates(newRate);
  };

  useEffect(() => {
    setCurrentRates(rates + '');
  }, [rates]);

  useEffect(() => {
    if (paidAnswerRate === undefined || paidAnswerRate === null) return;
    setCurrentPaidAnswerRate(paidAnswerRate + '');
  }, [paidAnswerRate]);

  const showRateAlertPopup = () => {
    Alert.alert(
      'GuideLinked',
      'GuideLinked charges 30% fee from your call rate and will transfer the remaining amount to your payment account.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Accept',
          onPress: () => {
            handleRateChange(currentRates);
            update();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const showPaidAnswerRateAlertPopup = () => {
    Alert.alert(
      'GuideLinked',
      'GuideLinked charges 30% fee from your Answer rate and will transfer the remaining amount to your payment account.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Accept',
          onPress: () => {
            if (typeof setPaidAnswerRate === 'function') {
              setPaidAnswerRate(currentPaidAnswerRate);
            }
            updatePaidAnswerRate();
          },
        },
      ],
      {cancelable: false},
    );
  };

  const update = async () => {
    const formdata = new FormData();
    formdata.append('price', currentRates);

    setLoaderVisible(true);

    const response = await Api.post(API_SCHEDULE_UPDATE_RATE, formdata);

    if (response.status == 'RC200') {
    }

    setLoaderVisible(false);
  };

  const updatePaidAnswerRate = async () => {
    const formdata = new FormData();
    formdata.append('price', currentPaidAnswerRate);

    setLoaderVisible(true);

    // NOTE: Call without BASE_URL prefix (BASE_URL = `${WEB_URL}api/users/`).
    const response = await Api.post(API_GUIDANCE_UPDATE_ANSWER_RATE,formdata);

    if (response.status == 'RC200') {
    }

    setLoaderVisible(false);
  };

  return (
    <View>
      <Card containerStyle={{padding: 0}}>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 10,
          }}>
          <Text
            style={{
              paddingVertical: 10,
              color: COLORS.primary,
              fontSize: 16,
              fontWeight: 'bold',
            }}>
            Time Slot Rate / 25 Mins
          </Text>

          <HelpVideoIcon type={1} />
        </View>
        <Card.Divider style={{marginBottom: 0}} />
        <View>
          <View
            style={{padding: 10, marginTop: 0, flexDirection: 'row', flex: 2}}>
            <View
              style={{
                borderColor: COLORS.gray,
                borderWidth: 1,
                color: COLORS.black,
                borderRadius: 10,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#000',
                  paddingLeft: 10,
                  width: 30,
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                $
              </Text>
              <TextInput
                style={[
                  // styles.input,
                  {
                    flex: 4,
                    paddingVertical: 10,
                    fontSize: 16,
                    fontWeight: 'bold',
                  },
                ]}
                keyboardType="decimal-pad"
                placeholder="Rate"
                maxLength={2}
                value={currentRates}
                // onChangeText={v => setCurrentRates(v)}
                onChangeText={v => {
                  // Check if the value is a number and less than or equal to 99
                  if (/^\d{0,2}$/.test(v)) {
                    setCurrentRates(v);
                  }
                }}
                placeholderTextColor={COLORS.gray}
              />
              {/* <Text style={{fontSize: 16, color: '#555', padding: 10,flex: 7}}> / 25 Mins</Text> */}
            </View>

            <Button
              title="Update"
              buttonStyle={[
                DefaultStyle.btnLogin,
                {
                  flex: 1,
                  backgroundColor: COLORS.primary,
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  marginLeft: 10,
                  marginVertical: 0,
                },
              ]}
              disabled={currentRates < 10}
              titleStyle={{color: COLORS.white}}
              onPress={() => showRateAlertPopup()}
            />
          </View>
          <Text
            style={{
              paddingHorizontal: 10,
              paddingBottom: 10,
              fontSize: 12,
              color: COLORS.black,
            }}>
            Please add an amount more than $10 for slot creation.
          </Text>
          <Text
            style={{
              paddingHorizontal: 10,
              paddingBottom: 10,
              fontSize: 12,
              color: COLORS.black,
            }}>
            Changes made to the Rate ($) will apply only to the bookings not
            made yet.
          </Text>
          <Text
            style={{
              paddingHorizontal: 10,
              paddingBottom: 10,
              fontSize: 12,
              color: COLORS.black,
            }}>
            GuideLinked charges 30% fee from your call rate and will transfer
            the remaining amount to your payment account.
          </Text>
        </View>
      </Card>

      <Card containerStyle={{padding: 0}}>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 10,
          }}>
          <Text
            style={{
              paddingVertical: 10,
              color: COLORS.primary,
              fontSize: 16,
              fontWeight: 'bold',
            }}>
            Paid Answer Rate / Question
          </Text>
        </View>
        <Card.Divider style={{marginBottom: 0}} />
        <View>
          <View
            style={{padding: 10, marginTop: 0, flexDirection: 'row', flex: 2}}>
            <View
              style={{
                borderColor: COLORS.gray,
                borderWidth: 1,
                color: COLORS.black,
                borderRadius: 10,
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#000',
                  paddingLeft: 10,
                  width: 30,
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                $
              </Text>
              <TextInput
                style={[
                  {
                    flex: 4,
                    paddingVertical: 10,
                    fontSize: 16,
                    fontWeight: 'bold',
                  },
                ]}
                keyboardType="decimal-pad"
                placeholder="Rate"
                maxLength={2}
                value={currentPaidAnswerRate}
                onChangeText={v => {
                  // Allow 0-99
                  if (/^\d{0,2}$/.test(v)) {
                    setCurrentPaidAnswerRate(v);
                  }
                }}
                placeholderTextColor={COLORS.gray}
              />
            </View>

            <Button
              title="Update"
              buttonStyle={[
                DefaultStyle.btnLogin,
                {
                  flex: 1,
                  backgroundColor: COLORS.primary,
                  borderRadius: 10,
                  paddingHorizontal: 15,
                  marginLeft: 10,
                  marginVertical: 0,
                },
              ]}
              disabled={currentPaidAnswerRate === ''}
              titleStyle={{color: COLORS.white}}
              onPress={() => showPaidAnswerRateAlertPopup()}
            />
          </View>

          <Text
            style={{
              paddingHorizontal: 10,
              paddingBottom: 10,
              fontSize: 12,
              color: COLORS.black,
            }}>
            GuideLinked charges 30% fee from your Answer rate and will transfer the
            remaining amount to your payment account..
          </Text>
        </View>
      </Card>

      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
    </View>
  );
};

export default TimeSlotRates;

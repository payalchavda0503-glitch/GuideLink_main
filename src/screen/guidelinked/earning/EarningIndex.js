import {SafeAreaView, Text, View} from 'react-native';
import React, { useCallback, useState } from 'react';
import IosStatusBar from '../../../component/IosStatusBar';
import {COLORS} from '../../../util/Theme';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import BottomTab from '../../../component/BottomTab';
import {DefaultStyle} from '../../../util/ConstVar';
import AppHeader from '../../../component/AppHeader';
import Api from '../../../service/Api';
import { API_GET_DASHBOARD } from '../../../service/apiEndPoint';
import { useFocusEffect } from '@react-navigation/native';
import BalanceCard from '../home/BalanceCard';
import Loader from '../../../util/Loader';

const EarningIndex = ({navigation}) => {

  const [loaderVisible, setLoaderVisible] = useState(false);
  const [hasConnectAccount, setHasConnectAccount] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

  const getData = async () => {
    try {
      setLoaderVisible(true);
      const response = await Api.get(API_GET_DASHBOARD);

      if (response.status == 'RC200') {
        const data = response.data;

        setHasConnectAccount(data.balance.has_connect_account);
        setCurrentBalance(data.balance.available);
        setPendingBalance(data.balance.pending);
      }

      setTimeout(() => {
        setLoaderVisible(false);
      }, 500);
    } catch (error) {
      log(error);
      setLoaderVisible(false);
    }
  };

  useFocusEffect(
      useCallback(() => {
        getData();
      }, []),
    );

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />

      <SafeAreaView
        style={[DefaultStyle.flexView, {backgroundColor: COLORS.gray2}]}>
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
          tittle={'Earnings Report'}
          titleColor={COLORS.white}
        />
        <View style={{flex: 1}}>
          {hasConnectAccount && (
              <BalanceCard
                availableBalance={currentBalance}
                pendingBalance={pendingBalance}
              />
            )}
        </View>
        <View style={{position:'absolute',bottom:0}}>
          <BottomTab />
        </View>
        <Loader
          loaderVisible={loaderVisible}
          setLoaderVisible={setLoaderVisible}
        />
      </SafeAreaView>
    </>
  );
};

export default EarningIndex;

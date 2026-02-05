import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useState} from 'react';
import {FlatList, Text, TouchableOpacity, View} from 'react-native';
import AppHeader from '../../../component/AppHeader';
import AppIcons from '../../../component/AppIcons';
import BottomTab from '../../../component/BottomTab';
import IosStatusBar from '../../../component/IosStatusBar';
import Api from '../../../service/Api';
import {
  API_NOTIFICATION,
  API_NOTIFICATION_CLEAR,
  API_NOTIFICATION_LIST,
} from '../../../service/apiEndPoint';
import {DefaultStyle} from '../../../util/ConstVar';
import Loader from '../../../util/Loader';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';
import {log} from '../../../util/Toast';
import {styles} from './styles';

const NotificationIndex = ({navigation}) => {
  const [notificationList, setNotificationList] = useState([]);
  const [loaderVisible, setLoaderVisible] = useState(false);

  const getData = async () => {
    setLoaderVisible(true);

    try {
      const response = await Api.get(
        `${API_NOTIFICATION}/${API_NOTIFICATION_LIST}`,
      );

      if (response.status == 'RC200') {
        setNotificationList(response.data);
        setLoaderVisible(false);
      }
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

  const renderNotification = ({item, index}, groupIndex) => {
    return (
      <View style={{backgroundColor: COLORS.white, marginBottom: 10}}>
        <View style={{padding: 10, position: 'relative'}}>
          <View style={DefaultStyle.row}>
            <View style={styles.imageBox}>
              <AppIcons
                type={'Ionicons'}
                name={'notifications-outline'}
                size={20}
                color={COLORS.white2}
              />
            </View>

            <View style={{flex: 1, marginStart: 5}}>
              <Text style={[styles.title, {marginRight: 20}]}>
                {item.title}
              </Text>
              <Text style={[styles.description, {marginTop: 10}]}>
                {item.message}
              </Text>
              <Text style={{fontSize: 12, color: COLORS.gray, marginTop: 10}}>
                {item.title?.toLowerCase().includes('replied')
                  ? `Poked on ${item.datetime}`
                  : `Booked on ${item.datetime}`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const [expandedGroups, setExpandedGroups] = useState({});
  const toggleGroup = appointment_id => {
    setExpandedGroups(prev => ({
      ...prev,
      [appointment_id]: !prev[appointment_id],
    }));
  };

  const renderGroup = ({item, index: groupIndex}) => {
    console.log(item);
    const isExpanded = expandedGroups[item.appointment_id];

    const handleClearGroup = async () => {
      const notificationIds = item.notifications.map(n => n.id);

      try {
        setLoaderVisible(true);
        const response = await Api.post(
          `${API_NOTIFICATION}/${API_NOTIFICATION_CLEAR}`,
          {
            notification_id: notificationIds, // send array of IDs
          },
        );

        if (response.status === 'RC200') {
          const updatedList = [...notificationList];
          updatedList.splice(groupIndex, 1); // remove the whole group
          setNotificationList(updatedList);
          setLoaderVisible(false);
        }
      } catch (err) {
        log('Failed to clear notifications');
        setLoaderVisible(false);
      }
    };

    return (
      <View style={{paddingVertical: 5}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 15,
            paddingVertical: 8,
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            onPress={() => toggleGroup(item.appointment_id)}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <AppIcons
              type="Entypo"
              name={isExpanded ? 'chevron-down' : 'chevron-right'}
              size={18}
              color={COLORS.primary}
            />
            <Text
              style={{
                marginLeft: 8,
                fontWeight: 'bold',
                color: COLORS.primary,
                fontSize: 16,
              }}>
              {item.notifications[0].user_name}
            </Text>
          </TouchableOpacity>

          {/* Group Clear Button */}
          <TouchableOpacity onPress={handleClearGroup} style={{padding: 5}}>
            <AppIcons
              type={'Ionicons'}
              name={'trash'}
              size={20}
              color={COLORS.gray}
            />
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <FlatList
            data={item.notifications}
            keyExtractor={notif => notif.id.toString()}
            renderItem={({item, index}) =>
              renderNotification({item, index}, groupIndex)
            }
            ItemSeparatorComponent={FlatListItemSeparator}
          />
        )}

        <View
          style={{
            height: 1,
            backgroundColor: COLORS.lightGray || '#E0E0E0',
            marginVertical: 15,
            marginHorizontal: 15,
          }}
        />
      </View>
    );
  };

  const FlatListItemSeparator = () => <View style={styles.separator}></View>;
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
        tittle={'Notifications'}
        titleColor={COLORS.white}
      />
      <View style={{flex: 1, marginVertical: 10}}>
        {notificationList.length != 0 && (
          <View style={[styles.itemBox, {flex: 1}]}>
            <FlatList
              style={{height: SIZES.height * 0.77}}
              showsVerticalScrollIndicator={false}
              data={notificationList}
              renderItem={renderGroup}
              keyExtractor={(item, index) => `${item.appointment_id}-${index}`}
            />
          </View>
        )}

        {notificationList.length == 0 && !loaderVisible && (
          <View
            style={{
              height: SIZES.height * 0.75,
              justifyContent: 'center',
              marginHorizontal: 20,
            }}>
            <Text
              style={{
                fontSize: 18,
                color: COLORS.black,
                textAlign: 'center',
              }}>
              Notifications may include alerts, sounds, and icon badges. We will
              notify you of your bookings/video calls, etc.
            </Text>
          </View>
        )}
      </View>
      <Loader
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
      <View style={{position: 'relative', bottom: 0}}>
        <BottomTab />
      </View>
    </>
  );
};

export default NotificationIndex;

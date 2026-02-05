import {useEffect, useState} from 'react';
import {ActivityIndicator, Text, Animated, View, FlatList} from 'react-native';
import Collapsible from 'react-native-collapsible';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {styles} from './styles';
import DayView from './DayView';
import {COLORS} from '../../../util/Theme';
import Api from '../../../service/Api';
import {API_SCHEDULE_MY_TIMELINE} from '../../../service/apiEndPoint';
import AppIcons from '../../../component/AppIcons';

const ExpandCollapseView = ({index, item, level, onDelete}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const toggleCollapse = () => {
    setIsEmpty(false);
    setList([]);
    setIsCollapsed(!isCollapsed);
  };

  const [loaderVisible, setLoaderVisible] = useState(true);
  const [list, setList] = useState([]);

  const getData = async () => {
    setLoaderVisible(true);

    const formdata = new FormData();
    formdata.append(`is_day`, item.is_day);
    formdata.append(`start_time`, item.start_time_utc);
    formdata.append(`end_time`, item.end_time_utc);

    const response = await Api.post(`${API_SCHEDULE_MY_TIMELINE}`, formdata);

    if (response.status == 'RC200') {
      let data = response.data;

      setList(data);
      setIsEmpty(data.length == 0);
    }

    setLoaderVisible(false);
  };

  useEffect(() => {
    if (isCollapsed) {
      setIsEmpty(false);
      setList([]);
      getData();
    }
  }, [isCollapsed]);

  const Divider = () => {
    return (
      <View
        style={{
          height: 1,
          backgroundColor: '#e0e0e0',
        }}
      />
    );
  };

  return (
    <View>
      <TouchableOpacity onPress={() => toggleCollapse()}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: level == 1 ? 25 : 0,
            backgroundColor: index % 2 == 0 ? '#F5F5F5' : '#FFFFFF',
          }}>
          <AppIcons
            type={'MaterialIcons'}
            name={isCollapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={30}
            color={item.total_slots == 0 ? COLORS.gray : COLORS.primary}
          />
          <Text
            style={[
              styles.listItemHeading,
              {
                color: item.total_slots == 0 ? COLORS.gray : COLORS.primary,
                paddingLeft: level == 1 ? 0 : 0,
              },
            ]}>
            {item.label}{' '}
            {item.total_slots != 0 && <>({item.total_slots} slots)</>}
          </Text>
        </View>
      </TouchableOpacity>

      {isCollapsed && (
        <>
          {loaderVisible ? (
            <ActivityIndicator
              style={{alignSelf: 'center'}}
              size={'large'}
              color={COLORS.primary}
            />
          ) : (
            isEmpty && (
              <Text
                style={[
                  {
                    color: COLORS.black,
                    fontWeight: 'normal',
                    textAlign: 'center',
                    flex: 1,
                    paddingVertical: 10,
                    fontSize: 14,
                  },
                ]}>
                Time slot has not been set up yet
              </Text>
            )
          )}

          {item.is_day == 1 && (
            <DayView
              index={index}
              onDeleteComplete={() => {
                setIsEmpty(false);
                setList([]);
                getData();
                onDelete();
              }}
              data={list}
            />
          )}

          {item.is_day == 0 && (
            <FlatList
              data={list}
              contentContainerStyle={{paddingBottom: 85}}
              keyExtractor={item => `level_1_${item.label}`}
              ItemSeparatorComponent={Divider}
              nestedScrollEnabled={false}
              renderItem={({item, index}) => (
                <ExpandCollapseView
                  index={index}
                  level={1}
                  item={item}
                  onDelete={() => {
                    getData();
                    onDelete();
                  }}
                />
              )}
            />
          )}
        </>
      )}
    </View>
  );
};

export default ExpandCollapseView;

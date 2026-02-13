import { Text, TouchableOpacity, View, Modal, Pressable } from "react-native";
import { COLORS } from "../../../util/Theme";
import { useEffect, useState } from "react";
import Api from "../../../service/Api";
import { API_SCHEDULE_DELETE_SLOT } from "../../../service/apiEndPoint";
import AppIcons from "../../../component/AppIcons";
import { styles } from "./styles";
import { DefaultStyle } from "../../../util/ConstVar";
import {Button} from '@rneui/themed';
import Loader from "../../../util/Loader";

const DayView = ({navigation, data, onDeleteComplete, index}) => {

    const [deleteSlotTimeArr, setDeleteSlotTimeArr] = useState([])
    const [loaderVisible, setLoaderVisible] = useState(false);

    const deleteSlotAPICall = async () => {

        const formdata = new FormData();
    
        deleteSlotTimeArr.map((val, index) => {
          formdata.append(`time[${index}][id]`, val.id);
        });
    
        setLoaderVisible(true);
    
        const response = await Api.post(API_SCHEDULE_DELETE_SLOT, formdata);
        setLoaderVisible(false);
    
        if (response.status == 'RC200') {
          setDeleteSlotTimeArr([])
          // refresh screen
          onDeleteComplete && onDeleteComplete()
        }
    
      }

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

      const [showDeletePopup, setShowDeletePopup] = useState(false)

    return(
        <>
            <View style={[styles.listItemSlotContainer]}>

                {data.length>0 &&(
                    <TouchableOpacity
                        style={{
                            paddingVertical: 4,
                            paddingHorizontal: 8,
                        }}
                        onPress={(event) => {
                            event.stopPropagation()
                            
                            setDeleteSlotTimeArr(data)
                            setShowDeletePopup(true)
                        }}>
                            <Text style={{color: COLORS.red}}>Delete All Slots of this day</Text>
                    </TouchableOpacity>
                )}
                
                <View style={{flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4, paddingBottom: 4}}>
                    {data.map((subItem, idx) => (
                        <View
                            key={`level_2_${subItem.label}_${idx}`}
                            style={styles.slotTube}>
                            <Text style={styles.slotTubeText}>
                              {subItem.label}
                            </Text>
                            <TouchableOpacity
                                style={{padding: 2, flexShrink: 0}}
                                onPress={() => {
                                    setDeleteSlotTimeArr([{id: subItem.id}]);
                                    setShowDeletePopup(true);
                                }}>
                                <AppIcons
                                    type={'MaterialCommunityIcons'}
                                    name={'trash-can-outline'}
                                    size={20}
                                    color={COLORS.red}
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
                
            </View>

        {showDeletePopup && <Modal
            visible={showDeletePopup}
            transparent={true}
            animationType="slide"
            onRequestClose={()=>{
                setShowDeletePopup(false)
            }}>
            <View style={[DefaultStyle.modalContentCenterDialog]}>
                <View style={[DefaultStyle.modalContent]}>
                <Text
                    style={[
                    DefaultStyle.blackBold,
                    {
                        textAlign: 'center',
                        marginVertical: 5,
                        marginTop: 10,
                        fontSize: 18,
                        marginHorizontal: 20,
                    },
                    ]}>
                    Remove Slot
                </Text>
                <Text
                    style={[
                    DefaultStyle.textblack,
                    {textAlign: 'center', marginTop: 5},
                    ]}>
                    Are you sure, do you want to remove slot ?
                </Text>

                <Text
                    style={[
                    DefaultStyle.textblack,
                    {textAlign: 'center', marginTop: 10},
                    ]}>
                    This action will not effect on already booked appointments.
                </Text>
                <View style={[DefaultStyle.flexAround, {marginVertical: 16}]}>
                    <Pressable style={DefaultStyle.btnBorder} onPress={()=>{
                        setShowDeletePopup(false)
                    }}>
                    <Text
                        style={{
                        textAlign: 'center',
                        color: COLORS.black,
                        fontSize: 14,
                        }}>
                        Cancel
                    </Text>
                    </Pressable>

                    <Button
                        title="Yes, Remove"
                        buttonStyle={[DefaultStyle.btnLogin, {marginVertical: 0}]}
                        titleStyle={DefaultStyle.whiteBold}
                        onPress={()=>{
                            setShowDeletePopup(false)
                            deleteSlotAPICall()
                        }}
                    />
                </View>
                </View>
            </View>
            </Modal>}


            {loaderVisible && <Loader
                loaderVisible={loaderVisible}
                setLoaderVisible={setLoaderVisible}
            />}
        </>
    )

}

export default DayView;
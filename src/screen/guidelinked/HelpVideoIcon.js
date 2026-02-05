import AppIcons from "../../component/AppIcons"
import {Linking, Pressable, Text, TouchableOpacity, View} from 'react-native';
import { COLORS } from "../../util/Theme";
import { useNavigation } from "@react-navigation/native";

const HelpVideoIcon = ({type, style, title="Help"}) =>{

    const navigation = useNavigation();

    return(
        <TouchableOpacity
            style={[style, {flexDirection: 'row', alignItems: 'center'}]}
            onPress={()=>{
                navigation.navigate('HelpVideos', {type:type})
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <AppIcons
                    name={'video'}
                    type={'Feather'}
                    size={20}
                    color={COLORS.gray}
                />
                <Text style={{marginLeft: 5, fontSize:15}} >{title}</Text>
            </View>
        </TouchableOpacity>
    )

}

export default HelpVideoIcon
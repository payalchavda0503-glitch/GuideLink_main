import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import AppIcons from '../../component/AppIcons';
import { COLORS } from '../../util/Theme';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import VideoView from './home/VideoView';

const ImageLoader = ({ url, title, vid, imageHeight = 240 }) => {

    const [isLoading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false)

    return (
        <GestureHandlerRootView style={{}}>
            {isLoading && (
                <ActivityIndicator style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} size={'large'} />
            )}

            <FastImage
                fallback={true}
                onError={() => {

                    setLoading(false)
                }}
                onLoadEnd={() => {
                    setLoading(false)
                }}
                onLoadStart={() => {
                    setLoading(true)
                }}
                source={{
                    uri: `${url}`,
                    priority: FastImage.priority.high,
                }}
                resizeMode={FastImage.resizeMode.cover}
                style={{ height: imageHeight }}
            />

            {!isLoading && <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={() => {
                        setVisible(true)
                    }}
                >
                    <View style={{ backgroundColor: '#00000082', borderRadius: 200, padding: 2 }} >
                        <AppIcons
                            type={'Ionicons'}
                            name={'play-circle-outline'}
                            size={45}
                            color={COLORS.white}
                        />
                    </View>
                </TouchableOpacity>

            </View>}

            <VideoView vid={vid} visible={visible} title={title} onClose={() => {
                setVisible(false)
            }} />

        </GestureHandlerRootView>
    )

}

export default ImageLoader
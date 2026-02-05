import { Platform,View  } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IosStatusBar = ({backgroundColor}) => {
    const insets = useSafeAreaInsets();
  return (
 <>
{Platform.OS=='ios'&& <View style={{backgroundColor:backgroundColor,height:insets.top}}/>}
 </>
  )
}

export default IosStatusBar

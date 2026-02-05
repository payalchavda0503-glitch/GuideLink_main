import {Platform, StyleSheet, TextInput, View} from 'react-native';
import React, {forwardRef} from 'react';
import {COLORS} from '../util/Theme';

const CustomInputBox = forwardRef(
  (
    {
      inputPlaceHolder,
      keyboardType,
      secureTextEntry,
      autoComplete,
      value,
      setValue,

      onSubmitEditing, // we will pass the focus handling as a prop
    },
    ref,
  ) => {
    return (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={inputPlaceHolder}
          placeholderTextColor={COLORS.gray}
          keyboardType={keyboardType}
          autoCorrect={false}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={txt => {
            setValue(txt);
          }}
          ref={ref}
          onSubmitEditing={onSubmitEditing}
        />
      </View>
    );
  },
);
export default CustomInputBox;

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingVertical: Platform.OS == 'ios' && 15,
    //  alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
    //  width: wp('85%'),
  },
  input: {paddingHorizontal: 15, color: COLORS.black},
});

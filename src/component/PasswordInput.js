import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import AppIcons from './AppIcons';
import {COLORS, SIZES} from '../util/Theme';

const PasswordInput = ({
  passref,
  placeholder = 'Password',
  password,
  setPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        ref={passref}
        placeholder={placeholder || ''}
        secureTextEntry={!showPassword}
        placeholderTextColor={COLORS.gray}
        value={password}
        onChangeText={setPassword} // Call handlePasswordChange on text input change
      />
      <TouchableOpacity
        style={styles.eyeIcon}
        onPress={togglePasswordVisibility}>
        <AppIcons
          type={'Feather'}
          name={showPassword ? 'eye' : 'eye-off'}
          size={20}
          color={COLORS.gray}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray,
    //width: wp('80%'),
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS == 'ios' && 15,
    paddingHorizontal: 15,
    color: COLORS.black,
  },
  eyeIcon: {
    padding: 10,
  },
});

export default PasswordInput;

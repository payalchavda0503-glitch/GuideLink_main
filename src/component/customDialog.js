import {Button} from '@rneui/themed';
import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {DefaultStyle} from '../util/ConstVar';
import {COLORS, SIZES} from '../util/Theme';
import AppIcons from './AppIcons';
import CustomRating from './CustomRating ';

export const CustomLogoutDialog = ({visible, onClose, onLogout}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
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
              },
            ]}>
            Logout
          </Text>
          <Text
            style={[
              DefaultStyle.texBold13,
              {textAlign: 'center', marginTop: 2},
            ]}>
            {' '}
            Are you sure you want to Logout?
          </Text>

          <View
            style={[
              DefaultStyle.flexAround,
              {marginVertical: 16, justifyContent: 'space-evenly'},
            ]}>
            <Button
              title="No"
              buttonStyle={[
                DefaultStyle.btnBorder,
                {marginVertical: 0, minWidth: 130, borderRadius: 20},
              ]}
              titleStyle={[DefaultStyle.whiteBold, {color: COLORS.primary}]}
              onPress={onClose}
            />

            {/* <Pressable style={[DefaultStyle.btnBorder, {flex:1}]} onPress={onClose}>
              <Text
                style={{textAlign: 'center', color: COLORS.gray, fontSize: 14,paddingTop:2}}>
                No
              </Text>
            </Pressable> */}

            <Button
              title="Yes"
              buttonStyle={[
                DefaultStyle.btnLogin,
                {marginVertical: 0, minWidth: 130},
              ]}
              titleStyle={DefaultStyle.whiteBold}
              onPress={onLogout}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const CustomApptDialogCancel = ({visible, onClose, onConfirm}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={[DefaultStyle.modalContentBottomDialog]}>
        <View style={[DefaultStyle.modalContentDialog]}>
          <View
            style={{
              alignSelf: 'center',
              paddingVertical: 10,
            }}>
            <AppIcons
              type={'FontAwesome'}
              name={'warning'}
              size={60}
              color={COLORS.red}
            />
          </View>

          <Pressable
            onPress={onClose}
            style={{
              position: 'absolute',
              right: 12,
              top: 10,
            }}>
            <AppIcons
              type={'Entypo'}
              name={'cross'}
              size={26}
              color={COLORS.black}
            />
          </Pressable>
          <Text style={[DefaultStyle.txt14bold, {textAlign: 'center'}]}>
            If you cancel, the other User has the right to give you the lowest
            rating. Our system filters search result by ratings. Do you still
            want to proceed ?
          </Text>

          <Button
            title="CONFIRM"
            buttonStyle={[DefaultStyle.btnDanger, {marginVertical: 20}]}
            titleStyle={DefaultStyle.whiteBold}
            onPress={onConfirm}
          />
        </View>
      </View>
    </Modal>
  );
};

export const CustomDialogVerifyEmail = ({visible, onClose, emailList}) => {
  const hideEmailChars = email => {
    // const [name, domain] = email.split('@');
    // const hiddName = name.replace(/./g, '.');
    // return `${hiddName}@${domain}`;

    const isIndex = email.indexOf('@'); // Find the index of '@', postion return
    const hiddenName = email.slice(0, isIndex).replace(/./g, ''); // Replace characters before '@' with dots
    // console.log("LIKE @nexcess.com : -",email.slice(isIndex));
    return '*****' + hiddenName + email.slice(isIndex); // Return hidden email
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={[DefaultStyle.modalContentCenterDialog]}>
        <View style={[DefaultStyle.modalContent]}>
          <View style={{alignSelf: 'center', paddingVertical: 10}}>
            <AppIcons
              type={'MaterialCommunityIcons'}
              name={'check-decagram'}
              size={60}
              color={COLORS.blue}
            />
          </View>
          <Pressable
            onPress={onClose}
            style={{position: 'absolute', right: 12, top: 10}}>
            <AppIcons
              type={'Entypo'}
              name={'cross'}
              size={26}
              color={COLORS.black}
            />
          </Pressable>
          <Text
            style={[
              DefaultStyle.txt14bold,
              {textAlign: 'center', fontSize: 18},
            ]}>
            Verified Emails
          </Text>

          <View style={{marginLeft: 50, marginVertical: 20}}>
            {emailList?.map(emailName => {
              const hiddenEmail = hideEmailChars(emailName);
              return (
                <Text style={[DefaultStyle.txt14, {marginTop: 2}]}>
                  {hiddenEmail}
                </Text>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const UploadPhotoDialog = ({
  visible,
  onClose,
  onChooseLibrary,
  onTakePhoto,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={DefaultStyle.modalContentBottomDialog}>
        <View style={DefaultStyle.modalContentDialog}>
          <SafeAreaView>
            <Text
              style={[
                DefaultStyle.primary18,
                {textAlign: 'center', marginVertical: 10},
              ]}>
              Upload Profile Image
            </Text>

            <Pressable
              style={DefaultStyle.imageContainer}
              onPress={onChooseLibrary}>
              <AppIcons
                type={'Ionicons'}
                name="image-outline"
                size={20}
                color={COLORS.black}
              />

              <Text style={[DefaultStyle.blackBold, {marginHorizontal: 15}]}>
                Gallery
              </Text>
            </Pressable>

            <Pressable
              style={[DefaultStyle.imageContainer, {marginVertical: 10}]}
              onPress={onTakePhoto}>
              <AppIcons
                type={'MaterialCommunityIcons'}
                name="camera-outline"
                size={20}
                color={COLORS.black}
              />
              <Text style={[DefaultStyle.blackBold, {marginHorizontal: 15}]}>
                Take Photo{' '}
              </Text>
            </Pressable>

            {/* <View style={DefaultStyle.cancelButtonContainer}> */}
            <Button
              title="Cancel"
              buttonStyle={DefaultStyle.cancelButton}
              titleStyle={{color: COLORS.white}}
              onPress={onClose}
            />

            {/* </View> */}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

export const CustomSmsDialog = ({visible, onClose, onYes}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={[DefaultStyle.modalContentCenterDialog]}>
        <View style={[DefaultStyle.modalContent]}>
          <Text
            style={[
              DefaultStyle.texBold13,
              {textAlign: 'center', marginTop: 2},
            ]}>
            Do you wish to proceed without SMS consent?
          </Text>

          <View
            style={[
              DefaultStyle.flexAround,
              {marginVertical: 16, justifyContent: 'space-evenly'},
            ]}>
            <Button
              title="No"
              buttonStyle={[
                DefaultStyle.btnBorder,
                {marginVertical: 0, minWidth: 130, borderRadius: 20},
              ]}
              titleStyle={[DefaultStyle.whiteBold, {color: COLORS.primary}]}
              onPress={onClose}
            />

            <Button
              title="Yes"
              buttonStyle={[
                DefaultStyle.btnLogin,
                {marginVertical: 0, minWidth: 130},
              ]}
              titleStyle={DefaultStyle.whiteBold}
              onPress={onYes}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const CustomApptDialogRaisComplaint = ({
  visible,
  onClose,
  onAddComplaint,
  statusID,
  subject,
  setSubject,
  message,
  setMessage,
  status,
  isOldVersion,
  setId,
}) => {
  const dispatch = useDispatch();
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={[DefaultStyle.modalContentBottomDialog]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <SafeAreaView
            style={[DefaultStyle.modalContentDialog, {width: SIZES.width}]}>
            <View
              style={{
                paddingTop: Platform.OS == 'ios' && 20,
                paddingHorizontal:
                  Platform.OS === 'ios' && (isOldVersion ? 0 : 30),
              }}>
              {/* <Pressable
            onPress={() => {
              onClose();
              setSubject('');
              setMessage('');
            }}
            style={{
              position: 'absolute',
              right: 12,
              top: 10,
            }}>
            <AppIcons
              type={'Entypo'}
              name={'cross'}
              size={28}
              color={COLORS.black}
            />
          </Pressable> */}
              {statusID == 0 || statusID == '0' ? (
                <View>
                  <Text
                    style={[
                      DefaultStyle.textPrimaryheading,
                      {textAlign: 'center', marginBottom: 20},
                    ]}>
                    Your Feedback
                  </Text>
                  <TextInput
                    style={[DefaultStyle.inputRating, {height: 48}]}
                    placeholder="Subject"
                    keyboardType="default"
                    value={subject}
                    textAlignVertical="top"
                    returnKeyType="done"
                    onChangeText={txt => {
                      setSubject(txt);
                    }}
                    placeholderTextColor={COLORS.gray}
                  />

                  <TextInput
                    style={[
                      DefaultStyle.inputRating,
                      {
                        minHeight: Platform.OS == 'ios' && 80,
                      },
                    ]}
                    placeholder="Message"
                    keyboardType="default"
                    value={message}
                    returnKeyType="done"
                    onChangeText={txt => {
                      setMessage(txt);
                    }}
                    maxLength={150}
                    numberOfLines={2}
                    textAlignVertical="top"
                    multiline
                    placeholderTextColor={COLORS.gray}
                  />
                  <View style={[DefaultStyle.flexAround]}>
                    <Button
                      title="CANCEL"
                      buttonStyle={[
                        DefaultStyle.btnDanger,
                        {marginBottom: 0, backgroundColor: COLORS.red},
                      ]}
                      titleStyle={DefaultStyle.whiteBold}
                      onPress={() => {
                        onClose();
                        setSubject('');
                        setMessage('');
                      }}
                    />
                    <Button
                      title="SAVE"
                      buttonStyle={[
                        DefaultStyle.btnDanger,
                        {backgroundColor: COLORS.primary, marginBottom: 0},
                      ]}
                      titleStyle={DefaultStyle.whiteBold}
                      onPress={onAddComplaint}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <Text
                    style={[
                      DefaultStyle.textPrimaryheading,
                      {textAlign: 'center', marginBottom: 20},
                    ]}>
                    Your Feedback
                  </Text>

                  <Text style={[DefaultStyle.txt14bold]}>Subject :</Text>

                  <Text style={[DefaultStyle.txt14]}>{subject}</Text>
                  {/* <TextInput
                style={[DefaultStyle.inputRating]}
                placeholder="Subject"
                keyboardType="default"
                value={subject}
                editable={false}
                returnKeyType="done"
                onChangeText={txt => {
                  setSubject(txt);
                }}
                placeholderTextColor={COLORS.gray}
              /> */}

                  <Text style={[DefaultStyle.txt14bold, {marginTop: 10}]}>
                    Message :
                  </Text>
                  <Text style={[DefaultStyle.txt14]}>{message}</Text>
                  {/* <TextInput
                style={[DefaultStyle.inputRating]}
                placeholder="Message"
                keyboardType="default"
                editable={false}
                value={message}
                returnKeyType="done"
                onChangeText={txt => {
                  setMessage(txt);
                }}
                maxLength={150}
                numberOfLines={2}
                textAlignVertical="top"
                placeholderTextColor={COLORS.gray}
              /> */}
                  {/* <Text style={[DefaultStyle.txt14bold, {marginTop: 10}]}>
                    Status :
                  </Text>
                  <Text style={[DefaultStyle.txt14]}>
                    {status == 1 || status == 0 ? 'Pending' : 'failed'}
                  </Text> */}

                  <Button
                    title="CLOSE"
                    buttonStyle={[DefaultStyle.btnDanger, {marginBottom: 0}]}
                    titleStyle={DefaultStyle.whiteBold}
                    onPress={() => {
                      onClose();
                      setSubject('');
                      setMessage('');
                    }}
                  />
                </View>
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
export const CustomDialogRating = ({
  visible,
  onClose,
  onSubmit,
  message,
  userName,
  setMessage,
  statusId,
  setRating,
  rating,
  isOldVersion,
}) => {
  const handleUpdateRating = value => {
    setRating(value);
  };

  const close = () => {
    onClose();
    setRating(0);
    setMessage('');
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={[DefaultStyle.modalContentBottomDialog]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <SafeAreaView
            style={[DefaultStyle.modalContentDialog, {width: SIZES.width}]}>
            <View
              style={{
                paddingTop: Platform.OS == 'ios' && 20,
                paddingHorizontal:
                  Platform.OS === 'ios' && (isOldVersion ? 0 : 30),
              }}>
              {statusId == 0 ? (
                <View>
                  <Text
                    style={[
                      DefaultStyle.textPrimaryheading,
                      {textAlign: 'center', marginBottom: 20},
                    ]}>
                    'Your Rating'
                  </Text>
                  <View style={{alignSelf: 'center'}}>
                    <CustomRating
                      ratingSize={28}
                      initialRating={rating}
                      onUpdateRating={handleUpdateRating}
                    />
                  </View>

                  {/* <TextInput
                    style={[DefaultStyle.inputRating,{ minHeight:Platform.OS=="ios"&&80}]}
                    numberOfLines={3}
                    maxLength={200}
                    multiline={true}
                    placeholder="Describe how your meeting went,how he explained etc."
                    textAlignVertical="top"
                    placeholderTextColor={COLORS.gray}
                    value={message}
                    onChangeText={text => setMessage(text)}
                  /> */}

                  <View style={[DefaultStyle.flexAround, {marginTop: 5}]}>
                    <Button
                      title="CANCEL"
                      buttonStyle={[
                        DefaultStyle.btnDanger,
                        {marginBottom: 0, backgroundColor: COLORS.red},
                      ]}
                      titleStyle={DefaultStyle.whiteBold}
                      onPress={() => {
                        onClose();
                        setMessage('');
                      }}
                    />
                    <Button
                      title="SAVE"
                      buttonStyle={[
                        DefaultStyle.btnDanger,
                        {backgroundColor: COLORS.primary, marginBottom: 0},
                      ]}
                      titleStyle={DefaultStyle.whiteBold}
                      onPress={() => {
                        onSubmit();
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View>
                  <Text
                    style={[
                      DefaultStyle.textPrimaryheading,
                      {textAlign: 'center', marginBottom: 20},
                    ]}>
                    {userName !== '' ? userName : 'Your Rating'}
                  </Text>

                  <Text style={[DefaultStyle.txt14bold]}>Rating :</Text>
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 5,
                      marginBottom: 10,
                    }}>
                    <CustomRating
                      ratingSize={22}
                      initialRating={rating}
                      isshow={true}
                    />
                  </View>

                  {/* <Text style={[DefaultStyle.txt14bold, {marginTop: 10}]}>
                    Message :
                  </Text>

                  <Text style={[DefaultStyle.txt14]}>{message}</Text> */}

                  <View style={{alignSelf: 'center'}}>
                    <Button
                      title="CLOSE"
                      buttonStyle={[DefaultStyle.btnDanger, {marginBottom: 0}]}
                      titleStyle={DefaultStyle.whiteBold}
                      onPress={() => {
                        onClose();
                        // setRating(0);
                        // setMessage('');
                      }}
                    />
                  </View>
                </View>
              )}
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

//Delete account
export const CustomDeleteDialog = ({visible, onClose, onDelete}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
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
            Are you sure, do you want to delete your account?
          </Text>
          <Text style={[DefaultStyle.texBold13, {textAlign: 'center'}]}>
            All your data will be deleted including appointments and payments
            history. This action cannot be undone.
          </Text>

          <View style={[DefaultStyle.flexAround, {marginVertical: 16}]}>
            <Pressable style={DefaultStyle.btnBorder} onPress={onClose}>
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
              title="Yes, Delete!"
              buttonStyle={[DefaultStyle.btnLogin, {marginVertical: 0}]}
              titleStyle={DefaultStyle.whiteBold}
              onPress={onDelete}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const CustomDeleteDialogComp = ({visible, onClose, onDelete, text}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
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
            {text}
          </Text>

          <View style={[DefaultStyle.flexAround, {marginVertical: 16}]}>
            <Pressable style={DefaultStyle.btnBorder} onPress={onClose}>
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
              title="Yes, Delete!"
              buttonStyle={[DefaultStyle.btnLogin, {marginVertical: 0}]}
              titleStyle={DefaultStyle.whiteBold}
              onPress={onDelete}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const CustomCancelTimeSlotDialog = ({
  visible,
  onClose,
  onCanelTimeSlot,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
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
            <Pressable style={DefaultStyle.btnBorder} onPress={onClose}>
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
              onPress={onCanelTimeSlot}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

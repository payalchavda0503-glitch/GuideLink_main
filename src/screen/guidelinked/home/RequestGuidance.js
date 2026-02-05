import AsyncStorage from '@react-native-async-storage/async-storage';
import {Button} from '@rneui/themed';
import debounce from 'lodash.debounce';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useDispatch} from 'react-redux';
import AppIcons from '../../../component/AppIcons';
import CustomRating from '../../../component/CustomRating ';
import {CustomDeleteDialogComp} from '../../../component/customDialog';
import {showToast} from '../../../redux/toastSlice';
import Api from '../../../service/Api';
import {
  API_DELETE_GUIDANCE_REQUEST,
  API_GET_GUIDANCE_REQUEST,
  API_POST_GUIDANCE_REQUEST,
} from '../../../service/apiEndPoint';
import {DefaultStyle} from '../../../util/ConstVar';
import {COLORS} from '../../../util/Theme';
import {log} from '../../../util/Toast';

const RequestGuidanceScreen = ({onHandleDeatils}) => {
  const [guidanceRequests, setGuidanceRequests] = useState([]);
  const dispatch = useDispatch();
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingQuestion, setEditingQuestion] = useState({
    question: '',
    questionDesc: '',
  });
  const [posting, setPosting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [isDelete, setIsDelete] = useState(false);
  const [deleteId, setdeleteId] = useState(0);
  const isDeleteDialog = () => {
    setIsDelete(!isDelete);
  };
  const [question, setQuestion] = useState({question: '', questionDesc: ''});
  const STORAGE_KEY_NEW = 'draft_new_question';
  const STORAGE_KEY_EDIT = 'draft_edit_question';

  const handleQuestion = text => {
    question.question = text;
    setQuestion({...question, question: text});
  };
  const handleAnswer = text => {
    question.questionDesc = text;
    setQuestion({...question, questionDesc: text});
  };

  const handleEditingQuestion = text => {
    editingQuestion.question = text;
    setEditingQuestion({...editingQuestion, question: text});
  };
  const handleEditingAnswer = text => {
    editingQuestion.questionDesc = text;
    setEditingQuestion({...editingQuestion, questionDesc: text});
  };

  useEffect(() => {
    fetchGuidanceRequests();
    loadSavedDrafts();
  }, []);

  const loadSavedDrafts = async () => {
    try {
      const savedNew = await AsyncStorage.getItem(STORAGE_KEY_NEW);
      if (savedNew) {
        setQuestion(JSON.parse(savedNew));
        console.log('Draft (new) loaded:', savedNew);
      }

      const savedEdit = await AsyncStorage.getItem(STORAGE_KEY_EDIT);
      if (savedEdit) {
        setEditingQuestion(JSON.parse(savedEdit));
        console.log('Draft (edit) loaded:', savedEdit);
      }
    } catch (e) {
      console.log('Error loading drafts:', e);
    }
  };

  // Save new question
  const saveNewDraft = async q => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_NEW, JSON.stringify(q));
    } catch (e) {
      console.log('Error saving new draft:', e);
    }
  };
  const debouncedSaveNew = React.useMemo(
    () => debounce(q => saveNewDraft(q), 500),
    [],
  );

  useEffect(() => {
    if (question.question.trim() || question.questionDesc.trim()) {
      debouncedSaveNew(question);
    }
    return () => debouncedSaveNew.cancel();
  }, [question]);

  // Save editing question
  const saveEditDraft = async q => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_EDIT, JSON.stringify(q));
    } catch (e) {
      console.log('Error saving edit draft:', e);
    }
  };
  const debouncedSaveEdit = React.useMemo(
    () => debounce(q => saveEditDraft(q), 500),
    [],
  );

  useEffect(() => {
    if (
      editingQuestion.question.trim() ||
      editingQuestion.questionDesc.trim()
    ) {
      debouncedSaveEdit(editingQuestion);
    }
    return () => debouncedSaveEdit.cancel();
  }, [editingQuestion]);

  const fetchGuidanceRequests = async () => {
    try {
      setLoadingGuidance(true);
      const response = await Api.get(`${API_GET_GUIDANCE_REQUEST}`);
      if (response.status === 'RC200') {
        setGuidanceRequests(response.data);
      }
    } catch (err) {
      log('Failed to load guidance requests');
    } finally {
      setLoadingGuidance(false);
    }
  };
  const toggleExpand = id => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id], // toggle for specific guidance_id
    }));
  };

  const postGuidance = async () => {
    if (!question.question.trim()) {
      dispatch(showToast('Please enter question'));
      return;
    } else if (!question.questionDesc.trim()) {
      dispatch(showToast('Please enter question'));
      return;
    }
    setPosting(true);
    try {
      const payload = {
        questions: [question],
      };
      const response = await Api.post(`${API_POST_GUIDANCE_REQUEST}`, payload);
      if (response.status === 'RC200') {
        fetchGuidanceRequests();
        setQuestion({question: '', questionDesc: ''});
        await AsyncStorage.removeItem(STORAGE_KEY_NEW);
      }
    } catch (err) {
      log('Failed to post guidance');
    } finally {
      setPosting(false);
    }
  };

  const startEdit = (id, questionData) => {
    setEditingId(id);
    try {
      setEditingQuestion({
        question: questionData.question || '',
        questionDesc: questionData.questionDesc || '',
      });
    } catch (e) {
      setEditingQuestion({question: questionData, questionDesc: ''});
    }
  };

  const updateGuidance = async id => {
    if (!editingQuestion.question.trim()) {
      dispatch(showToast('Please enter question'));
      return;
    } else if (!editingQuestion.questionDesc.trim()) {
      dispatch(showToast('Please enter question'));
      return;
    }

    try {
      const payload = {
        questions: [
          {
            id: id,
            question: editingQuestion.question,
            questionDesc: editingQuestion.questionDesc,
          },
        ],
      };

      console.log(payload);
      setPosting(true);
      const response = await Api.post(`${API_POST_GUIDANCE_REQUEST}`, payload);
      if (response.status === 'RC200') {
        fetchGuidanceRequests();
        setEditingId(null);
        setEditingQuestion({question: '', questionDesc: ''});
      }
    } catch (err) {
      log('Failed to update guidance');
    } finally {
      setPosting(false);
    }
  };

  const deleteGuidance = async id => {
    setDeletingId(id);
    isDeleteDialog();
    try {
      const response = await Api.post(`${API_DELETE_GUIDANCE_REQUEST}`, {id});
      if (response.status === 'RC200') {
        setGuidanceRequests(prev =>
          prev.filter(item => item.guidance_id !== id),
        );
      }
    } catch (err) {
      log('Failed to delete guidance');
    } finally {
      setDeletingId(null);
    }
  };

  const ProfileTab = ({user}) => {
    console.log(user);
    return (
      <Pressable
        onPress={() => {
          onHandleDeatils(user.id);
        }}>
        <View style={[DefaultStyle.row, {alignItems: 'center', padding: 5}]}>
          <Text>-</Text>
          <View style={profileStyles.imageContent}>
            <Image
              source={{uri: user.profile_image}}
              style={profileStyles.limage}
              resizeMode="cover"
            />
          </View>

          <View style={profileStyles.nameContent}>
            <View style={[DefaultStyle.flexDirection, {alignItems: 'center'}]}>
              <Text style={profileStyles.name}>{user.name}</Text>
              {user.is_email_verified && (
                <Pressable onPress={() => {}}>
                  <Image
                    source={require('../../../assets/images/ic_verify1.png')}
                    resizeMode="contain"
                    style={profileStyles.imgVerify}
                  />
                </Pressable>
              )}
            </View>

            {user.total_rating > 0 && (
              <View style={DefaultStyle.flexDirection}>
                <CustomRating
                  ratingSize={12}
                  initialRating={user.total_rating}
                  isshow={true}
                />
                <Text style={[DefaultStyle.text, {marginStart: 4}]}>
                  ({user.total_rating_users})
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderItem = ({item, index}) => {
    const isExpanded = expandedItems[item.guidance_id];
    return (
      <View style={styles.card}>
        {editingId === item.guidance_id ? (
          <>
            <View style={DefaultStyle.row}>
              <TextInput
                style={[styles.inputCollege, {flex: 1, marginBottom: 4}]}
                placeholder="Enter a heading to your question"
                placeholderTextColor={COLORS.gray}
                value={editingQuestion.question}
                onChangeText={text => handleEditingQuestion(text)}
              />
            </View>

            <TextInput
              style={styles.inputCollege}
              placeholder="Explain here with some thought and details"
              placeholderTextColor={COLORS.gray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={editingQuestion.questionDesc}
              onChangeText={text => handleEditingAnswer(text)}
            />
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => updateGuidance(item.guidance_id)}>
                <Icon name="check" size={22} color="green" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setEditingId(null);
                  setEditingQuestion({
                    question: '',
                    questionDesc: '',
                  });
                }}>
                <Icon name="close" size={22} color="red" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* Question Row */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              {/* <Text style={styles.questionText}>{item.question}</Text> */}
              <View style={{flexDirection: 'column'}}>
                <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                  <View style={{marginTop: 7}}>
                    <AppIcons
                      type={'FontAwesome'}
                      name={'circle'}
                      size={8}
                      color={COLORS.black}
                    />
                  </View>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: COLORS.black,
                      marginLeft: 8,
                      flexShrink: 1,
                    }}>
                    {item.question.question}
                  </Text>
                </View>
                <Text style={{paddingLeft: 16, color: COLORS.black}}>
                  {item.question.questionDesc}
                </Text>
              </View>
              <TouchableOpacity onPress={() => toggleExpand(item.guidance_id)}>
                <Icon
                  name={isExpanded ? 'remove' : 'add'}
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>
            </View>

            {/* Expandable Answers */}
            {isExpanded && item.answers.length > 0 && (
              <View style={{marginTop: 8}}>
                {item.answers.map((ans, idx) => (
                  <View key={idx} style={styles.answerBox}>
                    <Text style={styles.answerText}>{ans.answer}</Text>
                    <ProfileTab user={ans.user} />
                    {/* <Text style={styles.answerUser}>
                      - {ans.user?.name || 'Anonymous'}
                    </Text> */}
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => startEdit(item.guidance_id, item.question)}>
                <Icon name="edit" size={20} color="#555" />
              </TouchableOpacity>

              {deletingId === item.guidance_id ? (
                <ActivityIndicator size="small" color="red" />
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    isDeleteDialog();
                    setdeleteId(item.guidance_id);
                  }}>
                  <Icon name="delete" size={20} color="red" />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
        {/* Separator */}
        {index < guidanceRequests.length - 1 && (
          <View style={styles.separator} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.addNewContainer}>
        <View>
          <Text
            style={[
              DefaultStyle.blackBold,
              {color: COLORS.primary, marginBottom: 5},
            ]}>
            Post a Question
          </Text>
          <View
            style={{
              marginBottom: 15,
              marginTop: 5,
              flexDirection: 'row',
            }}>
            <Text style={DefaultStyle.txtgray12}>
              Your question will be posted and reviewed by Guides. They may poke
              you on the app and if you like them, book an appointment to get
              help!
            </Text>
          </View>

          <View style={DefaultStyle.row}>
            <TextInput
              style={[styles.inputCollege, {flex: 1, marginBottom: 4}]}
              placeholder="Enter a heading to your question"
              placeholderTextColor={COLORS.gray}
              value={question.question}
              onChangeText={text => handleQuestion(text)}
            />
          </View>

          <TextInput
            style={styles.inputCollege}
            placeholder="Explain here with some thought and details"
            placeholderTextColor={COLORS.gray}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={question.questionDesc}
            onChangeText={text => handleAnswer(text)}
          />
        </View>

        {/* <TextInput
          style={styles.inputMSg}
          keyboardType="default"
          numberOfLines={6}
          placeholder={
            'Your question will be posted and reviewed by Guides. They may poke you on the app and if you like them, book an appointment to get question!'
          }
          textAlignVertical="top"
          multiline={true}
          maxLength={10000}
          value={newQuestion}
          onChangeText={setNewQuestion}
          placeholderTextColor={COLORS.gray}
        /> */}

        <Button
          title={posting ? 'Posting...' : 'Post'}
          buttonStyle={[styles.btnDanger]}
          onPress={() => {
            postGuidance();
          }}
        />
      </View>
      {loadingGuidance ? (
        <ActivityIndicator
          color={COLORS.primary}
          style={{marginVertical: 10}}
        />
      ) : (
        <View>
          <Text
            style={[
              DefaultStyle.blackBold,
              {color: COLORS.primary, marginBottom: 5, marginLeft: 14},
            ]}>
            Old Requests
          </Text>
          <View style={styles.separator} />
          <FlatList
            style={{}}
            data={guidanceRequests}
            renderItem={renderItem}
            keyExtractor={item => String(item.guidance_id)}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                No questions found. Add your first question below.
              </Text>
            }
          />
        </View>
      )}

      <CustomDeleteDialogComp
        visible={isDelete}
        text="Are you sure you want to delete the question?"
        onClose={isDeleteDialog}
        onDelete={() => {
          deleteGuidance(deleteId);
        }}
      />
    </View>
  );
};

export default RequestGuidanceScreen;

const profileStyles = StyleSheet.create({
  imageContent: {alignItems: 'center', flex: 1},
  name: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    marginEnd: 2,
  },
  nameContent: {
    marginStart: 2,
    flex: 9,
  },

  limage: {
    width: 20,
    height: 20,
    borderRadius: 100,
  },
  imgVerify: {width: 10, height: 10, marginStart: 4},
});

const styles = StyleSheet.create({
  removeBtn: {
    justifyContent: 'center', // Vertically center content
    alignItems: 'center', // Horizontally center content
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  inputCollege: {
    borderColor: COLORS.gray,
    marginBottom: 12,
    marginTop: 5,
    borderWidth: 1,
    color: COLORS.black,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS == 'ios' && 12,
    //  width:wp('92%'),
  },
  card: {
    backgroundColor: '#fff',
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  answerBox: {
    backgroundColor: '#f2f2f2',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
  },
  answerText: {
    fontSize: 14,
  },
  answerUser: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  inputMSg: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    minHeight: 80,
  },
  container: {flex: 1, backgroundColor: '#fff', padding: 0},
  row: {flexDirection: 'row', alignItems: 'center', marginBottom: 10},
  questionText: {flex: 1, fontSize: 16},
  input: {
    flex: 1,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    color: COLORS.gray,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  inputMSg: {
    borderColor: COLORS.gray,
    marginTop: 5,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: COLORS.black,
    paddingVertical: Platform.OS == 'ios' && 12,
    // width: wp('92%'),
  },

  btnDanger: {
    paddingHorizontal: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },

  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  answerText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 4,
  },
  separator: {
    marginTop: 12,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    minHeight: 40,
    marginBottom: 8,
  },
  buttonText: {color: '#fff', fontSize: 14, fontWeight: 'bold'},
  emptyText: {color: COLORS.gray, textAlign: 'center', marginVertical: 5},
  addNewContainer: {marginTop: 16, padding: 16},
});

import React, {useEffect, useState, useRef} from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BottomTab from '../../../component/BottomTab';
import Icon from 'react-native-vector-icons/Feather';
import DropDownPicker from 'react-native-dropdown-picker';
import {COLORS, SIZES} from '../../../util/Theme';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import IosStatusBar from '../../../component/IosStatusBar';
import {CustomeImagePicker} from '../../../component/ICustomIMGPicker';
import {showToast} from '../../../util/Toast';
import LoaderV2 from '../../../component/LoaderV2';
import {useSelector} from 'react-redux';
import {
  BASE_URL,
  API_TIMELINE_POST_ADD,
  API_TIMELINE_POST_EDIT,
  API_POST_GUIDANCE_REQUEST,
  API_CATEGORY_LIST,
} from '../../../service/apiEndPoint';
import Api from '../../../service/Api';
import {useFocusEffect} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

const AddQuestion = ({navigation, route}) => {
  const token = useSelector(s => s.AuthSlice?.token);
  const [activeTab, setActiveTab] = useState('question'); // 'question' or 'post'
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [heading, setHeading] = useState('');
  const [questionText, setQuestionText] = useState('');
  const scrollToTop = () => {
    // Scroll the active tab's ScrollView to top
    if (activeTab === 'question') {
      questionScrollViewRef.current?.scrollTo({y: 0, animated: true});
    } else {
      postScrollViewRef.current?.scrollTo({y: 0, animated: true});
    }
  };
  // Separate state for post
  const [postDetails, setPostDetails] = useState('');
  const [postImages, setPostImages] = useState([]);
  const [existingPostImages, setExistingPostImages] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [loaderVisible, setLoaderVisible] = useState(false);

  // Refs for swipe functionality
  const scrollViewRef = useRef(null);
  const questionScrollViewRef = useRef(null);
  const postScrollViewRef = useRef(null);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const res = await Api.get(API_CATEGORY_LIST);
      setCategoriesLoading(false);
      if (res?.status === 'RC200' && Array.isArray(res?.data)) {
        const items = res.data.map(item => ({
          label: item.name || item.title || item.category_name || String(item.id),
          value: item.id,
          categoryId: item.id,
        }));
        setCategories(items);
      }
    } catch (e) {
      setCategoriesLoading(false);
      console.error('Fetch categories error:', e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCategories();
    }, []),
  );

  const handleCancel = () => {
    navigation.goBack();
  };

  useEffect(() => {
    const p = route?.params;
    if (p?.editPost && p?.postId != null) {
      setEditingPostId(p.postId);
      setPostDetails(p?.content != null ? String(p.content) : '');
      setExistingPostImages(Array.isArray(p?.images) ? p.images : []);
      // switch to Create Post tab
      setActiveTab('post');
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({x: screenWidth, animated: false});
      });
    } else if (p?.startTab === 'post') {
      // open directly on Create Post tab (e.g. from ShowPost floating + button)
      setActiveTab('post');
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({x: screenWidth, animated: false});
      });
    }
  }, [route?.params]);

  const handleSubmit = async () => {
    if (activeTab === 'question') {
      if (!heading.trim()) {
        showToast('Please enter a heading for your question');
        return;
      }
      if (!questionText.trim()) {
        showToast('Please enter question details');
        return;
      }

      try {
        setLoaderVisible(true);
        const category = categories.find(c => c.value === selectedCategory);
        const categoryId = category?.categoryId ?? 1;
        const payload = {
          category_id: categoryId,
          questions: [
            {
              question: heading.trim(),
              questionDesc: questionText.trim(),
            },
          ],
        };

        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);
        headers.append('Content-Type', 'application/json');

        const res = await fetch(BASE_URL + API_POST_GUIDANCE_REQUEST, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        setLoaderVisible(false);

        if (data?.status === 'RC200') {
          setSelectedCategory(null);
          setHeading('');
          setQuestionText('');
          navigation.navigate('ShowPost');
        } else if (data?.message) {
          showToast(data.message);
        } else {
          showToast('Failed to add question. Please try again.');
        }
      } catch (error) {
        setLoaderVisible(false);
        console.error('Add question error:', error);
        showToast('Failed to add question. Please try again.');
      }
    } else {
      if (!postDetails.trim()) {
        showToast('Please enter post details');
        return;
      }

      try {
        setLoaderVisible(true);
        const formdata = new FormData();
        if (editingPostId != null) {
          formdata.append('post_id', String(editingPostId));
        }
        formdata.append('content', postDetails.trim());

        postImages.forEach((img, index) => {
          const name = img.uri?.split?.('/')?.pop?.() || `image_${index}.jpg`;
          formdata.append('attachments[]', {
            uri: img.uri,
            name,
            type: img.type || 'image/jpeg',
          });
        });

        const headers = new Headers();
        headers.append('Authorization', `Bearer ${token}`);

        const endpoint =
          editingPostId != null ? API_TIMELINE_POST_EDIT : API_TIMELINE_POST_ADD;
        const res = await fetch(BASE_URL + endpoint, {
          method: 'POST',
          headers,
          body: formdata,
        });
        const data = await res.json().catch(() => ({}));
        setLoaderVisible(false);

        if (data?.status === 'RC200') {
          setPostDetails('');
          setPostImages([]);
          setExistingPostImages([]);
          setEditingPostId(null);
          navigation.navigate('ShowPost');
        } else if (data?.message) {
          showToast(data.message);
        } else {
          showToast(
            editingPostId != null
              ? 'Failed to update post. Please try again.'
              : 'Failed to create post. Please try again.',
          );
        }
      } catch (error) {
        setLoaderVisible(false);
        console.error('Create post error:', error);
        showToast(
          editingPostId != null
            ? 'Failed to update post. Please try again.'
            : 'Failed to create post. Please try again.',
        );
      }
    }
  };

  const handlePickImage = () => {
    CustomeImagePicker()
      .then(uri => {
        setPostImages(prev => [
          ...prev,
          {uri, type: 'image/jpeg'},
        ]);
      })
      .catch(() => {});
  };

  const handleRemoveImage = index => {
    setPostImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const pageIndex = tab === 'question' ? 0 : 1;
    scrollViewRef.current?.scrollTo({
      x: pageIndex * screenWidth,
      animated: true,
    });
  };

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / screenWidth);
    const newTab = pageIndex === 0 ? 'question' : 'post';
    if (newTab !== activeTab) {
      setActiveTab(newTab);
    }
  };

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.white} />
      <ScreenStatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <LoaderV2
        loaderVisible={loaderVisible}
        setLoaderVisible={setLoaderVisible}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabChange('question')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'question' && styles.activeTabText,
                ]}>
                Add Question
              </Text>
              {activeTab === 'question' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabChange('post')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'post' && styles.activeTabText,
                ]}>
                Create Post
              </Text>
              {activeTab === 'post' && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={styles.horizontalScrollView}
          contentContainerStyle={styles.horizontalScrollContent}>
          {/* Question Tab Content */}
          <ScrollView
            ref={questionScrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.contentContainer}>
              {/* Informational Text */}
              <Text style={styles.infoText}>
                {activeTab === 'question'
                  ? 'Questions are for getting answers to specific problems. You can ask a question about anything, from academic to career advice.'
                  : 'Share your thoughts, experiences, or insights with the community.'}
              </Text>

              {/* Category Dropdown */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Select category</Text>
                <DropDownPicker
                  open={categoryOpen}
                  value={selectedCategory}
                  items={categories}
                  setOpen={setCategoryOpen}
                  setValue={setSelectedCategory}
                  placeholder={
                    categoriesLoading
                      ? 'Loading...'
                      : categories.length === 0
                        ? 'No categories'
                        : 'Select category'
                  }
                  disabled={categoriesLoading}
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  textStyle={styles.dropdownText}
                  placeholderStyle={styles.dropdownPlaceholder}
                  zIndex={3000}
                  zIndexInverse={1000}
                  listMode="MODAL"
                  modalTitle="Select category"
                  modalAnimationType="slide"
                />
              </View>

              {/* Heading Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Enter a heading for your question.
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter a heading for your question."
                  placeholderTextColor={COLORS.gray}
                  value={heading}
                  onChangeText={setHeading}
                  maxLength={200}
                />
              </View>

              {/* Question Text Area */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Say something...</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Say something..."
                  placeholderTextColor={COLORS.gray}
                  value={questionText}
                  onChangeText={setQuestionText}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={2000}
                />
              </View>
            </View>
          </ScrollView>

          {/* Post Tab Content */}
          <ScrollView
            ref={postScrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            <View style={styles.contentContainer}>
              {/* Informational Text */}
              <Text style={styles.infoText}>
                Share your thoughts, experiences, or insights with the community.
              </Text>

              {/* Post Text Area only */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Say something...</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Say something..."
                  placeholderTextColor={COLORS.gray}
                  value={postDetails}
                  onChangeText={setPostDetails}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  maxLength={2000}
                />
              </View>

              {/* Image Previews */}
              {(existingPostImages.length > 0 || postImages.length > 0) && (
                <View style={styles.imagePreviewRow}>
                  {existingPostImages.map((uri, index) => (
                    <View
                      key={`existing-${index}`}
                      style={styles.imagePreviewContainer}>
                      <Image source={{uri}} style={styles.imagePreview} />
                    </View>
                  ))}
                  {postImages.map((img, index) => (
                    <View
                      key={index}
                      style={styles.imagePreviewContainer}>
                      <Image
                        source={{uri: img.uri}}
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => handleRemoveImage(index)}>
                        <Icon name="x" size={18} color={COLORS.white} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Post Button Container - right after text area */}
              <View style={styles.postButtonContainer}>
                <TouchableOpacity
                  style={styles.imageButton}
                  onPress={handlePickImage}>
                  <Icon name="image" size={22} color={COLORS.gray} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.postButton}
                  onPress={handleSubmit}>
                  <Text style={styles.postButtonText}>
                    {editingPostId != null ? 'Update' : 'Post'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ScrollView>

        {/* Action Buttons - only for question tab */}
        {activeTab === 'question' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleSubmit}>
              <Text style={styles.addButtonText}>Add question</Text>
            </TouchableOpacity>
          </View>
        )}
        <View>
        <BottomTab onHomePress={scrollToTop} />
      </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  tabContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  horizontalScrollView: {
    flex: 1,
  },
  horizontalScrollContent: {
    flexDirection: 'row',
  },
  scrollView: {
    width: screenWidth,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.black,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.grayed,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    minHeight: 44,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.grayed,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    minHeight: 44,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: COLORS.grayed,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  dropdownText: {
    fontSize: 14,
    color: COLORS.black,
  },
  dropdownPlaceholder: {
    color: COLORS.gray,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
   // marginBottom: 25,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  postButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  imageButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButton: {
    flex: 1,
    marginLeft: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AddQuestion;

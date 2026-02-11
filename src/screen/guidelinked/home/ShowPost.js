import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import BottomTab from '../../../component/BottomTab';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {Header} from '../../../component/Header';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import IosStatusBar from '../../../component/IosStatusBar';
import {COLORS, SIZES} from '../../../util/Theme';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
import FastImage from 'react-native-fast-image';
import Api from '../../../service/Api';
import {
  API_TIMELINE_POST_GET,
  API_TIMELINE_POST_LIKE,
  API_TIMELINE_POST_AURA,
  API_TIMELINE_POST_DELETE,
  API_TIMELINE_POST_DELETE_COMMENT,
  API_TIMELINE_POST_GET_LIKE_USERS,
  API_TIMELINE_POST_GET_AURA_USERS,
  API_TIMELINE_POST_COMMENT,
  API_TIMELINE_POST_COMMENT_LIKE,
  API_TIMELINE_POST_GET_COMMENTS,
  BASE_URL,
  WEB_URL,
} from '../../../service/apiEndPoint';
import {log, showToast} from '../../../util/Toast';
import OptionsMenu from 'react-native-option-menu';

const ShowPost = ({navigation}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [comments, setComments] = useState({});
  const currentUserName = useSelector(s => s.AuthSlice.name) || 'User';
  const token = useSelector(s => s.AuthSlice?.token);
  const flatListRef = useRef(null);
  const [likingPostId, setLikingPostId] = useState(null);
  const [auraPostId, setAuraPostId] = useState(null);
  const [replyingTo, setReplyingTo] = useState({});
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [commentLikingKey, setCommentLikingKey] = useState(null);
  const [commentsLoadingPostId, setCommentsLoadingPostId] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [deletingCommentKey, setDeletingCommentKey] = useState(null);
  const [likesModalVisible, setLikesModalVisible] = useState(false);
  const [likesModalPostId, setLikesModalPostId] = useState(null);
  const [likesModalLoading, setLikesModalLoading] = useState(false);
  const [likesModalUsers, setLikesModalUsers] = useState([]);
  const [auraModalVisible, setAuraModalVisible] = useState(false);
  const [auraModalPostId, setAuraModalPostId] = useState(null);
  const [auraModalLoading, setAuraModalLoading] = useState(false);
  const [auraModalUsers, setAuraModalUsers] = useState([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageModalImages, setImageModalImages] = useState([]);
  const [imageModalIndex, setImageModalIndex] = useState(0);

  const openImageModal = (images, index = 0) => {
    const list = Array.isArray(images) ? images : [];
    if (list.length === 0) return;
    setImageModalImages(list);
    setImageModalIndex(Math.max(0, Math.min(index, list.length - 1)));
    setImageModalVisible(true);
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, []),
  );

  const getAttachmentUrl = a => {
    if (typeof a === 'string') return a;
    if (!a || typeof a !== 'object') return null;
    const keys = [
      'url',
      'uri',
      'path',
      'image_url',
      'attachment_url',
      'file_url',
      'file_path',
      'full_url',
      'full_path',
      'link',
      'src',
      'storage_path',
    ];
    let v = null;
    for (const k of keys) {
      v = a[k];
      if (v && typeof v === 'string') break;
    }
    if (!v || typeof v !== 'string') {
      const sub = a.file ?? a.attachment ?? a.image;
      if (sub && typeof sub === 'object') return getAttachmentUrl(sub);
      return null;
    }
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    const base = (WEB_URL || '').replace(/\/$/, '');
    return v.startsWith('/') ? `${base}${v}` : `${base}/${v}`;
  };

  const mapPostFromApi = raw => {
    const arr = x => (Array.isArray(x) ? x : []);
    const attachments = arr(raw.attachments || raw.images);
    const images = attachments.map(getAttachmentUrl).filter(Boolean);
    if (attachments.length > 0 && images.length === 0) {
      console.warn(
        'Attachments not resolved for post',
        raw.id,
        JSON.stringify(attachments),
      );
    }
    const u = raw.userdata || raw.user || {};
    const userName =
      (u.full_name ?? u.fullname ?? u.username ?? u.name ?? raw.user_name) ||
      'User';
    const userAvatar =
      (u.profile_image && String(u.profile_image).trim()) || u.image_url || null;
    const likesData = arr(raw.likesData);
    const likedBy = likesData.map(
      x => x.full_name ?? x.fullname ?? x.username ?? x.name ?? 'User',
    );
    return {
      id: raw.id ?? raw.post_id,
      userId: raw.user_id ?? u.user_id ?? u.id,
      userName,
      userAvatar,
      action:
        raw.action ??
        (raw.type === 'question' ? 'Asked a question' : 'Added a post'),
      timeAgo: raw.formated_created_at ?? raw.created_post ?? raw.time_ago ?? raw.created_at ?? '',
      content: raw.content ?? raw.description ?? raw.text ?? '',
      hashtags: arr(raw.hashtags).map(h =>
        typeof h === 'string' ? h : h?.tag ?? '',
      ),
      images,
      likes: raw.likes ?? raw.likes_count ?? 0,
      comments: raw.comments ?? raw.comments_count ?? 0,
      aura: raw.aura ?? 0,
      likedBy,
      likedByCount: raw.liked_by_count ?? raw.likedByCount ?? likedBy.length,
      type: raw.type === 'question' ? 'question' : 'post',
      paidAnswers: raw.paid_answers ?? raw.paidAnswers ?? 0,
      freeAnswers: raw.free_answers ?? raw.freeAnswers ?? 0,
      isVerified: !!(raw.is_verified ?? raw.isVerified),
      isLiked: !!(raw.is_post_liked ?? raw.isLiked),
      isAuraGiven: !!(raw.is_post_aura ?? raw.isAuraGiven),
    };
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await Api.get(API_TIMELINE_POST_GET);
      setLoading(false);
      const list = res?.data?.data;
      console.log('timeline-post/get_posts data.data:', list);
      if (res?.status === 'RC200' && Array.isArray(list)) {
        setPosts(list.map(mapPostFromApi));
      } else {
        setPosts([]);
      }
    } catch (error) {
      log('Failed to load posts');
      setLoading(false);
      setPosts([]);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts().finally(() => setRefreshing(false));
  };

  const handleLike = async (postId, currentlyLiked) => {
    if (!token || likingPostId != null) return;
    const status = currentlyLiked ? 0 : 1;
    setLikingPostId(postId);
    try {
      const formdata = new FormData();
      formdata.append('post_id', String(postId));
      formdata.append('status', String(status));
      const res = await fetch(BASE_URL + API_TIMELINE_POST_LIKE, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formdata,
      });
      const data = await res.json().catch(() => ({}));
      if (data?.status === 'RC200') {
        setPosts(prev =>
          prev.map(p => {
            if (p.id !== postId) return p;
            const nextLiked = !currentlyLiked;
            const delta = nextLiked ? 1 : -1;
            let likedBy = p.likedBy || [];
            let likedByCount = p.likedByCount ?? likedBy.length;
            if (nextLiked) {
              likedBy = [currentUserName, ...likedBy];
              likedByCount = Math.max(0, likedByCount + 1);
            } else {
              likedBy = likedBy.filter(n => n !== currentUserName);
              likedByCount = Math.max(0, likedByCount - 1);
            }
            return {
              ...p,
              isLiked: nextLiked,
              likes: Math.max(0, (p.likes ?? 0) + delta),
              likedBy,
              likedByCount,
            };
          }),
        );
      } else if (data?.message) {
        showToast(data.message);
      }
    } catch (e) {
      console.error('Like error:', e);
      showToast('Could not update like');
    } finally {
      setLikingPostId(null);
    }
  };

  const handleAura = async (postId, currentlyAura) => {
    if (!token || auraPostId != null) return;
    const status = currentlyAura ? 0 : 1;
    setAuraPostId(postId);
    try {
      const formdata = new FormData();
      formdata.append('post_id', String(postId));
      formdata.append('status', String(status));
      const res = await fetch(BASE_URL + API_TIMELINE_POST_AURA, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formdata,
      });
      const data = await res.json().catch(() => ({}));
      if (data?.status === 'RC200') {
        setPosts(prev =>
          prev.map(p => {
            if (p.id !== postId) return p;
            const nextAura = !currentlyAura;
            const delta = nextAura ? 1 : -1;
            return {
              ...p,
              isAuraGiven: nextAura,
              aura: Math.max(0, (p.aura ?? 0) + delta),
            };
          }),
        );
      } else if (data?.message) {
        showToast(data.message);
      }
    } catch (e) {
      console.error('Aura error:', e);
      showToast('Could not update aura');
    } finally {
      setAuraPostId(null);
    }
  };

  const handleDeletePost = async postId => {
    if (!token || deletingPostId != null) return;
    if (postId == null || postId === '') {
      showToast('Invalid post');
      return;
    }
    setDeletingPostId(postId);
    try {
      const formdata = new FormData();
      formdata.append('post_id', String(postId));
      // Use Api instance so request has same auth, base URL and Content-Type as rest of app
      const data = await Api.post(API_TIMELINE_POST_DELETE, formdata);
      const isSuccess =
        data?.status === 'RC200' ||
        data?.status === 200 ||
        data?.status === '200' ||
        data?.success === true;
      if (isSuccess) {
        setPosts(prev => prev.filter(p => String(p.id) !== String(postId)));
        setOpenCommentsId(prev => (prev === postId ? null : prev));
        setComments(prev => {
          const next = {...prev};
          delete next[postId];
          return next;
        });
        setCommentTexts(prev => {
          const next = {...prev};
          delete next[postId];
          return next;
        });
        showToast(data?.message || 'Post deleted');
      } else if (data?.message) {
        showToast(data.message);
      } else {
        showToast(data?.message || 'Could not delete post');
      }
    } catch (e) {
      console.error('Delete post error:', e);
      showToast('Could not delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!token || deletingCommentKey != null) return;
    const key = `${postId}_${commentId}`;
    setDeletingCommentKey(key);
    try {
      const formdata = new FormData();
      formdata.append('post_id', String(postId));
      formdata.append('comment_id', String(commentId));
      const res = await fetch(BASE_URL + API_TIMELINE_POST_DELETE_COMMENT, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formdata,
      });
      const data = await res.json().catch(() => ({}));
      if (data?.status === 'RC200') {
        setComments(prev => {
          const list = prev[postId] || [];
          const removedIds = new Set([String(commentId)]);
          // remove replies under this comment too
          list.forEach(c => {
            if (c.parentId != null && String(c.parentId) === String(commentId)) {
              removedIds.add(String(c.id));
            }
          });
          const nextList = list.filter(c => !removedIds.has(String(c.id)));
          return {...prev, [postId]: nextList};
        });
        setPosts(prev =>
          prev.map(p => {
            if (p.id !== postId) return p;
            // best-effort decrement (at least 1)
            return {...p, comments: Math.max(0, (p.comments ?? 0) - 1)};
          }),
        );
        showToast(data?.message || 'Comment deleted');
      } else if (data?.message) {
        showToast(data.message);
      } else {
        showToast('Could not delete comment');
      }
    } catch (e) {
      console.error('Delete comment error:', e);
      showToast('Could not delete comment');
    } finally {
      setDeletingCommentKey(null);
    }
  };

  const mapLikeUserFromApi = raw => {
    const u = raw?.user ?? raw?.userdata ?? raw ?? {};
    const id = u.user_id ?? u.id ?? raw?.user_id ?? raw?.id ?? null;
    const name =
      u.full_name ??
      u.fullname ??
      u.username ??
      u.name ??
      raw?.full_name ??
      raw?.username ??
      'User';
    const avatar =
      (u.profile_image && String(u.profile_image).trim()) ||
      u.image_url ||
      raw?.image_url ||
      null;
    return {id, name, avatar};
  };

  const openLikesModal = async postId => {
    if (!token) return;
    setLikesModalVisible(true);
    setLikesModalPostId(postId);
    setLikesModalUsers([]);
    setLikesModalLoading(true);
    try {
      const formdata = new FormData();
      formdata.append('post_id', String(postId));
      const res = await fetch(BASE_URL + API_TIMELINE_POST_GET_LIKE_USERS, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formdata,
      });
      const data = await res.json().catch(() => ({}));
      const raw =
        Array.isArray(data?.data) ? data.data
          : Array.isArray(data?.data?.data) ? data.data.data
          : [];
      if (data?.status === 'RC200' && Array.isArray(raw)) {
        setLikesModalUsers(raw.map(mapLikeUserFromApi));
      } else {
        setLikesModalUsers([]);
      }
    } catch (e) {
      console.error('Get post like users error:', e);
      setLikesModalUsers([]);
    } finally {
      setLikesModalLoading(false);
    }
  };

  const openAuraModal = async postId => {
    if (!token) return;
    setAuraModalVisible(true);
    setAuraModalPostId(postId);
    setAuraModalUsers([]);
    setAuraModalLoading(true);
    try {
      const formdata = new FormData();
      formdata.append('post_id', String(postId));
      const res = await fetch(BASE_URL + API_TIMELINE_POST_GET_AURA_USERS, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formdata,
      });
      const data = await res.json().catch(() => ({}));
      const raw =
        Array.isArray(data?.data) ? data.data
          : Array.isArray(data?.data?.data) ? data.data.data
          : [];
      if (data?.status === 'RC200' && Array.isArray(raw)) {
        setAuraModalUsers(raw.map(mapLikeUserFromApi));
      } else {
        setAuraModalUsers([]);
      }
    } catch (e) {
      console.error('Get post aura users error:', e);
      setAuraModalUsers([]);
    } finally {
      setAuraModalLoading(false);
    }
  };

  const handleSubmitComment = async (postId, commentText, parentId) => {
    const text = (commentText || '').trim();
    if (!text || !token || commentingPostId != null) return;
    setCommentingPostId(postId);
    try {
      const formdata = new FormData();
      formdata.append('post_id', String(postId));
      formdata.append('comment', text);
      formdata.append(
        'parent_id',
        parentId != null ? String(parentId) : 'null',
      );
      const res = await fetch(BASE_URL + API_TIMELINE_POST_COMMENT, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formdata,
      });
      const data = await res.json().catch(() => ({}));
      if (data?.status === 'RC200') {
        const newComment = {
          id: data?.data?.id ?? Date.now(),
          parentId: parentId ?? null,
          userName: currentUserName,
          userAvatar: null,
          text,
          timeAgo: 'Just now',
          likes: 0,
          isLiked: false,
        };
        setComments(prev => {
          const list = prev[postId] || [];
          return {...prev, [postId]: [...list, newComment]};
        });
        setPosts(prev =>
          prev.map(p =>
            p.id === postId ? {...p, comments: (p.comments ?? 0) + 1} : p,
          ),
        );
        setCommentTexts(prev => ({...prev, [postId]: ''}));
        setReplyingTo(prev => ({...prev, [postId]: undefined}));
      } else if (data?.message) {
        showToast(data.message);
      } else {
        showToast('Could not post comment');
      }
    } catch (e) {
      console.error('Comment error:', e);
      showToast('Could not post comment');
    } finally {
      setCommentingPostId(null);
    }
  };

  const handleCommentLike = async (postId, commentId, currentlyLiked) => {
    if (!token || commentLikingKey != null) return;
    const status = currentlyLiked ? 0 : 1;
    const key = `${postId}_${commentId}`;
    setCommentLikingKey(key);
    try {
      const formdata = new FormData();
      formdata.append('post_id', String(postId));
      formdata.append('comment_id', String(commentId));
      formdata.append('status', String(status));
      const res = await fetch(BASE_URL + API_TIMELINE_POST_COMMENT_LIKE, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formdata,
      });
      const data = await res.json().catch(() => ({}));
      if (data?.status === 'RC200') {
        setComments(prev => {
          const list = prev[postId] || [];
          return {
            ...prev,
            [postId]: list.map(c => {
              if (c.id !== commentId) return c;
              const nextLiked = !currentlyLiked;
              const delta = nextLiked ? 1 : -1;
              return {
                ...c,
                isLiked: nextLiked,
                likes: Math.max(0, (c.likes ?? 0) + delta),
              };
            }),
          };
        });
      } else if (data?.message) {
        showToast(data.message);
      }
    } catch (e) {
      console.error('Comment like error:', e);
      showToast('Could not update like');
    } finally {
      setCommentLikingKey(null);
    }
  };

  const mapCommentFromApi = (raw, overrides = {}) => {
    const parentId =
      raw.parent_id ??
      raw.parentId ??
      raw.parent_comment_id ??
      raw.reply_to_id ??
      overrides.parentId;
    const id = raw.id ?? raw.comment_id ?? overrides.id;
    const resolvedParent =
      parentId != null && parentId !== '' ? parentId : null;
    return {
      id,
      parentId: resolvedParent,
      userName:
        raw.user_name ??
        raw.userName ??
        raw.user?.full_name ??
        raw.user?.username ??
        'User',
      userAvatar:
        raw.user_avatar ??
        raw.userAvatar ??
        raw.user?.image_url ??
        raw.user?.profile_image ??
        null,
      text: raw.comment ?? raw.text ?? raw.content ?? '',
      timeAgo:
        raw.formated_created_at ??
        raw.created_comment ??
        raw.created_post ??
        raw.time_ago ??
        raw.created_at ??
        raw.createdAt ??
       
        '',
      likes: raw.likes ?? raw.likes_count ?? 0,
      isLiked: !!(raw.is_liked ?? raw.isLiked ?? raw.is_comment_liked),
    };
  };

  const flattenCommentList = apiList => {
    if (!Array.isArray(apiList)) return [];
    const flat = [];
    for (const item of apiList) {
      const parentId = item.id ?? item.comment_id;
      const replyList = Array.isArray(item.sub_comments)
        ? item.sub_comments
        : Array.isArray(item.replies)
          ? item.replies
          : Array.isArray(item.children)
            ? item.children
            : Array.isArray(item.reply)
              ? item.reply
              : [];
      flat.push(mapCommentFromApi(item));
      for (const r of replyList) {
        flat.push(mapCommentFromApi(r, {parentId}));
      }
    }
    return flat;
  };

  const sameId = (a, b) => {
    if (a == null || a === '' || b == null || b === '') return a === b;
    return String(a) === String(b);
  };
  const isTopLevel = c =>
    c.parentId == null || c.parentId === '';

  const fetchComments = async postId => {
    if (!token) return;
    setCommentsLoadingPostId(postId);
    try {
      const formdata = new FormData();
      formdata.append('post_id', String(postId));
      const res = await fetch(BASE_URL + API_TIMELINE_POST_GET_COMMENTS, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formdata,
      });
      const data = await res.json().catch(() => ({}));
      setCommentsLoadingPostId(null);
      if (data?.status === 'RC200') {
        const raw =
          Array.isArray(data?.data) ? data.data
            : Array.isArray(data?.data?.data) ? data.data.data
            : [];
        const list = flattenCommentList(raw);
        setComments(prev => ({
          ...prev,
          [postId]: list,
        }));
      } else {
        setComments(prev => ({...prev, [postId]: []}));
      }
    } catch (e) {
      console.error('Fetch comments error:', e);
      setCommentsLoadingPostId(null);
      setComments(prev => ({...prev, [postId]: []}));
    }
  };

  const handleOpenComments = postId => {
    if (openCommentsId === postId) {
      setOpenCommentsId(null);
      return;
    }
    setOpenCommentsId(postId);
    fetchComments(postId);
  };

  const formatTimeAgo = timeAgo => {
    return timeAgo;
  };

  const renderPostItem = ({item}) => {
    const hasImages = item.images && item.images.length > 0;
    const imageCount = hasImages ? item.images.length : 0;
    const showGrid = imageCount > 1;

    return (
      <View style={styles.postCard}>
        <View style={styles.userSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            activeOpacity={0.7}
            onPress={() => {
              if (item.userId != null) {
                navigation.navigate('ExpertDetail', {ID: item.userId});
              }
            }}>
            {item.userAvatar ? (
              <FastImage
                source={{uri: item.userAvatar}}
                style={styles.avatar}
                resizeMode={FastImage.resizeMode.cover}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {item.userName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{item.userName}</Text>
            </View>
            <Text style={styles.userAction}>{item.action}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(item.timeAgo)}</Text>
          </View>
          <OptionsMenu
            customButton={
              <View style={styles.menuButton}>
                <Icon name="more-horizontal" size={20} color={COLORS.black} />
              </View>
            }
            options={['Delete', 'Edit','']}
            actions={[
              () => handleDeletePost(item.id),
              () => {
                navigation.navigate('AddQuestion', {
                  editPost: true,
                  postId: item.id,
                  content: item.content,
                  images: Array.isArray(item.images) ? item.images : [],
                });
              },
              () => {  navigation.navigate('AddQuestion', {
                editPost: true,
                postId: item.id,
                content: item.content,
                images: Array.isArray(item.images) ? item.images : [],
              });},
              () => {},
            ]}
            destructiveIndex={0}
          />
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.postContent}>{item.content}</Text>

          {item.hashtags && item.hashtags.length > 0 && (
            <View style={styles.hashtagContainer}>
              <Text style={styles.hashtags}>
                {item.hashtags.join(' ')}
              </Text>
            </View>
          )}

          {hasImages && (
            <View style={styles.imageContainer}>
              {imageCount === 1 ? (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => openImageModal(item.images, 0)}>
                  <FastImage
                    source={{uri: item.images[0]}}
                    style={styles.singleImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                </TouchableOpacity>
              ) : imageCount <= 3 ? (
                <View style={styles.imageRow}>
                  {item.images.slice(0, 3).map((img, index) => (
                    <TouchableOpacity
                      key={index}
                      activeOpacity={1}
                      style={[
                        styles.gridImage,
                        index === 2 && imageCount === 3 && styles.lastImage,
                      ]}
                      onPress={() => openImageModal(item.images, index)}>
                      <FastImage
                        source={{uri: img}}
                        style={StyleSheet.absoluteFill}
                        resizeMode={FastImage.resizeMode.cover}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.imageGrid}>
                  <View style={styles.imageRow}>
                    {item.images.slice(0, 3).map((img, index) => (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={1}
                        style={styles.gridImage}
                        onPress={() => openImageModal(item.images, index)}>
                        <FastImage
                          source={{uri: img}}
                          style={StyleSheet.absoluteFill}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={styles.imageRow}>
                    {item.images.slice(3, 5).map((img, index) => (
                      <TouchableOpacity
                        key={index + 3}
                        activeOpacity={1}
                        style={[
                          styles.gridImage,
                          index === 1 && styles.lastImage,
                        ]}
                        onPress={() =>
                          openImageModal(item.images, index + 3)
                        }>
                        <FastImage
                          source={{uri: img}}
                          style={StyleSheet.absoluteFill}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {item.likedBy && item.likedBy.length > 0 && (
            <View style={styles.likedBySection}>
              <View style={styles.likedByAvatars}>
                {item.likedBy.slice(0, 4).map((user, index) => (
                  <View
                    key={index}
                    style={[
                      styles.likedByAvatar,
                      {marginLeft: index > 0 ? -8 : 0},
                    ]}>
                    <View style={styles.likedByAvatarPlaceholder}>
                      <Text style={styles.likedByAvatarText}>
                        {user.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.likedByText}>
                {item.likedBy[0]} And {item.likedByCount} Others Liked This
              </Text>
            </View>
          )}
        </View>

        <View style={styles.engagementSection}>
          <View style={styles.engagementItem}>
            <TouchableOpacity
              style={styles.engagementLikeIconBtn}
              onPress={() => handleLike(item.id, item.isLiked)}
              disabled={likingPostId === item.id}>
              <Icon
                name="thumbs-up"
                size={16}
                color={item.isLiked ? COLORS.primary : COLORS.black2}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.engagementLikesTextBtn}
              onPress={() => openLikesModal(item.id)}
              disabled={likesModalLoading || (item.likes ?? 0) === 0}>
              <Text style={styles.engagementText}>{item.likes} Likes</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.engagementItem}
            onPress={() => handleOpenComments(item.id)}>
            <Icon name="message-circle" size={16} color={COLORS.black2} />
            <Text style={styles.engagementText}>
              {item.comments} Comments
            </Text>
          </TouchableOpacity>
          <View style={styles.engagementItem}>
            <TouchableOpacity
              style={styles.engagementLikeIconBtn}
              onPress={() => handleAura(item.id, item.isAuraGiven)}
              disabled={auraPostId === item.id}>
              <Image
                source={require('../../../assets/images/image.png')}
                style={styles.auraIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.engagementLikesTextBtn}
              onPress={() => openAuraModal(item.id)}
              disabled={auraModalLoading || (item.aura ?? 0) === 0}>
              <Text
                style={[
                  styles.engagementText,
                  styles.auraText,
                  item.isAuraGiven && {color: COLORS.primary},
                ]}>
                {item.aura} Aura
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comment Input Section - Conditionally Rendered */}
        {openCommentsId === item.id && (
          <View style={styles.commentSection}>
            {/* Comments List - Show above input */}
            {commentsLoadingPostId === item.id ? (
              <View style={styles.commentsLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.commentsLoadingText}>Loading comments…</Text>
              </View>
            ) : comments[item.id] && comments[item.id].length > 0 ? (
              <View style={styles.commentsList}>
                {(() => {
                  const list = comments[item.id] || [];
                  const topLevel = list.filter(isTopLevel);
                  const getReplies = pid =>
                    list.filter(c => sameId(c.parentId, pid));
                  return topLevel.map(comment => (
                    <View key={comment.id}>
                      <View style={styles.commentItem}>
                        <View style={styles.commentItemAvatar}>
                          <Text style={styles.commentItemAvatarText}>
                            {(comment.userName || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.commentItemContent}>
                          <View style={styles.commentItemHeader}>
                            <Text style={styles.commentItemUserName}>
                              {comment.userName}
                            </Text>
                            <Text style={styles.commentItemTime}>
                              {comment.timeAgo}
                            </Text>
                            <TouchableOpacity
                              style={styles.commentDeleteBtn}
                              onPress={() => handleDeleteComment(item.id, comment.id)}
                              disabled={
                                deletingCommentKey === `${item.id}_${comment.id}`
                              }>
                              <Icon
                                name="trash-2"
                                size={14}
                                color={COLORS.gray}
                              />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.commentItemText}>{comment.text}</Text>
                          <View style={styles.commentEngagement}>
                            <TouchableOpacity
                              style={styles.commentEngagementItem}
                              onPress={() =>
                                handleCommentLike(
                                  item.id,
                                  comment.id,
                                  comment.isLiked,
                                )
                              }
                              disabled={
                                commentLikingKey ===
                                `${item.id}_${comment.id}`
                              }>
                              <Icon
                                name="thumbs-up"
                                size={14}
                                color={
                                  comment.isLiked
                                    ? COLORS.primary
                                    : COLORS.gray
                                }
                              />
                              <Text
                                style={[
                                  styles.commentEngagementText,
                                  comment.isLiked && {
                                    color: COLORS.primary,
                                    fontWeight: '600',
                                  },
                                ]}>
                                {(comment.likes ?? 0) > 0
                                  ? `${comment.likes} Like${comment.likes === 1 ? '' : 's'}`
                                  : 'Likes'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.commentEngagementItem}
                              onPress={() =>
                                setReplyingTo(prev => ({
                                  ...prev,
                                  [item.id]: comment.id,
                                }))
                              }>
                              <Text style={styles.commentEngagementReply}>Reply</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      {getReplies(comment.id).map(reply => (
                        <View
                          key={reply.id}
                          style={[styles.commentItem, styles.commentItemReply]}>
                          <View style={styles.commentReplyLead}>
                            <View style={styles.commentItemAvatar}>
                              <Text style={styles.commentItemAvatarText}>
                                {(reply.userName || 'U').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.commentItemContent}>
                            <View style={styles.commentItemHeader}>
                              <Text style={styles.commentItemUserName}>
                                {reply.userName}
                              </Text>
                              <Text style={styles.commentItemTime}>
                                {reply.timeAgo}
                              </Text>
                              <TouchableOpacity
                                style={styles.commentDeleteBtn}
                                onPress={() => handleDeleteComment(item.id, reply.id)}
                                disabled={
                                  deletingCommentKey === `${item.id}_${reply.id}`
                                }>
                                <Icon
                                  name="trash-2"
                                  size={14}
                                  color={COLORS.gray}
                                />
                              </TouchableOpacity>
                            </View>
                            <Text style={styles.commentItemText}>{reply.text}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ));
                })()}
              </View>
            ) : null}

            {/* Replying to indicator */}
            {replyingTo[item.id] != null && (
              <View style={styles.replyingToRow}>
                <Text style={styles.replyingToText}>
                  Replying to{' '}
                  {(comments[item.id] || []).find(
                    c => c.id === replyingTo[item.id],
                  )?.userName ?? 'comment'}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setReplyingTo(prev => ({...prev, [item.id]: undefined}))
                  }>
                  <Text style={styles.replyingToCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Comment Input Section */}
            <View style={styles.commentInputContainer}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>
                  {currentUserName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder={
                  replyingTo[item.id] != null
                    ? 'Write a reply...'
                    : 'Write a Comment...'
                }
                placeholderTextColor={COLORS.gray}
                value={commentTexts[item.id] || ''}
                onChangeText={text => {
                  setCommentTexts(prev => ({...prev, [item.id]: text}));
                }}
                multiline
              />
              <TouchableOpacity
                style={styles.commentPostButton}
                onPress={() =>
                  handleSubmitComment(
                    item.id,
                    commentTexts[item.id],
                    replyingTo[item.id] ?? null,
                  )
                }
                disabled={commentingPostId === item.id}>
                <Text style={styles.commentPostButtonText}>
                  {commentingPostId === item.id ? '...' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <IosStatusBar backgroundColor={COLORS.primary} />
      <ScreenStatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
      />
      <View style={styles.container}>
          <Header
            menuiconColor={COLORS.white}
            iconColor={COLORS.black}
            navigation={navigation}
            background={COLORS.primary}
            isDasboard={true}
          />

        {loading && posts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={posts.filter(p => p.type === 'post')}
            renderItem={renderPostItem}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to share something!
                </Text>
              </View>
            }
          />
        )}
          <View>
            <BottomTab onHomePress={scrollToTop} />
          </View>
        </View>

      {/* Likes List Modal */}
      <Modal
        visible={likesModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLikesModalVisible(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.likesModalBackdrop}
          onPress={() => setLikesModalVisible(false)}>
          <View style={styles.likesModalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.likesModalHeader}>
              <Text style={styles.likesModalTitle}>Likes</Text>
              <TouchableOpacity
                onPress={() => setLikesModalVisible(false)}
                style={styles.likesModalClose}>
                <Icon name="x" size={22} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            {likesModalLoading ? (
              <View style={styles.likesModalLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.likesModalLoadingText}>Loading…</Text>
              </View>
            ) : (
              <FlatList
                data={likesModalUsers}
                keyExtractor={(u, i) => String(u?.id ?? i)}
                contentContainerStyle={styles.likesModalList}
                ListEmptyComponent={
                  <Text style={styles.likesModalEmpty}>No likes yet</Text>
                }
                renderItem={({item: u}) => (
                  <View style={styles.likesModalRow}>
                    <View style={styles.likesModalAvatar}>
                      {u.avatar ? (
                        <FastImage
                          source={{uri: u.avatar}}
                          style={styles.likesModalAvatarImg}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      ) : (
                        <Text style={styles.likesModalAvatarText}>
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.likesModalName}>{u.name}</Text>
                  </View>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Aura List Modal */}
      <Modal
        visible={auraModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAuraModalVisible(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.likesModalBackdrop}
          onPress={() => setAuraModalVisible(false)}>
          <View style={styles.likesModalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.likesModalHeader}>
              <Text style={styles.likesModalTitle}>Aura</Text>
              <TouchableOpacity
                onPress={() => setAuraModalVisible(false)}
                style={styles.likesModalClose}>
                <Icon name="x" size={22} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            {auraModalLoading ? (
              <View style={styles.likesModalLoading}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.likesModalLoadingText}>Loading…</Text>
              </View>
            ) : (
              <FlatList
                data={auraModalUsers}
                keyExtractor={(u, i) => String(u?.id ?? i)}
                contentContainerStyle={styles.likesModalList}
                ListEmptyComponent={
                  <Text style={styles.likesModalEmpty}>No aura yet</Text>
                }
                renderItem={({item: u}) => (
                  <View style={styles.likesModalRow}>
                    <View style={styles.likesModalAvatar}>
                      {u.avatar ? (
                        <FastImage
                          source={{uri: u.avatar}}
                          style={styles.likesModalAvatarImg}
                          resizeMode={FastImage.resizeMode.cover}
                        />
                      ) : (
                        <Text style={styles.likesModalAvatarText}>
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.likesModalName}>{u.name}</Text>
                  </View>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.imageModalBackdrop}
          onPress={() => setImageModalVisible(false)}>
          <View style={styles.imageModalContent} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.imageModalClose}
              onPress={() => setImageModalVisible(false)}>
              <Icon name="x" size={28} color={COLORS.white} />
            </TouchableOpacity>
            {imageModalImages[imageModalIndex] != null && (
              <FastImage
                source={{uri: imageModalImages[imageModalIndex]}}
                style={styles.imageModalImage}
                resizeMode={FastImage.resizeMode.contain}
              />
            )}
            {imageModalImages.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.imageModalNav, styles.imageModalNavLeft]}
                  onPress={() => {
                    setImageModalIndex(prev =>
                      prev <= 0 ? imageModalImages.length - 1 : prev - 1,
                    );
                  }}>
                  <Icon name="chevron-left" size={32} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.imageModalNav, styles.imageModalNavRight]}
                  onPress={() => {
                    setImageModalIndex(prev =>
                      prev >= imageModalImages.length - 1 ? 0 : prev + 1,
                    );
                  }}>
                  <Icon name="chevron-right" size={32} color={COLORS.white} />
                </TouchableOpacity>
                <View style={styles.imageModalCounter}>
                  <Text style={styles.imageModalCounterText}>
                    {imageModalIndex + 1} / {imageModalImages.length}
                  </Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  pageTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingHorizontal: 16,
  },
  pageTab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  pageTabText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  pageTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  pageTabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  userSection: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 2,
  },
  userAction: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.gray,
  },
  contentSection: {
    marginBottom: 12,
  },
  postContent: {
    fontSize: 14,
    color: COLORS.black,
    lineHeight: 20,
    marginBottom: 8,
  },
  questionContent: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
    lineHeight: 24,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedIcon: {
    marginLeft: 2,
  },
  menuButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  questionAnswerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  questionAnswerText: {
    fontSize: 14,
    color: COLORS.black2,
    fontWeight: '500',
  },
  answerList: {
    marginTop: 12,
    gap: 12,
  },
  answerBox: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white3 || COLORS.lightGray,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  answerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.grayed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerAvatarText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  answerMeta: {
    flex: 1,
  },
  answerUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
  },
  answerTime: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 1,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.black2,
    lineHeight: 20,
  },
  answerPaidPreview: {
    fontSize: 14,
    color: COLORS.black2,
    lineHeight: 20,
    marginBottom: 10,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  premiumBadgeText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  premiumCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    padding: 12,
  },
  premiumPreviewText: {
    fontSize: 14,
    color: COLORS.black2,
    lineHeight: 20,
    marginBottom: 10,
  },
  premiumBlurBlock: {
    borderRadius: 12,
    backgroundColor: COLORS.white3 || '#F2F2F2',
    paddingVertical: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  premiumBlurLine: {
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.10)',
    marginBottom: 10,
  },
  premiumUnlockBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumUnlockText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  answerPaidLockedBox: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white3 || '#F5F5F5',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    minHeight: 86,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  answerPaidLockedText: {
    width: '100%',
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(0,0,0,0.18)',
    textShadowColor: 'rgba(0,0,0,0.10)',
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 10,
    textAlign: 'left',
  },
  answerPaidLockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.78)',
  },
  payToUnlockBtn: {
    position: 'absolute',
    alignSelf: 'center',
    minWidth: 170,
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payToUnlockText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  modalTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  modalTabText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  modalTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  modalTabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  modalContentContainer: {
    minHeight: 280,
    marginBottom: 20,
  },
  paidAnswerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  modalTextArea: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    minHeight: 120,
    flex: 1,
    textAlignVertical: 'top',
  },
  modalTextAreaSpacing: {
    marginBottom: 16,
  },
  freeTextArea: {
    height: 280,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  hashtagContainer: {
    marginTop: 8,
  },
  hashtags: {
    fontSize: 14,
    color: COLORS.primary,
  },
  imageContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  singleImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  imageGrid: {
    gap: 4,
  },
  imageRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  gridImage: {
    flex: 1,
    height: 150,
    borderRadius: 4,
  },
  lastImage: {
    opacity: 0.7,
  },
  likedBySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  likedByAvatars: {
    flexDirection: 'row',
    marginRight: 12,
  },
  likedByAvatar: {
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 20,
  },
  likedByAvatarPlaceholder: {
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likedByAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
  },
  likedByText: {
    fontSize: 14,
    color: COLORS.black2,
    fontWeight: '500',
    flex: 1,
  },
  engagementSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementLikeIconBtn: {
    paddingVertical: 4,
    paddingRight: 6,
  },
  engagementLikesTextBtn: {
    paddingVertical: 4,
  },
  engagementText: {
    fontSize: 14,
    color: COLORS.black2,
    fontWeight: '500',
  },
  likesModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  likesModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
  },
  likesModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  likesModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
  likesModalClose: {
    padding: 6,
  },
  likesModalLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  likesModalLoadingText: {
    color: COLORS.gray,
    fontSize: 14,
  },
  likesModalList: {
    paddingBottom: 8,
  },
  likesModalEmpty: {
    textAlign: 'center',
    color: COLORS.gray,
    paddingVertical: 16,
  },
  likesModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    gap: 10,
  },
  likesModalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.grayed,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  likesModalAvatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  likesModalAvatarText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  likesModalName: {
    flex: 1,
    color: COLORS.black2,
    fontSize: 14,
    fontWeight: '600',
  },
  auraText: {
    color: COLORS.black2,
  },
  auraIcon: {
    width: 16,
    height: 16,
  },
  commentSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  commentsList: {
    marginBottom: 16,
    gap: 16,
  },
  commentsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
    marginBottom: 8,
  },
  commentsLoadingText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 12,
  },
  commentItemReply: {
    marginLeft: 28,
    marginTop: 8,
  },
  commentReplyLead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  replyingToRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  replyingToText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  replyingToCancel: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  commentItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentItemAvatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentItemContent: {
    flex: 1,
  },
  commentItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 2,
  },
  commentItemUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  commentItemTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  commentDeleteBtn: {
    marginLeft: 'auto',
    paddingLeft: 10,
    paddingVertical: 4,
  },
  commentItemText: {
    fontSize: 14,
    color: COLORS.black2,
    lineHeight: 20,
    marginTop: 2,
  },
  commentEngagement: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  commentEngagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentEngagementText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  commentEngagementReply: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayed,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.black,
    backgroundColor: COLORS.white,
    maxHeight: 100,
  },
  commentPostButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  commentPostButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
  },
  loadMoreFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadMoreText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 48,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  imageModalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.75,
  },
  imageModalNav: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    padding: 12,
    zIndex: 10,
  },
  imageModalNavLeft: {
    left: 8,
  },
  imageModalNavRight: {
    right: 8,
  },
  imageModalCounter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  imageModalCounterText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 110, // keep above BottomTab
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default ShowPost;

import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Dimensions,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconFa from 'react-native-vector-icons/FontAwesome5';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import FastImage from 'react-native-fast-image';
import BottomTab from '../../../component/BottomTab';
import {Header} from '../../../component/Header';
import {ScreenStatusBar} from '../../../util/ScreenStatusBar';
import IosStatusBar from '../../../component/IosStatusBar';
import {COLORS} from '../../../util/Theme';
import Api from '../../../service/Api';
import {
  API_GET_PROFILE,
  API_GET_GUIDANCE_ANSWERS,
  API_GET_GUIDANCE_MY_QUESTIONS,
  API_GET_GUIDANCE_MY_ANSWER_QUESTION,
  API_TIMELINE_POST_GET_MY_POSTS,
  API_TIMELINE_POST_LIKE,
  API_TIMELINE_POST_AURA,
  API_TIMELINE_POST_DELETE,
  API_TIMELINE_POST_DELETE_COMMENT,
  API_TIMELINE_POST_COMMENT,
  API_TIMELINE_POST_COMMENT_LIKE,
  API_TIMELINE_POST_GET_COMMENTS,
  API_TIMELINE_POST_GET_LIKE_USERS,
  API_TIMELINE_POST_GET_AURA_USERS,
  API_STRIPE_ANSWER_PAYMENT,
  API_GET_STRIPE_PUB_KEY,
  API_POKE_USER,
  API_SCHEDULE_MY_TIMELINE,
  BASE_URL,
  WEB_URL,
} from '../../../service/apiEndPoint';
import {log, showToast} from '../../../util/Toast';
import OptionsMenu from 'react-native-option-menu';
import {
  initPaymentSheet,
  presentPaymentSheet,
  StripeProvider,
} from '@stripe/stripe-react-native';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const QUESTIONS_PAGE_SIZE = 50;

const MyTimeline = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('my_post'); // 'my_post' | 'my_questions' | 'my_answers'
  const [userId, setUserId] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [myQuestions, setMyQuestions] = useState([]);
  const [myAnswers, setMyAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const token = useSelector(s => s.AuthSlice?.token);
  const currentUserName = useSelector(s => s.AuthSlice.name) || 'User';
  const [openCommentsId, setOpenCommentsId] = useState(null);
  const [commentTexts, setCommentTexts] = useState({});
  const [comments, setComments] = useState({});
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
  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerSubmitting, setAnswerSubmitting] = useState(false);
  const [answerTab, setAnswerTab] = useState('free');
  const [answerText, setAnswerText] = useState('');
  const [paidAnswerOverview, setPaidAnswerOverview] = useState('');
  const [paidAnswerText, setPaidAnswerText] = useState('');
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [unlockingKey, setUnlockingKey] = useState(null);
  const [unlockedPaidAnswerKeys, setUnlockedPaidAnswerKeys] = useState({});
  const [answersExpandedByQuestion, setAnswersExpandedByQuestion] = useState({});
  const [paidAnswerRate, setPaidAnswerRate] = useState(null);

  const isAnswersExpanded = (questionId) =>
    answersExpandedByQuestion[questionId] === true;

  const toggleAnswersExpanded = (questionId) => {
    setAnswersExpandedByQuestion((prev) => ({
      ...prev,
      [questionId]: !(prev[questionId] === true),
    }));
  };

  const fetchProfile = async () => {
    try {
      const res = await Api.get(API_GET_PROFILE);
      if (res?.status === 'RC200' && res?.data?.id != null) {
        setUserId(Number(res.data.id));
        return Number(res.data.id);
      }
    } catch (e) {
      log('Failed to load profile');
    }
    return null;
  };

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageModalImages, setImageModalImages] = useState([]);
  const [imageModalIndex, setImageModalIndex] = useState(0);

  const getAttachmentUrl = (a) => {
    if (typeof a === 'string') return a;
    if (!a || typeof a !== 'object') return null;
    const keys = ['url', 'uri', 'path', 'image_url', 'attachment_url', 'file_url', 'link', 'src'];
    let v = null;
    for (const k of keys) {
      v = a[k];
      if (v && typeof v === 'string') break;
    }
    if (!v || typeof v !== 'string') return null;
    if (v.startsWith('http')) return v;
    const base = (WEB_URL || '').replace(/\/$/, '');
    return v.startsWith('/') ? `${base}${v}` : `${base}/${v}`;
  };

  const getAvatarUrl = (u, rawFallback = null) => {
    const r = rawFallback ?? {};
    const keys = ['image_url', 'profile_image', 'image', 'profile_picture', 'avatar', 'profile_pic', 'user_image'];
    let v = null;
    for (const k of keys) {
      v = u?.[k] ?? r?.[k];
      if (v != null && typeof v === 'string' && v.trim()) break;
    }
    if (!v || typeof v !== 'string' || !v.trim()) return null;
    v = v.trim();
    if (v.startsWith('http://') || v.startsWith('https://')) return v;
    const base = (WEB_URL || '').replace(/\/$/, '');
    return v.startsWith('/') ? `${base}${v}` : `${base}/${v}`;
  };

  const fetchMyPosts = async () => {
    try {
      const res = await Api.get(API_TIMELINE_POST_GET_MY_POSTS);
      const list = res?.data?.data;
      if (res?.status === 'RC200' && Array.isArray(list)) {
        setMyPosts(list.map(normalizePost));
      } else {
        setMyPosts([]);
      }
    } catch (e) {
      setMyPosts([]);
    }
  };

  const normalizePost = (raw) => {
    const arr = x => (Array.isArray(x) ? x : []);
    const u = raw.userdata || raw.user || {};
    const attachments = arr(raw.attachments || raw.images);
    const images = attachments.map(getAttachmentUrl).filter(Boolean);
    const likesData = arr(raw.likesData);
    const likedBy = likesData.map(
      x => x.full_name ?? x.fullname ?? x.name ?? x.username ?? 'User',
    );
    return {
      id: raw.id ?? raw.post_id,
      userId: raw.user_id ?? u.user_id ?? u.id,
      userName: (u.full_name ?? u.fullname ?? u.name ?? u.username ?? raw.user_name) || 'User',
      userAvatar: getAvatarUrl(u, raw) || null,
      action: raw.action ?? (raw.type === 'question' ? 'Asked a question' : 'Added a post'),
      timeAgo: raw.created_post ?? raw.time_ago ?? raw.created_at ?? '',
      content: raw.content ?? raw.description ?? raw.text ?? '',
      hashtags: arr(raw.hashtags).map(h => (typeof h === 'string' ? h : h?.tag ?? '')),
      images,
      likes: raw.likes ?? raw.likes_count ?? 0,
      comments: raw.comments ?? raw.comments_count ?? 0,
      aura: raw.aura ?? 0,
      likedBy,
      likedByCount: raw.liked_by_count ?? raw.likedByCount ?? likedBy.length,
      type: raw.type === 'question' ? 'question' : 'post',
      isLiked: !!(raw.is_post_liked ?? raw.isLiked),
      isAuraGiven: !!(raw.is_post_aura ?? raw.isAuraGiven),
    };
  };

  const openImageModal = (images, index = 0) => {
    const list = Array.isArray(images) ? images : [];
    if (list.length === 0) return;
    setImageModalImages(list);
    setImageModalIndex(Math.max(0, Math.min(index, list.length - 1)));
    setImageModalVisible(true);
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
        setMyPosts(prev =>
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
        setMyPosts(prev =>
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
      showToast('Could not update aura');
    } finally {
      setAuraPostId(null);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!token || deletingPostId != null) return;
    setDeletingPostId(postId);
    try {
      const formdata = new FormData();
      formdata.append('post_id', String(postId));
      const res = await fetch(BASE_URL + API_TIMELINE_POST_DELETE, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formdata,
      });
      const data = await res.json().catch(() => ({}));
      if (data?.status === 'RC200') {
        setMyPosts(prev => prev.filter(p => p.id !== postId));
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
        showToast('Could not delete post');
      }
    } catch (e) {
      showToast('Could not delete post');
    } finally {
      setDeletingPostId(null);
    }
  };

  const mapLikeUserFromApi = (raw) => {
    const u = raw?.user ?? raw?.userdata ?? raw ?? {};
    const id = u.user_id ?? u.id ?? raw?.user_id ?? raw?.id ?? null;
    const name = u.full_name ?? u.fullname ?? u.name ?? u.username ?? raw?.full_name ?? raw?.name ?? raw?.username ?? 'User';
    const avatar = getAvatarUrl(u, raw) || null;
    return {id, name, avatar};
  };

  const openLikesModal = async (postId) => {
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
      const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.data) ? data.data.data : [];
      if (data?.status === 'RC200' && Array.isArray(raw)) {
        setLikesModalUsers(raw.map(mapLikeUserFromApi));
      } else {
        setLikesModalUsers([]);
      }
    } catch (e) {
      setLikesModalUsers([]);
    } finally {
      setLikesModalLoading(false);
    }
  };

  const openAuraModal = async (postId) => {
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
      const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.data) ? data.data.data : [];
      if (data?.status === 'RC200' && Array.isArray(raw)) {
        setAuraModalUsers(raw.map(mapLikeUserFromApi));
      } else {
        setAuraModalUsers([]);
      }
    } catch (e) {
      setAuraModalUsers([]);
    } finally {
      setAuraModalLoading(false);
    }
  };

  const getPublishableKey = async () => {
    try {
      const response = await Api.get(`${API_GET_STRIPE_PUB_KEY}`);
      if (response.status === 'RC200') {
        setStripePublishableKey(response.data);
      }
    } catch (e) {
      console.error('Stripe publishable key error:', e);
    }
  };

  const mapAnswersFromRaw = (rawAnswers) => {
    const arr = x => (Array.isArray(x) ? x : []);
    const isPaidAnswer = a =>
      a.is_paid === 1 ||
      a.is_paid === true ||
      (a.answer_type && String(a.answer_type).toLowerCase() === 'paid') ||
      (a.type && String(a.type).toLowerCase() === 'paid');
    return arr(rawAnswers).map(a => {
      const au = a.user ?? {};
      const answerUserId =
        a.answer_user_id ??
        a.answerUserId ??
        a.user_id ??
        au.user_id ??
        au.id ??
        null;
      const isGuidanceUserPayRaw = a.is_guidance_user_pay ?? a.isGuidanceUserPay ?? null;
      const isGuidanceUserPay =
        isGuidanceUserPayRaw === 1 ||
        isGuidanceUserPayRaw === true ||
        String(isGuidanceUserPayRaw) === '1';
      const isUnlocked =
        isGuidanceUserPay ||
        a.is_unlocked === 1 ||
        a.is_unlocked === true ||
        a.is_paid_unlocked === 1 ||
        a.is_paid_unlocked === true ||
        a.isUnlocked === true ||
        a.isPaidUnlocked === true;
      const paidContentPreview =
        a.paid_content_preview ?? a.paidContentPreview ?? a.preview ?? a.paid_preview ?? '';
      const paidContent =
        a.paid_content ?? a.paidContent ?? a.paid_answer ?? a.paidText ?? '';
      const priceRaw =
        au.per_answer_price ??
        a.per_answer_price ??
        a.price ??
        a.amount ??
        a.paid_amount ??
        a.unlock_amount ??
        a.unlock_price ??
        a.paid_price ??
        a.answer_price ??
        a.paidAnswerPrice ??
        null;
      const price = Number(priceRaw);
      const fallbackText = paidContent || paidContentPreview || '';
      const answerId = a.answer_id ?? a.answerId ?? a.id ?? null;
      return {
        text: (a.answer ?? a.text) ?? fallbackText,
        paidContentPreview: paidContentPreview || '',
        paidContent: paidContent || '',
        price: Number.isFinite(price) ? price : 49,
        timeAgo:
          (a.formated_created_at ?? a.answer_created_at ?? a.created_at) || a.time_ago || '',
        userName: au.full_name ?? au.fullname ?? au.name ?? au.username ?? 'User',
        userAvatar: getAvatarUrl(au, a) || null,
        isPaid: isPaidAnswer(a),
        answerUserId,
        answerId,
        isUnlocked,
        isGuidanceUserPay,
      };
    });
  };

  const fetchGuidanceAnswers = async (guidanceId, answerUserIdJustUnlocked = null) => {
    try {
      const res = await Api.get(`${API_GET_GUIDANCE_ANSWERS}/${String(guidanceId)}`, {
        skipSuccessToast: true,
      });
      if (res?.status !== 'RC200') {
        showToast('Could not load unlocked answer. Pull to refresh.');
        return;
      }
      let rawAnswers = [];
      const payload = res?.data ?? res;
      if (Array.isArray(payload)) {
        rawAnswers = payload;
      } else if (Array.isArray(payload?.answers)) {
        rawAnswers = payload.answers;
      } else if (Array.isArray(payload?.data)) {
        rawAnswers = payload.data;
      } else if (Array.isArray(res?.answers)) {
        rawAnswers = res.answers;
      } else if (Array.isArray(res?.data?.answers)) {
        rawAnswers = res.data.answers;
      }
      let mappedAnswers = mapAnswersFromRaw(rawAnswers);
      if (answerUserIdJustUnlocked != null) {
        mappedAnswers = mappedAnswers.map(ans =>
          String(ans.answerUserId) === String(answerUserIdJustUnlocked)
            ? {...ans, isUnlocked: true}
            : ans,
        );
      }
      setMyAnswers(prev =>
        prev.map(q =>
          String(q.id) === String(guidanceId)
            ? {...q, answers: mappedAnswers}
            : q,
        ),
      );
      setMyQuestions(prev =>
        prev.map(q =>
          String(q.id) === String(guidanceId)
            ? {...q, answers: mappedAnswers}
            : q,
        ),
      );
    } catch (e) {
      log('Failed to load answers after payment', e);
      showToast('Could not load unlocked answer. Pull to refresh.');
    }
  };

  const getPublishableKeyForUnlock = async (answerId, guidanceId, answerUserId, amount, key) => {
    setUnlockingKey(key);
    const response = await Api.get(`${API_GET_STRIPE_PUB_KEY}`, {
      skipSuccessToast: true,
    });
    if (response.status === 'RC200') {
      setStripePublishableKey(response.data);
      get_payment_details(answerId, guidanceId, answerUserId, amount, key);
    } else {
      setUnlockingKey(null);
      showToast('Payment is not available right now. Please try again.');
    }
  };

  const get_payment_details = async (answerId, guidanceId, answerUserId, amount, key) => {
    try {
      const response = await Api.get(`${API_STRIPE_ANSWER_PAYMENT}/${guidanceId}/${answerUserId}`, {
        skipSuccessToast: true,
      });
      setUnlockingKey(null);
      if (response.status !== 'RC200' || !response.data) {
        showToast(response?.message || 'Unable to start payment');
        return;
      }
      const data = response.data && typeof response.data === 'object' ? response.data : {};
      const nested = data.data && typeof data.data === 'object' ? data.data : {};
      const topLevel = typeof response === 'object' && response !== null ? response : {};
      const src = {...nested, ...data, ...topLevel};
      const paymentIntentSecret =
        src.pintent_secret ??
        src.paymentIntentClientSecret ??
        src.payment_intent_client_secret ??
        src.paymentIntentSecret ??
        src.client_secret ??
        src.intent_secret ??
        src.secret;
      const ephemeralKey =
        src.ekey_secret ??
        src.ephemeralKeySecret ??
        src.customer_ephemeral_key_secret ??
        src.customer_ephemeral_key ??
        src.ephemeral_key ??
        src.ephemeral_key_secret;
      const customerId =
        src.cid ?? src.customerId ?? src.customer_id ?? src.customer;
      const displayName =
        src.display_name ?? src.merchantDisplayName ?? src.merchant_name ?? 'GuideLinked';
      if (!paymentIntentSecret || !customerId || !ephemeralKey) {
        const missing = [];
        if (!paymentIntentSecret) missing.push('payment intent');
        if (!customerId) missing.push('customer');
        if (!ephemeralKey) missing.push('ephemeral key');
        console.warn('Payment setup missing:', missing.join(', '), response?.data);
        showToast('Payment setup incomplete. Please try again later.');
        return;
      }
      const {error} = await initPaymentSheet({
        merchantDisplayName: displayName,
        customerId,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntentSecret,
        allowsDelayedPaymentMethods: true,
        ...(Platform.OS === 'ios' ? {returnURL: 'guidelinked://stripe-redirect'} : {}),
      });
      if (error) {
        const msg =
          (error?.message && String(error.message).trim()) ||
          'Payment could not be started. Please try again.';
        showToast(msg);
        return;
      }
      const {error: Err} = await presentPaymentSheet();
      if (Err) return;

      setUnlockedPaidAnswerKeys(prev => ({...prev, [key]: true}));
      await new Promise(r => setTimeout(r, 300));
      await fetchGuidanceAnswers(guidanceId, answerUserId);
      showToast('Unlocked successfully');
    } catch (e) {
      setUnlockingKey(null);
      const msg =
        e?.message ?? e?.response?.data?.message ?? 'Payment failed. Please try again.';
      showToast(typeof msg === 'string' ? msg : 'Payment failed. Please try again.');
    }
  };

  const handleUnlockPaidAnswer = ({answerId, guidanceId, answerUserId, amount, key}) => {
    if (!guidanceId || !answerUserId) {
      showToast('Missing unlock details. Please refresh and try again.');
      return;
    }
    if (unlockingKey) return;
    getPublishableKeyForUnlock(answerId, guidanceId, answerUserId, amount, key);
  };

  const handlePokeAnswer = async ({
    questionId,
    toUserId,
    answer,
    isPaid = false,
    paidContentPreview = '',
    paidContent = '',
  }) => {
    const trimmedAnswer = (answer || '').trim();
    if (!token || !trimmedAnswer || answerSubmitting) return;
    setAnswerSubmitting(true);
    try {
      const formdata = new FormData();
      formdata.append('to_user_id', String(toUserId));
      formdata.append('answer', trimmedAnswer);
      formdata.append('question_id', String(questionId));
      formdata.append('is_paid', isPaid ? '1' : '0');
      formdata.append('paid_content_preview', (paidContentPreview || '').toString());
      formdata.append('paid_content', (paidContent || '').toString());
      const res = await fetch(BASE_URL + API_POKE_USER, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formdata,
      });
      const data = await res.json().catch(() => ({}));
      if (data?.status === 'RC200') {
        setAnswerModalVisible(false);
        setSelectedQuestion(null);
        setAnswerText('');
        setPaidAnswerOverview('');
        setPaidAnswerText('');
        setAnswerTab('free');
        showToast(data?.message || 'Answer added');
        if (userId != null) fetchMyAnswers();
      } else if (data?.message) {
        showToast(data.message);
      } else {
        showToast('Could not add answer');
      }
    } catch (e) {
      showToast('Could not add answer');
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const mapCommentFromApi = (raw, overrides = {}) => {
    const parentId = raw.parent_id ?? raw.parentId ?? raw.parent_comment_id ?? raw.reply_to_id ?? overrides.parentId;
    const id = raw.id ?? raw.comment_id ?? overrides.id;
    const resolvedParent = parentId != null && parentId !== '' ? parentId : null;
    return {
      id,
      parentId: resolvedParent,
      userName: raw.user_name ?? raw.userName ?? raw.user?.full_name ?? raw.user?.name ?? raw.user?.username ?? 'User',
      userAvatar: (getAvatarUrl(raw.user ?? raw, raw) || (raw.user_avatar ?? raw.userAvatar ?? null)),
      text: raw.comment ?? raw.text ?? raw.content ?? '',
      timeAgo:raw.formated_created_at ?? raw.created_comment ?? raw.created_post ?? raw.time_ago ?? raw.created_at ?? raw.createdAt ?? '',
      likes: raw.likes ?? raw.likes_count ?? 0,
      isLiked: !!(raw.is_liked ?? raw.isLiked ?? raw.is_comment_liked),
    };
  };

  const flattenCommentList = (apiList) => {
    if (!Array.isArray(apiList)) return [];
    const flat = [];
    for (const item of apiList) {
      const parentId = item.id ?? item.comment_id;
      const replyList = Array.isArray(item.sub_comments) ? item.sub_comments : Array.isArray(item.replies) ? item.replies : Array.isArray(item.children) ? item.children : Array.isArray(item.reply) ? item.reply : [];
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
  const isTopLevel = (c) => c.parentId == null || c.parentId === '';

  const fetchComments = async (postId) => {
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
        const raw = Array.isArray(data?.data) ? data.data : Array.isArray(data?.data?.data) ? data.data.data : [];
        const list = flattenCommentList(raw);
        setComments(prev => ({...prev, [postId]: list}));
      } else {
        setComments(prev => ({...prev, [postId]: []}));
      }
    } catch (e) {
      setCommentsLoadingPostId(null);
      setComments(prev => ({...prev, [postId]: []}));
    }
  };

  const handleOpenComments = (postId) => {
    if (openCommentsId === postId) {
      setOpenCommentsId(null);
      return;
    }
    setOpenCommentsId(postId);
    fetchComments(postId);
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
          list.forEach(c => {
            if (c.parentId != null && String(c.parentId) === String(commentId)) removedIds.add(String(c.id));
          });
          const nextList = list.filter(c => !removedIds.has(String(c.id)));
          return {...prev, [postId]: nextList};
        });
        setMyPosts(prev =>
          prev.map(p => (p.id !== postId ? p : {...p, comments: Math.max(0, (p.comments ?? 0) - 1)})),
        );
        showToast(data?.message || 'Comment deleted');
      } else if (data?.message) {
        showToast(data.message);
      } else {
        showToast('Could not delete comment');
      }
    } catch (e) {
      showToast('Could not delete comment');
    } finally {
      setDeletingCommentKey(null);
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
      formdata.append('parent_id', parentId != null ? String(parentId) : 'null');
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
        setMyPosts(prev => prev.map(p => (p.id === postId ? {...p, comments: (p.comments ?? 0) + 1} : p)));
        setCommentTexts(prev => ({...prev, [postId]: ''}));
        setReplyingTo(prev => ({...prev, [postId]: undefined}));
      } else if (data?.message) {
        showToast(data.message);
      } else {
        showToast('Could not post comment');
      }
    } catch (e) {
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
              return {...c, isLiked: nextLiked, likes: Math.max(0, (c.likes ?? 0) + delta)};
            }),
          };
        });
      } else if (data?.message) {
        showToast(data.message);
      }
    } catch (e) {
      setCommentLikingKey(null);
    } finally {
      setCommentLikingKey(null);
    }
  };

  const formatAnswerTime = (v) => {
    if (!v) return '';
    try {
      const d = new Date(v);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const mapQuestionFromApi = (raw) => {
    const q = raw.question || {};
    const title = q.question ?? raw.question_text ?? '';
    const desc = q.questionDesc ?? q.question_desc ?? raw.question_desc ?? '';
    const content = desc ? `${title}\n\n${desc}` : title;
    const u = raw.user ?? raw.userdata ?? {};
    const userName =
      u.full_name ?? u.fullname ?? u.name ?? u.username ?? raw.user_name ?? 'User';
    const userAvatar = getAvatarUrl(u, raw) || null;
    const arr = x => (Array.isArray(x) ? x : []);
    const isPaidAnswer = a =>
      a.is_paid === 1 ||
      a.is_paid === true ||
      (a.answer_type && String(a.answer_type).toLowerCase() === 'paid') ||
      (a.type && String(a.type).toLowerCase() === 'paid');
    const answers = arr(raw.answers).map(a => {
      const au = a.user ?? {};
      const answerUserId =
        a.answer_user_id ?? a.answerUserId ?? a.user_id ?? au.user_id ?? au.id ?? null;
      const isGuidanceUserPayRaw = a.is_guidance_user_pay ?? a.isGuidanceUserPay ?? null;
      const isGuidanceUserPay =
        isGuidanceUserPayRaw === 1 ||
        isGuidanceUserPayRaw === true ||
        String(isGuidanceUserPayRaw) === '1';
      const isUnlocked =
        isGuidanceUserPay ||
        a.is_unlocked === 1 ||
        a.is_unlocked === true ||
        a.is_paid_unlocked === 1 ||
        a.is_paid_unlocked === true ||
        a.isUnlocked === true ||
        a.isPaidUnlocked === true;
      const paidContentPreview =
        a.paid_content_preview ?? a.paidContentPreview ?? a.preview ?? a.paid_preview ?? '';
      const paidContent =
        a.paid_content ?? a.paidContent ?? a.paid_answer ?? a.paidText ?? '';
      const priceRaw =
        au.per_answer_price ??
        a.per_answer_price ??
        a.price ??
        a.amount ??
        a.paid_amount ??
        a.unlock_amount ??
        a.unlock_price ??
        a.paid_price ??
        a.answer_price ??
        a.paidAnswerPrice ??
        null;
      const price = Number(priceRaw);
      const answerId = a.answer_id ?? a.answerId ?? a.id ?? null;
      return {
        text: (a.answer ?? a.text) ?? (paidContent || paidContentPreview || ''),
        paidContentPreview: paidContentPreview || '',
        paidContent: paidContent || '',
        price: Number.isFinite(price) ? price : 49,
        timeAgo:
          (a.formated_created_at ?? a.answer_created_at ?? a.created_at) || a.time_ago || '',
        userName: au.full_name ?? au.fullname ?? au.name ?? au.username ?? 'User',
        userAvatar: getAvatarUrl(au, a) || null,
        isPaid: isPaidAnswer(a),
        answerUserId,
        answerId,
        isUnlocked,
        isGuidanceUserPay,
      };
    });
    const derivedPaid = answers.filter(x => x.isPaid).length;
    const derivedFree = answers.length - derivedPaid;
    const paidAnswers = Math.max(
      0,
      Number(
        raw.paid_answers ??
          raw.paidAnswers ??
          raw.paid_answer_count ??
          raw.paid_count ??
          derivedPaid,
      ) || 0,
    );
    const freeAnswers = Math.max(
      0,
      Number(
        raw.free_answers ??
          raw.freeAnswers ??
          raw.free_answer_count ??
          raw.free_count ??
          derivedFree,
      ) || 0,
    );
    return {
      id: raw.guidance_id ?? raw.id,
      userId: raw.user_id ?? u.user_id ?? u.id,
      userName,
      userAvatar,
      action: 'Asked a question',
      timeAgo: raw.formated_created_at ?? raw.created_question ?? raw.created_post ?? raw.time_ago ?? raw.created_at ?? raw.createdAt ?? '',
      content: content || 'Question',
      questionTitle: title || 'Question',
      questionDesc: desc || '',
      type: 'question',
      paidAnswers,
      freeAnswers,
      answers,
    };
  };

  const fetchMyQuestions = async () => {
    try {
      const res = await Api.get(API_GET_GUIDANCE_MY_QUESTIONS);
      const list = res?.data?.data ?? res?.data ?? [];
      const rawList = Array.isArray(list) ? list : [];
      setMyQuestions(rawList.map(mapQuestionFromApi));
    } catch (e) {
      setMyQuestions([]);
    }
  };

  const fetchMyAnswers = async () => {
    try {
      const res = await Api.get(API_GET_GUIDANCE_MY_ANSWER_QUESTION);
      const list = res?.data?.data ?? res?.data ?? [];
      const rawList = Array.isArray(list) ? list : [];
      setMyAnswers(rawList.map(mapQuestionFromApi));
    } catch (e) {
      setMyAnswers([]);
    }
  };

  const normalizeQuestion = (raw) => {
    const q = raw.question || {};
    const title = q.question ?? raw.question_text ?? '';
    const desc = q.questionDesc ?? q.question_desc ?? raw.question_desc ?? '';
    return {
      id: raw.guidance_id ?? raw.id,
      content: desc ? `${title}\n\n${desc}` : title,
      timeAgo:raw.formated_created_at ?? raw.created_post ?? raw.time_ago ?? raw.created_at ?? '',
    };
  };

  const normalizeQuestionAnswered = (raw, uid) => {
    const q = raw.question || {};
    const title = q.question ?? raw.question_text ?? 'Question';
    const answers = Array.isArray(raw.answers) ? raw.answers : [];
    const myAns = answers.find(
      a => (a.answer_user_id ?? a.user_id ?? a.user?.id) == uid,
    );
    const answerText = myAns
      ? (myAns.answer ?? myAns.paid_content ?? myAns.paid_content_preview ?? '').toString().slice(0, 80)
      : '';
    return {
      id: raw.guidance_id ?? raw.id,
      content: title,
      answerPreview: answerText ? `${answerText}${answerText.length >= 80 ? '…' : ''}` : '—',
      timeAgo:raw.formated_created_at ?? raw.created_post ?? raw.time_ago ?? raw.created_at ?? '',
    };
  };

  const loadAll = useCallback(async (uid) => {
    if (uid == null) return;
    setLoading(true);
    await Promise.all([fetchMyPosts(), fetchMyQuestions(), fetchMyAnswers()]);
    setLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const uid = userId ?? (await fetchProfile());
    if (uid != null) await loadAll(uid);
    setRefreshing(false);
  }, [userId, loadAll]);

  const loadPaidAnswerRateFromSchedule = useCallback(async () => {
    try {
      const res = await Api.get(`${API_SCHEDULE_MY_TIMELINE}`);
      if (res?.status === 'RC200' && res?.data) {
        const data = res.data;
        const rawRate =
          data.paid_answer_rate ??
          data.paidAnswerRate ??
          data.answer_rate ??
          data.answerRate ??
          data.answer_rates ??
          null;
        const num = Number(rawRate);
        if (Number.isFinite(num) && num > 0) {
          setPaidAnswerRate(num);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        const uid = await fetchProfile();
        if (mounted && uid != null) await loadAll(uid);
        if (mounted) getPublishableKey();
        if (mounted) loadPaidAnswerRateFromSchedule();
      })();
      return () => { mounted = false; };
    }, [loadAll, loadPaidAnswerRateFromSchedule]),
  );

  useEffect(() => {
    if (userId != null) loadAll(userId);
  }, [userId, loadAll]);

  useEffect(() => {
    if (activeTab === 'my_answers') {
      console.log('My questions answer tab – list:', myAnswers);
    }
  }, [activeTab, myAnswers]);

  const parsedPaidAnswerRate = Number(paidAnswerRate);
  const isPaidAnswerRateZero =
    !Number.isFinite(parsedPaidAnswerRate) || parsedPaidAnswerRate <= 0;

  const data =
    activeTab === 'my_post'
      ? myPosts
      : activeTab === 'my_questions'
        ? myQuestions
        : myAnswers;

  const renderPostCard = (item) => {
    const hasImages = item.images && item.images.length > 0;
    const imageCount = hasImages ? item.images.length : 0;
    return (
      <View style={styles.postCard}>
        <View style={styles.userSection}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ExpertDetail', {ID: item.userId})}>
            <View style={styles.avatarContainer}>
              {item.userAvatar ? (
                <FastImage
                  source={{uri: item.userAvatar}}
                  style={styles.avatar}
                  resizeMode={FastImage.resizeMode.cover}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {(item.userName || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.userAction}>{item.action}</Text>
            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
          </View>
          <OptionsMenu
            customButton={
              <View style={styles.menuButton}>
                <Icon name="more-horizontal" size={20} color={COLORS.black} />
              </View>
            }
            options={['Edit', 'Delete','']}
            actions={[
             
              () => {
                navigation.navigate('AddQuestion', {
                  editPost: true,
                  postId: item.id,
                  content: item.content,
                  images: Array.isArray(item.images) ? item.images : [],
                });
              },
              () => handleDeletePost(item.id),
              () => {},
            ]}
            destructiveIndex={Platform.OS === 'ios' ? 1 : undefined}
          />
        </View>
        <View style={styles.contentSection}>
          <Text style={styles.postContent}>{item.content}</Text>
          {item.hashtags && item.hashtags.length > 0 && (
            <View style={styles.hashtagContainer}>
              <Text style={styles.hashtags}>{item.hashtags.join(' ')}</Text>
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
                      style={[styles.gridImage, index === 2 && imageCount === 3 && styles.lastImage]}
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
                        style={[styles.gridImage, index === 1 && styles.lastImage]}
                        onPress={() => openImageModal(item.images, index + 3)}>
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
                    style={[styles.likedByAvatar, {marginLeft: index > 0 ? -8 : 0}]}>
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
          <View style={styles.engagementIconsRow}>
            <TouchableOpacity
              style={styles.engagementIconBtn}
              onPress={() => handleLike(item.id, item.isLiked)}
              disabled={likingPostId === item.id}>
              <IconFa
                name="thumbs-up"
                size={18}
                solid={item.isLiked}
                color={item.isLiked ? COLORS.primary : COLORS.gray}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.engagementIconBtn}
              onPress={() => handleOpenComments(item.id)}>
              <Icon name="message-circle" size={18} color={COLORS.gray} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.engagementIconBtn}
              onPress={() => handleAura(item.id, item.isAuraGiven)}
              disabled={auraPostId === item.id}>
              <Image
                source={require('../../../assets/images/image.png')}
                style={styles.auraIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.engagementCountsRow}>
            <TouchableOpacity
              onPress={() => openLikesModal(item.id)}
              disabled={likesModalLoading || (item.likes ?? 0) === 0}
              style={styles.engagementCountBtn}>
              <Text style={styles.engagementCountText}>{item.likes} Likes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleOpenComments(item.id)}
              style={styles.engagementCountBtn}>
              <Text style={styles.engagementCountText}>{item.comments} Comments</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => openAuraModal(item.id)}
              disabled={auraModalLoading || (item.aura ?? 0) === 0}
              style={styles.engagementCountBtn}>
              <Text style={styles.engagementCountText}>{item.aura} Aura</Text>
            </TouchableOpacity>
          </View>
        </View>

        {openCommentsId === item.id && (
          <View style={styles.commentSection}>
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
                  const getReplies = (pid) => list.filter(c => sameId(c.parentId, pid));
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
                            <Text style={styles.commentItemUserName}>{comment.userName}</Text>
                            <Text style={styles.commentItemTime}>{comment.timeAgo}</Text>
                            <TouchableOpacity
                              style={styles.commentDeleteBtn}
                              onPress={() => handleDeleteComment(item.id, comment.id)}
                              disabled={deletingCommentKey === `${item.id}_${comment.id}`}>
                              <Icon name="trash-2" size={14} color={COLORS.gray} />
                            </TouchableOpacity>
                          </View>
                          <Text style={styles.commentItemText}>{comment.text}</Text>
                          <View style={styles.commentEngagement}>
                            <TouchableOpacity
                              style={styles.commentEngagementItem}
                              onPress={() => handleCommentLike(item.id, comment.id, comment.isLiked)}
                              disabled={commentLikingKey === `${item.id}_${comment.id}`}>
                              <Icon name="thumbs-up" size={14} color={comment.isLiked ? COLORS.primary : COLORS.gray} />
                              <Text style={[styles.commentEngagementText, comment.isLiked && {color: COLORS.primary, fontWeight: '600'}]}>
                                {(comment.likes ?? 0) > 0 ? `${comment.likes} Like${comment.likes === 1 ? '' : 's'}` : 'Likes'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.commentEngagementItem}
                              onPress={() => setReplyingTo(prev => ({...prev, [item.id]: comment.id}))}>
                              <Text style={styles.commentEngagementReply}>Reply</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      {getReplies(comment.id).map(reply => (
                        <View key={reply.id} style={[styles.commentItem, styles.commentItemReply]}>
                          <View style={styles.commentReplyLead}>
                            <View style={styles.commentItemAvatar}>
                              <Text style={styles.commentItemAvatarText}>
                                {(reply.userName || 'U').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.commentItemContent}>
                            <View style={styles.commentItemHeader}>
                              <Text style={styles.commentItemUserName}>{reply.userName}</Text>
                              <Text style={styles.commentItemTime}>{reply.timeAgo}</Text>
                              <TouchableOpacity
                                style={styles.commentDeleteBtn}
                                onPress={() => handleDeleteComment(item.id, reply.id)}
                                disabled={deletingCommentKey === `${item.id}_${reply.id}`}>
                                <Icon name="trash-2" size={14} color={COLORS.gray} />
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

            {replyingTo[item.id] != null && (
              <View style={styles.replyingToRow}>
                <Text style={styles.replyingToText}>
                  Replying to {(comments[item.id] || []).find(c => c.id === replyingTo[item.id])?.userName ?? 'comment'}
                </Text>
                <TouchableOpacity onPress={() => setReplyingTo(prev => ({...prev, [item.id]: undefined}))}>
                  <Text style={styles.replyingToCancel}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.commentInputContainer}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{currentUserName.charAt(0).toUpperCase()}</Text>
              </View>
              <TextInput
                style={styles.commentInput}
                placeholder={replyingTo[item.id] != null ? 'Write a reply...' : 'Write a Comment...'}
                placeholderTextColor={COLORS.gray}
                value={commentTexts[item.id] || ''}
                onChangeText={(text) => setCommentTexts(prev => ({...prev, [item.id]: text}))}
                multiline
              />
              <TouchableOpacity
                style={styles.commentPostButton}
                onPress={() =>
                  handleSubmitComment(item.id, commentTexts[item.id], replyingTo[item.id] ?? null)
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

  const renderQuestionCard = (item) => {
    const freeCount = item.freeAnswers ?? 0;
    const paidCount = item.paidAnswers ?? 0;
    const answerSummary =
      `${freeCount} Free Answer${freeCount !== 1 ? 's' : ''} · ${paidCount} Paid Answer${paidCount !== 1 ? 's' : ''}`;

    return (
      <View style={styles.cardWrapper}>
        <View style={styles.postCard}>
          {/* Question header: avatar + name + timestamp + Write Answer button */}
          <View style={styles.questionHeader}>
            <View style={styles.questionHeaderLeft}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => navigation.navigate('ExpertDetail', {ID: item.userId})}>
                <View style={styles.avatarContainer}>
                  {item.userAvatar ? (
                    <FastImage
                      source={{uri: item.userAvatar}}
                      style={styles.avatar}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarText}>
                        {(item.userName || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.userName}</Text>
                <Text style={styles.timeAgo}>{item.timeAgo}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.writeAnswerBtn}
              onPress={() => {
                setSelectedQuestion({id: item.id, userId: item.userId});
                setAnswerModalVisible(true);
              }}>
              <Text style={styles.writeAnswerBtnText}>Answer this?</Text>
            </TouchableOpacity>
          </View>

          {/* Question title + description */}
          <Text style={styles.questionTitle}>{item.questionTitle}</Text>
          {item.questionDesc ? (
            <Text style={styles.questionDesc}>{item.questionDesc}</Text>
          ) : null}

          {/* Answer summary - full text, toggle on tap when has answers (collapsed by default) */}
          <View style={styles.answerSummaryRow}>
            {item.answers && item.answers.length > 0 ? (
              <TouchableOpacity
                style={styles.answerSummaryLeft}
                activeOpacity={0.7}
                onPress={() => toggleAnswersExpanded(item.id)}>
                <Icon name="message-circle" size={18} color={COLORS.primary} />
                <Text style={styles.answerSummaryText}>{answerSummary}</Text>
                <Icon
                  name={
                    isAnswersExpanded(item.id) ? 'chevron-up' : 'chevron-down'
                  }
                  size={20}
                  color={COLORS.primary}
                  style={styles.answerSummaryChevron}
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.answerSummaryLeft}>
                <Icon name="message-circle" size={18} color={COLORS.primary} />
                <Text style={styles.answerSummaryText}>{answerSummary}</Text>
              </View>
            )}
          </View>

          {/* Answers list - show/hide on click of Free/Paid summary */}
          {item.answers &&
            item.answers.length > 0 &&
            isAnswersExpanded(item.id) && (
              <View style={styles.answerList}>
                {item.answers.map((ans, idx) => {
                  const previewText = (ans.paidContentPreview || '').trim();
                  const priceNum = Number(ans.price);
                  const price = Number.isFinite(priceNum) ? priceNum : 49;
                  const priceDisplay = Number.isFinite(price)
                    ? price.toFixed(2)
                    : '49.00';
                  const answerUserId = ans.answerUserId;
                  const unlockKey = `${item.id}_${answerUserId ?? idx}`;
                  const isUnlocked =
                    ans.isUnlocked === true ||
                    unlockedPaidAnswerKeys[unlockKey] === true;
                  return (
                    <View key={`${idx}`} style={styles.answerBox}>
                      <View style={styles.answerHeader}>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() =>
                            answerUserId != null &&
                            navigation.navigate('ExpertDetail', {ID: answerUserId})
                          }>
                          {ans.userAvatar ? (
                            <FastImage
                              source={{uri: ans.userAvatar}}
                              style={styles.answerAvatarImage}
                              resizeMode={FastImage.resizeMode.cover}
                            />
                          ) : (
                            <View style={styles.answerAvatar}>
                              <Text style={styles.answerAvatarText}>
                                {(ans.userName || 'U').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                        <View style={styles.answerMeta}>
                          <Text style={styles.answerUserName}>
                            {ans.userName}
                          </Text>
                          {ans.timeAgo ? (
                            <Text style={styles.answerTime}>{ans.timeAgo}</Text>
                          ) : null}
                        </View>
                      </View>

                      {ans.isPaid ? (
                        <>
                          {isUnlocked ? (
                            <>
                              {!!previewText && (
                                <Text style={styles.paidPreviewText}>
                                  {previewText}
                                </Text>
                              )}
                              <Text style={styles.answerText}>
                                {(ans.paidContent || ans.text || '').toString()}
                              </Text>
                              {answerUserId != null && (
                                <TouchableOpacity
                                  style={styles.bookGuideButton}
                                  onPress={() =>
                                    navigation.navigate('BookAppointment', {
                                      UID: answerUserId,
                                    })
                                  }>
                                  <Text style={styles.bookGuideButtonText}>
                                    Book this guide
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </>
                          ) : (
                            <>
                              <View style={styles.premiumCard}>
                                {!!previewText && (
                                  <Text
                                    style={styles.paidPreviewText}
                                    numberOfLines={2}>
                                    {previewText}
                                  </Text>
                                )}
                                <View style={styles.premiumBlurBlock}>
                                  <View
                                    style={[
                                      styles.premiumBlurLine,
                                      {width: '92%'},
                                    ]}
                                  />
                                  <View
                                    style={[
                                      styles.premiumBlurLine,
                                      {width: '78%'},
                                    ]}
                                  />
                                </View>
                              </View>
                              <TouchableOpacity
                                style={styles.payViewAnswerBtn}
                                disabled={unlockingKey === unlockKey}
                                onPress={() =>
                                  handleUnlockPaidAnswer({
                                    answerId: ans.answerId,
                                    guidanceId: item.id,
                                    answerUserId,
                                    amount: price,
                                    key: unlockKey,
                                  })
                                }>
                                <Text style={styles.payViewAnswerBtnText}>
                                  {unlockingKey === unlockKey
                                    ? 'Processing…'
                                    : 'Pay & View Answer'}
                                </Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </>
                      ) : (
                        <Text style={styles.answerText}>{ans.text}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
        </View>
      </View>
    );
  };

  const renderItem = ({item}) => {
    if (activeTab === 'my_post') {
      return renderPostCard(item);
    }
    if (activeTab === 'my_questions') {
      return renderQuestionCard(item);
    }
    if (activeTab === 'my_answers') {
      return renderQuestionCard(item);
    }
    return (
      <View style={styles.card}>
        <Text style={styles.cardContent} numberOfLines={6}>{item.content || '—'}</Text>
        <Text style={styles.cardTime}>{item.timeAgo}</Text>
      </View>
    );
  };

  const ListEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>
        {activeTab === 'my_post' && 'No any feed available. Start with adding a feed.'}
        {activeTab === 'my_questions' && 'No questions yet'}
        {activeTab === 'my_answers' && 'No answers yet'}
      </Text>
    </View>
  );

  return (
    <StripeProvider publishableKey={stripePublishableKey || 'pk_test_placeholder'}>
      <IosStatusBar backgroundColor={COLORS.primary} />
      <ScreenStatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <View style={styles.container}>
        <Header
          menuiconColor={COLORS.white}
          iconColor={COLORS.black}
          navigation={navigation}
          background={COLORS.primary}
          isDasboard={true}
        />

        <View style={styles.tabs}>
          {[
            {key: 'my_post', label: 'Feed'},
            {key: 'my_questions', label: 'Questions'},
            {key: 'my_answers', label: 'Answers'},
          ].map(({key, label}) => (
            <TouchableOpacity
              key={key}
              style={styles.tab}
              onPress={() => setActiveTab(key)}
              activeOpacity={0.7}>
              <Text
                style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                {label}
              </Text>
              {activeTab === key && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={
              activeTab === 'my_post' ||
              activeTab === 'my_questions' ||
              activeTab === 'my_answers'
                ? styles.listContent
                : styles.list
            }
            ItemSeparatorComponent={
              activeTab === 'my_post' ||
              activeTab === 'my_questions' ||
              activeTab === 'my_answers'
                ? () => <View style={styles.separator} />
                : null
            }
            ListEmptyComponent={ListEmpty}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={COLORS.primary} />
            }
          />
        )}

        <View>
          <BottomTab />
        </View>

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
              <TouchableOpacity onPress={() => setLikesModalVisible(false)} style={styles.likesModalClose}>
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
                ListEmptyComponent={<Text style={styles.likesModalEmpty}>No likes yet</Text>}
                renderItem={({item: u}) => (
                  <View style={styles.likesModalRow}>
                    <View style={styles.likesModalAvatar}>
                      {u.avatar ? (
                        <FastImage source={{uri: u.avatar}} style={styles.likesModalAvatarImg} resizeMode={FastImage.resizeMode.cover} />
                      ) : (
                        <Text style={styles.likesModalAvatarText}>{(u.name || 'U').charAt(0).toUpperCase()}</Text>
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
              <TouchableOpacity onPress={() => setAuraModalVisible(false)} style={styles.likesModalClose}>
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
                ListEmptyComponent={<Text style={styles.likesModalEmpty}>No aura yet</Text>}
                renderItem={({item: u}) => (
                  <TouchableOpacity
                    style={styles.likesModalRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      setAuraModalVisible(false);
                      if (u?.id != null) navigation.navigate('ExpertDetail', {ID: u.id});
                    }}>
                    <View style={styles.likesModalAvatar}>
                      {u.avatar ? (
                        <FastImage source={{uri: u.avatar}} style={styles.likesModalAvatarImg} resizeMode={FastImage.resizeMode.cover} />
                      ) : (
                        <Text style={styles.likesModalAvatarText}>{(u.name || 'U').charAt(0).toUpperCase()}</Text>
                      )}
                    </View>
                    <Text style={styles.likesModalName}>{u.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={answerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setAnswerModalVisible(false);
          setSelectedQuestion(null);
        }}>
        <KeyboardAvoidingView
          style={styles.answerModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity
            style={styles.answerModalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setAnswerModalVisible(false);
              setSelectedQuestion(null);
            }}
          />
          <View style={styles.answerModalContainer}>
            <View style={styles.answerModalHeader}>
              <Text style={styles.answerModalTitle}>Add Answer</Text>
              <TouchableOpacity
                onPress={() => {
                  setAnswerModalVisible(false);
                  setSelectedQuestion(null);
                  setAnswerText('');
                  setPaidAnswerOverview('');
                  setPaidAnswerText('');
                  setAnswerTab('free');
                }}>
                <Icon name="x" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>
            <View style={styles.answerModalTabs}>
              <TouchableOpacity style={styles.answerModalTab} onPress={() => setAnswerTab('free')}>
                <Text style={[styles.answerModalTabText, answerTab === 'free' && styles.answerModalTabTextActive]}>Free</Text>
                {answerTab === 'free' && <View style={styles.answerModalTabUnderline} />}
              </TouchableOpacity>
              <TouchableOpacity style={styles.answerModalTab} onPress={() => setAnswerTab('paid')}>
                <Text style={[styles.answerModalTabText, answerTab === 'paid' && styles.answerModalTabTextActive]}>Paid</Text>
                {answerTab === 'paid' && <View style={styles.answerModalTabUnderline} />}
              </TouchableOpacity>
            </View>
            <View style={styles.answerModalContent}>
              {answerTab === 'free' ? (
                <TextInput
                  style={[styles.answerModalTextArea, styles.answerModalFreeTextArea]}
                  placeholder="Write your Answer..."
                  placeholderTextColor={COLORS.gray}
                  value={answerText}
                  onChangeText={setAnswerText}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
              ) : isPaidAnswerRateZero ? (
                <View style={styles.answerModalPaidInfoContainer}>
                  <Text style={styles.answerModalPaidInfoText}>
                    First select your paid answer rate on the Time Slots / Rate
                    page, then proceed.
                  </Text>
                </View>
              ) : (
                <View style={styles.answerModalPaidContainer}>
                  <TextInput
                    style={[styles.answerModalTextArea, styles.answerModalTextAreaSpacing]}
                    placeholder="Write paid answer overview..."
                    placeholderTextColor={COLORS.gray}
                    value={paidAnswerOverview}
                    onChangeText={setPaidAnswerOverview}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                  <TextInput
                    style={styles.answerModalTextArea}
                    placeholder="Write paid answer..."
                    placeholderTextColor={COLORS.gray}
                    value={paidAnswerText}
                    onChangeText={setPaidAnswerText}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.answerModalButton}
              disabled={answerSubmitting}
              onPress={() => {
                if (!selectedQuestion) return;
                if (answerTab === 'free') {
                  if (answerText.trim()) {
                    handlePokeAnswer({
                      questionId: selectedQuestion.id,
                      toUserId: selectedQuestion.userId,
                      answer: answerText,
                      isPaid: false,
                      paidContentPreview: '',
                      paidContent: '',
                    });
                  }
                } else {
                  if (isPaidAnswerRateZero) {
                    setAnswerModalVisible(false);
                    setSelectedQuestion(null);
                    navigation.navigate('AvailibilityTabIndex', {guide: true});
                    return;
                  }
                  if (paidAnswerOverview.trim() && paidAnswerText.trim()) {
                    handlePokeAnswer({
                      questionId: selectedQuestion.id,
                      toUserId: selectedQuestion.userId,
                      answer: paidAnswerText,
                      isPaid: true,
                      paidContentPreview: paidAnswerOverview.trim(),
                      paidContent: paidAnswerText.trim(),
                    });
                  }
                }
              }}>
              <Text style={styles.answerModalButtonText}>
                {answerSubmitting ? 'Adding…' : 'Add Answer'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
                  onPress={() =>
                    setImageModalIndex(prev =>
                      prev <= 0 ? imageModalImages.length - 1 : prev - 1,
                    )}>
                  <Icon name="chevron-left" size={32} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.imageModalNav, styles.imageModalNavRight]}
                  onPress={() =>
                    setImageModalIndex(prev =>
                      prev >= imageModalImages.length - 1 ? 0 : prev + 1,
                    )}>
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
      </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  separator: {
    height: 12,
    backgroundColor: 'transparent',
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white3 || '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  postCard: {
    backgroundColor: COLORS.white3 || '#F5F5F5',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  userSection: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  questionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
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
  questionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
    lineHeight: 24,
    marginBottom: 6,
  },
  questionDesc: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 14,
  },
  answerSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  answerSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    flexWrap: 'wrap',
  },
  answerSummaryText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  answerSummaryChevron: {
    marginLeft: 4,
  },
  writeAnswerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexShrink: 0,
  },
  writeAnswerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
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
    textAlign: 'left',
    paddingVertical: 16,
    lineHeight: 24,
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
    gap: 16,
  },
  answerBox: {
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  answerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  answerAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  answerMeta: {
    flex: 1,
  },
  answerUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  answerTime: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.black2 || '#333',
    lineHeight: 22,
  },
  paidPreviewText: {
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
  payViewAnswerBtn: {
    marginTop: 12,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payViewAnswerBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  bookGuideButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  bookGuideButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
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
  premiumUnlockText: {
    marginTop: 12,
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '600',
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
  menuButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  engagementSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  engagementIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  engagementIconBtn: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  engagementCountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  engagementCountBtn: {
    paddingVertical: 4,
  },
  engagementCountText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '500',
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
  answerModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  answerModalContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  answerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  answerModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  answerModalTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  answerModalTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    position: 'relative',
  },
  answerModalTabText: {
    fontSize: 16,
    color: COLORS.gray,
    fontWeight: '500',
  },
  answerModalTabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  answerModalTabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.primary,
  },
  answerModalContent: {
    minHeight: 280,
    marginBottom: 20,
  },
  answerModalPaidInfoContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  answerModalPaidInfoText: {
    fontSize: 14,
    color: COLORS.black2,
    textAlign: 'center',
    lineHeight: 22,
  },
  answerModalPaidContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  answerModalTextArea: {
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
  answerModalTextAreaSpacing: {
    marginBottom: 16,
  },
  answerModalFreeTextArea: {
    height: 280,
  },
  answerModalButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  auraText: {
    color: COLORS.black2,
  },
  auraIcon: {
    width: 16,
    height: 16,
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
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 6,
  },
  cardContent: {
    fontSize: 14,
    color: COLORS.black2,
    lineHeight: 20,
  },
  cardMeta: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardTime: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 8,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.gray,
  },
});

export default MyTimeline;

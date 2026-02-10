import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import {COLORS} from '../../../util/Theme';
import FastImage from 'react-native-fast-image';
import Api from '../../../service/Api';
import {
  API_GET_GUIDANCE_DATA,
  API_GET_GUIDANCE_ANSWERS,
  API_STRIPE_ANSWER_PAYMENT,
  API_GET_STRIPE_PUB_KEY,
  API_POKE_USER,
  API_SCHEDULE_MY_TIMELINE,
  BASE_URL,
} from '../../../service/apiEndPoint';
import {
  initPaymentSheet,
  presentPaymentSheet,
  StripeProvider,
} from '@stripe/stripe-react-native';
import {log, showToast} from '../../../util/Toast';

const QUESTIONS_PAGE_SIZE = 50;

const QuestionAnswers = ({navigation}) => {
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsLoadingMore, setQuestionsLoadingMore] = useState(false);
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsLastPage, setQuestionsLastPage] = useState(1);
  const [questionsHasMore, setQuestionsHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  const token = useSelector(s => s.AuthSlice?.token);
  const flatListRef = useRef(null);

  const isAnswersExpanded = questionId =>
    answersExpandedByQuestion[questionId] === true;

  const toggleAnswersExpanded = questionId => {
    setAnswersExpandedByQuestion(prev => ({
      ...prev,
      [questionId]: !(prev[questionId] === true),
    }));
  };

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({offset: 0, animated: true});
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

  const loadPaidAnswerRateFromSchedule = async () => {
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
      // Ignore – we'll fall back to deriving rate from guidance answers
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      setQuestionsPage(1);
      setQuestionsHasMore(true);
      fetchQuestions(1);
      getPublishableKey();
      loadPaidAnswerRateFromSchedule();
    }, []),
  );

  // const formatAnswerTime = v => {
  //   if (!v) return '';
  //   try {
  //     const d = new Date(v);
  //     if (isNaN(d.getTime())) return '';
  //     return d.toLocaleDateString('en-GB', {
  //       day: '2-digit',
  //       month: 'short',
  //       year: 'numeric',
  //     });
  //   } catch {
  //     return '';
  //   }
  // };

  const mapQuestionFromApi = raw => {
    console.log("mapQuestionFromAPI1111111",raw?.user)
    const q = raw.question || {};
    const title = q.question ?? raw.question_text ?? '';
    const desc = q.questionDesc ?? q.question_desc ?? raw.question_desc ?? '';
    const content = desc ? `${title}\n\n${desc}` : title;
    const u = raw.user ?? raw.userdata ?? {};
    const userName =
      u.full_name ?? u.fullname ?? u.username ?? u.name ?? raw.user_name ?? 'User';
    const userAvatar =
      (u.profile_image && String(u.profile_image).trim()) || u.image_url || null;
    const arr = x => (Array.isArray(x) ? x : []);
    const isPaidAnswer = a =>
      a.is_paid === 1 ||
      a.is_paid === true ||
      (a.answer_type && String(a.answer_type).toLowerCase() === 'paid') ||
      (a.type && String(a.type).toLowerCase() === 'paid');
    const answers = arr(raw.answers).map(a => {
      const au = a.user ?? {};
      const answerUserId =
        a.answer_user_id ??
        a.answerUserId ??
        a.user_id ??
        au.user_id ??
        au.id ??
        null;
      const isGuidanceUserPayRaw =
        a.is_guidance_user_pay ?? a.isGuidanceUserPay ?? null;
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
        a.paid_content_preview ??
        a.paidContentPreview ??
        a.preview ??
        a.paid_preview ??
        '';
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
        text: a.answer ?? a.text ?? fallbackText,
        paidContentPreview: paidContentPreview || '',
        paidContent: paidContent || '',
        price: Number.isFinite(price) ? price : 49,
        timeAgo:
          (a.formated_created_at ?? a.answer_created_at ?? a.created_at) ||
          a.time_ago ||
          '',
        userName:
          au.full_name ?? au.fullname ?? au.username ?? au.name ?? 'User',
        userAvatar:
          (au.profile_image && String(au.profile_image).trim()) ||
          au.image_url ||
          null,
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
      timeAgo:
      raw.formated_created_at ??
        raw.created_question ??
        raw.created_post ??
        raw.time_ago ??
        raw.created_at ??
        raw.createdAt ??
        '',
      content: content || 'Question',
      questionTitle: title || 'Question',
      questionDesc: desc || '',
      paidAnswers,
      freeAnswers,
      isVerified: !!(raw.is_verified ?? raw.isVerified),
      answers,
    };
  };

  const mapAnswersFromRaw = rawAnswers => {
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
      const isGuidanceUserPayRaw =
        a.is_guidance_user_pay ?? a.isGuidanceUserPay ?? null;
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
        a.paid_content_preview ??
        a.paidContentPreview ??
        a.preview ??
        a.paid_preview ??
        '';
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
        text: a.answer ?? a.text ?? fallbackText,
        paidContentPreview: paidContentPreview || '',
        paidContent: paidContent || '',
        price: Number.isFinite(price) ? price : 49,
        timeAgo:
          (a.formated_created_at ?? a.answer_created_at ?? a.created_at) ||
          a.time_ago ||
          '',
        userName:
          au.full_name ?? au.fullname ?? au.username ?? au.name ?? 'User',
        userAvatar:
          (au.profile_image && String(au.profile_image).trim()) ||
          au.image_url ||
          null,
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
      setQuestions(prev =>
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

  const getPublishableKeyForUnlock = async (
    answerId,
    guidanceId,
    answerUserId,
    amount,
    key,
  ) => {
    setUnlockingKey(key);
    const response = await Api.get(`${API_GET_STRIPE_PUB_KEY}`, {
      skipSuccessToast: true,
    });
    if (response.status == 'RC200') {
      setStripePublishableKey(response.data);
      get_payment_details(answerId, guidanceId, answerUserId, amount, key);
    } else {
      setUnlockingKey(null);
      showToast('Payment is not available right now. Please try again.');
    }
  };

  const get_payment_details = async (
    answerId,
    guidanceId,
    answerUserId,
    amount,
    key,
  ) => {
    try {
      const response = await Api.get(
        `${API_STRIPE_ANSWER_PAYMENT}/${guidanceId}/${answerUserId}`,
        {skipSuccessToast: true},
      );
      setUnlockingKey(null);

      if (response.status != 'RC200' || !response.data) {
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
        log('Payment setup missing: ' + missing.join(', '), {data: response.data});
        showToast('Payment setup incomplete. Please try again later.');
        return;
      }

      const {error} = await initPaymentSheet({
        merchantDisplayName: displayName,
        customerId,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntentSecret,
        allowsDelayedPaymentMethods: true,
        ...(Platform.OS === 'ios'
          ? {returnURL: 'guidelinked://stripe-redirect'}
          : {}),
      });

      if (error) {
        const msg =
          (error?.message && String(error.message).trim()) ||
          'Payment could not be started. Please try again.';
        showToast(msg);
        return;
      }

      const {error: Err} = await presentPaymentSheet();

      if (Err) {
        return;
      }

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

  const handleUnlockPaidAnswer = ({
    answerId,
    guidanceId,
    answerUserId,
    amount,
    key,
  }) => {
    if (!guidanceId || !answerUserId) {
      showToast('Missing unlock details. Please refresh and try again.');
      return;
    }
    if (unlockingKey) return;
    getPublishableKeyForUnlock(
      answerId,
      guidanceId,
      answerUserId,
      amount,
      key,
    );
  };
  const extractPaidAnswerRate = (resData, questionList) => {
    // 1) Direct keys from API (if backend sends them)
    if (resData) {
      const directRaw =
        resData.paid_answer_rate ??
        resData.paidAnswerRate ??
        resData.answer_rate ??
        resData.answerRate ??
        resData.answer_rates ??
        null;
      const directNum = Number(directRaw);
      if (Number.isFinite(directNum)) {
        return directNum;
      }
    }

    // 2) Fallback – use per_answer_price from answers->user (as in screenshot)
    if (Array.isArray(questionList)) {
      for (const q of questionList) {
        const answersArr = Array.isArray(q?.answers) ? q.answers : [];
        for (const a of answersArr) {
          console.log("a?.user",a?.user)
          const au = a?.user ?? {}; 
          
          const rawVal =
            au.per_answer_price ??
            a.per_answer_price ??
            a.answer_price ??
            null;
          const numVal = Number(rawVal);
         
          if (Number.isFinite(numVal)) {
            return numVal;
          }
        }
      }
    }

    return null;
  };

  const fetchQuestions = async (pageNo = 1) => {
    try {
      if (pageNo === 1) {
        setQuestionsLoading(true);
      } else {
        setQuestionsLoadingMore(true);
      }
      const url = `${API_GET_GUIDANCE_DATA}?page=${pageNo}&limit=${QUESTIONS_PAGE_SIZE}`;
      const res = await Api.get(url);
      if (pageNo === 1) setQuestionsLoading(false);
      else setQuestionsLoadingMore(false);
      const raw = res?.data?.data ?? [];
      console.log("raw11111111",raw[1]?.answers[1])
      const lastPage = res?.data?.last_page ?? 1;
      if (pageNo === 1) {
        const rate = extractPaidAnswerRate(res?.data, raw);
        console.log('QuestionAnswers paid answer rate (using per_answer_price):', {
          paid_answer_rate: res?.data?.paid_answer_rate,
          paidAnswerRate: res?.data?.paidAnswerRate,
          answer_rate: res?.data?.answer_rate,
          answerRate: res?.data?.answerRate,
          derivedFromAnswers: rate,
        });
        setPaidAnswerRate(
          Number.isFinite(Number(rate)) ? Number(rate) : 0,
        );
      }
      if (res?.status === 'RC200' && Array.isArray(raw)) {
        const mapped = raw.map(mapQuestionFromApi);
        setQuestionsLastPage(lastPage);
        if (pageNo === 1) {
          setQuestions(mapped);
        } else {
          setQuestions(prev => [...prev, ...mapped]);
        }
        if (raw.length < QUESTIONS_PAGE_SIZE || pageNo >= lastPage) {
          setQuestionsHasMore(false);
        }
      } else {
        if (pageNo === 1) setQuestions([]);
        setQuestionsHasMore(false);
      }
    } catch (error) {
      log('Failed to load questions');
      if (pageNo === 1) setQuestionsLoading(false);
      else setQuestionsLoadingMore(false);
      if (pageNo === 1) setQuestions([]);
      setQuestionsHasMore(false);
    }
  };

  const fetchMoreQuestions = () => {
    if (
      questionsLoadingMore ||
      !questionsHasMore ||
      questionsPage >= questionsLastPage
    ) {
      return;
    }
    const next = questionsPage + 1;
    setQuestionsPage(next);
    fetchQuestions(next);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setQuestionsPage(1);
    setQuestionsHasMore(true);
    fetchQuestions(1).finally(() => setRefreshing(false));
  };
  const formatTimeAgo = timeAgo => {
    return timeAgo;
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
      formdata.append(
        'paid_content_preview',
        (paidContentPreview || '').toString(),
      );
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
        setQuestionsPage(1);
        setQuestionsHasMore(true);
        fetchQuestions(1);
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

  const parsedPaidAnswerRate = Number(paidAnswerRate);
  const isPaidAnswerRateZero =
    !Number.isFinite(parsedPaidAnswerRate) || parsedPaidAnswerRate <= 0;

  const renderQuestionItem = ({item}) => {
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
                      {(item.userName || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.userName}</Text>
                <Text style={styles.timeAgo}>{formatTimeAgo(item.timeAgo)}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.writeAnswerBtn}
              onPress={() => {
                console.log('Selected Question (QuestionAnswers):', {
                  id: item.id,
                  userId: item.userId,
                  title: item.questionTitle,
                  desc: item.questionDesc,
                  freeAnswers: item.freeAnswers,
                  paidAnswers: item.paidAnswers,
                  answers: item.answers,
                });
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

          {/* Answer summary - full text, toggle on tap when has answers */}
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
                        onPress={() => {
                          if (ans.answerUserId != null) {
                            navigation.navigate('ExpertDetail', {
                              ID: ans.answerUserId,
                            });
                          }
                        }}>
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
                                  Book Guide
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

  return (
    <StripeProvider publishableKey={stripePublishableKey}>
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

        {questionsLoading && questions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={questions}
            renderItem={renderQuestionItem}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onEndReached={fetchMoreQuestions}
            onEndReachedThreshold={0.3}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListFooterComponent={
              questionsLoadingMore ? (
                <View style={styles.loadMoreFooter}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadMoreText}>Loading more…</Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No questions yet</Text>
                <Text style={styles.emptySubtext}>
                  Be the first to ask a question!
                </Text>
              </View>
            }
          />
        )}

        <View>
          <BottomTab onHomePress={scrollToTop} />
        </View>
      </View>

      {/* Add Answer Modal */}
      <Modal
        visible={answerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setAnswerModalVisible(false);
          setSelectedQuestion(null);
        }}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setAnswerModalVisible(false);
              setSelectedQuestion(null);
            }}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Answer</Text>
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

            <View style={styles.modalTabs}>
              <TouchableOpacity
                style={styles.modalTab}
                onPress={() => setAnswerTab('free')}>
                <Text
                  style={[
                    styles.modalTabText,
                    answerTab === 'free' && styles.modalTabTextActive,
                  ]}>
                  Free
                </Text>
                {answerTab === 'free' && (
                  <View style={styles.modalTabUnderline} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalTab}
                onPress={() => setAnswerTab('paid')}>
                <Text
                  style={[
                    styles.modalTabText,
                    answerTab === 'paid' && styles.modalTabTextActive,
                  ]}>
                  Paid
                </Text>
                {answerTab === 'paid' && (
                  <View style={styles.modalTabUnderline} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalContentContainer}>
              {answerTab === 'free' ? (
                <TextInput
                  style={[styles.modalTextArea, styles.freeTextArea]}
                  placeholder="Write your Answer..."
                  placeholderTextColor={COLORS.gray}
                  value={answerText}
                  onChangeText={setAnswerText}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                />
              ) : isPaidAnswerRateZero ? (
                <View style={styles.paidAnswerInfoContainer}>
                  <Text style={styles.paidAnswerInfoText}>
                    First select your paid answer rate on the Time Slots / Rate
                    page, then proceed.
                  </Text>
                </View>
              ) : (
                <View style={styles.paidAnswerContainer}>
                  <TextInput
                    style={[styles.modalTextArea, styles.modalTextAreaSpacing]}
                    placeholder="Write paid answer overview..."
                    placeholderTextColor={COLORS.gray}
                    value={paidAnswerOverview}
                    onChangeText={setPaidAnswerOverview}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                  <TextInput
                    style={styles.modalTextArea}
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
              style={styles.modalButton}
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
              <Text style={styles.modalButtonText}>
                {answerSubmitting ? 'Adding…' : 'Add Answer'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </StripeProvider>
  );
};

export default QuestionAnswers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
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
  separator: {
    height: 12,
    backgroundColor: 'transparent',
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
  userSection: {
    flexDirection: 'row',
    marginBottom: 12,
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
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifiedIcon: {
    marginLeft: 2,
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
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  bookGuideButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
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
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 110,
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
    shadowOffset: {width: 0, height: 2},
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
  paidAnswerInfoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  paidAnswerInfoText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
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
});

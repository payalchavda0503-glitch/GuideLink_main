export const WEB_URL = 'https://devapi.guidelinked.com/';
export const BASE_URL = WEB_URL + 'api/users/';
export const API_LOGIN = 'login';
export const API_POST_REGISTER = 'register';
export const API_POST_REGISTER_RESEND_OTP = 'register-resend-otp';
export const API_VERIFY_OTP = 'verify-otp';
export const API_SEND_OTP = 'send-otp';
export const API_POST_RESET_PASSWORD = 'reset-password';
export const API_FORGOTPASS_VERIFY_OTP = 'forgot-password-verify-otp';
export const API_POST_CHANGE_PASSWORD = 'change-password';
export const API_POST_FORGOT_PASSWORD = 'forgot-password';
export const API_LOGOUT = 'logout';
export const API_GET_PROFILE = 'get-profile';
export const API_GET_REGION = 'get-region';
export const API_GET_DASHBOARD = 'get-deshboard';
export const API_UPATE_PROFILE_IMAGE = 'update-profile-image';
export const API_UPDATE_PROFILE = 'update-profile';
export const API_UPDATE_PERSONAL_PROFILE = 'update-personal-detail';
export const API_UPDATE_SOCIAL_PROFILE = 'update-social-profile';
export const API_GET_DATA = 'get-data';
export const API_GET_NOTIFICATION = 'notifications';
export const API_ADD_EMAIL_VERIFY = 'users/emails-verification/add';
export const API_DELETE_EMAIL_VERIFY = 'users/emails-verification/delete/';
export const API_RESEND_WORK_EMAIL_OTP = 'users/emails-verification/resend-otp';
export const API_EMAIL_VERIFY = 'users/emails-verification/verify-otp';
export const API_EMAIL_LIST = 'users/emails-verification/list';
export const API_EXPERT_LIST = 'users/list';
export const API_LATEST_USER = 'users/latest';
export const API_EXPERT_DETAILS = 'users/details/';
export const API_REQUEST_SLOTS = '/users/request-slots';
export const API_USER = 'users';
export const API_EXPERT_DETAILS_RATING = 'rating/list';

export const API_SCHEDULE_UPDATE = 'schedule/update';
export const API_SCHEDULE_UPDATE_RATE = 'schedule/time-slots/update-price';
export const API_SCHEDULE_MY_TIMELINE = 'schedule/my-timeline';
export const API_SCHEDULE_DELETE_SLOT = 'schedule/time-slots/delete';

// Paid Answer (Q&A) rate
// NOTE: Use as absolute URL with `${WEB_URL}api/${API_GUIDANCE_UPDATE_ANSWER_RATE}` (no BASE_URL prefix).
export const API_GUIDANCE_UPDATE_ANSWER_RATE = 'schedule/time-slots/update-answer-price';

export const API_SCHEDULE_TIMESLOTS_DATE = 'schedule/time-slots/date';
export const API_SCHEDULE_TIMESLOTS_TIME = 'schedule/time-slots/time';
export const API_BOOK_APPOINTMENT = 'appointments/book';
export const API_BOOK_APPOINTMENT_VALIDATE = 'appointments/book/validate';
export const API_BOOK_APPOINTMENT_PAY_STATUS = 'appointments/payment/status';

export const API_APPOINTMENT = 'appointments';
export const API_GET_BOOKING = 'history';
export const API_CANCEL_APPOINTMENT = 'cancel';
export const API_RATING = 'rating';
export const API_COMPIANT = 'complaint';
export const API_ADD = 'add';
export const API_DETAILS = 'details';
export const API_TIMEZONE = 'get-timezones';
export const API_DELETE = 'delete-account';
export const API_NOTIFICATION = 'notifications';
export const API_NOTIFICATION_LIST = 'list';
export const API_NOTIFICATION_CLEAR = 'clear';

export const API_UPDATE_FCB = 'update-token';
export const API_CONTACTUS = 'contact-us';

export const API_ZOOM_START_MEETIING = 'zoom/start-meeting';
export const API_STRIPE_ONBOARDING_LINK = 'expert-onboarding-link';
export const API_STRIPE_LOGIN_LINK = 'expert-onboarding-login-link';
export const API_ZOOM_UPDATE_STATUS = 'zoom/status-update';
export const API_ZOOM_JOINING_STATUS = 'zoom/check-expert-status';

export const API_GET_STRIPE_PUB_KEY = 'stripe/publishable-key';
export const API_GET_STRIPE_CARD_SETUP_KEY = 'stripe/card/setup/keys';
export const API_GET_STRIPE_PAYMENT = 'stripe/payment';
export const API_STRIPE_ANSWER_PAYMENT = 'stripe/answer-payment';
export const API_SAVE_ANSWER_PAID_HISTORY = 'guidance/save_answer_paid_history';

export const API_GET_VIDEOS_LIST = 'how-to/videos/list';

export const API_GET_GUIDANCE_REQUEST = 'guidance/get_request';
export const API_POST_GUIDANCE_REQUEST = 'guidance/request';
export const API_GET_GUIDANCE_DATA = 'guidance/get';
export const API_GET_GUIDANCE_ANSWERS = 'guidance/get-answers';
export const API_GET_GUIDANCE_MY_QUESTIONS = 'guidance/get_my_question';
export const API_GET_GUIDANCE_MY_ANSWER_QUESTION = 'guidance/get_my_answer_question';
export const API_DELETE_GUIDANCE_REQUEST = 'guidance/delete';
export const API_POKE_USER = 'guidance/poke';

export const API_TIMELINE_POST_ADD = 'timeline-post/add';
export const API_TIMELINE_POST_GET = 'timeline-post/get_posts';
export const API_TIMELINE_POST_GET_MY_POSTS = 'timeline-post/get_my_posts';
export const API_TIMELINE_POST_LIKE = 'timeline-post/like';
export const API_TIMELINE_POST_AURA = 'timeline-post/aura';
export const API_TIMELINE_POST_EDIT = 'timeline-post/edit';
export const API_TIMELINE_POST_DELETE = 'timeline-post/delete';
export const API_TIMELINE_POST_DELETE_COMMENT = 'timeline-post/delete_comment';
export const API_TIMELINE_POST_COMMENT = 'timeline-post/comment';
export const API_TIMELINE_POST_COMMENT_LIKE = 'timeline-post/comment/like';
export const API_TIMELINE_POST_GET_COMMENTS = 'timeline-post/get_post_comment_users';
export const API_TIMELINE_POST_GET_LIKE_USERS = 'timeline-post/get_post_like_users';
export const API_TIMELINE_POST_GET_AURA_USERS = 'timeline-post/get_post_aura_users';
export const API_CATEGORY_LIST = 'category/list';

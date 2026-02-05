import {combineReducers, configureStore} from '@reduxjs/toolkit';
import AuthSlice from './AuthSlice';
import NetworkStatus from './NetworkStatus';
import ChangeSlice from './ChangeSlice';
import SearchSlice from './SearchSlice';
import toastSlice from './toastSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // blacklist: ['NetworkStatus', AuthSlice, ChangeSlice, SearchSlice,toastSlice],
};
const combine = combineReducers({
  AuthSlice,
  NetworkStatus,
  ChangeSlice,
  SearchSlice,
  toastSlice,
});
const persistReducerData = persistReducer(persistConfig, combine);

const store = configureStore({
  reducer: persistReducerData,

  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

const persistor = persistStore(store);

export {store, persistor};

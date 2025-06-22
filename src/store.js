import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE } from 'reduxjs-toolkit-persist/es/constants';
import { persistReducer } from 'reduxjs-toolkit-persist';
import storage from 'reduxjs-toolkit-persist/lib/storage';
import persistStore from 'reduxjs-toolkit-persist/es/persistStore';
import createMigrate from 'reduxjs-toolkit-persist/es/createMigrate';
import autoMergeLevel2 from 'reduxjs-toolkit-persist/es/stateReconciler/autoMergeLevel2';
import scrollspyReducer from 'components/scrollspy/scrollspySlice';
import langReducer from 'lang/langSlice';
import menuReducer from 'layout/nav/main-menu/menuSlice';
import settingsReducer from 'settings/settingsSlice';
import notificationReducer from 'layout/nav/notifications/notificationSlice';
import authReducer from 'auth/authSlice';
import layoutReducer from 'layout/layoutSlice';
import { REDUX_PERSIST_KEY } from 'config.js';
import { MENU_PLACEMENT } from 'constants.js';

const migrations = {
  // Refer to this commit: a91dd33 - change layout of nav
  0: (state) => ({
    ...state,
    menu: {
      placement: MENU_PLACEMENT.Vertical,
    },
    settings: {
      layout: 'boxed',
    },
  }),
  1: (state) => ({
    ...state,
    settings: {
      color: 'light-green',
    },
  }),
};

const persistConfig = {
  key: REDUX_PERSIST_KEY,
  storage,
  whitelist: ['menu', 'settings', 'lang'],
  version: 1,
  migrate: createMigrate(migrations, { debug: process.env.NODE_ENV !== 'production' }),
  stateReconciler: autoMergeLevel2,
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    settings: settingsReducer,
    layout: layoutReducer,
    lang: langReducer,
    auth: authReducer,
    menu: menuReducer,
    notification: notificationReducer,
    scrollspy: scrollspyReducer,
  })
);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});
const persistedStore = persistStore(store);
export { store, persistedStore };

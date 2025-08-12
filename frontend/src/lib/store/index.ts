import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import * as AuthReducer from '../reducers/authReducer';

const PersistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'facility', 'inventoryItem', 'systemAlert']
};

const rootReducer = combineReducers({
  auth: AuthReducer.authReducer
});

const store = configureStore({
  reducer: persistReducer(PersistConfig, rootReducer),
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { persistor, store, AuthReducer };

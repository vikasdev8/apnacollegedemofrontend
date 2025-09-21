import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';
import AuthApi from './api/authApi';
import { dsaApi } from '../../store/dsaApi';
import globalSlice from './slices/globalSlice';

// 1. Combine reducers
const rootReducer = combineReducers({
  globalState: globalSlice,
  [AuthApi.reducerPath]: AuthApi.reducer,
  [dsaApi.reducerPath]: dsaApi.reducer,
});

// 2. Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['globalState'], // persist only global state
  blacklist: [AuthApi.reducerPath, dsaApi.reducerPath], // don't persist API cache
};

// 3. Wrap reducer with persistence
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(AuthApi.middleware, dsaApi.middleware),
});

// 5. Create persistor for PersistGate
export const persistor = persistStore(store);

// 6. Typed hooks
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';
import timerReducer from './stateful/timer';
import gameReducer from './stateful/game';

const sagaMiddleware = createSagaMiddleware();

const store = configureStore({
	reducer: {
		timer: timerReducer,
		game: gameReducer,
	},
	middleware: [sagaMiddleware],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

sagaMiddleware.run(rootSaga);

export default store;

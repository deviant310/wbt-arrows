import { fork } from 'redux-saga/effects';
import gameSaga from './game-saga';
import timerSaga from './timer-saga';

export default function* rootSaga() {
	yield fork(timerSaga);
	yield fork(gameSaga);
}

import { call, cancel, delay, fork, put, select, take, takeEvery } from 'redux-saga/effects';

import config from '../config';

import {
	createInitAction,
	createRunAction,
	createInitDeadlineAction,
	createSetLimitAction,
	createUpdateRemainingTimeAction,
	createStopAction,
	remainingTimeSelector,
	createInitRemainingTimeAction,
} from '../stateful/timer';

export function* initTimer({ payload: { milliseconds } }: ReturnType<typeof createInitAction>) {
	yield put(createSetLimitAction({ milliseconds }));
	yield put(createInitRemainingTimeAction());
}

export function* runTimer() {
	yield put(createInitDeadlineAction());
	yield put(createInitRemainingTimeAction());

	while ((yield select(remainingTimeSelector)) > 0) {
		yield delay(config.TIMER_UPDATE_INTERVAL);
		yield put(createUpdateRemainingTimeAction());
	}

	yield put(createStopAction());
}

export function* timerWatcher() {
	yield takeEvery(createInitAction, initTimer);

	while (yield take(createRunAction)) {
		const timerTask = yield fork(runTimer);

		yield take(createStopAction);

		yield cancel(timerTask);
	}
}

export default function* timerSaga() {
	yield call(timerWatcher);
}

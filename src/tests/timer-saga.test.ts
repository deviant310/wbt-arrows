import { createMockTask } from '@redux-saga/testing-utils';
import assert from 'assert';

import { call, cancel, delay, fork, put, select, take, takeEvery } from 'redux-saga/effects';
import config from '../config';

import timerSaga, { initTimer, runTimer, timerWatcher } from '../sagas/timer-saga';
import {
	createInitAction,
	createInitDeadlineAction,
	createInitRemainingTimeAction,
	createRunAction,
	createSetLimitAction,
	createStopAction,
	createUpdateRemainingTimeAction,
	remainingTimeSelector,
} from '../stateful/timer';

describe('Timer saga test', () => {
	test('timer saga', () => {
		const timerSagaGenerator = timerSaga();

		assert.deepStrictEqual(timerSagaGenerator.next().value, call(timerWatcher));
	});

	test('timer watcher', () => {
		const timerWatcherGenerator = timerWatcher();

		assert.deepStrictEqual(
			timerWatcherGenerator.next().value,
			takeEvery(createInitAction, initTimer)
		);

		assert.deepStrictEqual(timerWatcherGenerator.next().value, take(createRunAction));
		assert.deepStrictEqual(timerWatcherGenerator.next(createRunAction()).value, fork(runTimer));

		const timerTask = createMockTask();

		assert.deepStrictEqual(timerWatcherGenerator.next(timerTask).value, take(createStopAction));

		assert.deepStrictEqual(
			timerWatcherGenerator.next(createStopAction()).value,
			cancel(timerTask)
		);
	});

	test('init timer', () => {
		const time = { milliseconds: config.GAME_STEP_TIMEOUT };
		const initTimerGenerator = initTimer(createInitAction(time));

		assert.deepStrictEqual(initTimerGenerator.next().value, put(createSetLimitAction(time)));

		assert.deepStrictEqual(
			initTimerGenerator.next().value,
			put(createInitRemainingTimeAction())
		);
	});

	test('run timer', () => {
		const runTimerGenerator = runTimer();

		assert.deepStrictEqual(runTimerGenerator.next().value, put(createInitDeadlineAction()));

		assert.deepStrictEqual(
			runTimerGenerator.next().value,
			put(createInitRemainingTimeAction())
		);

		assert.deepStrictEqual(runTimerGenerator.next().value, select(remainingTimeSelector));

		assert.deepStrictEqual(
			runTimerGenerator.next(true).value,
			delay(config.TIMER_UPDATE_INTERVAL)
		);

		assert.deepStrictEqual(
			runTimerGenerator.next().value,
			put(createUpdateRemainingTimeAction())
		);

		assert.deepStrictEqual(runTimerGenerator.next().value, select(remainingTimeSelector));
		assert.deepStrictEqual(runTimerGenerator.next(false).value, put(createStopAction()));
	});
});

import { Task } from 'redux-saga';
import { cancel, call, fork, put, select, take, race } from 'redux-saga/effects';
import { Arrow } from '../data/arrow-map';

import texts from '../data/texts';

import {
	createAddArrowTypingAction,
	createClearArrowTypingsAction,
	createIsLostAction,
	createIsWonAction,
	createNextStepAction,
	createSetGameIsOnAction,
	createSetRequiredArrowAction,
	createStartAction,
	createTypeArrowAction,
	gameIsOnSelector,
	LostReason,
	requiredArrowSelector,
} from '../stateful/game';

export function* initGame() {
	yield put(createSetGameIsOnAction(true));
	yield put(createClearArrowTypingsAction());
	yield put(createSetRequiredArrowAction());
}

export function* proceedGame() {
	yield put(createSetRequiredArrowAction());
}

export function* looseGame(reason: LostReason) {
	yield put(createSetGameIsOnAction(false));

	switch (reason) {
		case 'timeIsUp':
			alert(texts.textLooseByTime);
			break;
		case 'tooManyMistakes':
			alert(texts.textLooseByMistakes);
			break;
	}
}

export function* winGame() {
	yield put(createSetGameIsOnAction(false));

	alert(texts.textWin);
}

export function* checkTypedArrow(arrow: Arrow) {
	const requiredArrow: Arrow = yield select(requiredArrowSelector);

	yield put(
		createAddArrowTypingAction({
			arrow,
			isCorrect: arrow.code === requiredArrow.code,
		})
	);
}

export function* gameLooseWorker(gameProcessTask: Task) {
	const { payload: reason } = yield take(createIsLostAction);
	yield call(looseGame, reason);
	yield cancel(gameProcessTask);
}

export function* gameWinWorker(gameProcessTask: Task) {
	yield take(createIsWonAction);
	yield call(winGame);
	yield cancel(gameProcessTask);
}

export function* gameProcessWorker() {
	while (yield select(gameIsOnSelector)) {
		const { payload: arrow } = yield take(createTypeArrowAction);
		yield call(checkTypedArrow, arrow);
		yield take(createNextStepAction);
		yield call(proceedGame);
	}
}

export function* gameWatcher() {
	while (yield take(createStartAction)) {
		yield call(initGame);

		const gameProcessTask = yield fork(gameProcessWorker);

		yield race([call(gameLooseWorker, gameProcessTask), call(gameWinWorker, gameProcessTask)]);
	}
}

export default function* gameSaga() {
	yield call(gameWatcher);
}

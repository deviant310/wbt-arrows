import { createMockTask } from '@redux-saga/testing-utils';

import assert from 'assert';

import { call, cancel, fork, put, race, select, take } from 'redux-saga/effects';

import arrowMap, { Arrow } from '../data/arrow-map';
import texts from '../data/texts';

import gameSaga, {
	checkTypedArrow,
	gameLooseWorker,
	gameProcessWorker,
	gameWatcher,
	gameWinWorker,
	initGame,
	looseGame,
	proceedGame,
	winGame,
} from '../sagas/game-saga';

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
	requiredArrowSelector,
} from '../stateful/game';

import { getObjectRandomValue } from '../utils/object';

describe('Game saga test', () => {
	test('game saga', () => {
		const gameSagaGenerator = gameSaga();

		assert.deepStrictEqual(gameSagaGenerator.next().value, call(gameWatcher));
	});

	test('game watcher', () => {
		const gameWatcherGenerator = gameWatcher();

		assert.deepStrictEqual(gameWatcherGenerator.next().value, take(createStartAction));

		assert.deepStrictEqual(
			gameWatcherGenerator.next(createStartAction()).value,
			call(initGame)
		);

		assert.deepStrictEqual(gameWatcherGenerator.next().value, fork(gameProcessWorker));

		const gameProcessTask = createMockTask();

		assert.deepStrictEqual(
			gameWatcherGenerator.next(gameProcessTask).value,
			race([call(gameLooseWorker, gameProcessTask), call(gameWinWorker, gameProcessTask)])
		);
	});

	test('game process worker', () => {
		const gameProcessWorkerGenerator = gameProcessWorker();

		assert.deepStrictEqual(gameProcessWorkerGenerator.next().value, select(gameIsOnSelector));

		assert.deepStrictEqual(
			gameProcessWorkerGenerator.next({ payload: true }).value,
			take(createTypeArrowAction)
		);

		const arrow = getObjectRandomValue(arrowMap) as Arrow;

		assert.deepStrictEqual(
			gameProcessWorkerGenerator.next(createTypeArrowAction(arrow)).value,
			call(checkTypedArrow, arrow)
		);

		assert.deepStrictEqual(gameProcessWorkerGenerator.next().value, take(createNextStepAction));
		assert.deepStrictEqual(gameProcessWorkerGenerator.next().value, call(proceedGame));
	});

	test('game win worker', () => {
		const gameProcessTask = createMockTask();
		const gameWinWorkerGenerator = gameWinWorker(gameProcessTask);

		assert.deepStrictEqual(gameWinWorkerGenerator.next().value, take(createIsWonAction));
		assert.deepStrictEqual(gameWinWorkerGenerator.next().value, call(winGame));
		assert.deepStrictEqual(gameWinWorkerGenerator.next().value, cancel(gameProcessTask));
	});

	test('game loose worker', () => {
		const gameProcessTask = createMockTask();
		const gameLooseWorkerGenerator = gameLooseWorker(gameProcessTask);

		assert.deepStrictEqual(gameLooseWorkerGenerator.next().value, take(createIsLostAction));

		const lostReason = 'tooManyMistakes';

		assert.deepStrictEqual(
			gameLooseWorkerGenerator.next(createIsLostAction(lostReason)).value,
			call(looseGame, lostReason)
		);

		assert.deepStrictEqual(gameLooseWorkerGenerator.next().value, cancel(gameProcessTask));
	});

	test('check typed arrow', () => {
		const arrow = getObjectRandomValue(arrowMap) as Arrow;
		const requiredArrow = getObjectRandomValue(arrowMap) as Arrow;
		const checkTypedArrowGenerator = checkTypedArrow(arrow);

		assert.deepStrictEqual(
			checkTypedArrowGenerator.next().value,
			select(requiredArrowSelector)
		);

		assert.deepStrictEqual(
			checkTypedArrowGenerator.next(requiredArrow).value,
			put(
				createAddArrowTypingAction({
					arrow,
					isCorrect: arrow.code === requiredArrow.code,
				})
			)
		);
	});

	test('init game', () => {
		const initGameGenerator = initGame();

		assert.deepStrictEqual(initGameGenerator.next().value, put(createSetGameIsOnAction(true)));

		assert.deepStrictEqual(
			initGameGenerator.next().value,
			put(createClearArrowTypingsAction())
		);

		assert.deepStrictEqual(initGameGenerator.next().value, put(createSetRequiredArrowAction()));
	});

	test('proceed game', () => {
		const proceedGameGenerator = proceedGame();
		const setRequiredArrowAction = createSetRequiredArrowAction();

		assert.deepStrictEqual(proceedGameGenerator.next().value, put(setRequiredArrowAction));
		assert.deepStrictEqual(proceedGameGenerator.next(setRequiredArrowAction).value, undefined);
	});

	test('win game', () => {
		const winGameGenerator = winGame();
		const setGameIsOnAction = createSetGameIsOnAction(false);

		assert.deepStrictEqual(winGameGenerator.next().value, put(setGameIsOnAction));
		assert.deepStrictEqual(winGameGenerator.next(setGameIsOnAction).value, undefined);

		expect(window.alert).toBeCalledWith(texts.textWin);
	});

	test('loose game', () => {
		const setGameIsOnAction = createSetGameIsOnAction(false);

		const looseGameByMistakesGenerator = looseGame('tooManyMistakes');

		assert.deepStrictEqual(looseGameByMistakesGenerator.next().value, put(setGameIsOnAction));

		assert.deepStrictEqual(
			looseGameByMistakesGenerator.next(setGameIsOnAction).value,
			undefined
		);

		expect(window.alert).toBeCalledWith(texts.textLooseByMistakes);

		const looseGameByTimeGenerator = looseGame('timeIsUp');

		assert.deepStrictEqual(looseGameByTimeGenerator.next().value, put(setGameIsOnAction));
		assert.deepStrictEqual(looseGameByTimeGenerator.next(setGameIsOnAction).value, undefined);

		expect(window.alert).toBeCalledWith(texts.textLooseByTime);
	});
});

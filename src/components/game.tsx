import React, { useCallback, useEffect, useRef } from 'react';

import cn from 'classnames';

import arrowMap from '../data/arrow-map';

import { useAppDispatch, useAppSelector } from '../hooks';

import config from '../config';

import {
	arrowTypingsSelector,
	createIsLostAction as createGameIsLostAction,
	createIsWonAction as createGameIsWonAction,
	createNextStepAction as createGameNextStepAction,
	createStartAction as createGameStartAction,
	createTypeArrowAction as createGameTypeArrowAction,
	gameIsOnSelector,
	requiredArrowSelector,
} from '../stateful/game';

import {
	createInitAction as createTimerInitAction,
	createRunAction as createTimerRunAction,
	createStopAction as createTimerStopAction,
	remainingTimeSelector as timerRemainingTimeSelector,
} from '../stateful/timer';

const Game = () => {
	const dispatch = useAppDispatch();

	const gameIsReadyToTakeArrowTypingsEffect = useRef(false);
	const gameIsReadyToTakeRemainingSecondsEffect = useRef(false);

	const gameIsOn = useAppSelector(gameIsOnSelector);
	const requiredArrow = useAppSelector(requiredArrowSelector);
	const arrowTypings = useAppSelector(arrowTypingsSelector);
	const remainingTime = useAppSelector(timerRemainingTimeSelector);

	const remainingSeconds = Math.ceil(remainingTime / 1000);

	const onDocumentKeyUp = useCallback(
		({ code }: KeyboardEvent) => {
			const typedArrow = arrowMap[code];

			if (typedArrow === undefined) return;

			const gameTypeArrowAction = createGameTypeArrowAction(typedArrow);

			dispatch(gameTypeArrowAction);
			dispatch(createTimerStopAction());
		},
		[dispatch]
	);

	const startGame = useCallback(() => {
		dispatch(createGameStartAction());
		dispatch(createTimerRunAction());
	}, [dispatch]);

	useEffect(() => {
		dispatch(createTimerInitAction({ milliseconds: config.GAME_STEP_TIMEOUT }));
	}, [dispatch]);

	useEffect(() => {
		if (!gameIsReadyToTakeRemainingSecondsEffect.current) {
			gameIsReadyToTakeRemainingSecondsEffect.current = true;
			return;
		}

		const timeIsUp = remainingSeconds <= 0;

		if (timeIsUp) {
			dispatch(createGameIsLostAction('timeIsUp'));
		}
	}, [dispatch, remainingSeconds]);

	useEffect(() => {
		if (!gameIsReadyToTakeArrowTypingsEffect.current) {
			gameIsReadyToTakeArrowTypingsEffect.current = true;
			return;
		}

		if (arrowTypings.length === 0) return;

		const userMadeTooManyMistakes =
			arrowTypings.filter(arrowTyping => !arrowTyping || !arrowTyping.isCorrect).length > 2;

		const userTypedRequiredSequence =
			arrowTypings.length >= 3 &&
			arrowTypings
				.slice(arrowTypings.length - 3, arrowTypings.length)
				.every(arrowTyping => arrowTyping && arrowTyping.isCorrect);

		switch (true) {
			case userMadeTooManyMistakes: {
				const gameIsLostAction = createGameIsLostAction('tooManyMistakes');
				dispatch(gameIsLostAction);
				break;
			}
			case userTypedRequiredSequence:
				dispatch(createGameIsWonAction());
				break;
			default:
				dispatch(createGameNextStepAction());
				dispatch(createTimerRunAction());
		}
	}, [arrowTypings, dispatch]);

	useEffect(() => {
		document.addEventListener('keyup', onDocumentKeyUp);

		return () => {
			document.removeEventListener('keyup', onDocumentKeyUp);
		};
	}, [onDocumentKeyUp]);

	return (
		<div className="main-container" data-testid="game">
			<div className="content">
				<button
					className="start-game-button"
					onClick={startGame}
					data-testid="start-game-button"
				>
					Start game
				</button>
				<div className={cn('game-container', !gameIsOn && 'game-container--disabled')}>
					<h1>Type the arrow!</h1>
					<div className="timer">{remainingSeconds} second(s) left</div>
					<div>
						<span className="arrow--big" data-testid="required-arrow">
							{requiredArrow.label}
						</span>
					</div>
					<div className="arrow-typings" data-testid="arrow-typings">
						{arrowTypings.map((arrowTyping, index) =>
							arrowTyping ? (
								<span
									key={index}
									className={cn(
										'arrow--small',
										arrowTyping.isCorrect ? 'text--green' : 'text--red'
									)}
								>
									{arrowTyping.arrow.label}
								</span>
							) : (
								<span key={index} className="arrow--small text--red">
									-
								</span>
							)
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Game;

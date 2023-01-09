import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import arrowMap, { Arrow } from '../data/arrow-map';
import { RootState } from '../store';
import { getObjectRandomValue } from '../utils/object';

type ArrowTyping = {
	arrow: Arrow;
	isCorrect: boolean;
};

type State = {
	gameIsOn: boolean;
	requiredArrow: Arrow;
	arrowTypings: (ArrowTyping | null)[];
};

export type LostReason = 'timeIsUp' | 'tooManyMistakes';

const initialState: State = {
	gameIsOn: false,
	requiredArrow: getObjectRandomValue(arrowMap) as Arrow,
	arrowTypings: [],
};

const { actions, name, reducer } = createSlice({
	name: 'game',
	initialState,
	reducers: {
		setGameIsOn: (state, { payload: gameIsOn }: PayloadAction<boolean>) => {
			state.gameIsOn = gameIsOn;
		},
		setRequiredArrow: state => {
			state.requiredArrow = getObjectRandomValue(arrowMap) as Arrow;
		},
		addArrowTyping: (state, { payload: arrowTyping }: PayloadAction<ArrowTyping | null>) => {
			state.arrowTypings = state.arrowTypings.concat(arrowTyping);
		},
		clearArrowTypings: state => {
			state.arrowTypings = initialState.arrowTypings;
		},
	},
});

export const {
	setGameIsOn: createSetGameIsOnAction,
	setRequiredArrow: createSetRequiredArrowAction,
	addArrowTyping: createAddArrowTypingAction,
	clearArrowTypings: createClearArrowTypingsAction,
} = actions;

export const createStartAction = createAction(`${name}/start`);
export const createTypeArrowAction = createAction<Arrow>(`${name}/typeArrow`);
export const createNextStepAction = createAction(`${name}/nextStep`);
export const createIsLostAction = createAction<LostReason>(`${name}/isLost`);
export const createIsWonAction = createAction(`${name}/isWon`);

export const gameIsOnSelector = ({ game }: RootState) => game.gameIsOn;
export const arrowTypingsSelector = ({ game }: RootState) => game.arrowTypings;
export const requiredArrowSelector = ({ game }: RootState) => game.requiredArrow;

export default reducer;

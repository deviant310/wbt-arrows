import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

type State = {
	limit: number;
	deadline: number;
	remainingTime: number;
};

type Time = {
	milliseconds: number;
};

const initialState: State = {
	limit: 0,
	deadline: 0,
	remainingTime: 0,
};

const getRemainingTimeUntil = (timestamp: number) => {
	return timestamp - Date.now();
};

const { actions, name, reducer } = createSlice({
	name: 'timer',
	initialState,
	reducers: {
		setLimit: (state, { payload: { milliseconds } }: PayloadAction<Time>) => {
			state.limit = milliseconds;
		},
		initRemainingTime: state => {
			state.remainingTime = state.limit;
		},
		initDeadline: state => {
			state.deadline = Date.now() + state.limit;
		},
		updateRemainingTime: state => {
			state.remainingTime = getRemainingTimeUntil(state.deadline);
		},
	},
});

export const {
	setLimit: createSetLimitAction,
	initRemainingTime: createInitRemainingTimeAction,
	initDeadline: createInitDeadlineAction,
	updateRemainingTime: createUpdateRemainingTimeAction,
} = actions;

export const createInitAction = createAction<Time>(`${name}/init`);
export const createRunAction = createAction(`${name}/run`);
export const createStopAction = createAction(`${name}/stop`);

export const remainingTimeSelector = ({ timer }: RootState) => timer.remainingTime;

export default reducer;

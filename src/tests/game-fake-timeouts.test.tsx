import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react';

import App from '../App';

import texts from '../data/texts';

jest.mock('../config', () => ({
	GAME_STEP_TIMEOUT: 1,
	TIMER_UPDATE_INTERVAL: 0,
}));

describe('Game fake timeouts test', () => {
	test('user can lose the game by time', async () => {
		const { getByTestId } = render(<App />);
		const startGameButton = getByTestId('start-game-button');

		fireEvent.click(startGameButton);

		await waitFor(() => expect(window.alert).toBeCalledWith(texts.textLooseByTime));
	});
});

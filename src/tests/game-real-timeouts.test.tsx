import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react';

import App from '../App';

import arrowMap, { Arrow } from '../data/arrow-map';

import texts from '../data/texts';

const getRequiredArrow = (clause: 'thatHas' | 'thatDoesntHave', textContent: string | null) => {
	const findFn = (() => {
		switch (clause) {
			case 'thatHas':
				return ({ label }: Arrow) => label === textContent;
			case 'thatDoesntHave':
				return ({ label }: Arrow) => label !== textContent;
		}
	})();

	const requiredArrow = (Object.values(arrowMap) as Arrow[]).find(findFn);

	if (requiredArrow === undefined)
		throw new Error(`Can not find required arrow item by rendered content ${textContent}`);

	return requiredArrow;
};

test('rendering game container', () => {
	const { getByTestId } = render(<App />);
	const gameElement = getByTestId('game');
	const startGameButtonElement = getByTestId('start-game-button');

	expect(gameElement).toBeInTheDocument();
	expect(startGameButtonElement).toBeInTheDocument();
});

test('game needs to be started', () => {
	const { getByTestId } = render(<App />);
	const { children: typedArrowsElements } = getByTestId('arrow-typings');

	fireEvent.keyUp(document, { code: 'ArrowLeft' });

	expect(typedArrowsElements).toHaveLength(0);
});

test('started game catches arrows keys inputs', () => {
	const { getByTestId } = render(<App />);
	const startGameButton = getByTestId('start-game-button');

	fireEvent.click(startGameButton);

	const { children: typedArrowsElements } = getByTestId('arrow-typings');

	fireEvent.keyUp(document, { code: 'ArrowLeft' });

	expect(typedArrowsElements.item(typedArrowsElements.length - 1)).toHaveTextContent('←');

	fireEvent.keyUp(document, { code: 'ArrowRight' });

	expect(typedArrowsElements.item(typedArrowsElements.length - 1)).toHaveTextContent('→');
});

test('user can win the game', async () => {
	const { getByTestId } = render(<App />);
	const startGameButton = getByTestId('start-game-button');

	fireEvent.click(startGameButton);

	await waitFor(() => new Promise(resolve => setTimeout(resolve, 0)));

	const requiredArrowElementFirst = getByTestId('required-arrow');
	const requiredArrowFirst = getRequiredArrow('thatHas', requiredArrowElementFirst.textContent);

	fireEvent.keyUp(document, { code: requiredArrowFirst.code });

	const requiredArrowElementSecond = getByTestId('required-arrow');
	const requiredArrowSecond = getRequiredArrow('thatHas', requiredArrowElementSecond.textContent);

	fireEvent.keyUp(document, { code: requiredArrowSecond.code });

	const requiredArrowElementThird = getByTestId('required-arrow');
	const requiredArrowThird = getRequiredArrow('thatHas', requiredArrowElementThird.textContent);

	fireEvent.keyUp(document, { code: requiredArrowThird.code });

	await waitFor(() => expect(window.alert).toBeCalledWith(texts.textWin));
});

test('user can lose the game by mistakes', async () => {
	const { getByTestId } = render(<App />);
	const startGameButton = getByTestId('start-game-button');

	fireEvent.click(startGameButton);

	const requiredArrowElementFirst = getByTestId('required-arrow');
	const wrongArrowFirst = getRequiredArrow(
		'thatDoesntHave',
		requiredArrowElementFirst.textContent
	);

	fireEvent.keyUp(document, { code: wrongArrowFirst.code });

	const requiredArrowElementSecond = getByTestId('required-arrow');
	const wrongArrowSecond = getRequiredArrow(
		'thatDoesntHave',
		requiredArrowElementSecond.textContent
	);

	fireEvent.keyUp(document, { code: wrongArrowSecond.code });

	const requiredArrowElementThird = getByTestId('required-arrow');
	const wrongArrowThird = getRequiredArrow(
		'thatDoesntHave',
		requiredArrowElementThird.textContent
	);

	fireEvent.keyUp(document, { code: wrongArrowThird.code });

	await waitFor(() => expect(window.alert).toBeCalledWith(texts.textLooseByMistakes));
});

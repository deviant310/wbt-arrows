import React from 'react';
import { Provider } from 'react-redux';
import './App.css';
import Game from './components/game';
import store from './store';

const App = () => {
	return (
		<Provider store={store}>
			<Game />
		</Provider>
	);
};

export default App;

export type ArrowCode = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

export type Arrow = {
	code: ArrowCode;
	label: string;
};

export type ArrowMap = Record<string, Arrow | undefined>;

export default {
	ArrowUp: {
		code: 'ArrowUp',
		label: '↑',
	},
	ArrowDown: {
		code: 'ArrowDown',
		label: '↓',
	},
	ArrowLeft: {
		code: 'ArrowLeft',
		label: '←',
	},
	ArrowRight: {
		code: 'ArrowRight',
		label: '→',
	},
} as ArrowMap;

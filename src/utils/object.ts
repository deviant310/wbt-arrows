export const getObjectRandomValue = <T extends Record<string, unknown>>(object: T) => {
	const objectKeys = Object.keys(object);
	const randomKey = Math.floor(Math.random() * objectKeys.length);

	return object[objectKeys[randomKey]] as T[string];
};

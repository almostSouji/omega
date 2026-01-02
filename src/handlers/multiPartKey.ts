export function handleMultiPartKey(key: string, structure: any) {
	const parts = key.split(".");
	const value = parts.slice(0, -1).reduce((obj, key) => obj?.[key], structure);

	return {
		key: parts.at(-1),
		structure: value,
	};
}

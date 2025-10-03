import { writable } from 'svelte/store';

const count = writable(0);

/**
 * Increments the loader count by 1.
 * Used to indicate a loading state.
 */
const show = (): void => {
	count.update((c) => c + 1);
};

/**
 * Decrements the loader count by 1, minimum 0.
 * Used to hide a loading state.
 */
const hide = (): void => {
	count.update((c) => Math.max(0, c - 1));
};

export const loader = {
	count,
	show,
	hide
};

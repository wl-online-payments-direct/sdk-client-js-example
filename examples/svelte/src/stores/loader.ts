/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */
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

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
<script lang="ts">
    import type { Base } from '../types';

    export let id: string;
    export let label: string = '';
    export let name: string;
    export let value: string = '';
    export let checked: boolean = false;
    export let disabled: boolean = false;
    export let fieldAttrs: Base['fieldAttrs'] = {};
    export let onChange: ((value: string) => void) | undefined;

    const handleChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        onChange?.(target.value);
    };
</script>

<div class={`field ${fieldAttrs?.className || ''}`} id={`${id}Field`}>
    <label class="radio">
        <input
            type="radio"
            id={id}
            name={name}
            value={value}
            checked={checked}
            disabled={disabled}
            on:change={handleChange}
            {...fieldAttrs}
        />
        <span></span>
        <span>{label}</span>
    </label>
</div>

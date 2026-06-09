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

    export type Option = {
        label: string;
        value: string;
    };

    export let id: string;
    export let label: string;
    export let options: Option[] = [];
    export let value: string | undefined = '';
    export let required: boolean = false;
    export let disabled: boolean = false;
    export let fieldAttrs: Base['fieldAttrs'] = {};
    export let onChange: ((value: string) => void) | undefined = undefined;

    const handleChange = (event: Event) => {
        const target = event.target as HTMLSelectElement;
        onChange?.(target.value);
    };
</script>

<div class={`field ${fieldAttrs?.className || ''}`} id={`${id}Field`}>
    <label for={id}>{label}</label>
    <select
        id={id}
        name={id}
        required={required}
        disabled={disabled}
        bind:value={value}
        on:change={handleChange}
        {...fieldAttrs}
    >
        {#each options as option (option.value)}
            <option value={option.value}>{option.label}</option>
        {/each}
    </select>
</div>

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
    export let type: 'text' | 'url' | 'number' = 'text';
    export let value: string = '';
    export let disabled: boolean = false;
    export let required: boolean = false;
    export let fieldAttrs: Base['fieldAttrs'] = {};
</script>

<div class="field" id={`${id}Field`}>
    <label for={id}>{label}</label>
    <input
        {type}
        {id}
        name={id}
        {required}
        {disabled}
        bind:value
        on:input
        aria-autocomplete="none"
        aria-multiline="false"
        autocapitalize="off"
        autocorrect="off"
        data-enable-grammarly="false"
        data-gramm="false"
        spellcheck="false"
        class={fieldAttrs?.className ?? ''}
        {...fieldAttrs}
    />
</div>

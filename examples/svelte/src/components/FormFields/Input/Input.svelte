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

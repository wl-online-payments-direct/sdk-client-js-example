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

<script lang="ts">
    import type { Base } from '../types';

    export let id: string;
    export let label: string = '';
    export let checked: boolean = false;
    export let disabled: boolean = false;
    export let fieldAttrs: Base['fieldAttrs'] = {};
    export let onChange: ((value: boolean) => void) | undefined = undefined;

    const handleChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        onChange?.(target.checked);
    };
</script>

<div class={`field ${fieldAttrs?.className || ''}`} id={`${id}Field`}>
    <label class="checkbox">
        <input
            type="checkbox"
            id={id}
            name={id}
            bind:checked={checked}
            disabled={disabled}
            on:change={handleChange}
            {...fieldAttrs}
        />
        <span></span>
        <span>{label}</span>
    </label>
</div>

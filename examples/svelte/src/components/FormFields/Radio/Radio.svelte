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
        console.log('Radio clicked:', target.value);
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

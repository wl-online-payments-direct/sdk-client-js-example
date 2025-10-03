<script setup lang="ts">
import type { Base, FieldAttributes } from '../types/base.ts';

type Option = {
    label: string;
    value: string;
};

type Props = Base & {
    modelValue?: string;
    required?: boolean;
    options: Option[];
    onChange?: (value: string) => void;
    disabled?: boolean;
};

withDefaults(defineProps<Props>(), {
    modelValue: '',
    required: false,
    disabled: false,
    fieldAttrs: () => ({}) as FieldAttributes
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const handleChange = (e: Event) => {
    const value = (e.target as HTMLSelectElement).value;
    emit('update:modelValue', value);
};
</script>

<template>
    <div :id="`${id}Field`" :class="['field', fieldAttrs?.className]">
        <label :for="id">{{ label }}</label>
        <select
            :id="id"
            :name="id"
            :value="modelValue"
            :required="required"
            :disabled="disabled"
            @change="handleChange"
            v-bind="fieldAttrs ?? {}"
        >
            <option v-for="opt in options" :key="opt.value" :value="opt.value">
                {{ opt.label }}
            </option>
        </select>
    </div>
</template>

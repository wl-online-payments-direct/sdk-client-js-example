<script setup lang="ts">
import type { Base, FieldAttributes } from '../types/base.ts';

type Props = Base & {
    modelValue?: string;
    type?: 'text' | 'url' | 'number';
    required?: boolean;
    disabled?: boolean;
    onChange?: (value: string) => void;
};

const props = withDefaults(defineProps<Props>(), {
    modelValue: '',
    type: 'text',
    required: false,
    disabled: false,
    fieldAttrs: () => ({}) as FieldAttributes
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const handleInput = (e: Event) => {
    if (props.disabled) return;
    const value = (e.target as HTMLInputElement).value;
    emit('update:modelValue', value);
};
</script>

<template>
    <div :id="`${id}Field`" :class="['field', fieldAttrs?.className]">
        <label :for="id">{{ label }}</label>
        <input
            :type="type"
            :id="id"
            :name="id"
            :value="modelValue"
            :required="required"
            aria-autocomplete="none"
            aria-multiline="false"
            autocapitalize="off"
            autocorrect="off"
            data-enable-grammarly="false"
            data-gramm="false"
            spellcheck="false"
            :disabled="disabled"
            @input="handleInput"
            v-bind="fieldAttrs ?? {}"
        />
    </div>
</template>

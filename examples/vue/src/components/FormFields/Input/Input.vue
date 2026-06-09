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

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
import type { Base } from '../types/base.ts';

type Props = Base & {
    modelValue?: boolean;
    onChange?: (value: boolean) => void;
    disabled?: boolean;
};

withDefaults(defineProps<Props>(), {
    modelValue: false,
    disabled: false,
    fieldAttrs: () => ({})
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
}>();

const handleChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).checked;
    emit('update:modelValue', value);
};
</script>

<template>
    <div class="field" :id="`${id}Field`" :class="fieldAttrs?.className">
        <label class="checkbox">
            <input
                type="checkbox"
                :id="id"
                :name="id"
                :checked="modelValue"
                @change="handleChange"
                v-bind="fieldAttrs ?? {}"
            />
            <span></span>
            <span>{{ label }}</span>
        </label>
    </div>
</template>

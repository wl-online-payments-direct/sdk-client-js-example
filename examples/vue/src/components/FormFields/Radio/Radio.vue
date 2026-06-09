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
    name: string;
    value?: string;
};

const props = withDefaults(defineProps<Props>(), {
    value: '',
    disabled: false,
    fieldAttrs: () => ({})
});

const emit = defineEmits<{
    (e: 'change', payload: { id: string; value: string }): void;
}>();

const onChange = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    emit('change', { id: props.id, value: val });
};
</script>

<template>
    <div :class="['field']">
        <label class="radio">
            <input type="radio" :id="id" :name="name" :value="value" @change="onChange" />
            <span></span>
            <span>{{ label }}</span>
        </label>
    </div>
</template>

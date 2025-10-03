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

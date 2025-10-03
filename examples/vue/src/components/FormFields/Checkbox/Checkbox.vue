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

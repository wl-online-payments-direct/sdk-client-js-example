<script setup lang="ts">
import Radio from '../FormFields/Radio/Radio.vue';
import translations from '../../translations/translations.ts';
import { AccountOnFile } from 'onlinepayments-sdk-client-js';

const { accountsOnFile } = defineProps<{
    accountsOnFile: AccountOnFile[];
}>();

const emit = defineEmits<{ (e: 'select', id: string): void }>();

const handleSelect = (id: string) => {
    emit('select', id);
};
</script>

<template>
    <div class="flex-expand" role="radiogroup" aria-label="Payment methods">
        <p class="text-left">{{ translations.or_use_saved_method }}</p>
        <form class="form" id="paymentSelectionForm">
            <Radio
                v-for="accountOnFile in accountsOnFile"
                :key="accountOnFile.id"
                :id="accountOnFile.id.toString()"
                name="payment-methods"
                :label="accountOnFile.label"
                :value="accountOnFile.id.toString()"
                @change="handleSelect(accountOnFile.id)"
            />
        </form>
    </div>
</template>

<script setup lang="ts">
import Radio from '../FormFields/Radio/Radio.vue';
import translations from '../../translations/translations.ts';
import { AccountOnFile } from 'onlinepayments-sdk-client-js';
import { computed } from 'vue';

const props = defineProps<{
    accountsOnFile: (AccountOnFile | undefined)[];
}>();

const mappedAccounts = computed(() =>
    props.accountsOnFile.filter((account): account is AccountOnFile => account !== undefined)
);

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
                v-for="accountOnFile in mappedAccounts"
                :key="accountOnFile.id"
                :id="accountOnFile.id.toString()"
                name="payment-methods"
                :label="accountOnFile.getLabel()?.formattedValue"
                :value="accountOnFile.id.toString()"
                @change="handleSelect(accountOnFile.id)"
            />
        </form>
    </div>
</template>

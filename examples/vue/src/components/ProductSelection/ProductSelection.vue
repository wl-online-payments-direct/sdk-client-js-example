<script setup lang="ts">
import { computed } from 'vue';
import type { BasicPaymentItem } from 'onlinepayments-sdk-client-js';
import Radio from '../FormFields/Radio/Radio.vue';
import translations from '../../translations/translations.ts';

const props = defineProps<{
    items: BasicPaymentItem[];
}>();

const mappedItems = computed(() =>
    props.items.map((payment) => ({
        id: payment.id,
        label: payment.json.displayHints.label,
        logo: payment.json.displayHints.logo,
        accountsOnFile: payment.accountsOnFile || []
    }))
);

const emit = defineEmits<{ (e: 'select', id: number): void }>();

const handleSelect = (id: number) => {
    emit('select', id);
};
</script>

<template>
    <div class="flex-expand" role="radiogroup" aria-label="Payment methods">
        <p class="text-left">{{ translations.select_payment_method }}</p>
        <form class="form" id="paymentSelectionForm">
            <Radio
                v-for="item in mappedItems"
                :key="item.id"
                :id="item.id.toString()"
                name="payment-methods"
                :label="item.label"
                :value="item.id.toString()"
                @change="handleSelect(item.id)"
            />
        </form>
    </div>
</template>

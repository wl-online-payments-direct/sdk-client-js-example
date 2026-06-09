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
import Radio from '../FormFields/Radio/Radio.vue';
import translations from '../../translations/translations.ts';
import { BasicPaymentProduct } from 'onlinepayments-sdk-client-js';

const { products } = defineProps<{
    products: BasicPaymentProduct[];
}>();

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
                v-for="product in products"
                :key="product.id"
                :id="product.id.toString()"
                name="payment-methods"
                :label="product.label"
                :value="product.id.toString()"
                @change="handleSelect(product.id)"
            />
        </form>
    </div>
</template>

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

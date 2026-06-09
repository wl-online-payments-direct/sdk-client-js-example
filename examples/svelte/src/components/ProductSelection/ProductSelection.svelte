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
<script lang="ts">
    import type { BasicPaymentProduct } from 'onlinepayments-sdk-client-js';
    import Radio from '../FormFields/Radio/Radio.svelte';
    import { translations } from '../../translations/translations';

    export let products: BasicPaymentProduct[] = [];

    /**
     * Callback triggered when the user selects a payment product.
     * @param id - The ID of the selected product.
     */
    export let onSelectedProduct: (id: string) => Promise<void>;

    /**
     * Handles when the user changes the selected payment product.
     * @param id - The ID of the selected product.
     */
    const handleChange = async (id: string) => {
        await onSelectedProduct(id);
    };
</script>

<div class="flex-expand">
    <p class="text-left">{translations.select_payment_method}</p>
    <form class="form" id="paymentSelectionForm">
        {#each products as product (product.id)}
            <Radio
                id={product.id.toString()}
                name="paymentMethod"
                label={product.label}
                value={product.id.toString()}
                onChange={handleChange}
            />
        {/each}
    </form>
</div>

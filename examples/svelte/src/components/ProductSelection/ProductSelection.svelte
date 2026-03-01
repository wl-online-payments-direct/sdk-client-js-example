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

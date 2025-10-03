<script lang="ts">
    import type { BasicPaymentItem } from 'onlinepayments-sdk-client-js';
    import Radio from '../FormFields/Radio/Radio.svelte';
    import { translations } from '../../translations/translations';

    export let items: BasicPaymentItem[] = [];

    /**
     * Callback triggered when the user selects a payment product.
     * @param id - The ID of the selected product.
     */
    export let onSelectedProduct: (id: string) => Promise<void>;

    $: mappedItems = items.map((payment) => ({
        id: payment.id,
        label: payment.json.displayHints.label,
        logo: payment.json.displayHints.logo,
        accountsOnFile: payment.accountsOnFile || []
    }));

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
        {#each mappedItems as product (product.id)}
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

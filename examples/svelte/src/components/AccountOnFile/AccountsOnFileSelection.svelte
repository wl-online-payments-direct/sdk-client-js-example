<script lang="ts">
    import type { AccountOnFile } from 'onlinepayments-sdk-client-js';
    import Radio from '../FormFields/Radio/Radio.svelte';
    import { translations } from '../../translations/translations';

    export let accountsOnFile: (AccountOnFile | undefined)[] = [];
    export let onSelectedProduct: (id: string) => Promise<void>;

    $: mappedAccounts = accountsOnFile.filter((x): x is AccountOnFile => x !== undefined);

    /**
     * Handles the change event when a saved account is selected
     * @param id - The ID of the selected account
     */
    const handleChange = async (id: string) => {
        if (onSelectedProduct) {
            await onSelectedProduct(id);
        }
    };
</script>

<div class="flex-expand">
    <p class="text-left">{translations.or_use_saved_method}</p>
    <form class="form" id="aofSelectionForm">
        {#each mappedAccounts as aof (aof.id)}
            <Radio
                id={aof.id.toString()}
                name="paymentMethod"
                label={aof.getLabel()?.formattedValue}
                value={aof.id.toString()}
                onChange={handleChange}
            />
        {/each}
    </form>
</div>

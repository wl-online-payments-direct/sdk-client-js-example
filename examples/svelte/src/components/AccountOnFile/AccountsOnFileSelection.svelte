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
    import type { AccountOnFile } from 'onlinepayments-sdk-client-js';
    import Radio from '../FormFields/Radio/Radio.svelte';
    import { translations } from '../../translations/translations';

    export let accountsOnFile: AccountOnFile[] = [];
    export let onSelectedProduct: (id: string) => Promise<void>;

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
        {#each accountsOnFile as aof (aof.id)}
            <Radio
                id={aof.id.toString()}
                name="paymentMethod"
                label={aof.label}
                value={aof.id.toString()}
                onChange={handleChange}
            />
        {/each}
    </form>
</div>

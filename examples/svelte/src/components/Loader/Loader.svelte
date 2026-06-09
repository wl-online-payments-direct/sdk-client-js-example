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
    import { loader } from '../../stores/loader';
    import { derived } from 'svelte/store';

    /**
     * Derived store that is `true` if loader count > 0,
     * meaning the loader should be visible.
     */
    const visible = derived(loader.count, ($count) => $count > 0);
</script>

{#if $visible}
    <div class="loading-overlay">
        <div class="loader"></div>
    </div>
{/if}

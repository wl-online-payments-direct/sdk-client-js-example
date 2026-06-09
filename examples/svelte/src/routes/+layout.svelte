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
    import '../../design/styles/index.css';
    import Header from '../components/Header/Header.svelte';
</script>

<svelte:head>
    <title>Online payments Svelte SDK example app</title>
    <link rel="icon" href="../../design/images/favicon.ico" />
    <meta name="description" content="Online payments Svelte SDK example app" />
</svelte:head>

<Header />
<div id="app" class="flex">
    <slot />
</div>

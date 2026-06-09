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
import LoaderService from '../../services/LoaderService.ts';

const { isActive } = LoaderService;
</script>

<template>
    <teleport to="body">
        <div v-if="isActive" class="loading-overlay">
            <div class="loader" />
        </div>
    </teleport>
</template>

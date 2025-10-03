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

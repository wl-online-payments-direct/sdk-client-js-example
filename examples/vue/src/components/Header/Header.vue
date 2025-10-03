<script setup lang="ts">
import ThemeSwitcher from '../ThemeSwitcher/ThemeSwitcher.vue';
</script>

<template>
    <header class="main-header small">
        <RouterLink class="button link" to="/">Home</RouterLink>
        <ThemeSwitcher />
    </header>
</template>

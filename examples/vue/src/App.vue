<script setup lang="ts">
import Header from './components/Header/Header.vue';
import Loader from './components/Loader/Loader.vue';
</script>

<template>
    <Header />
    <div id="app" class="flex">
        <RouterView />
        <Loader />
    </div>
</template>

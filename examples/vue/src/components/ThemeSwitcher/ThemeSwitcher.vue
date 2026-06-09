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
import { computed, onMounted, ref, watch } from 'vue';
import MoonIcon from '../icons/MoonIcon.vue';
import SunIcon from '../icons/SunIcon.vue';

type Theme = 'dark' | 'light';

const getInitialTheme = (): Theme => {
    const saved = window.localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;

    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
};

const theme = ref<Theme>(getInitialTheme());
const isDark = computed(() => theme.value === 'dark');

const applyTheme = (theme: Theme) => {
    const root = document.documentElement;

    root.setAttribute('data-theme', theme);
    window.localStorage.setItem('theme', theme);
};

onMounted(() => {
    applyTheme(theme.value);
});

watch(theme, (theme) => applyTheme(theme));

const handleThemeChange = () => {
    theme.value = isDark.value ? 'light' : 'dark';
};
</script>

<template>
    <div class="flex row center">
        <span>Choose theme: </span>
        <button type="button" role="switch" id="theme-switcher" :data-value="theme" @click="handleThemeChange">
            <span>
                <MoonIcon class="dark" />
                <SunIcon class="light"
            /></span>
        </button>
    </div>
</template>

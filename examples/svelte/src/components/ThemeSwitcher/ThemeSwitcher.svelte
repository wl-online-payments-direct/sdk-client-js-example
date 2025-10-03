<script lang="ts">
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import MoonIcon from '../Icons/MoonIcon.svelte';
    import SunIcon from '../Icons/SunIcon.svelte';

    type Theme = 'dark' | 'light';
    const theme = writable<Theme>('light');

    onMount(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') {
            theme.set(saved);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            theme.set(prefersDark ? 'dark' : 'light');
        }

        return theme.subscribe((t) => {
            document.documentElement.setAttribute('data-theme', t);
            localStorage.setItem('theme', t);
        });
    });

    /**
     * Toggles the current theme between light and dark.
     */
    const toggleTheme = () => {
        theme.update((t) => (t === 'light' ? 'dark' : 'light'));
    };
</script>

<div class="flex row center">
    <span>Choose theme: </span>
    <button
        type="button"
        role="switch"
        aria-checked="false"
        id="theme-switcher"
        data-value={$theme}
        on:click={toggleTheme}
    >
        <span>
            {#if $theme === 'dark'}
            <MoonIcon className="icon" />
            {:else}
            <SunIcon className="icon" />
            {/if}
        </span>
    </button>
</div>

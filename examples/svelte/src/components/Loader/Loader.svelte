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

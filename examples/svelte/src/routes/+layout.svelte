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

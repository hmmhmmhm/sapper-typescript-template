<script lang="ts">
    // @ts-ignore
    import Nav from '../components/Nav.svelte'
    export let segment: undefined | 'selected' | 'blog'
</script>

<Nav {segment} />

<main>
    <slot />
</main>

<style>
    main {
        position: relative;
        max-width: 56em;
        background-color: white;
        padding: 2em;
        margin: 0 auto;
        box-sizing: border-box;
    }
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import { initCanvasWfc } from './_wfc';

	let canvas: HTMLCanvasElement | undefined;

	onMount(() => {
		if (canvas) {
			initCanvasWfc(canvas);
		}
	});
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="content">
	<h1>WFC example</h1>

	<p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae, similique.</p>

	<canvas bind:this={canvas} />
</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}
</style>

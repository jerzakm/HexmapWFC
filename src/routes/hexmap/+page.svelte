<script lang="ts">
	import { onMount } from 'svelte';
	import { initHexmap } from './_hexmap';
	let canvas: HTMLCanvasElement | undefined;

	onMount(() => {
		if (canvas) {
			initHexmap(canvas);
		}
	});
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<canvas bind:this={canvas} />

<style>
	canvas {
		width: 100vw;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		z-index: -100;
	}
</style>

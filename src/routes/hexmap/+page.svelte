<script lang="ts">
	import { onMount } from 'svelte';
	import { initHexmap } from './_hexmap';
	let canvas: HTMLCanvasElement | undefined;

	onMount(() => {
		initHexmap();
	});
</script>

<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

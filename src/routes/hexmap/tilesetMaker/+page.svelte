<script lang="ts">
	import { onMount } from 'svelte';

	import * as Honeycomb from 'honeycomb-grid';

	import type { WfcHexTile, WfcTileSet } from '$lib/hexmap/tileset';
	import { loadImage } from '$lib/renderer/canvas';

	let tileSet: WfcTileSet = {
		name: '',
		tags: [],
		tiles: []
	};
	let rawTiles: any;

	let canvas: HTMLCanvasElement;

	let pickTile: any;

	onMount(async () => {
		const res = await fetch('/api/tileset');
		const data = await res.json();
		tileSet = data;

		const ctx = canvas.getContext('2d');

		const hexSize = 48;
		const padding = 6;

		const Hex = Honeycomb.extendHex({ size: hexSize + padding, orientation: 'flat' });
		const Grid = Honeycomb.defineGrid(Hex);

		const centerHex = Hex(1, 1);

		drawHexgrid();

		pickTile = async (tile: WfcHexTile) => {
			const { x, y } = centerHex.toPoint();
			const image = await loadImage(tile.path);
			ctx?.drawImage(image, x + padding, y - 12 + padding);
		};

		function drawHexgrid() {
			Grid.hexagon({ radius: 1, center: Hex(1, 1) }).forEach((hex) => {
				const point = hex.toPoint();
				// add the hex's position to each of its corner points
				const corners = hex.corners().map((corner) => corner.add(point));
				// separate the first from the other corners
				const [firstCorner, ...otherCorners] = corners;

				if (!ctx) return;

				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.strokeStyle = 'red';

				// move the "pen" to the first corner
				ctx.moveTo(firstCorner.x, firstCorner.y);

				// draw lines to the other corners
				otherCorners.forEach(({ x, y }) => ctx.lineTo(x, y));
				// finish at the first corner
				ctx.lineTo(firstCorner.x, firstCorner.y);
				ctx?.stroke();
			});
		}

		pickTile(tileSet.tiles[0]);
	});

	function drawTile(tile: WfcHexTile) {
		//
	}
</script>

<h1>{tileSet.name}</h1>
<tags> ... </tags>
<editor>
	<tiles class="tiles-todo">
		{#each tileSet.tiles as tile}
			{#if !tile.sideTags}
				<button on:click={pickTile(tile)}>
					<img src={tile.path} />
				</button>
			{/if}
		{/each}
	</tiles>
	<canvas bind:this={canvas} width="500" height="500" />
	<tiles class="tiles-done">
		{#each tileSet.tiles as tile}
			{#if tile.sideTags}
				<img src={tile.path} />
			{/if}
		{/each}
	</tiles>
</editor>

<style>
	tiles {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	editor {
		display: flex;
		align-items: flex-start;
	}
</style>

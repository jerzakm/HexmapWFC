<script lang="ts">
	import { onMount } from 'svelte';

	import * as PIXI from 'pixi.js';

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
	let previewColor = [0, 0, 0];

	let pickTile: any;

	let newTag = {
		name: '',
		color: `0x000000`
	};
	let pickingColor = false;

	onMount(async () => {
		const res = await fetch('/api/tileset');
		const data = await res.json();
		tileSet = data;

		const ctx = canvas.getContext('2d');
		if (ctx) ctx.imageSmoothingEnabled = false;

		const hexSize = 96;
		const padding = -4;

		const Hex = Honeycomb.extendHex({ size: hexSize + padding, orientation: 'flat' });
		const Grid = Honeycomb.defineGrid(Hex);

		const centerHex = Hex(1, 1);

		let imgData: ImageData | undefined;

		pickTile = async (tile: WfcHexTile) => {
			ctx?.clearRect(0, 0, canvas.width, canvas.height);
			// draw grid
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

			// draw tile on top of the grid

			const { x, y } = centerHex.toPoint();
			const image = await loadImage(tile.path);
			ctx?.drawImage(image, x + padding, y - 24 + padding, image.width * 2, image.height * 2);

			imgData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
		};
		pickTile(tileSet.tiles[0]);

		canvas.addEventListener('mousemove', (e) => {
			const x = e.offsetX;
			const y = e.offsetY;

			if (!imgData) return;
			let index = (y * imgData.width + x) * 4;

			let red = imgData.data[index];
			let green = imgData.data[index + 1];
			let blue = imgData.data[index + 2];
			let alpha = imgData.data[index + 3];

			previewColor = [red, green, blue];
		});
	});
</script>

<h1>{tileSet.name}</h1>
<tags class="flex">
	<div class="flex  bg-slate-200 p-4 rounded-lg gap-2 ">
		<div class="flex flex-col gap-1">
			<span class="font-bold">Add a new tag</span>
			<div class="flex gap-2">
				<span>name</span>
				<input class="w-3/4" bind:value={newTag.name} />
			</div>

			<div class="flex gap-2 items-center">
				<span>color</span>
				<input class="w-32" bind:value={newTag.color} />
			</div>
		</div>
		<div class="mt-6">
			<button class="bg-white w-full" on:click={() => (pickingColor = !pickingColor)}>k</button>
			<div
				class="w-8 h-8 "
				style={`background-color: rgb(${previewColor[0]},${previewColor[1]},${previewColor[2]});`}
			/>
		</div>
		<button class="mt-4 bg-white font-bold border-slate-800 border w-16">Add</button>
	</div>
	<li>
		{#each tileSet.tags as tag}
			<ul>{tag.name}</ul>
		{/each}
	</li>
</tags>
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
	<div class="canvas-container relative">
		{#if pickingColor}<span class="absolute top-0 text-red-600 font-bold"
				>picking new color for tile tag</span
			>{/if}
		<canvas bind:this={canvas} width="800" height="800" />
	</div>
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
		gap: 1rem;
	}

	.canvas-container {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
</style>

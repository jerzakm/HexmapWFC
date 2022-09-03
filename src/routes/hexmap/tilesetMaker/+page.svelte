<script lang="ts">
	import { onMount } from 'svelte';

	import * as PIXI from 'pixi.js';
	import * as Honeycomb from 'honeycomb-grid';

	import type { WfcHexTile, WfcTileSet } from '$lib/hexmap/tileset';

	let tileSet: WfcTileSet = {
		name: '',
		tags: [],
		tiles: []
	};
	let rawTiles: any;

	let canvasContainer: HTMLDivElement;

	let pickTile: any;

	onMount(async () => {
		const res = await fetch('/api/tileset');
		const data = await res.json();
		tileSet = data;

		const app = new PIXI.Application({ transparent: true });
		const graphics = new PIXI.Graphics();

		canvasContainer.appendChild(app.view);

		const Hex = Honeycomb.extendHex({ size: 48, orientation: 'flat' });
		const Grid = Honeycomb.defineGrid(Hex);
		graphics.lineStyle(2, 0x999999);

		app.stage.scale.x = 2;
		app.stage.scale.y = 2;

		let sprite: PIXI.Sprite | undefined;

		Grid.hexagon({ radius: 1, center: Hex(1, 1) }).forEach((hex) => {
			const point = hex.toPoint();
			// add the hex's position to each of its corner points
			const corners = hex.corners().map((corner) => corner.add(point));
			// separate the first from the other corners
			const [firstCorner, ...otherCorners] = corners;

			// move the "pen" to the first corner
			graphics.moveTo(firstCorner.x, firstCorner.y);
			// draw lines to the other corners
			otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y));
			// finish at the first corner
			graphics.lineTo(firstCorner.x, firstCorner.y);

			app.stage.addChild(graphics);
		});

		sprite;

		const centerHex = Hex(1, 1);

		pickTile = (tile: WfcHexTile) => {
			if (sprite) app.stage.removeChild(sprite);
			const texture = PIXI.Texture.from(tile.path);
			sprite = new PIXI.Sprite(texture);

			const point = centerHex.toPoint();
			sprite.x = point.x;
			sprite.y = point.y - 12;
			app.stage.addChild(sprite);
		};
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
	<div id="pixi-canvas-container" bind:this={canvasContainer}>
		<!-- pixi container here -->
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
	}
</style>

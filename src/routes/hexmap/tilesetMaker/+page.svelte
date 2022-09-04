<script lang="ts">
	import { onMount } from 'svelte';
	import * as Honeycomb from 'honeycomb-grid';

	import { fetchTileset, type HexTile, type WfcTileSet } from '$lib/hexmap/tileset';
	import { loadImage } from '$lib/renderer/canvas';

	let tileSet: WfcTileSet = {
		name: '',
		tags: [],
		tiles: []
	};

	let activeTile: HexTile | undefined;

	let canvas: HTMLCanvasElement;
	let previewColor = [0, 0, 0];

	let pickTile: any;

	let activeTag: undefined | number;

	let newTag = {
		name: '',
		color: [0, 0, 0]
	};
	let pickingColor = false;
	let hoveringTile: undefined | number;

	onMount(async () => {
		tileSet = await fetchTileset();

		const ctx = canvas.getContext('2d');
		if (ctx) ctx.imageSmoothingEnabled = false;

		const hexSize = 96;
		const padding = -4;

		const Hex = Honeycomb.extendHex({ size: hexSize + padding, orientation: 'flat' });
		const Grid = Honeycomb.defineGrid(Hex);

		const centerHex = Hex(1, 1);

		let imgData: ImageData | undefined;

		let neighborIndex: any[] = new Array(6);

		let grid: Honeycomb.Grid<
			Honeycomb.Hex<{
				size: number;
				orientation: 'flat';
			}>
		>;

		pickTile = async (tile: HexTile) => {
			activeTile = tile;

			if (!ctx) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			const center = Hex(1, 1);
			// draw grid
			grid = Grid.hexagon({ radius: 1, center });

			for (let i = 0; i < grid.neighborsOf(center).length; i++) {
				const hex = grid.neighborsOf(center)[i];

				neighborIndex[i] = `${hex.x}${hex.y}`;

				const point = hex.toPoint();
				// add the hex's position to each of its corner points
				const corners = hex.corners().map((corner) => corner.add(point));
				// separate the first from the other corners
				const [firstCorner, ...otherCorners] = corners;

				if (!ctx) return;

				ctx.beginPath();
				ctx.lineWidth = 2;
				ctx.strokeStyle = 'red';

				if (hoveringTile == i) {
					ctx.strokeStyle = 'orange';
				}

				// move the "pen" to the first corner
				ctx.moveTo(firstCorner.x, firstCorner.y);

				// draw lines to the other corners
				otherCorners.forEach(({ x, y }) => ctx.lineTo(x, y));
				// finish at the first corner
				ctx.lineTo(firstCorner.x, firstCorner.y);

				if (tile.sideTags && tile.sideTags[i]) {
					const tagName = tile.sideTags[i];
					const tag = tileSet.tags.find((t) => {
						return t.name == tagName;
					});
					if (tag) {
						ctx.fillStyle = `rgb(${tag.color[0]},${tag.color[1]},${tag.color[2]})`;
						console.log(tag);
						ctx.fill();
						ctx.fillStyle = '#FFFFFF';
						ctx.fillText(`${tagName}`, corners[3].x + 40, (corners[0].y + corners[3].y - 50) / 2);
					}
				}

				ctx.stroke();
				ctx.fillStyle = '#FFFFFF';
				ctx.font = '20px Arial';
				ctx.fillText(`${i}`, (corners[0].x + corners[3].x) / 2, (corners[0].y + corners[3].y) / 2);
			}

			// draw tile on top of the grid

			const { x, y } = centerHex.toPoint();
			const image = await loadImage(tile.path);
			ctx?.drawImage(image, x + padding, y - 24 + padding, image.width * 2, image.height * 2);

			imgData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
		};

		pickUntaggedTile();

		function pickUntaggedTile() {
			for (const tile of tileSet.tiles) {
				if (!tile.sideTags) {
					pickTile(tile);
					break;
				}
			}
		}

		canvas.addEventListener('mousemove', ({ offsetX, offsetY }) => {
			if (pickingColor) {
				const x = offsetX;
				const y = offsetY;

				if (!imgData) return;
				let index = (y * imgData.width + x) * 4;

				let red = imgData.data[index];
				let green = imgData.data[index + 1];
				let blue = imgData.data[index + 2];
				let alpha = imgData.data[index + 3];

				previewColor = [red, green, blue];
			}
			const hexCoordinates = Grid.pointToHex(offsetX, offsetY);
			const hex = grid.get(hexCoordinates);
			const index = neighborIndex.indexOf(`${hex?.x}${hex?.y}`);
			if (index >= 0) {
				hoveringTile = index;
			} else {
				hoveringTile = undefined;
			}
		});
		canvas.addEventListener('click', () => {
			if (pickingColor) {
				pickingColor = false;
				newTag.color = previewColor;
			}
		});

		window.addEventListener('keydown', async (e) => {
			const { key } = e;
			const tagKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
			const tagIndex = tagKeys.indexOf(`${key}`);

			if (tagIndex >= 0) {
				if (tagIndex < tileSet.tags.length) activeTag = tagIndex;
				console.log(activeTag);
			}

			const hexKeys = ['d', 's', 'a', 'q', 'w', 'e'];
			const hexIndex = hexKeys.indexOf(`${key}`);

			if (hexIndex > -1 && typeof activeTag == 'number') {
				//
				console.log(hexIndex, tileSet.tags[activeTag].name);
				console.log(activeTile);
				if (!activeTile) return;
				if (!activeTile?.sideTags) {
					activeTile.sideTags = [undefined, undefined, undefined, undefined, undefined, undefined];
				}
				activeTile.sideTags[hexIndex] = tileSet.tags[activeTag].name;
				await saveTileSet();
				pickTile(activeTile);
			}
		});
	});

	function addNewTileTag() {
		tileSet.tags.push(newTag);
		tileSet = tileSet;
		saveTileSet();
	}

	async function saveTileSet() {
		await fetch('/api/tileset', {
			method: 'POST',
			body: JSON.stringify(tileSet)
		});
	}
</script>

<h1>{tileSet.name}</h1>
<div class="flex gap-6">
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
		<button
			class="mt-4 bg-white font-bold border-slate-800 border w-16"
			on:click={() => {
				addNewTileTag();
			}}>Add</button
		>
	</div>
	<tags class="flex gap-2">
		{#each tileSet.tags as tag, i}
			<tag
				class={`px-4 py-2 bg-slate-200 rounded-lg ${i == activeTag ? 'bg-orange-100' : ''}`}
				on:click={() => (activeTag = i)}
			>
				<span><b>[{i + 1}]</b> {tag.name}</span>
				<div class="w-16 h-16 " style={`background-color: rgb(${tag.color})`} />
			</tag>
		{/each}
	</tags>
</div>
<editor class="flex items-start gap-4">
	<tiles>
		{#each tileSet.tiles.reverse() as tile}
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
	<tiles>
		{#each tileSet.tiles as tile}
			{#if tile.sideTags}
				<button on:click={pickTile(tile)}>
					<img src={tile.path} />
				</button>
			{/if}
		{/each}
	</tiles>
</editor>

<style>
	tiles {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.canvas-container {
		display: flex;
		flex-direction: column;
		align-items: start;
	}
</style>

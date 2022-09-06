import { initPixiApp } from '$lib/renderer/pixi';
import * as PIXI from 'pixi.js';

import * as Honeycomb from 'honeycomb-grid';
import { fetchTileset, type HexTile } from '$lib/hexmap/tileset';

const RENDER_IN_STEPS = true;
const STEP_TIME_MS = 1;

export const initHexmap = async () => {
	const { app } = initPixiApp();

	const map = new PIXI.Container();
	app.stage.addChild(map);

	app.stage.scale.x = 0.75;
	app.stage.scale.y = 0.75;

	cameraSetup(app, map);

	const gridSize: [number, number] = [40, 20];

	const graphics = new PIXI.Graphics();
	graphics.lineStyle(2, 0x000000);

	const Hex = Honeycomb.extendHex({ size: 48, orientation: 'flat' });
	const Grid = Honeycomb.defineGrid(Hex);

	// draw hex grid - border outlines
	const hexGrid = Grid.rectangle({ width: gridSize[0], height: gridSize[1] });

	const grid = new PIXI.Container();

	hexGrid.map((hex) => {
		const point = hex.toPoint();
		const corners = hex.corners().map((corner) => corner.add(point));
		const [firstCorner, ...otherCorners] = corners;

		graphics.moveTo(firstCorner.x, firstCorner.y);
		otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y));
		graphics.lineTo(firstCorner.x, firstCorner.y);
		grid.addChild(graphics);
	});

	// WFC starts here
	await wfc(gridSize, map);

	grid.zIndex = 100;

	app.stage.addChild(grid);

	// center the map
	// map.x = app.renderer.width / 2 - (map.width / 2) * app.stage.scale.x;
	// map.y = app.renderer.height / 2 - (map.height / 2) * app.stage.scale.y;
};

const cameraSetup = (app: PIXI.Application, map: PIXI.Container) => {
	addEventListener('wheel', (event) => {
		app.stage.scale.x += event.deltaY * -0.001;
		app.stage.scale.y += event.deltaY * -0.001;

		app.stage.scale.x = Math.max(app.stage.scale.x, 0.1);
		app.stage.scale.y = Math.max(app.stage.scale.y, 0.1);
	});

	let cameraMove = false;

	addEventListener('pointerdown', (event) => {
		cameraMove = true;
	});

	addEventListener('pointerup', (event) => {
		cameraMove = false;
	});
	addEventListener('pointermove', (event) => {
		if (cameraMove) {
			app.stage.x += event.movementX / app.stage.scale.x;
			app.stage.y += event.movementY / app.stage.scale.x;
		}
	});
};

const wfc = async (gridSize: [number, number], map: PIXI.Container) => {
	// 1. Load tileset
	const { tiles, tags } = await fetchTileset();

	// 2. Make grid and setup data structure for wfc cells
	const Hex = Honeycomb.extendHex({ size: 48, orientation: 'flat' });
	const Grid = Honeycomb.defineGrid(Hex);

	// draw hex grid - border outlines
	const hexGrid = Grid.rectangle({ width: gridSize[0], height: gridSize[1] });

	const wfcHexTiles: WfcHexTile[] = [];
	const wfcHexGrid: WfcHexTile[][] = Array(gridSize[0])
		.fill(0)
		.map(() => Array(gridSize[1]));

	// check if every tile edge is labeled
	const validTiles = [];
	for (const tile of tiles) {
		if (
			tile.sideTags &&
			tile.sideTags.every((t) => {
				return typeof t != 'undefined';
			})
		) {
			//
			validTiles.push(tile);
		}
	}

	for (const hex of hexGrid) {
		const cell = {
			hex,
			collapsed: false,
			tile: undefined,
			options: [...validTiles]
		};
		wfcHexTiles.push(cell);
		wfcHexGrid[hex.x][hex.y] = cell;
	}

	// 3. Pick a random grid cell and collapse it first
	collapseTile(Math.floor(Math.random() * gridSize[0]), Math.floor(Math.random() * gridSize[1]));
	collapseStep();

	if (!RENDER_IN_STEPS) {
		renderFullMap();
	}

	function renderCell(cell: WfcHexTile) {
		//
		if (cell.tile) {
			const sprite = PIXI.Sprite.from(cell.tile.path);
			const point = cell.hex.toPoint();
			sprite.x = point.x;
			sprite.y = point.y - 12;
			map.addChild(sprite);
		}
	}

	function renderFullMap() {
		//
		for (const cell of wfcHexTiles) {
			renderCell(cell);
		}
	}

	function collapseTile(x: number, y: number) {
		const cell = wfcHexGrid[x][y];
		cell.collapsed = true;
		cell.tile = cell.options[Math.floor(Math.random() * cell.options.length)];
		cell.options = [cell.tile];

		if (RENDER_IN_STEPS) {
			renderCell(cell);
		}

		// 1.1 After collapsing a tile, recalculate neighbour options
		const neighbours = hexGrid.neighborsOf(cell.hex);
		for (let n = 0; n < neighbours.length; n++) {
			const nHex = neighbours[n];
			if (!nHex) return;

			const nCell = wfcHexGrid[nHex.x][nHex.y];
			// if neighbour exists and isnt collapsed, recalculate options
			if (!nCell.collapsed) {
				calculateOptions(nCell);
			}
		}
	}

	function calculateOptions(cell: WfcHexTile) {
		const neighbours = hexGrid.neighborsOf(cell.hex);
		for (let i = 0; i < 6; i++) {
			// check each neighbour
			if (neighbours[i]) {
				const neighbour = wfcHexGrid[neighbours[i].x][neighbours[i].y];
				// sideTags of options for an edge where it borders
				const sideTags: string[] = [];

				neighbour.options.map((option) => {
					if (option.sideTags) {
						const tag = option.sideTags[(i + 3) % 6];
						typeof tag === 'string' ? sideTags.push(tag) : '';
					}
				});

				cell.options = cell.options.filter((o) => {
					if (o.sideTags && o.sideTags[i]) {
						return sideTags.includes(`${o.sideTags[i]}`);
					}
				});
			}
		}
	}

	function collapseStep() {
		wfcHexTiles.sort((a, b) => {
			return a.options.length - b.options.length;
		});

		for (let i = 0; i < wfcHexTiles.length; i++) {
			if (!wfcHexTiles[i].collapsed) {
				try {
					collapseTile(wfcHexTiles[i].hex.x, wfcHexTiles[i].hex.y);
				} catch (e) {
					console.log('err collapsing tile', wfcHexTiles[i]);
				}
				break;
			}
		}

		const uncollapsed = wfcHexTiles.find((c) => {
			return !c.collapsed;
		});

		if (uncollapsed) {
			if (RENDER_IN_STEPS) {
				setTimeout(collapseStep, STEP_TIME_MS);
			} else {
				collapseStep();
			}
		} else {
			console.log('no more uncollapsed tiles');
		}
	}

	console.log(wfcHexTiles);
};

interface WfcHexTile {
	hex: Honeycomb.Hex<{
		size: number;
		orientation: 'flat';
	}>;
	collapsed: boolean;
	tile?: HexTile;
	options: HexTile[];
}

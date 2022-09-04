import { initPixiApp } from '$lib/renderer/pixi';
import * as PIXI from 'pixi.js';

import * as Honeycomb from 'honeycomb-grid';
import { fetchTileset, type HexTile } from '$lib/hexmap/tileset';

export const initHexmap = () => {
	const { app } = initPixiApp();

	const map = new PIXI.Container();
	app.stage.addChild(map);

	cameraSetup(app, map);

	const hex = 'hexTileSets/ZeshiosPixelHexTileset1.1/PixelHex_zeshio_tile-001.png';
	const texture = PIXI.Texture.from(hex);

	const graphics = new PIXI.Graphics();
	graphics.lineStyle(2, 0xffffff);

	const Hex = Honeycomb.extendHex({ size: 48, orientation: 'flat' });
	const Grid = Honeycomb.defineGrid(Hex);

	// draw hex grid - border outlines
	const hexGrid = Grid.rectangle({ width: 10, height: 10 });

	hexGrid.map((hex) => {
		const point = hex.toPoint();
		const corners = hex.corners().map((corner) => corner.add(point));
		const [firstCorner, ...otherCorners] = corners;

		graphics.moveTo(firstCorner.x, firstCorner.y);
		otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y));
		graphics.lineTo(firstCorner.x, firstCorner.y);
		map.addChild(graphics);
	});

	// WFC starts here
	wfc(hexGrid, map);

	// center the map
	map.x = app.renderer.width / 2 - map.width / 2;
	map.y = app.renderer.height / 2 - map.height / 2;
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
			map.x += event.movementX / app.stage.scale.x;
			map.y += event.movementY / app.stage.scale.x;
		}
	});
};

const wfc = async (
	hexGrid: Honeycomb.Grid<
		Honeycomb.Hex<{
			size: number;
			orientation: 'flat';
		}>
	>,
	map: PIXI.Container
) => {
	const wfcHexTiles: WfcHexTile[] = [];

	// 1. Load tileset

	const tileSet = await fetchTileset();
	console.log(tileSet);

	for (const hex of hexGrid) {
		wfcHexTiles.push({
			hex,
			collapsed: false,
			tile: undefined,
			options: []
		});
	}
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

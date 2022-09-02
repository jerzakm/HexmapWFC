import { initPixiApp } from '$lib/renderer/pixi';
import * as PIXI from 'pixi.js';

import * as Honeycomb from 'honeycomb-grid';

export const initHexmap = () => {
	const { app } = initPixiApp();

	const map = new PIXI.Container();
	app.stage.addChild(map);

	cameraSetup(app, map);

	const hex = 'hexTileSets/ZeshiosPixelHexTileset1.1/PixelHex_zeshio_tile-001.png';
	const texture = PIXI.Texture.from(hex);

	const graphics = new PIXI.Graphics();
	graphics.lineStyle(1, 0x999999);

	const Hex = Honeycomb.extendHex({ size: 48, orientation: 'flat' });
	const Grid = Honeycomb.defineGrid(Hex);

	Grid.rectangle({ width: 100, height: 100 }).forEach((hex) => {
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

		const tile = new PIXI.Sprite(texture);
		tile.x = point.x;
		tile.y = point.y - 12;
		map.addChild(tile);
		// map.addChild(graphics);
	});
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
